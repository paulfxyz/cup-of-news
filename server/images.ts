/**
 * @file server/images.ts
 * @author Paul Fleury <hello@paulfleury.com>
 * @version 4.3.0
 *
 * Cup of News — Self-hosted image pipeline
 *
 * Every story image is fetched from its source, converted to WebP,
 * and stored on the Fly.io persistent volume (/data/images/).
 * Images are served at /images/{hash}.webp from the Express server.
 *
 * Why self-host:
 *   - No dependency on external CDNs (picsum, Wikimedia, news outlets)
 *   - Consistent format (WebP, 800×450, ~50-80KB)
 *   - No CORS issues, no hotlinking blocks, no 404s after source removes image
 *   - Fast: Cloudflare caches /images/* at the edge
 *
 * Storage layout:
 *   /data/images/{sha256-of-source-url}.webp
 *
 * The hash is derived from the source URL (not the content) so the same
 * external image always maps to the same file. Re-hosting the same URL
 * is a no-op (file already exists → return cached path immediately).
 */

import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import sharp from "sharp";

// ─── Config ───────────────────────────────────────────────────────────────────

const DATA_DIR = process.env.DB_PATH
  ? path.dirname(process.env.DB_PATH)
  : path.join(process.cwd(), "data");

const IMAGES_DIR = path.join(DATA_DIR, "images");

// Target dimensions for story cards (16:7 aspect ratio, full-bleed)
const TARGET_WIDTH  = 1200;
const TARGET_HEIGHT = 525;   // 1200 / (16/7) ≈ 525

/** Ensure images directory exists on startup */
export function ensureImagesDir(): void {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

/** URL path for a given hash — served by Express at /images/{hash}.webp */
export function imageUrlPath(hash: string): string {
  return `/images/${hash}.webp`;
}

/** Full filesystem path for a given hash */
export function imageFilePath(hash: string): string {
  return path.join(IMAGES_DIR, `${hash}.webp`);
}

/** Hash a source URL to a stable 16-char hex string */
function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

/**
 * rehostImage — fetch an external image, convert to WebP, store on disk.
 *
 * Returns the /images/{hash}.webp URL path on success, null on any failure.
 *
 * Steps:
 *   1. Check cache: if file already exists, return immediately
 *   2. Fetch the image (10s timeout, 15MB max)
 *   3. Convert to WebP at 1200×525, quality 82, with smart crop
 *   4. Write to /data/images/{hash}.webp
 *   5. Return /images/{hash}.webp
 *
 * Smart crop: sharp's 'entropy' strategy crops to maximise information content
 * (Shannon entropy of pixel values) — better for complex real-world news scenes.
 * 'attention' was biasing toward high-contrast edges, sometimes selecting
 * backgrounds over subjects. Entropy preserves the most detail-rich region.
 */
export async function rehostImage(sourceUrl: string): Promise<string | null> {
  if (!sourceUrl || sourceUrl.startsWith("data:") || sourceUrl.startsWith("/")) {
    return null;
  }

  ensureImagesDir();

  const hash = hashUrl(sourceUrl);
  const filePath = imageFilePath(hash);
  const urlPath  = imageUrlPath(hash);

  // Cache hit — file already hosted
  if (fs.existsSync(filePath)) {
    return urlPath;
  }

  try {
    // Fetch with realistic browser headers and a 12s timeout
    const res = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CupOfNews/3.5; +https://cupof.news)",
        "Accept": "image/webp,image/avif,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      console.warn(`  ⚠️  rehostImage: HTTP ${res.status} for ${sourceUrl.slice(0, 80)}`);
      return null;
    }

    // Bail if response is too large (>20MB = not a normal editorial photo)
    const contentLength = Number(res.headers.get("content-length") || 0);
    if (contentLength > 20_000_000) {
      console.warn(`  ⚠️  rehostImage: too large (${contentLength} bytes) — skipping`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Gate: reject images that are too small to be editorial photos
    // Video thumbnails from broadcast news, small icons, and placeholder images
    // are typically < 400×300 px. We need at least 600×300 for a usable 1200×525 crop.
    const metadata = await sharp(inputBuffer).metadata();
    const srcW = metadata.width ?? 0;
    const srcH = metadata.height ?? 0;
    if (srcW < 600 || srcH < 300) {
      console.warn(`  ⚠️  rehostImage: too small (${srcW}×${srcH}) — skipping`);
      return null;
    }

    // Reject suspiciously small files for their claimed dimensions
    // A 1200×675 video thumbnail might only be 15-25KB — real photos are 80KB+
    // Formula: reject if bytes-per-pixel < 0.04 (extremely compressed = video still)
    const bytesPP = inputBuffer.length / Math.max(1, srcW * srcH);
    if (bytesPP < 0.04 && inputBuffer.length < 40_000) {
      console.warn(`  ⚠️  rehostImage: likely video frame (${inputBuffer.length} bytes, ${srcW}×${srcH}, ${bytesPP.toFixed(4)} bpp) — skipping`);
      return null;
    }

    // Convert to WebP: resize to 1200×525, smart crop, quality 82
    // sharp 'entropy' strategy: maximises Shannon entropy of the crop region
    // — better for news photos with complex real-world scenes
    const webpBuffer = await sharp(inputBuffer)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: "cover",
        position: "entropy",  // entropy crop — maximise information content
      })
      .webp({ quality: 82 })
      .toBuffer();

    // Post-conversion quality gate: reject video stills after WebP conversion
    // A real editorial photo at 1200×525 quality 82 is typically 40-120KB.
    // Video frames compress to <25KB because they have very little detail.
    const postBpp = webpBuffer.length / (TARGET_WIDTH * TARGET_HEIGHT);
    if (postBpp < 0.04 && webpBuffer.length < 40_960) {
      console.warn(`  ⚠️  rehostImage: post-conversion video still (${webpBuffer.length} bytes, ${postBpp.toFixed(4)} bpp) — rejecting`);
      return null;
    }

    fs.writeFileSync(filePath, webpBuffer);
    console.log(`  📸 Rehosted: ${sourceUrl.slice(0, 60)}… → ${urlPath} (${Math.round(webpBuffer.length / 1024)}KB)`);
    return urlPath;

  } catch (err) {
    console.warn(`  ⚠️  rehostImage failed for ${sourceUrl.slice(0, 80)}: ${err}`);
    return null;
  }
}

/**
 * rehostOrPassthrough — try to rehost, fall back to original URL.
 * Used when we have a good external URL but want to self-host if possible.
 */
export async function rehostOrPassthrough(sourceUrl: string): Promise<string> {
  const hosted = await rehostImage(sourceUrl);
  return hosted ?? sourceUrl;
}

/** List all cached image hashes */
export function listCachedImages(): string[] {
  if (!fs.existsSync(IMAGES_DIR)) return [];
  return fs.readdirSync(IMAGES_DIR)
    .filter(f => f.endsWith(".webp"))
    .map(f => f.replace(".webp", ""));
}

/** Delete a cached image by hash */
export function deleteCachedImage(hash: string): void {
  const p = imageFilePath(hash);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

/**
 * getStoredImageQuality — check quality of an already-stored WebP image.
 * Returns null if the file doesn't exist.
 */
export function getStoredImageQuality(hash: string): {
  filePath: string;
  fileSize: number;
  bpp: number;
  isVideoStill: boolean;
} | null {
  const fp = imageFilePath(hash);
  if (!fs.existsSync(fp)) return null;
  const fileSize = fs.statSync(fp).size;
  const bpp = fileSize / (1200 * 525);
  const isVideoStill = bpp < 0.04 && fileSize < 40_960;
  return { filePath: fp, fileSize, bpp, isVideoStill };
}

/**
 * deleteStoredImage — delete a stored WebP image by hash.
 * Returns true if the file was deleted, false if it didn't exist.
 */
export function deleteStoredImage(hash: string): boolean {
  const fp = imageFilePath(hash);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
    return true;
  }
  return false;
}

/**
 * generateAiImage — generate a photorealistic news photo via OpenRouter.
 *
 * Uses google/gemini-2.5-flash-image — photorealistic, $0.04/image, no branding.
 * Returns a hosted /images/{hash}.webp path, or null if generation fails.
 *
 * @param title    Story headline
 * @param category Story category (World, Business, etc.)
 * @param summary  Short summary (first 150 chars)
 * @param openrouterKey OpenRouter API key
 */
/**
 * sanitizeForImagePrompt — reframe sensitive news topics for Gemini image generation.
 *
 * Gemini safety filters reject prompts containing words like "killed", "strike",
 * "bomb", "war", "dead", etc. — even in clearly journalistic contexts.
 * This function detects those topics and rewrites the subject as a scene description
 * that conveys the same editorial context without triggering refusals.
 *
 * Strategy: describe the SETTING and PROFESSION, not the event itself.
 */
/**
 * sanitizeForImagePrompt — rewrites sensitive topics as scene descriptions.
 *
 * Gemini refuses prompts with: violence, death, conflict, space disasters,
 * political firings. This function detects those topics in BOTH the story
 * summary (any language) AND the English title hint, then returns a safe
 * scene description that conveys the same editorial context.
 *
 * Rules for adding new patterns:
 *   - Test the regex against real failing story titles/summaries
 *   - Return a SCENE (setting + objects), never an event
 *   - Be specific enough that the image is editorially relevant
 */
function sanitizeForImagePrompt(
  summary: string,
  category: string,
  englishTitleHint: string = ""
): string {
  // Combine summary + english title for matching — catches non-EN summaries
  const lower = (summary + " " + englishTitleHint).toLowerCase();

  // ── Death / obituary (multi-language) ─────────────────────────────────────
  // EN: dies, dead, death, passed away, killed  FR: décède, mort, tué
  // DE: stirbt, gestorben, Abschied  ES: fallece, muerto  PT: morreu
  if (/(dies?|died|dead|death|passed away|obituar|in memoriam|fallece?|mouri?t|décèd|gestorben|stirbt|abschied|morreu|muerto|umer[lł])/.test(lower)) {
    // Philosopher / intellectual / cultural figure
    if (/(philosopher|philosophe|filosof|denker|essayist|author|writer|intellectual|artist|poet|composer|musician|director|architect|scientist|akadem)/.test(lower)) {
      return `A grand university lecture hall or library interior, rows of empty wooden seats, tall arched windows with warm afternoon light streaming in. Stacks of academic books on reading tables. Atmospheric, quiet scholarly setting.`;
    }
    // Political / public figure
    if (/(president|minister|prime minister|senator|general|leader|chancellor|official|politician|diplomat)/.test(lower)) {
      return `Exterior of a government building with flags at half-staff. Steps leading to grand classical architecture. Overcast sky, solemn atmosphere, no people visible.`;
    }
    // Default obituary
    return `A quiet memorial garden with stone benches and flowers. Soft natural light filtering through trees. Peaceful, contemplative outdoor setting.`;
  }

  // ── Conflict / military / airstrikes (multi-language) ─────────────────────
  // EN: airstrike, bomb, missile, war  FR: frappes, frappe  ES: ataques aéreos
  // DE: Angriff, Luftangriff  AR: ضربات
  if (/(killed?|strike|struck|frappes?|frappe|bomb|missile|airstrike|air.?strike|ataques?\s+a[eé]reo|luftangriff|angriff|shot|casualt|murder|assassin|executed?|soldier|troops|military.?operation|attack|explosion|blast|combat|warfare|battle|frontline|front.?line|shelling|bombardment|drone.?strike|rocket.?fire)/.test(lower)) {
    if (/(journalist|reporter|press|media|camera|broadcast|correspondent|photojournalist)/.test(lower)) {
      return `Press journalists with professional camera equipment and tripods working at a border area. White SUVs marked PRESS parked on a dusty road. Rocky arid hills and distant mountains in background.`;
    }
    if (/(iran|israel|lebanon|gaza|ukraine|syria|iraq|afghanistan|yemen|russia|tehran|kyiv|beirut|rafah)/.test(lower)) {
      return `Aerial wide view of a Middle Eastern border landscape. Rocky terrain, sparse dry vegetation, a straight road cutting through the desert. Distant mountains on the horizon. Documentary landscape photography.`;
    }
    if (/(infrastruct|bridge|power.?plant|hospital|school|building|civilian)/.test(lower)) {
      return `Wide aerial view of an urban landscape with a river crossing. City blocks, roads, and bridges visible from above. Documentary urban landscape photography.`;
    }
    return `Wide landscape view of a remote border region. Flat terrain, dusty roads, overcast sky. Documentary photography, no people visible.`;
  }

  // ── Space / NASA / rocket missions ────────────────────────────────────────
  // Gemini refuses astronaut/spacecraft imagery as potentially depicting disasters
  if (/(nasa|artemis|spacex|rocket|spacecraft|astronaut|cosmonaut|lunar|moon.?mission|space.?station|iss|orbit|launch|liftoff|spacewalk|capsule|orion|starship|falcon)/.test(lower)) {
    if (/(moon|lunar|apollo)/.test(lower)) {
      return `Wide angle view of a moonlit desert landscape at night. The full moon large and bright on the horizon, illuminating rocky terrain. Atmospheric, cinematic, no people.`;
    }
    if (/(launch|rocket|liftoff)/.test(lower)) {
      return `Wide shot of a coastal rocket launch facility at dawn. Launch towers and service structures silhouetted against a pale sky. Ocean visible in the background. Industrial, atmospheric.`;
    }
    return `Exterior of a modern space research facility with large satellite dishes and antenna arrays on an open plain under a clear blue sky.`;
  }

  // ── Political firing / removal / resignation ──────────────────────────────
  if (/(fires?d?|removes?d?|dismiss[ei]|resign|ousted?|sack[ei]|forced.?out|steps?.?down|abruptly|attorney.?general|cabinet|white.?house)/.test(lower)) {
    return `The exterior of the White House or a government ministry building. Wide shot showing the full facade, American flag flying above. Clear sky, formal setting, no people.`;
  }

  // ── Political protests / demonstrations ───────────────────────────────────
  if (/(protest|demonstrat|rally|march|crowd|riot|unrest|uprising|demonstration)/.test(lower)) {
    return `A large public gathering in a city plaza or wide boulevard. People assembled in an open urban space, buildings in background, daytime scene with natural lighting.`;
  }

  // ── Disaster / accident / crisis ─────────────────────────────────────────
  if (/(disaster|earthquake|flood|hurricane|wildfire|crash|collaps|evacuа|emergency|rescue|tsunami|cyclone|avalanche)/.test(lower)) {
    return `Emergency response professionals in high-visibility vests working at an outdoor scene. Vehicles and equipment visible in background. Documentary crisis response photography.`;
  }

  // Default: return the original summary
  return summary;
}

export async function generateAiImage(
  title: string,
  category: string,
  summary: string,
  openrouterKey: string
): Promise<string | null> {
  const categoryVisuals: Record<string, string> = {
    "WORLD": "wide establishing shot of an international location, diplomats or officials in action",
    "POLITICS": "government building exterior, legislative chamber, or officials at podium",
    "BUSINESS": "financial district skyline, professionals in modern office, stock exchange floor",
    "TECHNOLOGY": "sleek modern tech environment, servers or devices, clean and precise setting",
    "SCIENCE": "research laboratory, scientists at work with equipment, clean scientific setting",
    "HEALTH": "hospital corridor, medical professionals, healthcare environment",
    "ENVIRONMENT": "dramatic natural landscape, environmental impact scene",
    "SPORTS": "packed sports stadium, athletes in competition, dynamic action",
    "CULTURE": "museum gallery, concert hall, artistic or cultural venue",
    "MILITARY": "military base or vehicles, uniformed personnel in strategic context",
  };

  const visualHint = categoryVisuals[category.toUpperCase()] ?? "professional editorial setting, wide shot";
  const summaryCrop = summary.slice(0, 200).replace(/["\n]/g, " ");

  // NOTE: Always build prompt in English regardless of story language.
  // French/non-English titles cause Gemini to add text overlays in that language.
  // The visual content is language-neutral — only the English prompt matters.

  // ── Prompt sanitization ──────────────────────────────────────────────────
  // Gemini refuses to generate images for stories about death, violence, strikes,
  // or conflict. Instead of describing the event, describe the SCENE and CONTEXT.
  // This produces better editorial images AND avoids safety filter rejections.
  // Pass English title hint so sanitizer catches non-EN summaries (FR/DE/ES/etc)
  const sanitizedSubject = sanitizeForImagePrompt(summaryCrop, category, title);

  const prompt = `A pure photograph only. No text. No letters. No words. Anywhere.

Subject: ${sanitizedSubject}
Category: ${category}
Visual style: ${visualHint}

ABSOLUTE RULES — any violation means the image is rejected:
1. ZERO TEXT anywhere: no headlines, no captions, no banners, no labels, no subtitles
2. No readable signs, no billboards with words, no readable street signs
3. No screens or monitors displaying text, charts, graphs, or data
4. No infographics, no diagrams, no data visualizations
5. No watermarks, no logos, no brand names visible
6. No news channel chyrons, no lower-thirds, no ticker bars

Visual style:
- Documentary photojournalism — real location, natural lighting, authentic scene
- Wide establishing shot showing full environment and context
- If people appear: medium shot or wider, full upper body visible, faces not cut off
- Landscape orientation, 16:9 or wider
- Sharp focus, professional quality throughout
- Avoid futuristic/sci-fi aesthetics — realistic contemporary settings only`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
        "HTTP-Referer": "https://cupof.news",
        "X-Title": "Cup of News",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`  ⚠️  generateAiImage: API error ${res.status} — ${errText.slice(0, 200)}`);
      return null;
    }

    const data = await res.json() as any;
    const message = data.choices?.[0]?.message as any;
    if (!message) {
      console.warn("  ⚠️  generateAiImage: no message in response");
      return null;
    }

    // Gemini via OpenRouter: image in message.images[0].image_url.url as data URI
    let dataUrl: string | null = null;

    if (message.images && Array.isArray(message.images) && message.images.length > 0) {
      const imgEntry = message.images[0];
      const url = imgEntry?.image_url?.url ?? imgEntry?.url;
      if (url && url.startsWith("data:")) dataUrl = url;
    }

    if (!dataUrl) {
      const msgContent = message.content;
      if (typeof msgContent === "string") {
        const match = msgContent.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (match) dataUrl = match[0];
      } else if (Array.isArray(msgContent)) {
        for (const part of msgContent) {
          if (part.type === "image_url" && part.image_url?.url?.startsWith("data:")) {
            dataUrl = part.image_url.url;
            break;
          }
        }
      }
    }

    if (!dataUrl) {
      // ── Retry with minimal safe prompt ─────────────────────────────────────
      // Gemini sometimes returns 0 images for sensitive topics even after
      // sanitization. On first failure, retry once with an abstract category scene.
      console.warn(`  ⚠️  generateAiImage: no image returned — retrying with fallback prompt`);
      const fallbackPrompt = `A pure photograph only. No text anywhere.\n\nCategory: ${category}\nScene: ${categoryVisuals[category.toUpperCase()] ?? "professional editorial setting, wide establishing shot"}\n\nWide landscape or establishing shot. Natural lighting. No people required. No text, no signs, no logos anywhere.`;
      try {
        const retryRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${openrouterKey}\`, "HTTP-Referer": "https://cupof.news" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash-image", messages: [{ role: "user", content: fallbackPrompt }], modalities: ["image","text"] }),
          signal: AbortSignal.timeout(90_000),
        });
        if (retryRes.ok) {
          const retryData = await retryRes.json() as any;
          const retryMsg = retryData.choices?.[0]?.message as any;
          if (retryMsg?.images?.[0]?.image_url?.url?.startsWith("data:")) {
            dataUrl = retryMsg.images[0].image_url.url;
            console.log(`  🔄 Retry succeeded for category: ${category}`);
          }
        }
      } catch (_) { /* retry failed — fall through to null */ }
      if (!dataUrl) {
        console.warn("  ⚠️  generateAiImage: retry also returned no image — falling back");
        return null;
      }
    }

    const base64Data = dataUrl.split(",")[1];
    if (!base64Data) return null;

    const imageBuffer = Buffer.from(base64Data, "base64");

    const sharp = (await import("sharp")).default;
    const webpBuffer = await sharp(imageBuffer)
      .resize({ width: 1200, height: 630, fit: "cover", position: "center" })
      .webp({ quality: 85 })
      .toBuffer();

    if (webpBuffer.length < 50_000) {
      console.warn(`  ⚠️  generateAiImage: output too small (${webpBuffer.length} bytes) — rejecting`);
      return null;
    }

    // ── Post-generation text detection ───────────────────────────────────────
    // Gemini sometimes adds text banners/headlines to the image despite being
    // told not to. Detect and reject any image containing visible text using
    // a quick vision check on the raw buffer (no URL needed — use data URI).
    try {
      const b64Check = webpBuffer.toString("base64");
      const checkRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openrouterKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-lite",
          messages: [{
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/webp;base64,${b64Check}` }
              },
              {
                type: "text",
                text: "Does this image contain any visible text, letters, words, readable signs, readable billboards, on-screen text, charts with labels, or readable characters anywhere in the image? Answer only YES or NO."
              }
            ]
          }],
          max_tokens: 5,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json() as any;
        const answer = (checkData.choices?.[0]?.message?.content ?? "").trim().toUpperCase();
        if (answer.startsWith("YES")) {
          console.warn(`  ⚠️  generateAiImage: text detected in output — rejecting and retrying`);
          return null;  // caller (fetchEditorialImage) will fall to OG fallback
        }
      }
    } catch (textCheckErr) {
      // Non-fatal — if check fails, proceed (better a maybe-text image than SVG)
      console.warn(`  ⚠️  generateAiImage: text check failed (${textCheckErr}) — proceeding`);
    }

    await ensureImagesDir();
    const hash = createHash("sha256").update(webpBuffer).digest("hex").slice(0, 16);
    const filePath = imageFilePath(hash);
    fs.writeFileSync(filePath, webpBuffer);

    console.log(`  🎨 Gemini image generated: ${hash}.webp (${Math.round(webpBuffer.length / 1024)}KB)`);
    return `/images/${hash}.webp`;

  } catch (err) {
    console.warn(`  ⚠️  generateAiImage failed: ${err}`);
    return null;
  }
}

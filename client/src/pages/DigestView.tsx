/**
 * @file client/src/pages/DigestView.tsx
 * @author Paul Fleury <hello@paulfleury.com>
 * @version 0.3.0
 *
 * Espresso — Public Digest Reader
 *
 * The main public-facing page. Inspired by The Economist Espresso:
 * - Header with thick red rule (signature Economist mark)
 * - Card grid: image, category pill, headline, summary preview
 * - Full story reader with editorial summary and source link
 * - Closing quote at end of edition
 * - Dark/light mode toggle
 */

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Sun, Moon, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import type { DigestStory } from "@shared/schema";

interface DigestResponse {
  id: number;
  date: string;
  status: string;
  stories: DigestStory[];
  closingQuote: string;
  closingQuoteAuthor: string;
}

// Category colours — red family for featured, muted for secondary
const CATEGORY_STYLES: Record<string, string> = {
  Technology:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Science:      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Business:     "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  Politics:     "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  World:        "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  Culture:      "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  Health:       "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Environment:  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  Sports:       "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400",
  Other:        "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default function DigestView() {
  const { theme, toggle } = useTheme();
  const [activeStory, setActiveStory] = useState<string | null>(null);

  const { data: digest, isLoading } = useQuery<DigestResponse | null>({
    queryKey: ["/api/digest/latest"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/digest/latest");
      if (!r.ok) return null;
      return r.json();
    },
    retry: false,
  });

  if (isLoading) return <LoadingView />;
  if (!digest) return <EmptyView />;

  const openStory = activeStory ? digest.stories.find(s => s.id === activeStory) : null;
  const currentIdx = activeStory ? digest.stories.findIndex(s => s.id === activeStory) : -1;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">

      {/* The Economist-style header: thick red rule on top */}
      <div className="h-1 w-full bg-[#E3120B]" />

      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <a href="/#/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 bg-[#E3120B] flex items-center justify-center rounded-sm flex-shrink-0">
              <span className="text-white font-bold text-xs font-display tracking-tight">E</span>
            </div>
            <span className="font-bold tracking-tight text-sm font-display uppercase">
              Espresso
            </span>
          </a>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {formatDate(digest.date)}
            </span>
            <button
              onClick={toggle}
              data-testid="theme-toggle"
              className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <a href="/#/admin" className="text-xs text-muted-foreground hover:text-[#E3120B] transition-colors font-ui">
              Admin
            </a>
          </div>
        </div>
      </header>

      {/* Hero date strip */}
      <section className="bg-foreground text-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-xs uppercase tracking-[0.15em] opacity-60 mb-1 font-ui">Morning Briefing</p>
          <h1 className="text-2xl sm:text-3xl font-bold font-display" data-testid="digest-date">
            {formatDate(digest.date)}
          </h1>
          <p className="text-sm opacity-60 mt-1 font-ui">{digest.stories.length} stories · Espresso β</p>
        </div>
      </section>

      {/* Stories */}
      {!openStory ? (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {digest.stories.map((story, idx) => (
              <StoryCard
                key={story.id}
                story={story}
                index={idx}
                onClick={() => setActiveStory(story.id)}
              />
            ))}
          </div>

          {/* Closing quote */}
          {digest.closingQuote && (
            <div className="mt-16 pt-10 border-t-2 border-[#E3120B] max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4 font-ui">
                Today's Thought
              </p>
              <blockquote className="text-lg sm:text-xl font-editorial italic text-foreground leading-relaxed">
                "{digest.closingQuote}"
              </blockquote>
              {digest.closingQuoteAuthor && (
                <p className="mt-3 text-sm text-muted-foreground font-ui">
                  — {digest.closingQuoteAuthor}
                </p>
              )}
            </div>
          )}
        </main>
      ) : (
        /* Story reader */
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">
          <button
            onClick={() => setActiveStory(null)}
            className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#E3120B] transition-colors font-ui"
            data-testid="back-button"
          >
            <ChevronLeft size={15} /> Back to briefing
          </button>

          <article data-testid={`story-detail-${openStory.id}`}>
            {openStory.imageUrl && (
              <div className="w-full aspect-video mb-6 overflow-hidden bg-muted border border-border">
                <img
                  src={openStory.imageUrl}
                  alt={openStory.title}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                />
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider font-ui ${CATEGORY_STYLES[openStory.category] || CATEGORY_STYLES.Other}`}>
                {openStory.category}
              </span>
              <span className="text-xs text-muted-foreground font-ui">
                {currentIdx + 1} of {digest.stories.length}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display mb-5 leading-snug">
              {openStory.title}
            </h2>

            <div className="economist-rule-thin pt-4 mb-5" />

            <p className="text-base font-editorial leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {openStory.summary}
            </p>

            <a
              href={openStory.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#E3120B] hover:underline font-ui"
              data-testid="read-source-link"
            >
              Read full story <ArrowUpRight size={13} />
            </a>
          </article>

          {/* Prev / Next */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
            <button
              onClick={() => currentIdx > 0 && setActiveStory(digest.stories[currentIdx - 1].id)}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 text-sm font-ui text-muted-foreground hover:text-[#E3120B] transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              data-testid="prev-story"
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <button
              onClick={() => currentIdx < digest.stories.length - 1 && setActiveStory(digest.stories[currentIdx + 1].id)}
              disabled={currentIdx === digest.stories.length - 1}
              className="flex items-center gap-1.5 text-sm font-ui text-muted-foreground hover:text-[#E3120B] transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              data-testid="next-story"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>

          {/* Quote after last story */}
          {currentIdx === digest.stories.length - 1 && digest.closingQuote && (
            <div className="mt-12 pt-8 border-t-2 border-[#E3120B]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-ui">Today's Thought</p>
              <blockquote className="text-base font-editorial italic leading-relaxed">
                "{digest.closingQuote}"
              </blockquote>
              {digest.closingQuoteAuthor && (
                <p className="mt-2 text-xs text-muted-foreground font-ui">— {digest.closingQuoteAuthor}</p>
              )}
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-ui">Espresso β · v0.3.0</span>
          <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-ui">
            Built with Perplexity Computer
          </a>
        </div>
      </footer>
    </div>
  );
}

// ── Story Card ────────────────────────────────────────────────────────────────

function StoryCard({ story, index, onClick }: { story: DigestStory; index: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      data-testid={`story-card-${story.id}`}
      className="story-card group text-left bg-card p-5 hover:bg-accent/40 transition-colors duration-150 flex flex-col"
    >
      {story.imageUrl && (
        <div className="w-full aspect-video mb-4 overflow-hidden bg-muted border border-border/50">
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
          />
        </div>
      )}

      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[10px] font-bold font-ui text-[#E3120B] uppercase tracking-wider">
          {story.category}
        </span>
        <span className="text-[10px] text-muted-foreground font-ui">
          #{String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="story-title text-sm font-bold font-display leading-snug text-foreground transition-colors line-clamp-3 mb-2">
        {story.title}
      </h3>

      <p className="text-xs font-editorial text-muted-foreground line-clamp-3 leading-relaxed mt-auto">
        {story.summary}
      </p>
    </button>
  );
}

function LoadingView() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 w-full bg-[#E3120B]" />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-8 h-8 bg-[#E3120B] mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-muted-foreground font-ui">Loading your briefing…</p>
        </div>
      </div>
    </div>
  );
}

function EmptyView() {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-1 w-full bg-[#E3120B]" />
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#E3120B] flex items-center justify-center rounded-sm">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="font-bold text-sm font-display uppercase">Espresso</span>
          </div>
          <button onClick={toggle} className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded transition-colors">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center text-center px-6">
        <div className="max-w-sm">
          <div className="w-12 h-12 bg-[#E3120B] mx-auto mb-6 flex items-center justify-center">
            <span className="text-white font-bold text-xl font-display">E</span>
          </div>
          <h2 className="text-xl font-bold font-display mb-2">No digest published yet</h2>
          <p className="text-sm text-muted-foreground mb-6 font-editorial leading-relaxed">
            Submit some links via the admin panel, generate your first digest, and publish it.
          </p>
          <a
            href="/#/admin"
            className="inline-flex items-center gap-2 text-sm font-bold bg-[#E3120B] text-white px-5 py-2.5 hover:bg-[#B50D08] transition-colors font-ui"
          >
            Go to Admin <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

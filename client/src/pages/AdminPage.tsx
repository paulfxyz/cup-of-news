/**
 * @file client/src/pages/AdminPage.tsx
 * @author Paul Fleury <hello@paulfleury.com>
 * @version 0.3.0
 *
 * Espresso — Admin Panel
 *
 * Three tabs: Overview, Links, Digest.
 * Auth is handled by AdminAuthGate (wraps this component in App.tsx).
 * The adminKey comes from useAdminAuth() context — no prop drilling.
 *
 * Changes in v0.3.0:
 * - Full Economist red/black/white redesign
 * - Auth via AdminAuthGate (login + change password)
 * - Better error messages and loading states
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, RefreshCw, Send, Eye, EyeOff,
  ArrowLeft, Link2, Loader2, ChevronDown, ChevronUp,
  ArrowUpRight, Sun, Moon, LayoutDashboard, BookOpen
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAdminAuth } from "@/components/AdminAuth";
import type { DigestStory, Link } from "@shared/schema";

interface DigestResponse {
  id: number;
  date: string;
  status: string;
  stories: DigestStory[];
  closingQuote: string;
  closingQuoteAuthor: string;
}

type Tab = "overview" | "links" | "digest";

export default function AdminPage() {
  const { theme, toggle } = useTheme();
  const { adminKey } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("overview");

  const headers = adminKey ? { "x-admin-key": adminKey } : {};

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Red rule */}
      <div className="h-1 w-full bg-[#E3120B]" />

      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/#/" className="text-muted-foreground hover:text-[#E3120B] transition-colors">
              <ArrowLeft size={16} />
            </a>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-[#E3120B] flex items-center justify-center">
                <span className="text-white font-bold text-[10px] font-display">E</span>
              </div>
              <span className="font-bold text-sm font-display uppercase tracking-wide">Admin</span>
            </div>
          </div>
          <button onClick={toggle} className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded transition-colors">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex">
          {(["overview", "links", "digest"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`tab-${t}`}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors font-ui border-b-2 ${
                tab === t
                  ? "border-[#E3120B] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {tab === "overview" && <OverviewTab headers={headers} />}
        {tab === "links"    && <LinksTab    headers={headers} />}
        {tab === "digest"   && <DigestTab   headers={headers} />}
      </div>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground font-ui">
        <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer"
          className="hover:text-foreground transition-colors">
          Built with Perplexity Computer
        </a>
      </footer>
    </div>
  );
}

// ── Shared stat card ──────────────────────────────────────────────────────────
function Stat({ label, value, red = false }: { label: string; value: number; red?: boolean }) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-ui mb-1">{label}</p>
      <p className={`text-3xl font-bold font-display ${red ? "text-[#E3120B]" : ""}`}>{value}</p>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ headers }: { headers: Record<string, string> }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ["/api/setup/status"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/setup/status"); return r.ok ? r.json() : {}; },
  });
  const { data: links = [] } = useQuery<Link[]>({
    queryKey: ["/api/links"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/links", undefined, headers); return r.ok ? r.json() : []; },
  });
  const { data: digests = [] } = useQuery<DigestResponse[]>({
    queryKey: ["/api/digests"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/digests", undefined, headers); return r.ok ? r.json() : []; },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/digest/generate", {}, headers);
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: (data) => {
      toast({ title: `Digest generated — ${data.storiesCount} stories ready` });
      qc.invalidateQueries({ queryKey: ["/api/digests"] });
    },
    onError: (e: any) => toast({ title: "Generation failed", description: e.message, variant: "destructive" }),
  });

  const publishedCount = (digests as DigestResponse[]).filter(d => d.status === "published").length;
  const unprocessed = (links as Link[]).filter((l: any) => !l.processedAt).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total links" value={(links as Link[]).length} />
        <Stat label="Unprocessed" value={unprocessed} red={unprocessed > 0} />
        <Stat label="Digests" value={(digests as DigestResponse[]).length} />
        <Stat label="Published" value={publishedCount} red={publishedCount > 0} />
      </div>

      {/* Quick actions */}
      <div className="border border-border bg-card p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-ui mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !status?.configured}
            data-testid="generate-digest-btn"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E3120B] text-white text-sm font-bold hover:bg-[#B50D08] transition-colors disabled:opacity-40 font-ui"
          >
            {generateMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Generate Today's Digest
          </button>
          <a href="/#/" className="flex items-center gap-2 px-5 py-2.5 border border-border text-sm font-ui hover:bg-accent transition-colors">
            <Eye size={13} /> View Digest
          </a>
        </div>
        {!status?.configured && (
          <p className="text-xs text-[#E3120B] mt-3 font-ui">
            ⚠ OpenRouter API key not configured. Go to <a href="/#/setup" className="underline">Setup</a>.
          </p>
        )}
      </div>

      {/* API reference */}
      <div className="border border-border bg-card p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-ui mb-4">Submit Links via API</h2>
        <pre className="bg-muted text-xs p-4 overflow-x-auto rounded font-mono leading-relaxed">{`curl -X POST https://paulflxyz-espresso.fly.dev/api/links \\
  -H "Content-Type: application/json" \\
  -H "x-admin-key: YOUR_PASSWORD" \\
  -d '{"url": "https://example.com/article"}'`}</pre>
      </div>
    </div>
  );
}

// ── Links Tab ─────────────────────────────────────────────────────────────────
function LinksTab({ headers }: { headers: Record<string, string> }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [urlInput, setUrlInput] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const { data: links = [], isLoading } = useQuery<Link[]>({
    queryKey: ["/api/links"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/links", undefined, headers); return r.ok ? r.json() : []; },
  });

  const addMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const r = await apiRequest("POST", "/api/links", { urls }, headers);
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: (data) => {
      toast({ title: `${data.created} link(s) added` });
      setUrlInput(""); setBulkInput("");
      qc.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await apiRequest("DELETE", `/api/links/${id}`, undefined, headers);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Link removed" });
      qc.invalidateQueries({ queryKey: ["/api/links"] });
    },
  });

  const handleAdd = () => {
    const urls = showBulk
      ? bulkInput.split("\n").map(u => u.trim()).filter(Boolean)
      : urlInput.trim() ? [urlInput.trim()] : [];
    if (urls.length) addMutation.mutate(urls);
  };

  return (
    <div className="space-y-6">
      {/* Add links */}
      <div className="border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-ui">Add Links</h2>
          <button onClick={() => setShowBulk(v => !v)} className="text-xs text-[#E3120B] hover:underline font-ui">
            {showBulk ? "Single URL" : "Bulk paste"}
          </button>
        </div>

        {!showBulk ? (
          <div className="flex gap-3">
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="https://article.com/news..."
              data-testid="input-url"
              className="flex-1 text-sm px-3 py-2.5 border border-border bg-background focus:outline-none focus:border-[#E3120B] focus:ring-1 focus:ring-[#E3120B] font-ui"
            />
            <button
              onClick={handleAdd}
              disabled={addMutation.isPending || !urlInput.trim()}
              data-testid="add-link-btn"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E3120B] text-white text-sm font-bold hover:bg-[#B50D08] transition-colors disabled:opacity-40 font-ui"
            >
              {addMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Add
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
              placeholder="One URL per line..."
              rows={6}
              data-testid="input-bulk-urls"
              className="w-full text-sm px-3 py-2.5 border border-border bg-background focus:outline-none focus:border-[#E3120B] font-mono resize-none"
            />
            <button
              onClick={handleAdd}
              disabled={addMutation.isPending || !bulkInput.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E3120B] text-white text-sm font-bold hover:bg-[#B50D08] transition-colors disabled:opacity-40 font-ui"
            >
              {addMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Add {bulkInput.split("\n").filter(Boolean).length} URLs
            </button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3 font-ui">
          Supports articles, YouTube, TikTok, and any URL. Content extracted automatically at generation time.
        </p>
      </div>

      {/* Links list */}
      <div className="border border-border bg-card overflow-hidden">
        <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-muted/30">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-ui">
            Links ({(links as Link[]).length})
          </h2>
          <span className="text-xs text-muted-foreground font-ui">
            {(links as Link[]).filter((l: any) => !l.processedAt).length} unprocessed
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground font-ui">Loading…</div>
        ) : (links as Link[]).length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground font-ui">No links yet. Add some above.</div>
        ) : (
          <div className="divide-y divide-border">
            {(links as any[]).map((link: any) => (
              <div key={link.id} data-testid={`link-row-${link.id}`}
                className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${link.processedAt ? "bg-foreground/30" : "bg-[#E3120B]"}`}
                    title={link.processedAt ? "Used in digest" : "Unprocessed"} />
                  <div className="min-w-0">
                    <p className="text-sm font-ui truncate font-medium">{link.title || link.url}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-[#E3120B] truncate flex items-center gap-1 font-ui">
                      {(() => { try { return new URL(link.url).hostname; } catch { return link.url; } })()} <ArrowUpRight size={9} />
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground hidden md:block font-ui">
                    {new Date(link.submittedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(link.id)}
                    data-testid={`delete-link-${link.id}`}
                    className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-[#E3120B] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Digest Tab ────────────────────────────────────────────────────────────────
function DigestTab({ headers }: { headers: Record<string, string> }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: digests = [], isLoading } = useQuery<DigestResponse[]>({
    queryKey: ["/api/digests"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/digests", undefined, headers); return r.ok ? r.json() : []; },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/digest/generate", {}, headers);
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: (data) => {
      toast({ title: `Generated — ${data.storiesCount} stories` });
      qc.invalidateQueries({ queryKey: ["/api/digests"] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, publish }: { id: number; publish: boolean }) => {
      const r = await apiRequest("POST", `/api/digest/${id}/${publish ? "publish" : "unpublish"}`, {}, headers);
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: (_, v) => {
      toast({ title: v.publish ? "Published" : "Unpublished" });
      qc.invalidateQueries({ queryKey: ["/api/digests"] });
      qc.invalidateQueries({ queryKey: ["/api/digest/latest"] });
    },
  });

  const swapMutation = useMutation({
    mutationFn: async ({ digestId, storyId }: { digestId: number; storyId: string }) => {
      const r = await apiRequest("PATCH", `/api/digest/${digestId}/story/${storyId}/swap`, {}, headers);
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Story swapped" });
      qc.invalidateQueries({ queryKey: ["/api/digests"] });
    },
    onError: (e: any) => toast({ title: "Swap failed", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await apiRequest("DELETE", `/api/digest/${id}`, undefined, headers);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Deleted" });
      qc.invalidateQueries({ queryKey: ["/api/digests"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-ui">
          All Digests ({(digests as DigestResponse[]).length})
        </h2>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="generate-digest-btn-2"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#E3120B] text-white text-sm font-bold hover:bg-[#B50D08] transition-colors disabled:opacity-40 font-ui"
        >
          {generateMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Generate Today
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground font-ui">Loading…</div>
      ) : (digests as DigestResponse[]).length === 0 ? (
        <div className="border border-border bg-card p-12 text-center">
          <div className="w-10 h-10 bg-muted mx-auto mb-4 flex items-center justify-center">
            <span className="text-muted-foreground font-bold font-display">E</span>
          </div>
          <p className="text-sm text-muted-foreground font-ui">No digests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(digests as DigestResponse[]).map(digest => (
            <div key={digest.id} className="border border-border bg-card overflow-hidden" data-testid={`digest-row-${digest.id}`}>
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setExpandedId(expandedId === digest.id ? null : digest.id)}
                    className="text-muted-foreground hover:text-foreground">
                    {expandedId === digest.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <div>
                    <p className="text-sm font-bold font-display">{digest.date}</p>
                    <p className="text-xs text-muted-foreground font-ui">{digest.stories.length} stories</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 font-ui ${
                    digest.status === "published"
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {digest.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => publishMutation.mutate({ id: digest.id, publish: digest.status !== "published" })}
                    disabled={publishMutation.isPending}
                    data-testid={`publish-btn-${digest.id}`}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border border-border hover:border-[#E3120B] hover:text-[#E3120B] transition-colors font-ui"
                  >
                    {digest.status === "published" ? <><EyeOff size={11} /> Unpublish</> : <><Send size={11} /> Publish</>}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(digest.id)}
                    data-testid={`delete-digest-${digest.id}`}
                    className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-[#E3120B] transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {expandedId === digest.id && (
                <div className="border-t border-border">
                  {digest.stories.map((story, idx) => (
                    <div key={story.id} className="px-6 py-3 flex items-start gap-4 border-b border-border/50 last:border-0">
                      <span className="text-[10px] font-mono text-muted-foreground mt-0.5 w-5 flex-shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[#E3120B] uppercase tracking-wider font-ui mb-0.5">
                          {story.category}
                        </p>
                        <p className="text-sm font-display font-medium leading-snug">{story.title}</p>
                        <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-[#E3120B] flex items-center gap-1 mt-0.5 font-ui">
                          {story.sourceTitle || story.sourceUrl} <ArrowUpRight size={9} />
                        </a>
                      </div>
                      <button
                        onClick={() => swapMutation.mutate({ digestId: digest.id, storyId: story.id })}
                        disabled={swapMutation.isPending}
                        data-testid={`swap-story-${story.id}`}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 border border-border hover:border-[#E3120B] hover:text-[#E3120B] transition-colors flex-shrink-0 font-ui"
                      >
                        {swapMutation.isPending ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                        Swap
                      </button>
                    </div>
                  ))}

                  {digest.closingQuote && (
                    <div className="px-6 py-4 bg-muted/20 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-ui mb-1">Quote</p>
                      <p className="text-sm font-editorial italic">"{digest.closingQuote}"</p>
                      {digest.closingQuoteAuthor && (
                        <p className="text-xs text-muted-foreground mt-1 font-ui">— {digest.closingQuoteAuthor}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

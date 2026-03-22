/**
 * @file client/src/pages/DigestView.tsx
 * @author Paul Fleury <hello@paulfleury.com>
 * @version 0.4.0
 *
 * Espresso — Public Digest Reader
 *
 * UI DESIGN (v0.4.0 overhaul):
 *   The v0.3.0 card grid was static and didn't invite exploration.
 *   v0.4.0 introduces a full-screen card carousel — one story at a time,
 *   navigated with left/right arrows and keyboard. Inspired by how
 *   The Economist Espresso app actually works on mobile.
 *
 *   Layout:
 *   - Header: logo + date + progress indicator + theme toggle
 *   - Card: full-width image → category → headline → summary (serif)
 *   - Navigation: ← prev / next → with story count
 *   - Final card: closing quote in editorial style
 *   - Swipe support: touch events for mobile
 *
 *   The "Overview" grid is still accessible via the grid icon (top right)
 *   for users who want to scan all stories at once.
 */

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useRef } from "react";
import {
  Sun, Moon, ArrowUpRight, ChevronLeft, ChevronRight,
  LayoutGrid, X
} from "lucide-react";
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

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function DigestView() {
  const { theme, toggle } = useTheme();
  const [cardIndex, setCardIndex] = useState(0); // 0..stories.length (last = quote card)
  const [showGrid, setShowGrid] = useState(false);

  // Touch swipe
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

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

  const totalCards = digest.stories.length + 1; // +1 for quote card
  const isQuoteCard = cardIndex === digest.stories.length;
  const story = isQuoteCard ? null : digest.stories[cardIndex];

  const goNext = () => setCardIndex(i => Math.min(i + 1, totalCards - 1));
  const goPrev = () => setCardIndex(i => Math.max(i - 1, 0));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = null;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStart.current === null || touchEnd.current === null) return;
    const delta = touchStart.current - touchEnd.current;
    if (Math.abs(delta) > 50) {
      delta > 0 ? goNext() : goPrev();
    }
    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Economist red rule */}
      <div className="h-1 w-full bg-[#E3120B] flex-shrink-0" />

      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-13 py-3 flex items-center justify-between gap-4">
          {/* Logo — links back to / (card 0) */}
          <button
            onClick={() => setCardIndex(0)}
            className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
            aria-label="Back to first story"
          >
            <div className="w-7 h-7 bg-[#E3120B] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs font-display">E</span>
            </div>
            <span className="font-bold text-sm font-display uppercase tracking-wide hidden sm:block">
              Espresso
            </span>
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1 flex-1 justify-center overflow-hidden">
            {digest.stories.map((_, i) => (
              <button
                key={i}
                onClick={() => setCardIndex(i)}
                className={`h-1 rounded-full transition-all duration-200 flex-shrink-0 ${
                  i === cardIndex
                    ? "w-6 bg-[#E3120B]"
                    : i < cardIndex
                    ? "w-1.5 bg-foreground/40"
                    : "w-1.5 bg-border"
                }`}
                aria-label={`Story ${i + 1}`}
              />
            ))}
            {/* Quote dot */}
            <button
              onClick={() => setCardIndex(digest.stories.length)}
              className={`h-1 rounded-full transition-all duration-200 flex-shrink-0 ${
                isQuoteCard ? "w-6 bg-[#E3120B]" : "w-1.5 bg-border"
              }`}
              aria-label="Closing quote"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowGrid(v => !v)}
              className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded transition-colors"
              aria-label="Show overview"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <a href="/#/admin" className="text-xs text-muted-foreground hover:text-[#E3120B] transition-colors font-ui hidden sm:block">
              Admin
            </a>
          </div>
        </div>
      </header>

      {/* Grid overlay */}
      {showGrid && (
        <GridOverlay
          digest={digest}
          onSelect={i => { setCardIndex(i); setShowGrid(false); }}
          onClose={() => setShowGrid(false)}
        />
      )}

      {/* Card area */}
      <div
        className="flex-1 flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isQuoteCard ? (
          <QuoteCard
            quote={digest.closingQuote}
            author={digest.closingQuoteAuthor}
            date={digest.date}
          />
        ) : story ? (
          <StoryCard story={story} index={cardIndex} total={digest.stories.length} />
        ) : null}
      </div>

      {/* Navigation bar */}
      <div className="flex-shrink-0 border-t border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={cardIndex === 0}
            className="flex items-center gap-2 text-sm font-ui font-bold text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            data-testid="prev-story"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:block">Previous</span>
          </button>

          <span className="text-xs text-muted-foreground font-ui tabular-nums">
            {isQuoteCard ? "✦" : `${cardIndex + 1} / ${digest.stories.length}`}
          </span>

          <button
            onClick={goNext}
            disabled={cardIndex === totalCards - 1}
            className="flex items-center gap-2 text-sm font-ui font-bold text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            data-testid="next-story"
          >
            <span className="hidden sm:block">Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Story Card ───────────────────────────────────────────────────────────────

function StoryCard({ story, index, total }: { story: DigestStory; index: number; total: number }) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Hero image */}
        {story.imageUrl && (
          <div className="w-full aspect-video bg-muted border border-border overflow-hidden flex-shrink-0">
            <img
              src={story.imageUrl}
              alt={story.title}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
            />
          </div>
        )}

        {/* Category + number */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold font-ui text-[#E3120B] uppercase tracking-[0.15em]">
            {story.category}
          </span>
          <span className="text-[10px] text-muted-foreground font-ui tabular-nums">
            {index + 1} of {total}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-xl sm:text-2xl font-bold font-display leading-snug">
          {story.title}
        </h1>

        {/* Red rule */}
        <div className="border-t-2 border-[#E3120B] w-12" />

        {/* Summary — editorial serif */}
        <p className="text-base font-editorial leading-[1.75] text-foreground/90">
          {story.summary}
        </p>

        {/* Source link */}
        <a
          href={story.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-bold font-ui text-[#E3120B] hover:underline mt-auto"
          data-testid="read-source-link"
        >
          Read full story <ArrowUpRight size={13} />
        </a>
      </div>
    </div>
  );
}

// ─── Quote Card ───────────────────────────────────────────────────────────────

function QuoteCard({ quote, author, date }: { quote: string; author: string; date: string }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-foreground text-background px-6 py-12">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-ui">
          {formatDate(date)} · Today's Thought
        </div>
        <div className="w-8 h-0.5 bg-[#E3120B] mx-auto" />
        <blockquote className="text-xl sm:text-2xl font-editorial italic leading-relaxed">
          "{quote}"
        </blockquote>
        {author && (
          <p className="text-sm opacity-60 font-ui">— {author}</p>
        )}
        <div className="pt-4">
          <a
            href="/#/admin"
            className="text-xs opacity-40 hover:opacity-70 transition-opacity font-ui"
          >
            Admin
          </a>
          <span className="text-xs opacity-20 mx-2">·</span>
          <a
            href="https://www.perplexity.ai/computer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs opacity-40 hover:opacity-70 transition-opacity font-ui"
          >
            Built with Perplexity Computer
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Grid Overlay ─────────────────────────────────────────────────────────────

function GridOverlay({
  digest,
  onSelect,
  onClose,
}: {
  digest: DigestResponse;
  onSelect: (i: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-base font-display uppercase tracking-wide">All Stories</h2>
            <p className="text-xs text-muted-foreground font-ui">{formatDate(digest.date)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {digest.stories.map((story, i) => (
            <button
              key={story.id}
              onClick={() => onSelect(i)}
              className="bg-card text-left p-5 hover:bg-accent/50 transition-colors"
            >
              {story.imageUrl && (
                <div className="aspect-video bg-muted mb-3 overflow-hidden">
                  <img src={story.imageUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                </div>
              )}
              <p className="text-[10px] font-bold text-[#E3120B] uppercase tracking-wider font-ui mb-1.5">{story.category}</p>
              <h3 className="text-sm font-bold font-display leading-snug line-clamp-3">{story.title}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Loading / Empty ──────────────────────────────────────────────────────────

function LoadingView() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-1 w-full bg-[#E3120B]" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 bg-[#E3120B] mx-auto animate-pulse" />
          <p className="text-sm text-muted-foreground font-ui">Loading your briefing…</p>
        </div>
      </div>
    </div>
  );
}

function EmptyView() {
  const { toggle, theme } = useTheme();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-1 w-full bg-[#E3120B]" />
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-13 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#E3120B] flex items-center justify-center">
              <span className="text-white font-bold text-xs font-display">E</span>
            </div>
            <span className="font-bold text-sm font-display uppercase">Espresso</span>
          </div>
          <button onClick={toggle} className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded transition-colors">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div className="max-w-xs space-y-4">
          <div className="w-12 h-12 bg-[#E3120B] mx-auto flex items-center justify-center">
            <span className="text-white font-bold text-xl font-display">E</span>
          </div>
          <h2 className="text-xl font-bold font-display">No digest yet</h2>
          <p className="text-sm text-muted-foreground font-editorial leading-relaxed">
            Submit links, generate a digest, and publish it to start reading.
          </p>
          <a href="/#/admin"
            className="inline-flex items-center gap-2 text-sm font-bold bg-[#E3120B] text-white px-5 py-2.5 hover:bg-[#B50D08] transition-colors font-ui">
            Go to Admin <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

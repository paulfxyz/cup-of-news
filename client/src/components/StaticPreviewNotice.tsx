import { useEffect, useState } from "react";
import { X } from "lucide-react";

const PREVIEW_NOTICE_STORAGE_KEY = "cofn_preview_notice_seen";

export function StaticPreviewNotice() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(PREVIEW_NOTICE_STORAGE_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const dismiss = () => {
    try {
      localStorage.setItem(PREVIEW_NOTICE_STORAGE_KEY, "1");
    } catch {}
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={dismiss}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="static-preview-title"
        aria-describedby="static-preview-description"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8"
        onClick={event => event.stopPropagation()}
      >
        <div className="mb-5 h-1 w-12 bg-[#E3120B]" />
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Dismiss static preview notice"
          data-testid="button-dismiss-static-preview-notice"
        >
          <X size={18} />
        </button>

        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#E3120B]">
          Cup of News open-source demo
        </p>
        <h2 id="static-preview-title" className="mb-3 pr-8 text-2xl font-black font-display leading-tight">
          This is a static preview
        </h2>
        <p id="static-preview-description" className="font-editorial text-sm leading-relaxed text-foreground/75">
          You&apos;re viewing the open-source Cup of News demo with a frozen digest snapshot. It is not connected
          to live digest generation, so these headlines will not update with new news.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-xl bg-[#E3120B] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#B50D08]"
            data-testid="button-show-static-demo"
          >
            OK, show me the demo
          </button>
          <a
            href="https://read.cupof.news"
            onClick={dismiss}
            className="w-full rounded-xl border border-border px-4 py-3 text-center text-sm font-bold text-foreground transition-colors hover:border-[#E3120B] hover:bg-accent"
            data-testid="link-live-cup-of-news"
          >
            See the live version <span className="font-normal text-muted-foreground">at read.cupof.news</span>
          </a>
        </div>
      </section>
    </div>
  );
}

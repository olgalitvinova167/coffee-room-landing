import { useState } from "react";
import { Coffee, Send, X } from "lucide-react";

const QUICK_ACTIONS = ["View Menu", "Opening Hours", "Delivery", "Help Me Choose"];

export function AskAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          role="dialog"
          aria-label="Coffee Room Assistant"
          className="flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
        >
          <div className="flex items-center justify-between gap-3 bg-terracotta px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Coffee className="size-5" aria-hidden />
              <span className="font-display text-base font-bold">Coffee Room Assistant</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-full p-1 transition hover:bg-primary-foreground/15"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="space-y-3 px-4 py-4">
            <p className="rounded-xl bg-secondary px-3 py-2.5 text-sm leading-relaxed text-secondary-foreground">
              Hi! I can help with our menu, opening hours, pickup, delivery, and
              product recommendations.
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="rounded-full border border-terracotta px-3 py-1.5 text-xs font-medium text-terracotta transition hover:bg-terracotta hover:text-primary-foreground"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <form
            className="flex items-center gap-2 border-t border-border px-3 py-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question…"
              className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-terracotta px-3.5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-terracotta/90"
            >
              Send
              <Send className="size-3.5" aria-hidden />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-terracotta/90"
      >
        <Coffee className="size-4" aria-hidden />
        Ask Coffee Room
      </button>
    </div>
  );
}

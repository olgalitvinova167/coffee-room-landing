import { useEffect, useRef, useState } from "react";
import { Coffee, Send, X } from "lucide-react";
import { AssistantEnquiryForm } from "./AssistantEnquiryForm";
import { useServerFn } from "@tanstack/react-start";
import { askCoffeeRoom } from "@/lib/assistant.functions";
import { ASSISTANT_ERROR, assistantResultSchema, containsContactDetails } from "@/lib/assistant";
import { CAFE } from "@/data/cafe";
import { BAKERY_ITEMS, COFFEE_ITEMS, getMenuItem, type MenuItem } from "@/data/menu";

const QUICK_ACTIONS = ["View Menu", "Opening Hours", "Delivery", "Help Me Choose"];
const CHOICES = ["Coffee", "Sweet pastry", "Chocolate", "Dairy-free coffee"] as const;
type Choice = (typeof CHOICES)[number];
type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  enquiryQuestion?: string;
  link?: { href: "#menu" | "#order"; label: string };
};
const currency = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
const productLine = (item: MenuItem) => `${item.name} — ${currency(item.price)}`;
const choiceClass =
  "rounded-full border border-terracotta px-3 py-1.5 text-xs font-medium text-terracotta transition hover:bg-terracotta hover:text-primary-foreground";

export function AskAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [choosing, setChoosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enquiryIndex, setEnquiryIndex] = useState<number | null>(null);
  const pending = useRef(false);
  const ask = useServerFn(askCoffeeRoom);
  const conversation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation.current) conversation.current.scrollTop = conversation.current.scrollHeight;
  }, [messages, choosing, open, loading, enquiryIndex]);

  const submitQuestion = async () => {
    const question = message.trim();
    if (!question || pending.current) return;
    pending.current = true;
    setLoading(true);
    const responseIndex = messages.length + 1;
    setMessages((previous) => [
      ...previous,
      { role: "user", text: question },
      { role: "assistant", text: "Thinking…" },
    ]);
    const finish = (text: string, action?: "order_navigation", offerEnquiry = false) =>
      setMessages((previous) =>
        previous.map((entry, index) =>
          index === responseIndex
            ? {
                role: "assistant",
                text,
                ...(offerEnquiry ? { enquiryQuestion: question } : {}),
                ...(action === "order_navigation"
                  ? { link: { href: "#order" as const, label: "Go to Order Online" } }
                  : {}),
              }
            : entry,
        ),
      );
    try {
      const result = assistantResultSchema.parse(
        await ask({
          data: {
            message: question,
            history: messages
              .filter((entry) => !containsContactDetails(entry.text))
              .slice(-6)
              .map(({ role, text }) => ({ role, text: text.slice(0, 2000) })),
          },
        }),
      );
      finish(result.message, result.action, result.status === "unknown");
      if (result.status !== "error") setMessage("");
    } catch {
      finish(ASSISTANT_ERROR);
    } finally {
      pending.current = false;
      setLoading(false);
    }
  };

  const reply = (choice: string, response: ChatMessage) => {
    setMessages((previous) => [...previous, { role: "user", text: choice }, response]);
  };

  const quickAction = (action: string) => {
    setChoosing(action === "Help Me Choose");
    switch (action) {
      case "View Menu":
        reply(action, {
          role: "assistant",
          text: `Coffee\n${COFFEE_ITEMS.map(productLine).join("\n")}\n\nBakery\n${BAKERY_ITEMS.map(productLine).join("\n")}`,
          link: { href: "#menu", label: "Jump to menu" },
        });
        break;
      case "Opening Hours":
        reply(action, {
          role: "assistant",
          text: `${CAFE.weeklyHours.map((hours) => `${hours.days}: ${hours.opens}–${hours.closes}`).join("\n")}\nTimezone: ${CAFE.timezone}. These are regular hours; holiday hours are unknown.`,
        });
        break;
      case "Delivery":
        reply(action, {
          role: "assistant",
          text: [
            CAFE.fulfillment.pickupAvailable ? "Pickup is available." : "",
            CAFE.fulfillment.sameDayDeliveryAvailable
              ? `Same-day delivery is available in ${CAFE.fulfillment.deliveryAreas.join(" and ")}.`
              : "",
            "Delivery outside these areas is not available. Fees, minimum order, lead time, and advance-order availability are not confirmed.",
          ]
            .filter(Boolean)
            .join(" "),
          link: { href: "#order", label: "Go to Order Online" },
        });
        break;
      case "Help Me Choose":
        reply(action, {
          role: "assistant",
          text: "What would you prefer? Choose an option below.",
        });
        break;
    }
  };

  const recommend = (choice: Choice) => {
    const ids: Record<Choice, readonly string[]> = {
      Coffee: ["latte", "americano"],
      "Sweet pastry": ["cinnamon-roll", "almond-croissant"],
      Chocolate: ["pain-au-chocolat"],
      "Dairy-free coffee": ["americano", "latte"],
    };
    const products = ids[choice].flatMap((id) => {
      const item = getMenuItem(id);
      return item ? [`${productLine(item)}\n${item.description}`] : [];
    });
    const alternatives = new Intl.ListFormat("en-US", { type: "disjunction" }).format(
      CAFE.milk.options
        .filter((option) => option.alternative)
        .map((option) => option.name.toLowerCase()),
    );
    const milkNote =
      choice === "Dairy-free coffee"
        ? `\n\nFor a coffee without dairy milk, consider an Americano as described above, or request ${alternatives} instead of whole milk in a latte. Listed prices are base menu prices. The website advertises +${currency(CAFE.milk.alternativeSurcharge)} for alternative milk. The current order form has no milk selector and does not calculate this surcharge. Allergy safety, complete ingredients, and cross-contamination policies are unknown; please check with the café.`
        : "";
    reply(choice, { role: "assistant", text: products.join("\n\n") + milkNote });
    setChoosing(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          role="dialog"
          aria-label="Coffee Room Assistant"
          className="flex max-h-[calc(100dvh-7rem)] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 bg-terracotta px-4 py-3 text-primary-foreground">
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

          <div className="min-h-0 space-y-3 overflow-y-auto px-4 py-4" ref={conversation}>
            <p className="rounded-xl bg-secondary px-3 py-2.5 text-sm leading-relaxed text-secondary-foreground">
              Hi! I can help with our menu, opening hours, pickup, delivery, and product
              recommendations. Please leave personal and contact details out of your questions.
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => quickAction(action)}
                  className="rounded-full border border-terracotta px-3 py-1.5 text-xs font-medium text-terracotta transition hover:bg-terracotta hover:text-primary-foreground"
                >
                  {action}
                </button>
              ))}
            </div>
            <div
              role="log"
              aria-label="Assistant conversation"
              aria-live="polite"
              className="space-y-3"
            >
              {messages.map((entry, index) => (
                <div
                  key={index}
                  className={`rounded-xl px-3 py-2.5 text-sm leading-relaxed ${entry.role === "user" ? "ml-6 bg-terracotta/10 text-foreground" : "bg-secondary text-secondary-foreground"}`}
                >
                  <span className="sr-only">
                    {entry.role === "user" ? "You" : "Coffee Room Assistant"}:{" "}
                  </span>
                  <p className="whitespace-pre-line break-words">{entry.text}</p>
                  {entry.enquiryQuestion && (
                    <button
                      type="button"
                      className={`${choiceClass} mt-2`}
                      disabled={enquiryIndex !== null || loading}
                      onClick={() => {
                        setEnquiryIndex(index);
                        setMessage("");
                      }}
                    >
                      Send to Coffee Room
                    </button>
                  )}
                  {entry.link && (
                    <a
                      href={entry.link.href}
                      onClick={() => setOpen(false)}
                      className="mt-2 inline-block font-medium text-terracotta underline underline-offset-2"
                    >
                      {entry.link.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
            {enquiryIndex !== null && messages[enquiryIndex]?.enquiryQuestion && (
              <AssistantEnquiryForm
                key={enquiryIndex}
                question={messages[enquiryIndex].enquiryQuestion}
                onClose={() => setEnquiryIndex(null)}
              />
            )}
            {choosing && (
              <div className="flex flex-wrap gap-2" aria-label="Product preferences">
                {CHOICES.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    className={choiceClass}
                    onClick={() => recommend(choice)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}
          </div>

          {enquiryIndex === null && (
            <form
              className="flex shrink-0 items-center gap-2 border-t border-border px-3 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!message.trim()) return;
                void submitQuestion();
              }}
            >
              <input
                type="text"
                aria-label="Ask a question"
                maxLength={1000}
                disabled={loading}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question…"
                className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                aria-busy={loading}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-terracotta px-3.5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-terracotta/90"
              >
                {loading ? "Sending…" : "Send"}
                <Send className="size-3.5" aria-hidden />
              </button>
            </form>
          )}
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

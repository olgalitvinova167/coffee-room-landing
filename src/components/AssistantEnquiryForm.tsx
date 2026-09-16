import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { sendEnquiry } from "@/lib/enquiry.functions";
import { enquirySchema, enquiryResultSchema, ENQUIRY_ERROR, type Enquiry } from "@/lib/enquiry";

const fields = ["name", "phone", "email", "message"] as const;
const prompts = [
  "What’s your name?",
  "What’s the best phone number to reach you?",
  "What’s your email address?",
  "Here’s your question. You can edit it before continuing.",
];
export function AssistantEnquiryForm({
  question,
  onClose,
}: {
  question: string;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Enquiry>({
    name: "",
    phone: "",
    email: "",
    message: question,
  });
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const pending = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  const send = useServerFn(sendEnquiry);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [step, error, busy, sent]);
  const buttonClass =
    "rounded-lg bg-terracotta px-3.5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60";
  const field = fields[step];
  return (
    <div className="space-y-3" aria-label="Coffee Room enquiry conversation">
      <p className="text-xs text-muted-foreground">
        These details stay out of AI chat and are sent to Coffee Room only after you confirm.
      </p>
      {fields.slice(0, Math.min(step, 4)).map((field, index) => (
        <div key={field} className="space-y-2 text-sm">
          <p className="rounded-xl bg-secondary p-3">{prompts[index]}</p>
          <p className="ml-6 whitespace-pre-wrap break-words rounded-xl bg-terracotta/10 p-3">
            {values[field]}
          </p>
        </div>
      ))}
      {sent ? (
        <p role="status" className="rounded-xl bg-secondary p-3 text-sm">
          Thanks. Your question has been sent to the Coffee Room team.
        </p>
      ) : field ? (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = enquirySchema.shape[field].safeParse(draft);
            if (!parsed.success) {
              setError(parsed.error.issues[0]?.message ?? "Please check this value and try again.");
              return;
            }
            setValues((previous) => ({ ...previous, [field]: parsed.data }));
            setError("");
            setStep(step + 1);
            setDraft(step === 2 ? values.message : "");
          }}
          className="space-y-3"
        >
          <p className="rounded-xl bg-secondary p-3 text-sm">{prompts[step]}</p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error} Please try again.
            </p>
          )}
          {field === "message" ? (
            <textarea
              autoFocus
              aria-label="Enquiry message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full rounded-lg border border-input bg-background p-3 text-sm"
            />
          ) : (
            <input
              key={field}
              autoFocus
              aria-label={
                field === "name"
                  ? "Your name"
                  : field === "phone"
                    ? "Your phone number"
                    : "Your email address"
              }
              type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={field === "name" ? 80 : field === "phone" ? 40 : 254}
              className="w-full rounded-lg border border-input bg-background p-3 text-sm"
            />
          )}
          <button type="submit" className={buttonClass}>
            {field === "message" ? "Review enquiry" : "Continue"}
          </button>
        </form>
      ) : (
        <div className="space-y-3 rounded-xl bg-secondary p-3 text-sm">
          <p>Please review your enquiry before sending.</p>
          <p className="whitespace-pre-wrap break-words">{`Name: ${values.name}\nPhone: ${values.phone}\nEmail: ${values.email}\nMessage: ${values.message}`}</p>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={busy}
            className={buttonClass}
            onClick={async () => {
              if (pending.current) return;
              pending.current = true;
              setBusy(true);
              setError("");
              try {
                const result = enquiryResultSchema.parse(
                  await send({ data: enquirySchema.parse(values) }),
                );
                if (result.success) setSent(true);
                else setError(result.message);
              } catch {
                setError(ENQUIRY_ERROR);
              } finally {
                pending.current = false;
                setBusy(false);
              }
            }}
          >
            {busy ? "Sending enquiry…" : "Send enquiry"}
          </button>
          <button
            type="button"
            disabled={busy}
            className="ml-3 text-terracotta underline"
            onClick={() => {
              setStep(0);
              setDraft(values.name);
              setError("");
            }}
          >
            Edit details
          </button>
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        className="text-sm text-terracotta underline"
        onClick={onClose}
      >
        {sent ? "Back to assistant" : "Cancel enquiry"}
      </button>
      <div ref={end} />
    </div>
  );
}

import { z } from "zod";

export const assistantInputSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) }))
    .max(6)
    .default([]),
});
export const assistantResultSchema = z.object({
  status: z.enum(["answer", "unknown", "off_topic", "error"]),
  message: z.string().trim().min(1).max(3000),
  action: z.literal("order_navigation").optional(),
});
export type AssistantResult = z.infer<typeof assistantResultSchema>;
export const UNKNOWN =
  "I don’t have confirmed information about that yet. Would you like me to send your question to the Coffee Room team?";
export const OFF_TOPIC =
  "I can help with Coffee Room’s menu, opening hours, pickup, delivery and product recommendations.";
export const ASSISTANT_ERROR =
  "The assistant is unavailable right now. Please try again or use the quick actions above.";

// Reject contact-bearing turns rather than forwarding them to the model.
// History turns with contact details are dropped as well.
export function containsContactDetails(text: string) {
  return /@|https?:\/\/|\bwww\.|(?:\+?\d[\d ().-]{6,}\d)|\b(?:my name|my address|my email|my phone|call me|contact me|reach me|i live|i am called)\b|\b\d+\s+\w+(?:\s+\w+){0,3}\s+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr)\b/i.test(
    text.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "[date]"),
  );
}

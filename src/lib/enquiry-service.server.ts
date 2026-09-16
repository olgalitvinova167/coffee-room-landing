import { enquirySchema, ENQUIRY_ERROR, type EnquiryResult } from "./enquiry.ts";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function deliverEnquiry(
  input: unknown,
  options: {
    botToken?: string | undefined;
    chatId?: string | undefined;
    fetch?: typeof fetch;
  },
): Promise<EnquiryResult> {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: "Please check your name, contact details and message." };
  if (!options.botToken?.trim() || !options.chatId?.trim())
    return { success: false, message: ENQUIRY_ERROR };
  const reference = `CE-${crypto.randomUUID()}`;
  const { name, phone, email, message } = parsed.data;
  const text = [
    "<b>New Coffee Room Enquiry</b>",
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Phone:</b> ${escapeHtml(phone)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    `<b>Message:</b> ${escapeHtml(message)}`,
    `<b>Enquiry reference:</b> ${reference}`,
    `<b>Timestamp:</b> ${new Date().toISOString()}`,
  ].join("\n");
  try {
    const response = await (options.fetch ?? fetch)(
      `https://api.telegram.org/bot${options.botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chat_id: options.chatId, text, parse_mode: "HTML" }),
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!response.ok) return { success: false, message: ENQUIRY_ERROR };
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("ok" in payload) || payload.ok !== true)
      return { success: false, message: ENQUIRY_ERROR };
    return { success: true, reference };
  } catch {
    // Never log the token-bearing URL, customer details or API responses, or retry automatically.
    return { success: false, message: ENQUIRY_ERROR };
  }
}

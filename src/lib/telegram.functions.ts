import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { orderFormSchema, buildOrder, formatCurrency, TAX_RATE } from "@/lib/order";

const CHAT_ID = "1376058571";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const sendOrderToTelegram = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderFormSchema.parse(input))
  .handler(async ({ data }) => {
    const order = buildOrder(data);
    if (order.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    const lovableApiKey = process.env["LOVABLE_API_KEY"];
    const telegramApiKey = process.env["TELEGRAM_API_KEY"];
    if (!lovableApiKey || !telegramApiKey) {
      throw new Error("Telegram is not configured");
    }

    const address = order.fulfillment.address;
    const lines = [
      `<b>New Coffee Room order ${escapeHtml(order.reference)}</b>`,
      "",
      `<b>Name:</b> ${escapeHtml(order.customer.fullName)}`,
      `<b>Phone:</b> ${escapeHtml(order.customer.phone)}`,
      `<b>Email:</b> ${escapeHtml(order.customer.email)}`,
      `<b>Order type:</b> ${order.fulfillment.type === "delivery" ? "Delivery" : "Pick-up"}`,
      ...(address
        ? [
            `<b>Address:</b> ${escapeHtml(
              `${address.streetAddress}, ${address.city} ${address.postcode}`,
            )}`,
          ]
        : []),
      `<b>Date:</b> ${escapeHtml(order.fulfillment.date)}`,
      `<b>Time:</b> ${escapeHtml(order.fulfillment.time)}`,
      "",
      ...order.items.map(
        (item) =>
          `<b>${item.category === "coffee" ? "Coffee" : "Bakery"}:</b> ${escapeHtml(item.name)} × ${
            item.quantity
          } — ${formatCurrency(item.lineTotal)}`,
      ),
      `<b>Quantity:</b> ${data.quantity}`,
      ...(order.notes ? [`<b>Notes:</b> ${escapeHtml(order.notes)}`] : []),
      "",
      `<b>Subtotal:</b> ${formatCurrency(order.totals.subtotal)}`,
      `<b>Tax (${(TAX_RATE * 100).toFixed(3)}%):</b> ${formatCurrency(order.totals.tax)}`,
      `<b>Total:</b> ${formatCurrency(order.totals.total)}`,
    ];

    const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": telegramApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: lines.join("\n"),
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Telegram sendMessage failed [${response.status}]: ${errorBody}`);
      throw new Error(`Telegram request failed [${response.status}]`);
    }

    const payload = (await response.json()) as { ok?: boolean; description?: string };
    if (!payload.ok) {
      console.error(`Telegram sendMessage returned not-ok: ${payload.description ?? "unknown"}`);
      throw new Error("Telegram rejected the order message");
    }

    return { order };
  });

export type SendOrderInput = z.infer<typeof orderFormSchema>;

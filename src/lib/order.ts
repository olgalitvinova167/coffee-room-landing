import { z } from "zod";
import { getMenuItem } from "@/data/menu";

/**
 * Clean, transport-agnostic order data model.
 * The shape below is what a future Telegram bot (or any backend) would receive.
 */

export const TAX_RATE = 0.08875;

export const orderTypeSchema = z.enum(["pickup", "delivery"]);
export type OrderType = z.infer<typeof orderTypeSchema>;

export const orderFormSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  orderType: orderTypeSchema,
  date: z.string().min(1, "Please choose a date"),
  time: z.string().min(1, "Please choose a time"),
  coffeeId: z.string().optional(),
  bakeryId: z.string().optional(),
  quantity: z.number().int().min(1).max(20),
  notes: z.string().max(200).optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export interface OrderLineItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  category: "coffee" | "bakery";
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
}

export interface Order {
  reference: string;
  placedAt: string;
  customer: { fullName: string; phone: string; email: string };
  fulfillment: { type: OrderType; date: string; time: string };
  items: OrderLineItem[];
  totals: OrderTotals;
  notes?: string | undefined;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function buildLineItems(values: Partial<OrderFormValues>): OrderLineItem[] {
  const quantity = values.quantity && values.quantity > 0 ? values.quantity : 1;
  const ids = [values.coffeeId, values.bakeryId].filter(Boolean) as string[];

  return ids.flatMap((id) => {
    const item = getMenuItem(id);
    if (!item) return [];
    return [
      {
        id: item.id,
        name: item.name,
        unitPrice: item.price,
        quantity,
        lineTotal: round(item.price * quantity),
        category: item.category,
      },
    ];
  });
}

export function calculateTotals(items: OrderLineItem[]): OrderTotals {
  const subtotal = round(items.reduce((sum, i) => sum + i.lineTotal, 0));
  const tax = round(subtotal * TAX_RATE);
  return { subtotal, tax, total: round(subtotal + tax) };
}

export function createOrderReference() {
  return `CR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function buildOrder(values: OrderFormValues): Order {
  const items = buildLineItems(values);
  return {
    reference: createOrderReference(),
    placedAt: new Date().toISOString(),
    customer: { fullName: values.fullName, phone: values.phone, email: values.email },
    fulfillment: { type: values.orderType, date: values.date, time: values.time },
    items,
    totals: calculateTotals(items),
    notes: values.notes?.trim() || undefined,
  };
}

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

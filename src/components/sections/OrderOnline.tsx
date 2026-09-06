import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Check, Clock, Leaf, Lock, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { sendOrderToTelegram } from "@/lib/telegram.functions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BAKERY_ITEMS, CAFE, COFFEE_ITEMS, getMenuItem } from "@/data/menu";
import {
  buildLineItems,
  buildOrder,
  calculateTotals,
  formatCurrency,
  orderFormSchema,
  TAX_RATE,
  type Order,
  type OrderFormValues,
  type OrderType,
} from "@/lib/order";

const NONE = "none";

const emptyValues: OrderFormValues = {
  fullName: "",
  phone: "",
  email: "",
  orderType: "pickup",
  date: "",
  time: "",
  streetAddress: "",
  city: "",
  postcode: "",
  coffeeId: "",
  bakeryId: "",
  quantity: 1,
  notes: "",
};

export function OrderOnline() {
  const sendOrder = useServerFn(sendOrderToTelegram);
  const [values, setValues] = useState<OrderFormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);


  const set = <K extends keyof OrderFormValues>(key: K, value: OrderFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const items = useMemo(
    () =>
      buildLineItems({
        ...values,
        coffeeId: values.coffeeId && values.coffeeId !== NONE ? values.coffeeId : undefined,
        bakeryId: values.bakeryId && values.bakeryId !== NONE ? values.bakeryId : undefined,
      }),
    [values],
  );
  const totals = useMemo(() => calculateTotals(items), [items]);

  const isDelivery = values.orderType === "delivery";
  const label = isDelivery ? "Delivery" : "Pick-up";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const candidate: OrderFormValues = {
      ...values,
      coffeeId: values.coffeeId && values.coffeeId !== NONE ? values.coffeeId : undefined,
      bakeryId: values.bakeryId && values.bakeryId !== NONE ? values.bakeryId : undefined,
    };
    const parsed = orderFormSchema.safeParse(candidate);
    const nextErrors: Record<string, string> = {};

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
    }
    if (!candidate.coffeeId && !candidate.bakeryId) {
      nextErrors["items"] = "Please choose at least one coffee or bakery item";
    }

    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0 || !parsed.success) return;

    setSubmitting(true);
    try {
      const result = await sendOrder({ data: parsed.data });
      setPlacedOrder(result.order);
      setValues(emptyValues);
      window.setTimeout(
        () => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" }),
        0,
      );
    } catch (error) {
      console.error(error);
      setSubmitError(
        "We couldn't send your order just now. Please try again, or call us to order by phone.",
      );
    } finally {
      setSubmitting(false);
    }
  };


  if (placedOrder) {
    return (
      <section id="order" className="scroll-mt-20 bg-beige/60">
        <div className="mx-auto max-w-2xl px-5 py-20 text-center lg:px-8">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-olive text-olive-foreground">
            <Check className="size-7" />
          </span>
          <h2 className="mt-6 font-display text-3xl font-bold text-foreground">
            Thank you, {placedOrder.customer.fullName.split(" ")[0]}!
          </h2>
          <p className="mt-3 text-muted-foreground">
            Your order <span className="font-semibold text-terracotta">{placedOrder.reference}</span>{" "}
            is confirmed for {placedOrder.fulfillment.type === "delivery" ? "delivery" : "pick-up"} on{" "}
            {placedOrder.fulfillment.date} at {placedOrder.fulfillment.time}. We sent a copy to{" "}
            {placedOrder.customer.email}.
          </p>

          <div className="mt-8 rounded-xl border border-border bg-card p-6 text-left">
            {placedOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 py-1.5 text-sm">
                <span className="min-w-0 text-foreground">
                  {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium">{formatCurrency(item.lineTotal)}</span>
              </div>
            ))}
            <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(placedOrder.totals.total)}</span>
            </div>
          </div>

          <Button className="mt-8" size="lg" onClick={() => setPlacedOrder(null)}>
            Place another order
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="order" className="scroll-mt-20 bg-beige/60">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Order Online
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tell us what you&apos;d like, and we&apos;ll have it ready with care. Same-day pickup or
            delivery available.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-10 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          {/* Form card */}
          <div className="space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div>
              <h3 className="font-display text-xl font-semibold text-terracotta">Your Details</h3>
              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <Field label="Full Name" error={errors["fullName"]}>
                  <Input
                    value={values.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </Field>
                <Field label="Phone Number" error={errors["phone"]}>
                  <Input
                    value={values.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="(718) 123-4567"
                  />
                </Field>
                <Field label="Email Address" error={errors["email"]}>
                  <Input
                    type="email"
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </Field>
              </div>

              <div className="mt-6">
                <Label className="text-sm">Order Type</Label>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  <OrderTypeOption
                    active={!isDelivery}
                    onSelect={() => set("orderType", "pickup")}
                    icon={<ShoppingBag className="size-5" />}
                    title="Pick-up"
                    subtitle="Ready at our café"
                  />
                  <OrderTypeOption
                    active={isDelivery}
                    onSelect={() => set("orderType", "delivery")}
                    icon={<Truck className="size-5" />}
                    title="Delivery"
                    subtitle="We'll bring it to you"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label={`${label} Date`} error={errors["date"]}>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-9"
                      value={values.date}
                      onChange={(e) => set("date", e.target.value)}
                    />
                  </div>
                </Field>
                <Field label={`${label} Time`} error={errors["time"]}>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="time"
                      className="pl-9"
                      value={values.time}
                      onChange={(e) => set("time", e.target.value)}
                    />
                  </div>
                </Field>
              </div>

              {isDelivery ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-3">
                  <Field label="Street Address" error={errors["streetAddress"]}>
                    <Input
                      value={values.streetAddress ?? ""}
                      onChange={(e) => set("streetAddress", e.target.value)}
                      placeholder="123 Maple Street"
                    />
                  </Field>
                  <Field label="City" error={errors["city"]}>
                    <Input
                      value={values.city ?? ""}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="Brooklyn"
                    />
                  </Field>
                  <Field label="Postcode" error={errors["postcode"]}>
                    <Input
                      value={values.postcode ?? ""}
                      onChange={(e) => set("postcode", e.target.value)}
                      placeholder="11201"
                    />
                  </Field>
                </div>
              ) : null}
            </div>

            <div>
              <h3 className="font-display text-xl font-semibold text-terracotta">Your Order</h3>
              <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_1fr_auto]">
                <Field label="Coffee Selection">
                  <Select value={values.coffeeId ?? ""} onValueChange={(v) => set("coffeeId", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your coffee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No coffee</SelectItem>
                      {COFFEE_ITEMS.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} — {formatCurrency(item.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Bakery Selection">
                  <Select value={values.bakeryId ?? ""} onValueChange={(v) => set("bakeryId", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your bakery item" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>No bakery item</SelectItem>
                      {BAKERY_ITEMS.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} — {formatCurrency(item.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Quantity">
                  <div className="flex h-9 items-center rounded-md border border-input bg-background">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => set("quantity", Math.max(1, values.quantity - 1))}
                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{values.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => set("quantity", Math.min(20, values.quantity + 1))}
                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </Field>
              </div>

              {errors["items"] ? (
                <p className="mt-3 text-sm text-destructive">{errors["items"]}</p>
              ) : null}

              <div className="mt-5">
                <Field label="Order Notes (Optional)">
                  <div className="relative">
                    <Textarea
                      rows={3}
                      maxLength={200}
                      value={values.notes ?? ""}
                      onChange={(e) => set("notes", e.target.value)}
                      placeholder="Any special requests or notes?"
                      className="resize-none pb-7"
                    />
                    <span className="absolute right-3 bottom-2 text-xs text-muted-foreground">
                      {(values.notes ?? "").length} / 200
                    </span>
                  </div>
                </Field>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-lg bg-muted p-4">
                <Leaf className="mt-0.5 size-5 shrink-0 text-olive" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Everything is baked fresh daily.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Thank you for supporting local and choosing quality.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border border-border bg-card p-6 sm:p-8 lg:sticky lg:top-28">
            <h3 className="font-display text-xl font-semibold text-foreground">
              Your Order Summary
            </h3>

            <div className="mt-5 space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing selected yet — choose a coffee or bakery item to see your total.
                </p>
              ) : (
                items.map((line) => {
                  const menuItem = getMenuItem(line.id);
                  return (
                    <div key={line.id} className="flex items-center gap-3">
                      {menuItem ? (
                        <img
                          src={menuItem.image}
                          alt={menuItem.name}
                          loading="lazy"
                          width={800}
                          height={640}
                          className="size-14 shrink-0 rounded-md object-cover"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{line.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(line.unitPrice)} × {line.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-terracotta">
                        {formatCurrency(line.lineTotal)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
              <Row label={`Tax (${(TAX_RATE * 100).toFixed(3)}%)`} value={formatCurrency(totals.tax)} />
              <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold text-foreground">
                {isDelivery ? "Delivery from Coffee Room" : "Pick-up at Coffee Room"}
              </p>
              <p className="mt-1 text-muted-foreground">{CAFE.address}</p>
              <p className="text-muted-foreground">
                We&apos;ll have your order ready at your selected time.
              </p>
            </div>

            {submitError ? (
              <p className="mt-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {submitError}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
              {submitting ? "Sending your order…" : "Place Order"}
              <ShoppingBag className="size-4" />
            </Button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3" />
              Secure checkout. Your information is safe with us.
            </p>
          </aside>
        </form>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <Label className="mb-2 block text-sm font-normal text-foreground/80">{label}</Label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function OrderTypeOption({
  active,
  onSelect,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
        active
          ? "border-terracotta bg-terracotta/5"
          : "border-border bg-background hover:border-terracotta/40",
      )}
    >
      <span className={cn("shrink-0", active ? "text-terracotta" : "text-muted-foreground")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm font-semibold", active && "text-terracotta")}>
          {title}
        </span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
      {active ? <Check className="size-4 shrink-0 text-terracotta" /> : null}
    </button>
  );
}

export type { OrderType };

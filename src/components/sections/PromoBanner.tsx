import { ArrowRight, ShoppingBag } from "lucide-react";
import promoImage from "@/assets/promo.jpg";

export function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24">
      <div className="relative overflow-hidden rounded-2xl bg-olive">
        <img
          src={promoImage}
          alt="Takeaway coffee cup and a paper bag of pastries"
          loading="lazy"
          width={1000}
          height={560}
          className="absolute inset-y-0 right-0 hidden h-full w-1/3 object-cover opacity-90 md:block"
        />
        <div className="relative grid items-center gap-5 p-7 md:grid-cols-[minmax(0,1fr)_auto] md:p-10 md:pr-[36%]">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-olive-foreground/90">
              <ShoppingBag className="size-5 text-olive" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-olive-foreground/85">
                Coffee, pastries, and more — ready when you are.
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-olive-foreground sm:text-2xl">
                Order online for pickup or same-day delight.
              </p>
            </div>
          </div>
          <a
            href="#order"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-olive-foreground px-5 py-3 text-sm font-medium text-olive transition-opacity hover:opacity-90"
          >
            Order Online Now
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

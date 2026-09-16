import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { BAKERY_ITEMS, COFFEE_ITEMS } from "@/data/menu";
import { CAFE } from "@/data/cafe";

const milkNames = new Intl.ListFormat("en-US", { type: "disjunction" }).format(
  CAFE.milk.options.map((option) => option.id),
);

export function FeaturedMenu() {
  return (
    <section id="menu" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-terracotta">Featured Favorites</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Made fresh. Just for you.
          </h2>
        </div>
        <a
          href="#order"
          className="hidden shrink-0 items-center gap-2 text-sm font-medium text-terracotta hover:underline sm:inline-flex"
        >
          View Full Menu
          <ArrowRight className="size-4" />
        </a>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {COFFEE_ITEMS.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Your coffee, your way — choose {milkNames} milk in any coffee. Alternative milk{" "}
        <span className="font-medium text-terracotta">
          +${CAFE.milk.alternativeSurcharge.toFixed(2)}
        </span>
        .
      </p>

      <div id="bakery" className="mt-14 scroll-mt-24">
        <p className="eyebrow text-terracotta">From the Bakery</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
          Baked fresh every morning.
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BAKERY_ITEMS.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <a
        href="#order"
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-terracotta hover:underline sm:hidden"
      >
        View Full Menu
        <ArrowRight className="size-4" />
      </a>
    </section>
  );
}

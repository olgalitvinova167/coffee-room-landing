import type { MenuItem } from "@/data/menu";
import { formatCurrency } from "@/lib/order";

export function ProductCard({ item }: { item: MenuItem }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-[0_18px_40px_-24px_oklch(0.29_0.05_48/0.45)]">
      <div className="aspect-[5/4] overflow-hidden bg-muted">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width={800}
          height={640}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-1.5 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-foreground">{item.name}</h3>
          <span className="shrink-0 text-sm font-semibold text-terracotta">
            {formatCurrency(item.price)}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
    </article>
  );
}

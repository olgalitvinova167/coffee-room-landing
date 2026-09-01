import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero.jpg";

export function Hero() {
  return (
    <section id="home" className="bg-beige">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl leading-[1.08] font-bold text-foreground sm:text-5xl lg:text-6xl">
            Warm coffee.
            <br />
            Fresh bakery.
            <br />
            Slow mornings.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Thoughtfully sourced ingredients, crafted with care. A cozy space to savor the little
            things — one cup and one warm pastry at a time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#order">
                <ShoppingBag className="size-4" />
                Order Online
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-terracotta/50 text-terracotta">
              <a href="#menu">View Menu</a>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl">
          <img
            src={heroImage}
            alt="Latte with rosetta art beside a golden croissant on a wooden café table"
            width={1600}
            height={1104}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Coffee", href: "#menu" },
  { label: "Bakery", href: "#bakery" },
  { label: "About", href: "#about" },
  { label: "Order Online", href: "#order" },
  { label: "Contact", href: "#contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <a href="#home" className="min-w-0">
          <span className="block font-display text-2xl leading-none font-bold text-foreground">
            Coffee Room
          </span>
          <span className="eyebrow mt-1 block text-terracotta">Coffee &amp; Bakery</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-terracotta"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="lg" className="hidden shrink-0 sm:inline-flex">
            <a href="#order">
              Order Online
              <ShoppingBag className="size-4" />
            </a>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 shrink-0 place-items-center rounded-md border border-border text-foreground lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div className={cn("border-t border-border bg-background lg:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-7xl flex-col px-5 py-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-border/60 py-3 text-sm font-medium text-foreground/85 last:border-0"
            >
              {link.label}
            </a>
          ))}
          <Button asChild className="my-3 sm:hidden">
            <a href="#order" onClick={() => setOpen(false)}>
              Order Online
              <ShoppingBag className="size-4" />
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}

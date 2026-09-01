import { useState } from "react";
import { ArrowRight, Facebook, Instagram, Music2 } from "lucide-react";
import { CAFE } from "@/data/menu";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer id="contact" className="scroll-mt-20 border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-2xl font-bold text-foreground">Coffee Room</p>
          <p className="eyebrow mt-1 text-terracotta">Coffee &amp; Bakery</p>
          <address className="mt-5 space-y-1 text-sm not-italic text-muted-foreground">
            <p>123 Maple Street</p>
            <p>Brooklyn, NY 11201</p>
            <p>
              <a href={`tel:${CAFE.phone}`} className="hover:text-terracotta">
                {CAFE.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${CAFE.email}`} className="hover:text-terracotta">
                {CAFE.email}
              </a>
            </p>
          </address>
        </div>

        <div>
          <p className="eyebrow text-foreground">Hours</p>
          <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
            {CAFE.hours.map((h) => (
              <div key={h.days} className="flex gap-4">
                <dt className="w-20 shrink-0">{h.days}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">
            We&apos;re open every day
            <br />
            for your coffee &amp; pastry fix.
          </p>
        </div>

        <div>
          <p className="eyebrow text-foreground">Follow Us</p>
          <div className="mt-4 flex gap-3">
            {[Instagram, Facebook, Music2].map((Icon, i) => (
              <a
                key={i}
                href="#contact"
                aria-label="Social profile"
                className="grid size-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-terracotta hover:text-terracotta"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{CAFE.instagram}</p>
        </div>

        <div>
          <p className="eyebrow text-foreground">Stay in the Loop</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Be the first to know about new treats, specials, and cozy happenings.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@")) setSubscribed(true);
            }}
            className="mt-4 flex gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              aria-label="Your email address"
              className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90"
            >
              <ArrowRight className="size-4" />
            </button>
          </form>
          {subscribed ? (
            <p className="mt-2 text-sm text-olive">Thanks! You&apos;re on the list.</p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-muted-foreground lg:px-8">
          © {new Date().getFullYear()} Coffee Room. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

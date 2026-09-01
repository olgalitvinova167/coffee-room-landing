import { Button } from "@/components/ui/button";
import interiorImage from "@/assets/interior.jpg";

const HIGHLIGHTS = [
  "Baked fresh daily, never the day before",
  "Small-batch beans roasted for balance, not bitterness",
  "A welcoming room made for lingering",
];

export function About() {
  return (
    <section id="about" className="bg-beige/60 scroll-mt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={interiorImage}
            alt="Warm café interior with wooden tables, pendant lighting and a bakery display case"
            loading="lazy"
            width={1200}
            height={912}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div className="max-w-xl">
          <p className="eyebrow text-terracotta">About Coffee Room</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
            A cozy corner in your day.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Coffee Room is a neighborhood café and bakery inspired by European coffee culture and
            the joy of slowing down. Our pastries come out of the oven each morning, our espresso is
            pulled to order, and there is always a seat by the window waiting for you.
          </p>
          <ul className="mt-6 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-foreground/85">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-terracotta" />
                {h}
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-8 bg-olive text-olive-foreground hover:bg-olive/90">
            <a href="#contact">Learn More About Us</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

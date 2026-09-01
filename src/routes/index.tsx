import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/sections/Hero";
import { FeaturedMenu } from "@/components/sections/FeaturedMenu";
import { About } from "@/components/sections/About";
import { OrderOnline } from "@/components/sections/OrderOnline";
import { PromoBanner } from "@/components/sections/PromoBanner";
import { SiteFooter } from "@/components/sections/SiteFooter";

const title = "Coffee Room — Cozy Coffee & Bakery in Brooklyn";
const description =
  "Warm coffee, fresh bakery, slow mornings. Order lattes, croissants and cinnamon rolls online for same-day pickup or delivery from Coffee Room in Brooklyn.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <FeaturedMenu />
        <About />
        <OrderOnline />
        <PromoBanner />
      </main>
      <SiteFooter />
    </div>
  );
}

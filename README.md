# Coffee Room Landing

Build a responsive single-page landing page for a cozy coffee shop and bakery called "Coffee Room". Use the three attached reference images as the main visual direction — match the warm, cozy, premium aesthetic, layout logic, typography (elegant serif headings + clean sans-serif body), product card style, and order form structure shown in them. Don't copy every pixel, but the site should be clearly inspired by these references. Color palette: cream, beige, warm brown, caramel, soft terracotta, muted olive accents.

Structure:
1. Header/Nav — logo "Coffee Room" with small subtitle "Coffee & Bakery", nav links (Home, Menu, Bakery, About, Order Online, Contact), prominent "Order Online" button.
2. Hero — headline "Warm coffee. Fresh bakery. Slow mornings.", short supporting copy about quality ingredients and cozy atmosphere, two CTAs ("Order Online", "View Menu"), large hero image area for a coffee cup + croissant photo.
3. Featured Menu — title "Made fresh. Just for you.", product cards (image, name, short description, price) for at least: Latte, Cappuccino, Americano, Flat White, Butter Croissant, Almond Croissant, Cinnamon Roll, Pain au Chocolat. Include "View Full Menu" link/button.
4. About — short cozy-café story, warm interior image, mentions fresh daily baking/quality coffee/welcoming atmosphere, "Learn More About Us" button.
5. Order Online section — a real working order form with: Full Name, Phone Number, Email Address, Order Type (Pick-up/Delivery), Pick-up/Delivery Date, Pick-up/Delivery Time, Coffee Selection (dropdown), Bakery Selection (dropdown), Quantity, Order Notes (optional). Next to/below it, a live Order Summary panel showing selected items, quantity, subtotal, tax, and total. On submit, show a confirmation/success message (no payment gateway). Structure the order data cleanly (e.g. a well-defined order object/schema) so it can later be wired to a Telegram bot — this matters, keep the data model clean even though no integration is needed yet.
6. Promo banner — "Coffee, pastries, and more — ready when you are." with an "Order Online Now" button.
7. Contact/Footer — address, phone, email, opening hours, social icons, small newsletter email signup field.

Technical: fully responsive desktop/mobile, reusable components for sections and product cards, consistent spacing/typography/buttons, polished premium feel suitable as a portfolio/demo piece, not cluttered. Use nice stock-style imagery for coffee cups with latte art, pastries, croissants, cinnamon rolls, and a cozy café interior matching the references.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://coffee-room-landing.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/48e8604f-7d5c-4bae-a324-f59252e42ebf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

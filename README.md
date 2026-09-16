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

## Coffee Room assistant

Free-text chat uses a TanStack Start server function and the OpenAI Responses API.
Quick actions remain local and work without API credentials. Unknown cafe questions offer a conversational Telegram enquiry flow. Confirmed same-day delivery areas are Downtown Brooklyn, Brooklyn Heights, DUMBO, Cobble Hill, Boerum Hill and Fort Greene. Outside coverage is unavailable and does not trigger enquiries; fees, minimums and lead times remain unknown. Custom cakes, large orders, catering and other useful unresolved café requests can trigger enquiries.

Set `OPENAI_API_KEY` and `OPENAI_MODEL` in the server environment. The model must support
Responses API Structured Outputs. `.env.example` contains placeholders only; never put a
key in a `VITE_` variable or commit real environment files.

For local development, copy `.env.example` to the ignored `.env.local`, fill in both values,
and start with Node 24 (the bundled runtime) so the variables reach the server process:

```sh
node --env-file=.env.local node_modules/vite/bin/vite.js dev --host 127.0.0.1
```

Restart after changing environment values. Set equivalent server secrets in the hosting
environment for deployment; the ordinary Vite client environment is not sufficient.
Missing credentials show a recoverable unavailable message instead of making a request.

Requests use `store: false`, a 20-second timeout, a 1,000-character question limit and at most
six recent turns of 2,000 characters each. Chat remains in React memory. Order/contact form
data is never read. Contact-bearing chat turns are blocked/omitted using conservative pattern
checks; this is not a general-purpose personal-data detector, so users should not enter personal
details. Provider data-retention policies still apply despite `store: false`.

Menu facts come from `src/data/menu.ts`, business facts from `src/data/cafe.ts`. Regular hours
are calculated in code, with today/tomorrow resolved in `America/New_York`. Bare weekday
names mean the next occurrence including today; “next Friday” excludes today. Holiday hours
and advance-order capacity remain unconfirmed. Natural-language intent extraction and answer
grounding still require live model evaluation before public release. Public deployment should
also configure host-level rate limits and spending controls.

Run focused tests (mocked OpenAI, no key or network needed) with Node 24:

```sh
node --test tests/assistant.test.ts
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vite/bin/vite.js build
```

## Assistant enquiries

Set server-only TELEGRAM_ENQUIRY_BOT_TOKEN to the token for @coffee_room_enquiry_bot (Coffee Room Assistant), and TELEGRAM_ENQUIRY_CHAT_ID to 1376058571. Enquiries use the direct Telegram Bot API, independently of the Lovable Telegram connector. Restart after configuring the local environment. The existing order handler and its LOVABLE_API_KEY / TELEGRAM_API_KEY configuration are unchanged. Only the reviewed name, phone, email and message plus a generated reference and timestamp are sent; chat history is never included. Sending requires an explicit Send enquiry click. Name, phone and email are collected one at a time, then the prefilled message can be edited and reviewed before sending. These details are excluded from OpenAI history. Failures retain the review details; retries are manual and an ambiguous timeout may result in duplicates.

Run enquiry and assistant tests with: node --test tests/assistant.test.ts tests/enquiry.test.ts

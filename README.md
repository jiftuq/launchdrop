# 🚀 LaunchDrop — AI Dropshipping Store Generator

Paste any product URL → get a fully-branded, conversion-optimized store in under 60 seconds. Powered by Claude AI + Convex + React.

## How it works

1. **Paste a product URL** — Amazon, AliExpress, Temu, Etsy, Shopify, etc.
2. **AI analyzes the product** — Claude scrapes the page, extracts product data (name, price, features, audience)
3. **AI generates a complete store** — custom branding, color scheme, typography, headlines, testimonials, FAQ, urgency elements
4. **Preview & publish** — one-click publishing with custom subdomain

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Vite |
| Backend | Convex (real-time database + serverless actions) |
| AI | Claude API (Anthropic) via Convex actions |
| Styling | Custom CSS design system |
| Icons | Lucide React |

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd launchdrop
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

This will:
- Create a Convex project (sign up if needed)
- Generate the `_generated` types
- Give you a `VITE_CONVEX_URL` — add it to `.env.local`

### 3. Add your Anthropic API key

Go to the **Convex Dashboard** → your project → **Settings** → **Environment Variables**, and add:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 4. Run the app

```bash
npm run dev
```

Open `http://localhost:5173` and paste a product URL!

## Project Structure

```
launchdrop/
├── convex/
│   ├── schema.ts          # Database schema (stores table)
│   ├── stores.ts          # Queries & mutations (CRUD)
│   └── generateStore.ts   # AI action (scrape → analyze → generate)
├── src/
│   ├── main.tsx           # Entry point with Convex provider
│   ├── App.tsx            # Router
│   ├── index.css          # Design system & global styles
│   └── components/
│       ├── Landing.tsx     # Landing page + URL input
│       ├── StoreBuilder.tsx # Generation progress UI
│       ├── StorePreview.tsx # Renders AI-generated store
│       └── Dashboard.tsx   # Store management
├── index.html
├── package.json
└── .env.local.example
```

## AI Pipeline (Convex Action)

The `generateStore` action in `convex/generateStore.ts` runs a 3-step pipeline:

1. **Scrape** — fetches the product URL and extracts HTML content
2. **Analyze** — sends content to Claude to extract structured product data (name, price, features, audience)
3. **Generate** — sends product data to Claude to create a complete store config (branding, colors, fonts, copy, testimonials, FAQ, urgency elements)

Each step updates the store's status in real-time, so the frontend shows live progress.

## Extending

Some ideas for next steps:

- **Auth** — add Clerk or Auth0 for user accounts
- **Custom domains** — let users connect their own domains
- **Payment integration** — add Stripe checkout to generated stores
- **Product image proxy** — cache and serve product images
- **Store editor** — visual drag-and-drop to customize generated stores
- **Multiple products** — support multi-product catalogs
- **A/B testing** — generate multiple store variants and track conversions
- **Export** — download store as static HTML/CSS

## License

MIT

# Mietealle — B2B Industrial Equipment Rental Marketplace

> A three-sided marketplace connecting industrial equipment vendors with business renters across Germany, with full admin oversight and AI-powered features.

---

## What is Mietealle?

Mietealle is a **B2B SaaS rental marketplace** — like Airbnb, but for industrial equipment. Businesses that own forklifts, LED display boards, generators, sound systems and other industrial assets can list them for daily rent. Other businesses can discover, book, and receive those assets without the cost of ownership.

**Key differentiator:** Mietealle is a pure marketplace — we own no equipment. Revenue comes from a commission (default 10%, adjustable per vendor) on every confirmed booking.

---

## Modules

| Module | Path | Who uses it |
|---|---|---|
| **Marketplace** | `/marketplace` | Public — browse without login |
| **Vendor Portal** | `/vendor/*` | Equipment owners — list, manage, track |
| **Renter Portal** | `/renter/*` | Businesses — browse, book, track orders |
| **Admin Console** | `/admin/*` | Platform team — verify, monitor, commission |
| **AI Features** | `/ai-features` | Demo — explains all 3 planned AI capabilities |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| Storage | Supabase Storage (product images, KYC docs) |
| Deployment | Vercel |

---

## Project Structure

```
Rent-All/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Public landing page
│   ├── marketplace/            # Product browse + detail
│   ├── vendor/                 # Vendor portal (dashboard, products, bookings)
│   ├── renter/                 # Renter portal (dashboard, orders, history)
│   ├── admin/                  # Admin console (layout wraps all admin pages)
│   ├── ai-features/            # AI capabilities showcase page
│   └── api/                    # Next.js API routes (all data operations)
│       ├── auth/               # login, register
│       ├── products/           # CRUD + filtering
│       ├── bookings/           # Create, list, update status
│       ├── admin/              # users list, verify endpoint
│       └── upload/             # Image upload to Supabase Storage
├── components/
│   ├── layout/                 # Navbar, VendorSidebar, RenterSidebar, AdminSidebar/Topbar
│   ├── ui/                     # Shared UI (Card, Badge, NotificationBell)
│   └── ai/                     # Interactive AI demo widgets
│       ├── SmartPricingWidget.tsx    # Vendor: suggests optimal price
│       ├── AIMatchingPanel.tsx       # Renter: recommended products
│       └── DemandForecastWidget.tsx  # Admin: category demand forecast
├── lib/
│   ├── session.ts              # Cookie-based auth session helper
│   ├── mock-data.ts            # Static seed data fallback
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # formatCurrency, formatDate, etc.
├── supabase/
│   ├── schema.sql              # Base schema — run this first
│   └── schema-v2.sql           # Extended schema (tracking, ratings, media)
├── scripts/
│   └── seed.mjs                # Seeds all 5 demo accounts + products + bookings
├── .env.example                # Template for environment variables (safe to commit)
└── .env.local                  # Your actual secrets (NEVER committed — in .gitignore)
```

---

## Local Development

### Prerequisites

- Node.js 18+ (`node --version` to check)
- A free [Supabase](https://supabase.com) account and project

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/mietealle.git
cd mietealle
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Where to find them:** supabase.com → your project → Settings → API

### 3. Set up the database

**Step A — Base schema:**
1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new)
2. Copy the entire contents of `supabase/schema.sql`
3. Paste into the editor and click **Run**

**Step B — Extended schema** (booking tracking, ratings, quality check):
1. Same SQL Editor
2. Copy `supabase/schema-v2.sql`
3. Paste and click **Run**

### 4. Seed demo data

```bash
# Required for Node 20 (WebSocket support)
npm install ws

node scripts/seed.mjs
```

This creates all 5 demo accounts, 6 equipment listings, and 3 sample bookings in your Supabase project.

### 5. Start the server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the landing page with equipment listings.

---

## Demo Accounts

Use the floating **Demo Navigator** (bottom-right corner) to jump between modules, or log in manually:

| Role | Email | Password | What you'll see |
|---|---|---|---|
| **Admin** | admin@mietealle.de | admin123 | Platform dashboard, KYC verifications, all bookings, AI demand forecast |
| **Vendor (verified)** | k.mueller@techequip.de | vendor123 | 4 active listings, booking management, Smart Pricing AI |
| **Vendor (pending)** | m.weber@avpro.de | vendor123 | Pending KYC state, 2 listings |
| **Renter (verified)** | s.bauer@eventco.de | renter123 | 2 active orders, AI product recommendations |
| **Renter (pending)** | f.hoffmann@bautech.de | renter123 | Pending KYC state |

> **Tip:** Hit **"🔄 Clear Session & Start Fresh"** in the Demo Navigator to log out all users instantly.

---

## Key Features

### Vendor Portal
- Multi-step registration with government document (KYC) upload
- Product listing with Supabase image storage (drag & drop)
- **✨ Smart Pricing AI** — suggests optimal daily rate per category/location (demo widget)
- Booking management with full status flow: Pending → Confirmed → Packaging → In Transit → Delivered → Return → Completed
- Revenue dashboard showing your 90% payout and Mietealle's 10% commission
- 48-hour dispatch deadline alerts

### Renter Portal
- KYC-gated registration (admin must approve before booking)
- Marketplace with category, location, and availability filters
- **✨ AI Matching Panel** — personalised product recommendations (demo widget)
- Booking form with transport option, insurance checkbox, delivery address, and pre-payment display
- Order tracking with visual step-by-step progress bar
- Order history with timeline (created → confirmed → dispatched → delivered → completed)
- Contact vendor directly (email / phone)

### Admin Console
- KYC verification queue — review documents, set per-vendor commission rate, approve/reject
- **✨ AI Demand Forecast** — interactive category trend widget showing next-30-day predictions (demo widget)
- Full booking oversight — confirm, complete, cancel any booking with status tracking
- Platform revenue with 10%/90% commission split per booking
- Vendor and renter management tables

### AI Features (Phase 2 Roadmap)

| Feature | Lives in | What it does |
|---|---|---|
| **Smart Pricing AI** | Vendor → Add Product | Analyses 12+ similar listings + season + location → suggests daily rate |
| **Demand Forecasting** | Admin Dashboard | Predicts category demand spikes 30–90 days ahead using time-series ML |
| **Vendor–Renter Matching** | Marketplace + Renter Dashboard | Recommends best equipment based on booking history + industry + location |

Visit `/ai-features` for the full roadmap, tech stack recommendations, and implementation plan.

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .

# Verify .env.local is NOT included:
git status | grep env.local   # should show nothing

git commit -m "Initial commit — Mietealle B2B rental marketplace"
git remote add origin https://github.com/YOUR_USERNAME/mietealle.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Select your GitHub repository → **Import**
3. Framework preset: **Next.js** (auto-detected)
4. Add Environment Variables (from your `.env.local`):

| Variable | Scope | Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Your service role key |
| `NEXT_PUBLIC_APP_URL` | All | `https://your-app.vercel.app` |

> For `SUPABASE_SERVICE_ROLE_KEY` — in Vercel's UI, uncheck "Expose to browser" to keep it server-side only.

5. Click **Deploy** (~2 minutes)

### 3. Configure Supabase redirect URLs

After deploy, add your production domain:

```
Supabase → Authentication → URL Configuration

Site URL:      https://your-app.vercel.app
Redirect URLs: https://your-app.vercel.app/**
               http://localhost:3000/**
```

### 4. Seed production data

```bash
# Your .env.local already points to the production Supabase — just run:
node scripts/seed.mjs
```

---

## Security

| What | Protection |
|---|---|
| `.env.local` | In `.gitignore` — never committed to git |
| `SUPABASE_SERVICE_ROLE_KEY` | Only used in server-side `/app/api/` routes — never sent to browser |
| Session cookie (`ma_user`) | `SameSite=Lax`, 24-hour expiry, cleared on logout |
| Row Level Security | Enabled on all Supabase tables |
| Admin operations | Use `service_role` key server-side only, with role checks |

---

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | TypeScript check + production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `node scripts/seed.mjs` | Seed demo accounts, products, bookings |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key (safe in browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key — server-side only, bypasses RLS |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL used for auth redirects |

---

## License

MIT — built as a product demo for investor presentation.

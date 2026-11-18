# 🍕 PizzaHub — Frontend Client

> **Modern, responsive Next.js 15 (App Router, React 19) web application for PizzaHub — featuring real-time ordering, kitchen decks, customer reviews, dark/light themes, and Stripe payments.**

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.1 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI primitives, Radix UI
- **Animations & Icons**: Framer Motion 12, Lucide React
- **Data Visualization**: Recharts
- **HTTP Client**: Axios with dynamic JWT interceptors
- **Authentication Client**: Better Auth React Integration

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local

# 3. Start local development server
npm run dev
# Running on http://localhost:3000
```

---

## ☁️ Vercel Deployment

1. Import `pizzahub-client` into Vercel.
2. Preset: `Next.js` (Zero configuration required).
3. Set Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://<your-pizzahub-server>.vercel.app/api
NEXT_PUBLIC_BETTER_AUTH_URL=https://<your-pizzahub-server>.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key
```

4. Click **Deploy**.

---

## 📂 Core Pages & Route Structure

- `/` — Homepage (Hero, Categories, Featured items, Why Choose Us)
- `/menu` — Searchable and filterable artisanal pizza catalog
- `/menu/[id]` — Pizza details, customer ratings & reviews, ordering modal
- `/favorites` — Customer saved favorites list
- `/sign-in` & `/sign-up` — Authentication with role selection
- `/dashboard/customer` — Order status metrics, history, and timeline modal
- `/dashboard/vendor` — Kitchen deck, active recipe management, 3-item limit
- `/dashboard/vendor/menu/new` & `[id]/edit` — Recipe creation and update
- `/dashboard/vendor/orders` — Kitchen queue with Accept/Decline action buttons
- `/dashboard/vendor/subscription` — Stripe checkout for Premium upgrade
- `/dashboard/admin` — Analytics overview, user block/unblock, recipe approval, audit ledger

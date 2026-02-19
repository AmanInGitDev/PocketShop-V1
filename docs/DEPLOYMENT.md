# PocketShop Deployment Guide

This doc describes the **reference deployment (Prathmesh org)** and the **checklist for Aman's Org** to match it.

---

## Part 1: Reference Setup (Prathmesh Org)

### Deployment Overview

| Layer | Service | URL |
|-------|---------|-----|
| **Frontend Hosting** | Lovable Cloud (Vite build → edge CDN) | Preview: `https://id-preview--181b8e19-88de-49a6-9f4f-4c3fd76dd242.lovable.app` |
| | | Production: `https://dawn-of-app-craft.lovable.app` |
| **Backend (BaaS)** | Supabase | `https://uzyrfljocowacffxvtwx.supabase.co` |
| **Edge Functions** | Supabase Edge Functions (Deno Deploy) | `https://uzyrfljocowacffxvtwx.supabase.co/functions/v1/` |

Frontend is a **PWA** (installable, offline caching via Workbox).

---

### Services Used (Prathmesh)

| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| **Supabase** | DB, Auth, Realtime, Storage, RLS, RPC | Direct from frontend + Edge Functions |
| **Stripe** | Card/UPI payments | `create-checkout-session`, `stripe-webhook` |
| **Resend** | Order confirmation emails | `send-order-confirmation` (uses `RESEND_API_KEY`, not SMTP) |
| **Lovable AI Gateway** | AI insights (Gemini 2.5 Flash) | `generate-insights` (uses `LOVABLE_API_KEY`) |
| **PWA/Workbox** | Offline cache, installability | Service worker |
| **Browser APIs** | Push, BarcodeDetector, Vibration | Native JS APIs |

---

### Database Tables (Prathmesh)

- `vendors`, `orders`, `order_items`, `products`, `payments`
- `notifications`, `order_messages`, `order_feedback`
- `customer_profiles`, `user_roles`

### Database RPC Functions (Prathmesh)

- `atomic_stock_update`, `get_order_queue_position`, `calculate_avg_processing_time`
- `update_order_timestamps`, `check_low_stock`, `notify_new_order`, `notify_payment_status`
- `handle_customer_signup`, `has_role`, `get_vendor_id`

### Edge Functions (Prathmesh)

| Function | Purpose | External API |
|----------|---------|--------------|
| `create-order` | Order creation, validation, stock deduction | None |
| `create-checkout-session` | Stripe Checkout Session | Stripe |
| `stripe-webhook` | Stripe webhook handler | Stripe |
| `restore-stock` | Restore stock on cancel | None |
| `send-order-confirmation` | Branded HTML emails | Resend |
| `generate-insights` | AI insights | Lovable AI Gateway → Gemini |

### Storage Buckets (Prathmesh)

- `product-images` (public)

### Secrets (Prathmesh)

| Secret | Where | Purpose |
|--------|-------|---------|
| `STRIPE_SECRET_KEY` | Edge Functions | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Edge Functions | Webhook verification |
| `RESEND_API_KEY` | Edge Functions | Resend email API |
| `LOVABLE_API_KEY` | Edge Functions | Lovable AI Gateway |
| `SUPABASE_URL` | Auto | Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto | Edge Functions |
| `VITE_SUPABASE_URL` | Frontend | Client Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | Anon key |

---

## Part 2: Aman's Org – Deployment Checklist

Use this to bring **Aman's Org** in line with Prathmesh.

### 2.1 Supabase Project

| Item | Status | Notes |
|------|--------|-------|
| Create/use Aman Supabase project | ☐ | Settings → General → note Project Ref ID |
| Run migrations from `Migration_Data/supabase/migrations/` | ☐ | Or `docs/database/*.sql` |
| Create `vendors` view if using `vendor_profiles` | ☐ | `CREATE VIEW vendors AS SELECT id, user_id, is_active FROM vendor_profiles` |
| Ensure `atomic_stock_update` exists | ☐ | Migration `20251106090220_*.sql` |
| Realtime: add `orders`, `order_messages`, `notifications`, `products` | ☐ | Database → Replication |
| Storage: create `product-images` bucket (public) | ☐ | Storage → New bucket |
| Auth: enable Email provider | ☐ | Authentication → Providers |

### 2.2 Edge Functions

| Function | Status | Notes |
|----------|--------|-------|
| `create-order` | ☐ | Deploy from `Migration_Data/supabase/functions/` |
| `create-checkout-session` | ☐ | Requires Stripe secrets |
| `stripe-webhook` | ☐ | Requires webhook URL in Stripe dashboard |
| `restore-stock` | ☐ | |
| `send-order-confirmation` | ☐ | Uses **Resend** (`RESEND_API_KEY`), not SMTP |
| `generate-insights` | ☐ | Requires `LOVABLE_API_KEY` |

### 2.3 Edge Function Secrets (Aman)

| Secret | Status | How to get |
|--------|--------|------------|
| `STRIPE_SECRET_KEY` | ☐ | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | ☐ | Stripe webhook endpoint → Signing secret |
| `RESEND_API_KEY` | ☐ | Resend.com → API Keys |
| `LOVABLE_API_KEY` | ☐ | Lovable AI Gateway (if using) |

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` automatically.

### 2.4 Frontend Hosting (Aman)

| Item | Status | Notes |
|------|--------|-------|
| Build: `cd frontend && npm run build` | ☐ | Must succeed |
| Hosting choice | ☐ | Lovable Cloud, Vercel, Netlify, or other |
| Env vars in hosting | ☐ | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` for Aman |
| Custom domain (optional) | ☐ | |

### 2.5 Frontend Environment (Local / Hosting)

```bash
VITE_SUPABASE_URL=https://YOUR_AMAN_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   # Aman project anon key
```

---

## Part 3: Architecture Diagram

```
Customer (QR Scan / Browser)
        │
        ▼
┌─────────────────────────────┐
│  Frontend (PWA)             │  ← Vite + React + Tailwind
│  Lovable / Vercel / etc.    │
└────────────┬────────────────┘
             │ HTTPS
             ▼
┌─────────────────────────────┐
│  Supabase                   │
│  ├─ PostgreSQL              │  ← Tables, RLS, RPC
│  ├─ Auth                    │  ← JWT login
│  ├─ Realtime                │  ← Live sync
│  ├─ Storage                 │  ← product-images
│  └─ Edge Functions          │
│     ├─ → Stripe             │  ← Payments
│     ├─ → Resend             │  ← Emails
│     └─ → Lovable AI GW      │  ← Insights (optional)
└─────────────────────────────┘
```

---

## Part 4: Related Docs

- `AMAN_MIGRATION_STEPS.md` – Step-by-step migration
- `SUPABASE_MATCH_CHECKLIST.md` – Detailed Supabase comparison
- `MIGRATION_STATUS.md` – Overall migration status
- `LAST_FINAL_MIGRATION.md` – Post-migration polish

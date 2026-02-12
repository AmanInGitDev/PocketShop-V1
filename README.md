# PocketShop

> Transform QR codes into powerful, app-free virtual storefronts for local businesses.

## Overview

PocketShop is a Progressive Web Application (PWA) platform that enables local businesses to create digital storefronts accessible via QR codes. Customers can browse menus, place orders, and make payments—all without downloading any apps.

### Key Features

- **Zero-App Experience**: Customers access storefronts directly through their browser
- **Real-Time Order Management**: Vendors manage orders with a Kanban-style dashboard
- **QR Code Integration**: Transform any QR code into a dynamic, interactive storefront
- **Location Services**: Detect customer location and suggest nearby places
- **AI-Powered Analytics**: Business insights and sales trends (coming soon)
- **Multi-Business Support**: Restaurants, cafes, salons, retail stores, and more

## Project Structure

```
PocketShop-V1/
├── frontend/          # React + TypeScript frontend application
├── backend/           # Backend services (Supabase)
├── docs/              # All project documentation
└── scripts/           # Utility scripts
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Real-time)
- **Maps**: Google Maps API, Places Autocomplete
- **State Management**: React Context API
- **Routing**: React Router v6
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google Maps API key (for location features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PocketShop-V1
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` in the `frontend/` directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

### Quick Setup Guides

For detailed setup instructions, see the [documentation](docs/):

- **[Authentication Setup](docs/setup/AUTH_SETUP.md)** - Complete authentication setup checklist
- **[Google OAuth Setup](docs/setup/GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration guide
- **[Configuration Summary](docs/setup/PROJECT_CONFIG_SUMMARY.md)** - Complete configuration reference

## Documentation

All documentation is organized in the [`docs/`](docs/) directory:

- **Setup & Configuration** - Installation and configuration guides (`docs/setup/`)
- **Troubleshooting** - Debugging guides and fix instructions (`docs/troubleshooting/`)
- **Guides** - Process flows and how-tos (`docs/guides/`)
- **Database** - Schema, RLS policies, and setup scripts (`docs/database/`)
- **API Testing** - Postman collection (`docs/postman/`)
- **Reports** - Project reports and checklists (`docs/reports/`)

See [docs/README.md](docs/README.md) for the complete documentation index.

## Current Status

*Status below is derived from the codebase (not assumptions).*

### ✅ Completed

- **Project & config** – Setup, DB schema, RLS policies, triggers (see `docs/database/`).
- **Auth** – Email/password sign up & sign in, sign out, Google OAuth, OAuth callback page (`/auth/callback`), phone OTP (send/verify), `AuthContext`, login/register pages, `RegisterConfirm`.
- **Routing** – Centralized config (`publicRoutes`, `protectedRoutes`, `onboardingRoutes`), `AppRoutes`, route constants; guards: `AuthRouteGuard`, `OnboardingProtectedRoute`, `ProtectedRoute` (wired via `routeHelpers`).
- **Vendor onboarding** – 3 stages + completion (`OnboardingLayout`, Stage 1/2/3, `OnboardingCompletion`).
- **Vendor dashboard** – Overview, Orders, Inventory (list/add/edit), Insights, Storefront, Payouts/Payments, Settings; all lazy-loaded and sub-routed in `VendorDashboard`.
- **Customer storefront** – `PublicStorefront`, cart, `CheckoutForm`, order creation via `orderService.createOrderDirect`; payment methods: cash, UPI, wallet, card (card uses Edge Function when deployed).
- **Order management** – Orders list with status tabs (`OrdersNew`, `useOrders`), order detail (`OrderDetailNew`), order cards, status/payment UI; `orderService` with `payment_method` / `payment_status`; DB-backed.
- **Payments (vendor)** – Payments page (`PaymentsNew`), `usePayments` / `usePaymentStats`, payments table, real-time updates via Supabase channel; `PaymentStatusButton` on order detail.
- **Real-time** – Orders (`useOrders`, `useOrder`), payments (channel in Payments page), products (`useProducts`), notifications (`useNotifications`), order messages (`useOrderMessages`), storefront `ActiveOrdersWidget`.
- **Analytics/Insights** – `useAnalytics` (revenue, daily sales, peak hours, top products, weekly comparison from orders); Insights page (`AnalyticsNew`) with charts (Recharts).
- **Location** – `LocationDetector`, `PlacesAutocomplete`.
- **PWA** – `usePWA`, `OfflineIndicator`, Offline page.

### 🚧 In Progress / Partial

- **Card payment** – Frontend calls Supabase Edge Function `create-checkout-session` (e.g. Stripe); no Edge Functions in this repo, so card payment requires deploying the function to Supabase.
- **AI insights** – `useAIInsights` calls Edge Function `generate-insights`; optional and may not be deployed yet.

### 📋 Planned

- AI-powered insights backend (Edge Function not in repo).
- Advanced reporting features.
- Multi-language support.
- Mobile app (optional).

## Development

### Available Scripts

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Code Standards

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Code formatting
- **Comments**: All functions and complex logic documented
- **Structure**: Organized by feature, not file type

## Troubleshooting

If you encounter issues:

1. **OAuth/Authentication Issues**: See [OAuth Troubleshooting Guide](docs/troubleshooting/oauth/STEP_BY_STEP_FIX.md)
2. **Setup Problems**: Check [Setup Documentation](docs/setup/)
3. **Application Flow**: Review [End-to-End Flow Guide](docs/guides/END_TO_END_FLOW.md)

For complete troubleshooting resources, see [docs/troubleshooting/README.md](docs/troubleshooting/README.md).

## Contributing

This is a private project. For questions or issues, please contact the project maintainer.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

**Aman**

---

For more information, visit the [documentation](docs/) directory.

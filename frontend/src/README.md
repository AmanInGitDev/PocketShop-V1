# Frontend Source Structure

PocketShop frontend (React + Vite + TypeScript) is organized as follows.

## Top-level folders

| Folder | Purpose |
|--------|--------|
| **app/** | App shell: `App.tsx`, `main.tsx`, layouts, global pages (Landing, About, NotFound, Offline), route component |
| **routes/** | Route configuration and `AppRoutes` component: `index.ts`, `publicRoutes`, `protectedRoutes`, `onboardingRoutes`, `AppRoutes.tsx`, `types.ts` |
| **features/** | Feature-based modules (auth, vendor, analytics, common) with pages, components, services, context, hooks |
| **components/** | Shared UI: TopNavbar, StatusToggle, kanban (OrderCard, OrderDetailPanel, VendorOrdersKanban), OfflineIndicator |
| **constants/** | App constants (e.g. `routes.ts`) |
| **context/** | Global context (e.g. `OrderProvider`) |
| **hooks/** | Global hooks (e.g. `usePWA`) |
| **lib/** | Third-party/config (e.g. `supabaseClient`) |
| **services/** | Shared interfaces (e.g. `IOrderRepository`) |
| **types/** | Shared TypeScript types |
| **utils/** | Helpers: `routeHelpers`, `preloaders`, `reconciliation` |
| **data/** | Static/demo data (e.g. `demo/menu.json`, `orders.json`) |
| **assets/** | Images and global styles (`index.css`, feature CSS) |
| **__tests__/** | Test setup and routing tests |

## Features

- **features/auth** – Login, register, `AuthContext`, auth service
- **features/vendor** – Vendor dashboard, onboarding (stages 1–3 + completion), orders, inventory, payouts, settings, hooks, services
- **features/analytics** – Insights page and analytics service
- **features/common** – Shared components (Button, Card, Input, ErrorBoundary, route guards, etc.), types, utils

## Conventions

- **Pages**: Shell/marketing pages live in `app/pages/`; feature-specific pages in `features/<name>/pages/`.
- **Routes**: Definitions live in `routes/`; `AppRoutes` renders them via `utils/routeHelpers`.
- **Imports**: Use `@/` for `src/` (e.g. `@/features/common/components`, `@/routes/AppRoutes`).

# PocketShop-V1 – Project inventory

Everything that exists in the project, listed by category. Use this to check things one by one.

---

## 1. Root / repo

| Item | Path / note |
|------|------------------|
| Root package.json | Workspaces: `frontend`, `backend`; scripts: dev, build, lint, test, install:all |
| README.md | Main project readme |
| LICENSE | MIT |
| .eslintrc.cjs | ESLint config |
| .prettierrc.json, .prettierignore | Prettier |
| .gitignore | Git ignore |

---

## 2. Backend

| Item | Path / note |
|------|------------------|
| backend/package.json | `pocketshop-backend`; dev/build/start echo "not implemented" |
| backend/README.md | Backend readme |

*No Supabase Edge Functions in repo; frontend calls `create-checkout-session` and `generate-insights` (deploy separately).*

---

## 3. Scripts (root)

| Script | Purpose |
|--------|--------|
| generate-types-from-api.js | Generate types from API |
| generate-types.sh | Type generation |
| phase4-quickstart.sh | Phase 4 quick start |
| run-phase4-migration.js | Run Phase 4 migration |
| verify-phase4-migration.js | Verify Phase 4 migration |
| verify-phase4-setup.js | Verify Phase 4 setup |

---

## 4. Documentation (docs/)

### 4.1 Setup

| File | Purpose |
|------|--------|
| docs/setup/AUTH_SETUP.md | Auth setup checklist |
| docs/setup/GOOGLE_OAUTH_SETUP.md | Google OAuth setup |
| docs/setup/PROJECT_CONFIG_SUMMARY.md | Config reference |
| docs/setup/PORT_CONFIG.md | Port config (e.g. 5173) |

### 4.2 Troubleshooting

| File | Purpose |
|------|--------|
| docs/troubleshooting/README.md | Troubleshooting index |
| docs/troubleshooting/oauth/STEP_BY_STEP_FIX.md | OAuth step-by-step fix |
| docs/troubleshooting/oauth/OAUTH_DEEP_TROUBLESHOOTING.md | Deep OAuth debugging |
| docs/troubleshooting/oauth/VERIFY_REDIRECT_URIS.md | Verify redirect URIs |
| docs/troubleshooting/oauth/OAUTH_FIX.md | OAuth fix |
| docs/troubleshooting/oauth/OAUTH_TROUBLESHOOTING.md | OAuth troubleshooting |

### 4.3 Guides

| File | Purpose |
|------|--------|
| docs/guides/INDEX.md | Guides index |
| docs/guides/END_TO_END_FLOW.md | End-to-end app flow |

### 4.4 Database

| File | Purpose |
|------|--------|
| docs/database/README.md | Database index |
| docs/database/schema.sql | Schema |
| docs/database/triggers.sql | Triggers |
| docs/database/RLS_POLICIES.sql | RLS policies |
| docs/database/rls_policies_full.sql | Full RLS |
| docs/database/DATABASE_SETUP_COMPLETE.sql | Full DB setup |
| docs/database/vendor_onboarding_updates.sql | Vendor onboarding |
| docs/database/COD_REALTIME_FIX.sql | COD/realtime fix |
| docs/database/QUICK_RLS_FIX.sql | Quick RLS fix |
| docs/database/RLS_POLICY_FIX.sql | RLS policy fix |
| docs/database/PHASE4_MIGRATION.sql | Phase 4 migration |

### 4.5 Reports

| File | Purpose |
|------|--------|
| docs/reports/README.md | Reports index |
| docs/reports/guides/README.md | Reports guides |
| docs/reports/sql/pocketshop_schema.sql | Schema (copy) |
| docs/reports/sql/pocketshop_triggers.sql | Triggers (copy) |
| docs/reports/sql/pocketshop_rls_policies.sql | RLS (copy) |
| docs/reports/sql/vendor_onboarding_updates.sql | Onboarding (copy) |

### 4.6 Other docs

| Item | Purpose |
|------|--------|
| docs/README.md | Docs index |
| docs/postman/PocketShop_API.postman_collection.json | Postman API collection |
| docs/archive/ | Old VendorOnboarding components (VendorOnboarding.tsx, VendorOnboardingFlow.tsx, .css, .ts) |

---

## 5. Frontend – app shell

| Item | Path |
|------|------|
| Entry | app/main.tsx |
| App root | app/App.tsx |
| Routes component | app/routes/AppRoutes.tsx (re-exposed from routes/AppRoutes.tsx) |
| Layout | app/layouts/DashboardLayout.tsx |

### App pages (global / shell)

| Page | Path | Route (from constants) |
|------|------|------------------------|
| Landing | app/pages/LandingPage.tsx | / |
| Business landing | app/pages/BusinessLandingPage.tsx | /business |
| About | app/pages/AboutUs.tsx | /about-us |
| NotFound | app/pages/NotFound.tsx | * |
| Offline | app/pages/Offline.tsx | /offline |
| Order confirmation | app/pages/OrderConfirmation.tsx | /order-confirmation |

---

## 6. Frontend – routes

| File | Purpose |
|------|--------|
| constants/routes.ts | ROUTES object, RoutePath type, helpers (getAllRoutes, isValidRoute, getRouteName) |
| routes/index.ts | Exports publicRoutes, protectedRoutes, onboardingRoutes, allRoutes, getRouteByPath, getAuthenticatedRoutes, getOnboardingRequiredRoutes, getPublicRoutes |
| routes/types.ts | RouteConfig, RouteAccessLevel, BreadcrumbItem |
| routes/publicRoutes.ts | Public route config (Landing, Business, About, Login, Register, AuthCallback, VendorAuth redirect, storefront/:vendorId, order-confirmation, offline, 404) |
| routes/protectedRoutes.ts | Protected config (vendor dashboard /*) |
| routes/onboardingRoutes.ts | Onboarding config (stage-1, stage-2, stage-3, completion, /vendor/onboarding redirect) |
| routes/AppRoutes.tsx | Renders Routes from allRoutes via generateRoutes (with ErrorBoundary) |
| utils/routeHelpers.tsx | generateRoutes; wraps with OnboardingProtectedRoute / AuthRouteGuard as per config |

---

## 7. Frontend – features

### 7.1 Auth (features/auth)

| Item | Path |
|------|------|
| Context | features/auth/context/AuthContext.tsx |
| Service | features/auth/services/authService.ts (signUp, signIn, signOut, signInWithGoogle, sendOTP, verifyOTP, getCurrentUser) |
| Pages | features/auth/pages/LoginPage.tsx, AuthCallbackPage.tsx |
| Components | features/auth/components/RegisterConfirm.tsx |

### 7.2 Vendor (features/vendor)

**Context**

| Item | Path |
|------|------|
| OnboardingContext | features/vendor/context/OnboardingContext.tsx |

**Hooks**

| Hook | Path | Purpose |
|------|------|--------|
| useActiveOrders | hooks/useActiveOrders.ts | Active orders + update status |
| useAnalytics | hooks/useAnalytics.ts | Analytics from orders (revenue, daily, peak hours, top products, weekly) |
| useNotifications | hooks/useNotifications.ts | Notifications + realtime |
| useOrder | hooks/useOrder.ts | Single order + realtime |
| useOrderMessages | hooks/useOrderMessages.ts | Order messages + realtime |
| useOrders | hooks/useOrders.ts | Orders list + realtime |
| usePayments | hooks/usePayments.ts | Payments list |
| usePaymentStats | (in usePayments.ts) | Payment stats (e.g. revenue) |
| useProductMutations | hooks/useProductMutations.ts | Create/update/delete products |
| useProducts | hooks/useProducts.ts | Products + realtime |
| useStorefront | hooks/useStorefront.ts | Storefront (e.g. QR) |
| useVendor | hooks/useVendor.ts | Current vendor profile |
| useVendorStatus | hooks/useVendorStatus.ts | Vendor status |
| useAIInsights | (in useAnalytics.ts) | Calls Edge Function generate-insights |

**Onboarding**

| Item | Path |
|------|------|
| Layout | features/vendor/onboarding/OnboardingLayout.tsx |
| Stage 1 | features/vendor/onboarding/stage-1/OnboardingStage1.tsx |
| Stage 2 | features/vendor/onboarding/stage-2/OnboardingStage2.tsx |
| Stage 3 | features/vendor/onboarding/stage-3/OnboardingStage3.tsx |
| Completion | features/vendor/onboarding/completion/OnboardingCompletion.tsx |

**Pages (vendor)**

| Page | Path | Dashboard sub-route |
|------|------|---------------------|
| VendorDashboard | pages/VendorDashboard.tsx | (parent) |
| DashboardNew | pages/DashboardNew.tsx | "" (overview) |
| DashboardOverview | pages/DashboardOverview.tsx | (alternate overview) |
| OrdersNew | pages/OrdersNew.tsx | orders |
| Orders | pages/Orders.tsx | (older) |
| OrderDetailNew | pages/OrderDetailNew.tsx | (linked from orders) |
| InventoryNew | pages/InventoryNew.tsx | inventory |
| Inventory | pages/Inventory.tsx | (older) |
| AddProductNew | pages/AddProductNew.tsx | inventory/add |
| EditProductNew | pages/EditProductNew.tsx | inventory/edit/:id |
| AnalyticsNew | pages/AnalyticsNew.tsx | insights |
| StorefrontNew | pages/StorefrontNew.tsx | storefront |
| PaymentsNew | pages/PaymentsNew.tsx | payouts |
| Payouts | pages/Payouts.tsx | (older) |
| SettingsNew | pages/SettingsNew.tsx | settings |
| Settings | pages/Settings.tsx | (older) |

**Services (vendor)**

| Service | Path |
|---------|------|
| productService | features/vendor/services/productService.ts |
| vendorService | features/vendor/services/vendorService.ts |
| demoOrderRepository | features/vendor/services/demoOrderRepository.ts |

### 7.3 Storefront (features/storefront)

| Item | Path |
|------|------|
| PublicStorefront | features/storefront/pages/PublicStorefront.tsx |

### 7.4 Analytics (features/analytics)

| Item | Path |
|------|------|
| InsightsPage | features/analytics/pages/InsightsPage.tsx |
| analyticsService | features/analytics/services/analyticsService.ts (placeholder getAnalytics) |

### 7.5 Common (features/common)

**Components**

| Component | Path |
|-----------|------|
| Badge, Button, Card, ErrorBoundary, ErrorFallback, Input, LoadingFallback, LoadingScreen, Logo, RouteSkeleton | features/common/components/ |
| LocationDetector, PlacesAutocomplete | features/common/components/ |
| index (exports) | features/common/components/index.ts |
| OnboardingLayout (common) | features/common/components/onboarding/OnboardingLayout.tsx |
| AuthRouteGuard, OnboardingProtectedRoute, ProtectedRoute, Button, InputField, StageIndicator | features/common/components/shared/ |

**Types**

| Item | Path |
|------|------|
| database.ts | features/common/types/database.ts |
| index | features/common/types/index.ts |

**Utils**

| Item | Path |
|------|------|
| onboardingCheck | features/common/utils/onboardingCheck.ts |
| routeGuards | features/common/utils/routeGuards.ts |
| storage | features/common/utils/storage.ts |
| example.test | features/common/utils/__tests__/example.test.ts |

---

## 8. Frontend – components (shared UI)

### 8.1 By domain

| Domain | Components |
|--------|------------|
| cart | CartSummary.tsx |
| checkout | CheckoutForm.tsx |
| common | StatusToggle.tsx, TopNavbar.tsx |
| feedback | FeedbackForm.tsx |
| inventory | BulkActions.tsx, ProductCard.tsx, ProductForm.tsx |
| kanban | OrderCard.tsx, OrderDetailPanel.tsx, VendorOrdersKanban.tsx |
| layout | AppLayout.tsx, AppSidebar.tsx |
| notifications | NotificationBell.tsx |
| orders | CustomerMessaging.tsx, OrderCard.tsx, OrderMessaging.tsx, OrderReceipt.tsx, OrderStatusBadge.tsx, OrderStatusSelect.tsx, OrderStatusTracker.tsx, PaymentStatusButton.tsx |
| storefront | ActiveOrdersWidget.tsx |

### 8.2 Other

| Item | Path |
|------|------|
| ErrorBoundary | components/ErrorBoundary.tsx |
| OfflineIndicator | components/OfflineIndicator.tsx |

### 8.3 UI (design system)

Under `components/ui/`: accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, lazy-image, menubar, metric-card, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip.

---

## 9. Frontend – context & providers

| Item | Path |
|------|------|
| OrderProvider | context/OrderProvider.tsx |
| CartProvider (CartContext) | contexts/CartContext.tsx |

---

## 10. Frontend – services (global)

| Service | Path |
|---------|------|
| IOrderRepository | services/IOrderRepository.ts |
| orderService | services/orderService.ts (createOrderDirect, etc.) |

---

## 11. Frontend – schemas, types, lib, hooks, utils

| Category | Items |
|----------|--------|
| schemas | checkoutSchema.ts (checkoutFormSchema, CheckoutFormData) |
| types | types/index.ts |
| lib | supabaseClient.ts, utils.ts, performance.ts |
| hooks (global) | use-mobile.tsx, use-toast.ts, usePWA.ts |
| utils | preloaders.ts, reconciliation.ts, routeHelpers.tsx |

---

## 12. Frontend – data & assets

| Item | Path |
|------|------|
| Demo data | data/demo/menu.json, data/demo/orders.json |
| Styles | assets/styles/index.css, VendorAuth.css |
| Images | assets/images/image.png, logo.png |

---

## 13. Frontend – pages-new (alternate pages)

| Page | Path | Note |
|------|------|------|
| Dashboard | pages-new/Dashboard.tsx | Alternate dashboard |
| Orders | pages-new/Orders.tsx | |
| OrderDetail | pages-new/OrderDetail.tsx | |
| Inventory | pages-new/Inventory.tsx | |
| AddProduct | pages-new/AddProduct.tsx | |
| EditProduct | pages-new/EditProduct.tsx | |
| Analytics | pages-new/Analytics.tsx | |
| Payments | pages-new/Payments.tsx | |
| Settings | pages-new/Settings.tsx | |

*VendorDashboard currently uses the `*New` pages from features/vendor/pages, not pages-new.*

---

## 14. Frontend – tests

| Item | Path |
|------|------|
| setupTests | setupTests.ts |
| Router test utils | __tests__/setup/routerTestUtils.tsx |
| AuthFlow.test | __tests__/routing/AuthFlow.test.tsx |
| ErrorHandling.test | __tests__/routing/ErrorHandling.test.tsx |
| Navigation.test | __tests__/routing/Navigation.test.tsx |
| OnboardingFlow.test | __tests__/routing/OnboardingFlow.test.tsx |
| ProtectedRoute.test | __tests__/routing/ProtectedRoute.test.tsx |
| __tests__/routing/README.md | Routing tests readme |

---

## 15. Route paths (all)

From `constants/routes.ts`:

- Public: `/`, `/business`, `/about-us`
- Auth: `/login`, `/register`, `/auth/callback`, `/vendor/auth` → redirect to login
- Onboarding: `/vendor/onboarding`, `/vendor/onboarding/stage-1`, `stage-2`, `stage-3`, `/vendor/onboarding/completion`
- Dashboard: `/vendor/dashboard`, `/vendor/dashboard/orders`, `inventory`, `inventory/add`, `inventory/edit/:id`, `insights`, `storefront`, `payouts`, `settings`
- Other: `/storefront/:vendorId`, `/order-confirmation`, `/offline`, `*` (404)

---

## 16. Frontend config & build

| Item | Path |
|------|------|
| package.json | frontend/package.json (Vite, React, TypeScript, Supabase, TanStack Query, Recharts, etc.) |
| vite.config | frontend/vite.config.ts |
| tsconfig | frontend/tsconfig.json (and variants if any) |
| frontend README | frontend/src/README.md (source structure) |

---

*End of inventory. Use this list to verify or check each part of the project one by one.*

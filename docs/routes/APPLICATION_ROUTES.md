# Application Routes - Complete List

## 🛣️ All Available Routes

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage` | Main landing page (public) |
| `/vendor/auth` | `VendorAuth` | Login/Register page (public) |

### Authentication Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/vendor/auth` | `VendorAuth` | Combined login/register page |
| `/vendor/auth/login` | (via VendorAuth) | Login form (email/phone) |
| `/vendor/auth/register` | (via VendorAuth) | Register form (email/phone/OTP) |

### Onboarding Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/vendor/onboarding` | `VendorOnboardingFlow` | Main onboarding flow (legacy) |
| `/vendor/onboarding/stage-1` | `VendorOnboardingFlow` | Stage 1: Restaurant Info |
| `/vendor/onboarding/stage-2` | `VendorOnboardingFlow` | Stage 2: Operational Details |
| `/vendor/onboarding/stage-3` | `VendorOnboardingFlow` | Stage 3: Plans Selection |
| `/vendor/onboarding/completion` | `VendorOnboardingFlow` | Terms & Conditions |

**Note**: New onboarding pages exist at:
- `pages/vendor/onboarding/stage-1/OnboardingStage1.tsx`
- `pages/vendor/onboarding/stage-2/OnboardingStage2.tsx`
- `pages/vendor/onboarding/stage-3/OnboardingStage3.tsx`
- `pages/vendor/onboarding/completion/OnboardingCompletion.tsx`

But routes currently point to `VendorOnboardingFlow`. Need to update routes.

### Dashboard Routes (Protected)

| Route | Component | Description |
|-------|-----------|-------------|
| `/vendor/dashboard` | `VendorDashboard` | Main dashboard |
| `/vendor/dashboard/orders` | `Orders` | Orders management |
| `/vendor/dashboard/inventory` | `Inventory` | Inventory management |
| `/vendor/dashboard/insights` | `Insights` | Analytics & insights |
| `/vendor/dashboard/payouts` | `Payouts` | Payouts management |
| `/vendor/dashboard/settings` | `Settings` | Settings page |

### Special Routes

| Route | Description |
|-------|-------------|
| `*` | Catch-all route → redirects to `/` |

## 🔄 Redirect Flow

### Registration Flow:
1. `/vendor/auth` (Register tab)
2. Submit registration → Check email confirmation
3. If confirmed → `/vendor/onboarding/stage-1`
4. If NOT confirmed → Stay on `/vendor/auth` with message

### Login Flow:
1. `/vendor/auth` (Login tab)
2. Submit login → Check onboarding status
3. If incomplete → `/vendor/onboarding/stage-1`
4. If complete → `/vendor/dashboard`

### OAuth Flow:
1. `/vendor/auth` → Click Google OAuth
2. OAuth callback → `/vendor/auth`
3. Check onboarding status → Redirect accordingly

### OTP Flow:
1. `/vendor/auth` → Enter phone → OTP sent
2. Verify OTP → Check onboarding status
3. If incomplete → `/vendor/onboarding/stage-1`
4. If complete → `/vendor/dashboard`

## 🚨 Current Issues

1. **Email Confirmation Issue**: After registration, if email not confirmed, user should stay on register page with message, not redirect to login.

2. **Onboarding Routes**: Routes point to `VendorOnboardingFlow` instead of new components. Need to update App.tsx to use new components.

3. **Redirect Logic**: AuthContext redirects logged-in users to dashboard, but should check email confirmation first.

## 📝 Files to Update

1. `frontend/src/App.tsx` - Update onboarding routes to use new components
2. `frontend/src/pages/VendorAuth.tsx` - Fix registration redirect logic
3. `frontend/src/contexts/AuthContext.tsx` - Check email confirmation before redirect


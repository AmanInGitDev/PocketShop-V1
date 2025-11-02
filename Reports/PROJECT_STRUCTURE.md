# PocketShop Project Structure

## 📁 Folder Organization

```
PocketShop-V1/
├── frontend/              # Frontend React application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services (Supabase)
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx        # Main app component
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html         # HTML template
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.ts     # Vite configuration
│   ├── tsconfig.json      # TypeScript configuration
│   └── tailwind.config.js  # Tailwind CSS configuration
│
├── backend/               # Backend services (Future)
│   ├── api/               # API routes and handlers
│   ├── services/          # Business logic services
│   ├── models/            # Data models and schemas
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── tests/             # Backend tests
│
├── docs/                  # Documentation
│   ├── api/               # API documentation
│   ├── deployment/        # Deployment guides
│   ├── development/       # Development guides
│   └── postman/           # Postman collections
│
├── Reports/               # Project reports
│   ├── Daily/             # Daily reports
│   ├── Weekly/            # Weekly reports
│   └── Monthly/           # Monthly reports
│
├── package.json           # Root package.json (workspace)
└── README.md              # Main project README
```

## 🎯 Frontend Structure Details

### `/frontend/src/components/`
Reusable UI components that can be used across the application.
- `Button.tsx` - Button component
- `Input.tsx` - Input component
- `Card.tsx` - Card component
- `Badge.tsx` - Badge component

### `/frontend/src/pages/`
Page-level components that represent full routes.
- `VendorDashboard.tsx` - Vendor dashboard
- `VendorOnboarding.tsx` - Vendor onboarding landing page
- `VendorOnboardingFlow.tsx` - Vendor onboarding multi-step form

### `/frontend/src/services/`
API and external service integrations.
- `supabase.ts` - Supabase client and helper functions

### `/frontend/src/contexts/`
React Context providers for global state.
- `AuthContext.tsx` - Authentication context

### `/frontend/src/types/`
TypeScript type definitions.
- `index.ts` - Shared types
- `database.ts` - Database schema types

### `/frontend/src/hooks/`
Custom React hooks for reusable logic.

### `/frontend/src/utils/`
Utility functions and helpers.

## 🔧 Backend Structure (Future)

The backend folder is prepared for future implementation. It can include:
- REST API endpoints
- Serverless functions (Supabase Edge Functions)
- Database migrations
- Background job processors
- Webhook handlers

## 📝 Development Workflow

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development (Future)
```bash
cd backend
npm install
npm run dev
```

### Root Level Commands
```bash
# Install all dependencies
npm run install:all

# Run frontend dev server
npm run dev:frontend

# Run backend dev server (when implemented)
npm run dev:backend

# Build frontend
npm run build:frontend
```

## 🔐 Environment Variables

Frontend environment variables should be in `/frontend/.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Backend environment variables (when implemented) should be in `/backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📦 Dependencies

- **Frontend**: Managed in `/frontend/package.json`
- **Backend**: Managed in `/backend/package.json` (when implemented)
- **Root**: Workspace configuration in root `package.json`

## 🚀 Deployment

- **Frontend**: Deploy `/frontend` directory (Vite build output)
- **Backend**: Deploy `/backend` directory (when implemented)


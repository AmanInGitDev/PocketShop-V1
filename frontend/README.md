# PocketShop Frontend

React + TypeScript + Vite frontend application for PocketShop.

## Project Structure

```
frontend/
├── public/           # Static assets
│   ├── icons/
│   ├── images/
│   └── logo.png
├── src/
│   ├── components/   # Reusable UI components
│   ├── contexts/     # React contexts (Auth, etc.)
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── services/     # API services (Supabase)
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions
│   ├── App.tsx       # Main app component
│   ├── main.tsx      # Entry point
│   └── index.css     # Global styles
├── index.html        # HTML template
├── package.json      # Dependencies
├── vite.config.ts   # Vite configuration
├── tsconfig.json     # TypeScript configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Supabase** - Backend services (Auth, Database)
- **Lucide React** - Icons

## Features

- ✅ Vendor Authentication (Email/Password, Google OAuth, Phone OTP)
- ✅ Vendor Registration
- ✅ Vendor Dashboard
- ✅ Responsive Design
- ✅ Type-safe with TypeScript


# PocketShop

Transform QR codes into powerful, app-free virtual storefronts for local businesses.

## 🚀 Overview

PocketShop is a Progressive Web Application (PWA) platform that enables local businesses to create digital storefronts accessible via QR codes. Customers can browse menus, place orders, and make payments—all without downloading any apps.

### Key Features

- **Zero-App Experience**: Customers access storefronts directly through their browser
- **Real-Time Order Management**: Vendors manage orders with a Kanban-style dashboard
- **QR Code Integration**: Transform any QR code into a dynamic, interactive storefront
- **Location Services**: Detect customer location and suggest nearby places
- **AI-Powered Analytics**: Business insights and sales trends (coming soon)
- **Multi-Business Support**: Restaurants, cafes, salons, retail stores, and more

## 🏗️ Project Structure

```
PocketShop-V1/
├── frontend/          # React + TypeScript frontend application
├── backend/           # Backend services (Supabase)
├── customer-files/    # Customer-facing components
├── vendor-files/      # Vendor dashboard components
└── docs/              # All project documentation
```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Maps**: Google Maps API, Places Autocomplete
- **State Management**: React Context API
- **Styling**: Tailwind CSS

## 📦 Getting Started

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
   npm run install:all
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

   The application will be available at `http://localhost:3000`

### Quick Setup Guide

For detailed setup instructions, see:
- [Quick Start Guide](docs/setup/QUICK_START.md)
- [Supabase Setup](docs/setup/SUPABASE_SETUP.md)
- [Google Maps Setup](docs/setup/GOOGLE_MAPS_SETUP.md)

## 📚 Documentation

All documentation is organized in the [`docs/`](docs/) directory:

- **Setup & Configuration**: Installation and configuration guides
- **API Documentation**: API testing and endpoints
- **Database**: Schema, RLS policies, and setup scripts
- **Features**: Feature implementation guides
- **Development**: Development workflows and guidelines
- **Testing**: Testing guides and checklists

See [docs/README.md](docs/README.md) for the complete documentation index.

## 🎯 Current Status

### ✅ Completed
- Project setup and configuration
- Database schema and RLS policies
- Authentication system (vendor registration/login)
- Location detection and places autocomplete
- Basic vendor dashboard
- Customer storefront interface

### 🚧 In Progress
- Order management system
- Payment integration
- Real-time order updates

### 📋 Planned
- AI-powered analytics dashboard
- Advanced reporting features
- Multi-language support
- Mobile app (optional)

## 🤝 Contributing

This is a private project. For questions or issues, please contact the project maintainer.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 👤 Author

**Aman**

---

For more information, visit the [documentation](docs/) directory.


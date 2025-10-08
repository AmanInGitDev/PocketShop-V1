# 🛍️ PocketShop - Virtual Storefront Platform

Transform any QR code into a powerful, app-free virtual storefront for local businesses.

## 🎯 Project Overview

PocketShop is an innovative platform that converts standard QR codes into comprehensive digital storefronts. Local businesses can manage orders in real-time, engage customers with interactive menus, and access AI-driven insights—all without requiring customers to download any apps.

### ✨ Key Features

- **🔗 Universal QR Integration**: Transform any QR code into a dynamic storefront
- **📱 App-Free Experience**: Customers can order and pay directly through their browser
- **📊 Real-Time Dashboard**: Kanban-style order management (New, In Progress, Ready)
- **🤖 AI-Powered Analytics**: Sales insights and business intelligence
- **🏪 Multi-Business Support**: Restaurants, salons, retail stores, and more
- **💳 Integrated Payments**: Seamless payment processing
- **📈 Growth Insights**: Popular items and peak time predictions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Context + Hooks
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PocketShop-V1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials in `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
PocketShop-V1/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and external services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── contexts/           # React contexts
├── Reports/                # Development progress reports
│   ├── Daily/             # Daily progress reports
│   ├── Weekly/            # Weekly summaries
│   └── Monthly/           # Monthly milestones
├── docs/                   # Project documentation
├── public/                 # Static assets
└── README.md
```

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts (vendors and customers)
- **businesses**: Business profiles and settings
- **products**: Product catalog and pricing
- **orders**: Customer orders and status tracking
- **order_items**: Individual items within orders

### Key Relationships

- Users can own multiple businesses
- Businesses have many products
- Orders belong to businesses and customers
- Order items link orders to products

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Standards

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Configured with React and TypeScript rules
- **Comments**: All functions and complex logic documented
- **Naming**: Clear, descriptive variable and function names
- **Structure**: Organized by feature, not file type

### Daily Reports

Progress is tracked daily in the `Reports/Daily/` directory. Each report includes:
- Tasks completed
- Code changes made
- Challenges encountered
- Next steps planned
- Time spent

## 🚀 Deployment

### Supabase Setup

1. Create a new Supabase project
2. Run the database migrations (see `docs/database/`)
3. Set up Row Level Security (RLS) policies
4. Configure authentication settings

### Environment Variables

Required for production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional:
- `VITE_APP_ENV=production`
- `VITE_APP_VERSION=1.0.0`

## 📊 Features Roadmap

### Phase 1: Core Platform ✅
- [x] Project setup and configuration
- [x] Database schema design
- [x] Authentication system
- [ ] Basic storefront interface
- [ ] Order management system

### Phase 2: Business Features 🚧
- [ ] Product catalog management
- [ ] Real-time order updates
- [ ] Payment integration
- [ ] Business dashboard

### Phase 3: Advanced Features 📋
- [ ] AI-powered analytics
- [ ] Customer insights
- [ ] Inventory management
- [ ] Multi-language support

### Phase 4: Scale & Optimize 🎯
- [ ] Performance optimization
- [ ] Mobile app (optional)
- [ ] Advanced reporting
- [ ] Third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email [your-email@example.com] or create an issue in the repository.

---

**Built with ❤️ for local businesses everywhere**
# PocketShop Documentation

This folder contains all project documentation organized by category.

## 📁 Folder Structure

### `/setup/` - Setup & Configuration Guides
**Purpose:** Step-by-step setup instructions and configuration references

- `AUTH_SETUP.md` - Complete authentication setup checklist
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth setup verification guide
- `PROJECT_CONFIG_SUMMARY.md` - Complete configuration summary (ports, auth, Supabase, Google Cloud)
- `PORT_CONFIG.md` - Port configuration reference (use port 5173)

### `/troubleshooting/` - Troubleshooting Guides
**Purpose:** Debugging guides and fix instructions

- `/oauth/` - OAuth-specific troubleshooting
  - `OAUTH_TROUBLESHOOTING.md` - Comprehensive OAuth troubleshooting checklist
  - `OAUTH_FIX.md` - Fix for "Unable to exchange external code" error
  - `OAUTH_DEEP_TROUBLESHOOTING.md` - Advanced OAuth debugging (when basic fixes don't work)
  - `VERIFY_REDIRECT_URIS.md` - Guide to verify Google Cloud Console redirect URIs
  - `STEP_BY_STEP_FIX.md` - Step-by-step OAuth fix guide (follow in order)

See [troubleshooting/README.md](troubleshooting/README.md) for detailed troubleshooting index.

### `/guides/` - Process & Flow Guides
**Purpose:** Application flow documentation and process guides

- `END_TO_END_FLOW.md` - Complete application flow mapping (for bug hunting and QA)
- `INDEX.md` - Quick reference index for all documentation files

### `/database/` - Database Documentation
**Purpose:** Database schema, SQL scripts, and RLS policies

- `README.md` - Database documentation index
- `DATABASE_SETUP_COMPLETE.sql` - Complete database setup SQL
- `schema.sql` - Database schema
- `triggers.sql` - Database triggers
- `RLS_POLICIES.sql` - Row Level Security policies
- `rls_policies_full.sql` - Complete RLS policies
- Various migration and fix SQL files

### `/reports/` - Reports & Checklists
**Purpose:** Project reports, checklists, and guides

- `README.md` - Reports index
- `/guides/` - Setup and implementation guides
  - `README.md` - Guides index
- `/sql/` - SQL scripts (duplicates from database/ for reporting)

### `/postman/` - API Testing
**Purpose:** Postman collection for API testing

- `PocketShop_API.postman_collection.json` - Postman API collection

### `/archive/` - Archived Files
**Purpose:** Old component files and deprecated code

- Old component files (VendorOnboarding, etc.)

## 🔍 Quick Links

### Getting Started
- **Auth Setup**: [Setup Guide](setup/AUTH_SETUP.md)
- **Google OAuth**: [OAuth Setup](setup/GOOGLE_OAUTH_SETUP.md)
- **Configuration**: [Config Summary](setup/PROJECT_CONFIG_SUMMARY.md)

### Troubleshooting
- **OAuth Issues**: [OAuth Troubleshooting](troubleshooting/oauth/STEP_BY_STEP_FIX.md)
- **Complete Troubleshooting Index**: [Troubleshooting README](troubleshooting/README.md)

### Understanding the App
- **Application Flow**: [End-to-End Flow](guides/END_TO_END_FLOW.md)

### Database
- **Database Setup**: [Database Documentation](database/README.md)

## 📄 Documentation Categories

| Category | Purpose | Location |
|----------|---------|----------|
| **Setup** | Initial setup and configuration | `/setup/` |
| **Troubleshooting** | Debugging and fixing issues | `/troubleshooting/` |
| **Guides** | Process flows and how-tos | `/guides/` |
| **Database** | Schema, SQL, RLS policies | `/database/` |
| **Reports** | Project reports and checklists | `/reports/` |
| **API** | API testing collections | `/postman/` |
| **Archive** | Deprecated code | `/archive/` |

---

For the main project README, see [../README.md](../README.md)

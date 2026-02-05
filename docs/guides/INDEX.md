# Documentation Index

Quick reference index for all Markdown documentation files in the PocketShop project.

## 📚 Main Documentation

### Root Level
- `README.md` – Project overview and setup instructions (at repository root)

### Documentation Hub
- `../README.md` – Main documentation index with complete folder structure

## 📁 Documentation Structure

### `/docs/setup/` - Setup & Configuration
**Purpose:** Step-by-step setup instructions and configuration references

- `AUTH_SETUP.md` - Complete authentication setup checklist
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth setup verification guide
- `PROJECT_CONFIG_SUMMARY.md` - Complete configuration summary (ports, auth, Supabase, Google Cloud)
- `PORT_CONFIG.md` - Port configuration reference (use port 5173)

### `/docs/troubleshooting/` - Troubleshooting Guides
**Purpose:** Debugging guides and fix instructions

- `README.md` - Troubleshooting index and workflow guide
- `/oauth/` - OAuth-specific troubleshooting
  - `STEP_BY_STEP_FIX.md` - Step-by-step OAuth fix guide (start here)
  - `OAUTH_TROUBLESHOOTING.md` - Comprehensive OAuth troubleshooting checklist
  - `OAUTH_FIX.md` - Fix for "Unable to exchange external code" error
  - `OAUTH_DEEP_TROUBLESHOOTING.md` - Advanced OAuth debugging
  - `VERIFY_REDIRECT_URIS.md` - Guide to verify Google Cloud Console redirect URIs

### `/docs/guides/` - Process & Flow Guides
**Purpose:** Application flow documentation and process guides

- `END_TO_END_FLOW.md` - Complete application flow mapping (for bug hunting and QA)

### `/docs/database/` - Database Documentation
**Purpose:** Database schema, SQL scripts, and RLS policies

- `README.md` - Database documentation index
- `DATABASE_SETUP_COMPLETE.sql` - Complete database setup SQL
- `schema.sql` - Database schema
- `triggers.sql` - Database triggers
- `RLS_POLICIES.sql` - Row Level Security policies
- `rls_policies_full.sql` - Complete RLS policies
- Various migration and fix SQL files

### `/docs/reports/` - Reports & Checklists
**Purpose:** Project reports, checklists, and guides

- `README.md` - Reports index
- `/guides/` - Setup and implementation guides
  - `README.md` - Guides index
- `/sql/` - SQL scripts (duplicates from database/ for reporting)

### `/docs/postman/` - API Testing
**Purpose:** Postman collection for API testing

- `PocketShop_API.postman_collection.json` - Postman API collection

### `/docs/archive/` - Archived Files
**Purpose:** Old component files and deprecated code

- Old component files (VendorOnboarding, etc.)

## 🔍 Quick Navigation

### Getting Started
- **New to the project?** → [../../README.md](../../README.md)
- **Setting up auth?** → [../setup/AUTH_SETUP.md](../setup/AUTH_SETUP.md)
- **Configuring OAuth?** → [../setup/GOOGLE_OAUTH_SETUP.md](../setup/GOOGLE_OAUTH_SETUP.md)

### Troubleshooting
- **OAuth not working?** → [../troubleshooting/oauth/STEP_BY_STEP_FIX.md](../troubleshooting/oauth/STEP_BY_STEP_FIX.md)
- **Need troubleshooting index?** → [../troubleshooting/README.md](../troubleshooting/README.md)

### Understanding the App
- **Application flow?** → [END_TO_END_FLOW.md](END_TO_END_FLOW.md)

### Database
- **Database setup?** → [../database/README.md](../database/README.md)

## 📋 Documentation Categories Summary

| Category | Location | Purpose |
|----------|----------|---------|
| **Setup** | `/docs/setup/` | Initial setup and configuration |
| **Troubleshooting** | `/docs/troubleshooting/` | Debugging and fixing issues |
| **Guides** | `/docs/guides/` | Process flows and how-tos |
| **Database** | `/docs/database/` | Schema, SQL, RLS policies |
| **Reports** | `/docs/reports/` | Project reports and checklists |
| **API** | `/docs/postman/` | API testing collections |
| **Archive** | `/docs/archive/` | Deprecated code |

---

**For complete documentation structure, see:** [../README.md](../README.md)

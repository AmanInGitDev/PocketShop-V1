#!/bin/bash

# Phase 4: Database Setup Quick Start Script
# This script helps you run the Phase 4 database migration

set -e

echo "🚀 Phase 4: Database Setup - Quick Start"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  .env.local file not found!"
    echo "Please run: cd frontend && ./setup-env.sh"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' frontend/.env.local | xargs)

# Check if Supabase credentials are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "⚠️  Supabase credentials not found in .env.local"
    exit 1
fi

echo "✅ Supabase credentials found"
echo "   URL: $VITE_SUPABASE_URL"
echo ""

# Extract project reference from URL
PROJECT_REF=$(echo $VITE_SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co||')
DASHBOARD_URL="https://supabase.com/dashboard/project/$PROJECT_REF"

echo "📋 Migration Steps:"
echo ""
echo "1. Open Supabase Dashboard:"
echo "   ${BLUE}$DASHBOARD_URL${NC}"
echo ""
echo "2. Navigate to SQL Editor → New Query"
echo ""
echo "3. Run DATABASE_SETUP_COMPLETE.sql (if not already run):"
echo "   ${YELLOW}File: docs/database/DATABASE_SETUP_COMPLETE.sql${NC}"
echo ""
echo "4. Run PHASE4_MIGRATION.sql:"
echo "   ${YELLOW}File: docs/database/PHASE4_MIGRATION.sql${NC}"
echo ""
echo "5. Verify migration using queries from:"
echo "   ${YELLOW}docs/database/PHASE4_EXECUTION_GUIDE.md${NC}"
echo ""

# Ask if user wants to open the dashboard
read -p "Do you want to open the Supabase Dashboard in your browser? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "$DASHBOARD_URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$DASHBOARD_URL"
    else
        echo "Please open the dashboard manually: $DASHBOARD_URL"
    fi
fi

echo ""
echo "📝 Next steps after migration:"
echo "1. Generate TypeScript types:"
echo "   ${BLUE}cd frontend && npx supabase gen types typescript --linked > src/integrations/supabase/types.ts${NC}"
echo ""
echo "2. Test the application:"
echo "   ${BLUE}cd frontend && npm run dev${NC}"
echo ""
echo "3. Verify hooks work with real data"
echo ""
echo "📚 For detailed instructions, see:"
echo "   ${YELLOW}docs/database/PHASE4_EXECUTION_GUIDE.md${NC}"
echo ""
echo "${GREEN}✅ Ready to start Phase 4 migration!${NC}"


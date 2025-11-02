#!/bin/bash

echo "🔧 PocketShop Login Setup"
echo "========================"
echo ""
echo "This script will help you set up your Supabase environment variables."
echo ""

if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

echo ""
echo "Please enter your Supabase credentials:"
echo "(You can find these in Supabase Dashboard → Settings → API)"
echo ""

read -p "Supabase URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY

cat > .env.local << ENVFILE
# Supabase Configuration
# Generated on $(date)

VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENVFILE

echo ""
echo "✅ .env.local file created successfully!"
echo ""
echo "Next steps:"
echo "1. Set up RLS policies in Supabase (see docs/database/RLS_POLICIES.sql)"
echo "2. Restart your dev server: npm run dev"
echo "3. Start onboarding at /vendor/onboarding"
echo ""
echo "For detailed setup instructions, see: docs/development/SUPABASE_SETUP.md"

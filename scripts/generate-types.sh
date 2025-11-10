#!/bin/bash

# Generate TypeScript types from Supabase database
# This script generates types from the Supabase project

set -e

echo "🔧 Generating TypeScript types from Supabase database..."
echo ""

PROJECT_ID="ovfcyvyavpzkijyfhezp"
OUTPUT_FILE="frontend/src/features/common/types/database.ts"

# Try using Supabase CLI
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI..."
    cd frontend
    npx supabase gen types typescript --project-id $PROJECT_ID > $OUTPUT_FILE 2>&1 || {
        echo "⚠️  Failed to generate types using CLI"
        echo "💡 Alternative: Get types from Supabase Dashboard"
        echo "   1. Go to https://supabase.com/dashboard/project/$PROJECT_ID"
        echo "   2. Navigate to Settings → API"
        echo "   3. Scroll down to 'Generated Types'"
        echo "   4. Copy TypeScript types"
        echo "   5. Paste into $OUTPUT_FILE"
        exit 1
    }
    echo "✅ Types generated successfully!"
else
    echo "⚠️  Supabase CLI not found"
    echo "💡 Please install Supabase CLI: npm install -g supabase"
    echo "   Or get types from Supabase Dashboard:"
    echo "   1. Go to https://supabase.com/dashboard/project/$PROJECT_ID"
    echo "   2. Navigate to Settings → API"
    echo "   3. Scroll down to 'Generated Types'"
    echo "   4. Copy TypeScript types"
    echo "   5. Paste into $OUTPUT_FILE"
    exit 1
fi

echo ""
echo "📝 Types saved to: $OUTPUT_FILE"
echo "✅ Done!"


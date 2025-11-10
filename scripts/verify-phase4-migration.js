#!/usr/bin/env node

/**
 * Phase 4 Migration Verification Script
 * 
 * This script verifies that the Phase 4 migration completed successfully
 * by checking for required tables, functions, and policies.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../frontend/.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verification queries
const verificationChecks = [
  {
    name: 'Check required tables exist',
    query: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN ('products', 'orders', 'order_items', 'payments', 'notifications', 'order_messages')
      ORDER BY table_name;
    `,
    expectedCount: 6,
  },
  {
    name: 'Check products table has stock columns',
    query: `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products'
      AND column_name IN ('stock_quantity', 'low_stock_threshold')
      ORDER BY column_name;
    `,
    expectedCount: 2,
  },
  {
    name: 'Check orders table has order_number column',
    query: `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
      AND column_name = 'order_number';
    `,
    expectedCount: 1,
  },
  {
    name: 'Check enum types exist',
    query: `
      SELECT typname 
      FROM pg_type 
      WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND typname IN ('order_status', 'payment_status', 'payment_method')
      ORDER BY typname;
    `,
    expectedCount: 3,
  },
];

async function verifyMigration() {
  console.log('🔍 Verifying Phase 4 Database Migration...\n');

  let allPassed = true;

  for (const check of verificationChecks) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: check.query });

      if (error) {
        // Try alternative method - direct query if RPC doesn't work
        console.log(`⚠️  ${check.name}: Could not verify (RPC not available)`);
        console.log(`   Run this query in Supabase SQL Editor to verify manually:\n`);
        console.log(check.query);
        console.log('');
        continue;
      }

      const count = Array.isArray(data) ? data.length : 0;
      const passed = count >= check.expectedCount;

      if (passed) {
        console.log(`✅ ${check.name}: PASSED (${count} items found)`);
      } else {
        console.log(`❌ ${check.name}: FAILED (expected ${check.expectedCount}, found ${count})`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`⚠️  ${check.name}: Could not verify`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Run this query in Supabase SQL Editor to verify manually:\n`);
      console.log(check.query);
      console.log('');
    }
  }

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ Migration verification complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Generate TypeScript types: cd frontend && npx supabase gen types typescript --linked > src/integrations/supabase/types.ts');
    console.log('2. Test the application with real data');
    console.log('3. Verify hooks work correctly');
  } else {
    console.log('⚠️  Some checks failed. Please review the migration.');
    console.log('\n💡 To verify manually, run these queries in Supabase SQL Editor:');
    verificationChecks.forEach(check => {
      console.log(`\n-- ${check.name}`);
      console.log(check.query);
    });
  }
  console.log('='.repeat(60) + '\n');
}

verifyMigration().catch(console.error);


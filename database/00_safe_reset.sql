-- =====================================================
-- SAFE DATABASE RESET - Won't Error on Missing Objects
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. DROP ALL CUSTOM TABLES (CASCADE handles dependencies)
-- =====================================================

DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS payout_requests CASCADE;
DROP TABLE IF EXISTS fx_orders CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS kyc_documents CASCADE;
DROP TABLE IF EXISTS kyc_records CASCADE;
DROP TABLE IF EXISTS kyc_status CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS client_profiles CASCADE;
DROP TABLE IF EXISTS admin_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- 2. DROP FUNCTIONS (CASCADE removes associated triggers)
-- =====================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_kyc_records_updated_at_fn() CASCADE;
DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_super_admin(UUID) CASCADE;

-- =====================================================
-- 3. DELETE AUTH USERS (Optional - Fresh Start)
-- =====================================================
-- Uncomment below if you want to delete all users
-- DELETE FROM auth.users;

-- =====================================================
-- 4. VERIFICATION
-- =====================================================

SELECT 'Database reset complete!' AS status;

-- Show remaining tables (should be empty or only system tables)
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

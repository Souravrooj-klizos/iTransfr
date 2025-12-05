-- =====================================================
-- FIX TABLE PERMISSIONS - Run in Supabase SQL Editor
-- =====================================================

-- Grant full permissions to authenticated role
GRANT ALL ON email_verifications TO authenticated;
GRANT ALL ON email_verifications TO service_role;
GRANT ALL ON email_verifications TO anon;

GRANT ALL ON client_profiles TO authenticated;
GRANT ALL ON client_profiles TO service_role;

GRANT ALL ON admin_profiles TO authenticated;
GRANT ALL ON admin_profiles TO service_role;

GRANT ALL ON kyc_records TO authenticated;
GRANT ALL ON kyc_records TO service_role;

GRANT ALL ON kyc_documents TO authenticated;
GRANT ALL ON kyc_documents TO service_role;

GRANT ALL ON wallets TO authenticated;
GRANT ALL ON wallets TO service_role;

GRANT ALL ON transactions TO authenticated;
GRANT ALL ON transactions TO service_role;

GRANT ALL ON ledger_entries TO authenticated;
GRANT ALL ON ledger_entries TO service_role;

GRANT ALL ON fx_orders TO authenticated;
GRANT ALL ON fx_orders TO service_role;

GRANT ALL ON payout_requests TO authenticated;
GRANT ALL ON payout_requests TO service_role;

GRANT ALL ON audit_log TO authenticated;
GRANT ALL ON audit_log TO service_role;

-- Also disable RLS on all tables temporarily to test
ALTER TABLE email_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE fx_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT 'Permissions granted and RLS disabled!' AS status;

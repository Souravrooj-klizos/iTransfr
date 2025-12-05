-- =====================================================
-- FIX RLS POLICIES - Run after SETUP_ALL_IN_ONE.sql
-- =====================================================

-- =====================================================
-- DISABLE RLS ON TABLES (For Admin/Service Role Access)
-- =====================================================

-- Email verifications - No RLS needed (service role only)
ALTER TABLE email_verifications DISABLE ROW LEVEL SECURITY;

-- Client profiles - Enable RLS with policies
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (supabaseAdmin bypasses RLS)
-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile" ON client_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON client_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Service role can do everything (policies don't apply to service role)

-- Admin profiles - Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own profile" ON admin_profiles
  FOR SELECT USING (auth.uid() = id);

-- KYC Records - Enable RLS
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own KYC" ON kyc_records
  FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can insert own KYC" ON kyc_records
  FOR INSERT WITH CHECK (auth.uid() = "userId");

-- KYC Documents - Enable RLS  
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own KYC docs" ON kyc_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kyc_records 
      WHERE kyc_records.id = kyc_documents."kycRecordId" 
      AND kyc_records."userId" = auth.uid()
    )
  );

CREATE POLICY "Users can insert own KYC docs" ON kyc_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM kyc_records 
      WHERE kyc_records.id = kyc_documents."kycRecordId" 
      AND kyc_records."userId" = auth.uid()
    )
  );

-- Wallets - Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallets" ON wallets
  FOR SELECT USING (auth.uid() = "userId");

-- Transactions - Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (auth.uid() = "userId");

-- Other tables - Disable RLS (admin only access via service role)
ALTER TABLE ledger_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE fx_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'RLS policies applied!' AS status;

-- Show RLS status for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

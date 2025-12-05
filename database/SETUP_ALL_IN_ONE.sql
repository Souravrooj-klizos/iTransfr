-- =====================================================
-- COMPLETE DATABASE SETUP - ALL IN ONE SCRIPT (CAMELCASE)
-- =====================================================
-- Run this entire script in Supabase SQL Editor
-- Column names use camelCase to match API code
-- =====================================================

-- =====================================================
-- PART 1: CLEANUP (Safe - won't error)
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

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;

-- =====================================================
-- PART 2: CREATE TABLES
-- =====================================================

-- 1. EMAIL VERIFICATIONS
CREATE TABLE email_verifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "userId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_verifications_email ON email_verifications(email);

-- 2. CLIENT PROFILES
CREATE TABLE client_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  mobile TEXT,
  country_code TEXT,
  city TEXT,
  country TEXT,
  pincode TEXT,
  company_name TEXT,
  business_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending_kyc' CHECK (status IN ('pending_kyc', 'active', 'suspended')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_client_profiles_status ON client_profiles(status);

-- 3. ADMIN PROFILES
CREATE TABLE admin_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  mobile TEXT,
  country_code TEXT,
  city TEXT,
  country TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  department TEXT,
  employee_id TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX idx_admin_profiles_department ON admin_profiles(department);

-- 4. KYC RECORDS
CREATE TABLE kyc_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" UUID UNIQUE NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  "amlbotRequestId" TEXT,
  "riskScore" DECIMAL,
  notes TEXT[] DEFAULT '{}',
  "reviewedBy" UUID REFERENCES admin_profiles(id),
  "reviewedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kyc_records_userId ON kyc_records("userId");
CREATE INDEX idx_kyc_records_status ON kyc_records(status);

-- 5. KYC DOCUMENTS
CREATE TABLE kyc_documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "kycRecordId" TEXT NOT NULL REFERENCES kyc_records(id) ON DELETE CASCADE,
  "documentType" TEXT NOT NULL CHECK ("documentType" IN ('passport', 'address_proof', 'photo_id')),
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "s3Bucket" TEXT DEFAULT 'itransfr-kyc-documents',
  "s3Key" TEXT,
  "fileSize" BIGINT,
  "mimeType" TEXT,
  "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE kyc_documents ADD CONSTRAINT unique_kyc_doc_type UNIQUE ("kycRecordId", "documentType");
CREATE INDEX idx_kyc_documents_kycRecordId ON kyc_documents("kycRecordId");

-- 6. WALLETS
CREATE TABLE wallets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
  "turnkeyWalletId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE wallets ADD CONSTRAINT unique_user_currency UNIQUE ("userId", currency);
CREATE INDEX idx_wallets_userId ON wallets("userId");

-- 7. TRANSACTIONS
CREATE TABLE transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'swap', 'payout', 'fee')),
  status TEXT NOT NULL DEFAULT 'pending',
  amount DECIMAL(18, 8) NOT NULL,
  currency TEXT NOT NULL,
  "referenceNumber" TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_userId ON transactions("userId");
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);

-- 8. LEDGER ENTRIES
CREATE TABLE ledger_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "transactionId" TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  account TEXT NOT NULL,
  debit DECIMAL(18, 8) DEFAULT 0,
  credit DECIMAL(18, 8) DEFAULT 0,
  currency TEXT NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ledger_entries_transactionId ON ledger_entries("transactionId");

-- 9. FX ORDERS
CREATE TABLE fx_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "transactionId" TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  "fromCurrency" TEXT NOT NULL,
  "toCurrency" TEXT NOT NULL,
  "fromAmount" DECIMAL(18, 8) NOT NULL,
  "toAmount" DECIMAL(18, 8),
  "exchangeRate" DECIMAL(18, 8),
  "bitsoOrderId" TEXT,
  "bitsoQuoteId" TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  "executedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fx_orders_transactionId ON fx_orders("transactionId");

-- 10. PAYOUT REQUESTS
CREATE TABLE payout_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "transactionId" TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  "recipientName" TEXT NOT NULL,
  "recipientAccount" TEXT NOT NULL,
  "recipientBank" TEXT NOT NULL,
  "recipientBankCode" TEXT,
  "recipientCountry" TEXT NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  currency TEXT NOT NULL,
  "infinitusRequestId" TEXT,
  "infinitusTrackingNumber" TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  "sentAt" TIMESTAMP WITH TIME ZONE,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payout_requests_transactionId ON payout_requests("transactionId");

-- 11. AUDIT LOG
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "adminId" UUID NOT NULL REFERENCES admin_profiles(id),
  action TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "oldValues" JSONB,
  "newValues" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_adminId ON audit_log("adminId");

-- =====================================================
-- PART 3: TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_profiles_updated_at 
  BEFORE UPDATE ON client_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at 
  BEFORE UPDATE ON admin_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_records_updated_at 
  BEFORE UPDATE ON kyc_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at 
  BEFORE UPDATE ON wallets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 4: HELPER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_profiles WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Schema created successfully!' AS status;

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

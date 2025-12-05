-- =====================================================
-- COMPLETE SCHEMA - Per Project Documentation
-- =====================================================
-- Based on:
-- - docs/project_guidelines.txt (lines 47-54)
-- - README.md database schema section
-- =====================================================
-- Run AFTER 00_safe_reset.sql
-- =====================================================

-- =====================================================
-- 1. EMAIL VERIFICATIONS
-- =====================================================
CREATE TABLE email_verifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "userId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_verifications_email ON email_verifications(email);

-- =====================================================
-- 2. CLIENT PROFILES (For clients/customers)
-- =====================================================
CREATE TABLE client_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT,
  mobile TEXT,
  country_code TEXT,
  city TEXT,
  country TEXT,
  pincode TEXT,
  business_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending_kyc' CHECK (status IN ('pending_kyc', 'active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_client_profiles_email ON client_profiles(email);
CREATE INDEX idx_client_profiles_status ON client_profiles(status);

-- =====================================================
-- 3. ADMIN PROFILES (Separate table for admins)
-- =====================================================
CREATE TABLE admin_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  department TEXT,
  employee_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX idx_admin_profiles_status ON admin_profiles(status);
CREATE INDEX idx_admin_profiles_department ON admin_profiles(department);
CREATE INDEX idx_admin_profiles_role ON admin_profiles(role);

-- =====================================================
-- 4. KYC RECORDS (Per docs: kyc_status table)
-- =====================================================
CREATE TABLE kyc_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID UNIQUE NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  amlbot_request_id TEXT,
  risk_score DECIMAL,
  notes TEXT[] DEFAULT '{}',
  reviewed_by UUID REFERENCES admin_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kyc_records_user_id ON kyc_records(user_id);
CREATE INDEX idx_kyc_records_status ON kyc_records(status);

-- =====================================================
-- 5. KYC DOCUMENTS (Files in AWS S3)
-- =====================================================
CREATE TABLE kyc_documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  kyc_record_id TEXT NOT NULL REFERENCES kyc_records(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'address_proof', 'photo_id')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  s3_bucket TEXT DEFAULT 'itransfr-kyc-documents',
  s3_key TEXT,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE kyc_documents ADD CONSTRAINT unique_kyc_doc_type
UNIQUE (kyc_record_id, document_type);

CREATE INDEX idx_kyc_documents_kyc_record_id ON kyc_documents(kyc_record_id);

-- =====================================================
-- 6. WALLETS (Per docs - Turnkey integration)
-- =====================================================
CREATE TABLE wallets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
  turnkey_wallet_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE wallets ADD CONSTRAINT unique_user_currency
UNIQUE (user_id, currency);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- =====================================================
-- 7. TRANSACTIONS (Per docs)
-- =====================================================
CREATE TABLE transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'swap', 'payout', 'fee')),
  status TEXT NOT NULL DEFAULT 'pending',
  amount DECIMAL(18, 8) NOT NULL,
  currency TEXT NOT NULL,
  reference_number TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);

-- =====================================================
-- 8. LEDGER ENTRIES (Per docs - Double-entry bookkeeping)
-- =====================================================
CREATE TABLE ledger_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  account TEXT NOT NULL,
  debit DECIMAL(18, 8) DEFAULT 0,
  credit DECIMAL(18, 8) DEFAULT 0,
  currency TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ledger_entries_transaction_id ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_entries_account ON ledger_entries(account);

-- =====================================================
-- 9. FX ORDERS (Per docs - Bitso integration)
-- =====================================================
CREATE TABLE fx_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  from_amount DECIMAL(18, 8) NOT NULL,
  to_amount DECIMAL(18, 8),
  exchange_rate DECIMAL(18, 8),
  bitso_order_id TEXT,
  bitso_quote_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fx_orders_transaction_id ON fx_orders(transaction_id);
CREATE INDEX idx_fx_orders_status ON fx_orders(status);

-- =====================================================
-- 10. PAYOUT REQUESTS (Per docs - Infinitus integration)
-- =====================================================
CREATE TABLE payout_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_account TEXT NOT NULL,
  recipient_bank TEXT NOT NULL,
  recipient_bank_code TEXT,
  recipient_country TEXT NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  currency TEXT NOT NULL,
  infinitus_request_id TEXT,
  infinitus_tracking_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payout_requests_transaction_id ON payout_requests(transaction_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);

-- =====================================================
-- 11. AUDIT LOG (Per docs - Admin action tracking)
-- =====================================================
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_id UUID NOT NULL REFERENCES admin_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_admin_id ON audit_log(admin_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- =====================================================
-- 12. TRIGGERS FOR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
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
-- 13. HELPER FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Schema created successfully!' AS status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

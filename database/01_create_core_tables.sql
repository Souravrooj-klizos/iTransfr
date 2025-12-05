-- =====================================================
-- ITRANSFR CORE TABLES - PROPER SCHEMA (QUOTED IDENTIFIERS)
-- =====================================================
-- Run this AFTER 00_reset_database.sql
-- =====================================================

-- =====================================================
-- 1. EMAIL VERIFICATIONS TABLE
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
CREATE INDEX idx_email_verifications_expiresAt ON email_verifications("expiresAt");

COMMENT ON TABLE email_verifications IS 'Stores OTP codes for email verification during signup';

-- =====================================================
-- 2. PROFILES TABLE
-- =====================================================
-- This stores user profile data linked to auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  mobile TEXT,
  country_code TEXT,
  city TEXT,
  country TEXT,
  pincode TEXT,
  business_type TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin', 'super_admin')),
  status TEXT NOT NULL DEFAULT 'pending_kyc' CHECK (status IN ('pending_kyc', 'active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Note: Admin policies removed to prevent RLS recursion
-- Admin operations should use service role key (supabaseAdmin)

COMMENT ON TABLE profiles IS 'User profile data linked to Supabase Auth users';

-- =====================================================
-- 3. KYC RECORDS TABLE
-- =====================================================
CREATE TABLE kyc_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  "amlbotRequestId" TEXT,
  "riskScore" DECIMAL,
  notes TEXT[] DEFAULT '{}',
  "reviewedBy" UUID REFERENCES auth.users(id),
  "reviewedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kyc_records_userId ON kyc_records("userId");
CREATE INDEX idx_kyc_records_status ON kyc_records(status);

-- Enable Row Level Security
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can read own KYC record" ON kyc_records
  FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can insert own KYC record" ON kyc_records
  FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Admin policies
CREATE POLICY "Admins can read all KYC records" ON kyc_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update KYC records" ON kyc_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

COMMENT ON TABLE kyc_records IS 'KYC verification status and tracking';

-- =====================================================
-- 4. KYC DOCUMENTS TABLE
-- =====================================================
-- NOTE: We store document metadata here, actual files in AWS S3
CREATE TABLE kyc_documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "kycRecordId" TEXT NOT NULL REFERENCES kyc_records(id) ON DELETE CASCADE,
  "documentType" TEXT NOT NULL CHECK ("documentType" IN ('passport', 'address_proof', 'photo_id')),
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL, -- AWS S3 URL
  "s3Bucket" TEXT DEFAULT 'itransfr-kyc-documents',
  "s3Key" TEXT,
  "fileSize" BIGINT,
  "mimeType" TEXT,
  "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure one document per type per KYC record
ALTER TABLE kyc_documents ADD CONSTRAINT unique_kyc_document_type
UNIQUE ("kycRecordId", "documentType");

CREATE INDEX idx_kyc_documents_kycRecordId ON kyc_documents("kycRecordId");
CREATE INDEX idx_kyc_documents_documentType ON kyc_documents("documentType");

-- Enable Row Level Security
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can read own KYC documents" ON kyc_documents
  FOR SELECT USING (
    "kycRecordId" IN (
      SELECT id FROM kyc_records WHERE "userId" = auth.uid()
    )
  );

CREATE POLICY "Users can insert own KYC documents" ON kyc_documents
  FOR INSERT WITH CHECK (
    "kycRecordId" IN (
      SELECT id FROM kyc_records WHERE "userId" = auth.uid()
    )
  );

-- Admin policies
CREATE POLICY "Admins can read all KYC documents" ON kyc_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

COMMENT ON TABLE kyc_documents IS 'KYC document metadata - actual files stored in AWS S3';

-- =====================================================
-- 5. TRIGGER: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: kyc_records uses "updatedAt" (camelCase)
CREATE OR REPLACE FUNCTION update_kyc_records_updated_at_fn()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kyc_records_updated_at 
  BEFORE UPDATE ON kyc_records 
  FOR EACH ROW EXECUTE FUNCTION update_kyc_records_updated_at_fn();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
SELECT 'Core tables created successfully with QUOTED identifiers!' AS status;

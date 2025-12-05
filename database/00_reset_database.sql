-- =====================================================
-- ITRANSFR DATABASE RESET (COMPLETE WIPE)
-- WARNING: This will DROP ALL DATA AND ALL USERS
-- =====================================================

-- 1. Drop public tables with CASCADE
DROP TABLE IF EXISTS kyc_documents CASCADE;
DROP TABLE IF EXISTS kyc_records CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Drop storage policies
DROP POLICY IF EXISTS "Users can upload own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own KYC documents" ON storage.objects;

-- 3. Clear and Drop storage bucket
DELETE FROM storage.objects WHERE bucket_id = 'kyc-documents';
DELETE FROM storage.buckets WHERE id = 'kyc-documents';

-- 4. WIPE ALL AUTH USERS
-- This deletes all registered users from Supabase Auth
-- This will also cascade delete any linked data in other tables if FKs exist
DELETE FROM auth.users;

-- Confirm reset
SELECT 'Database reset complete. All tables, data, and USERS dropped.' AS status;

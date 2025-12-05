-- =====================================================
-- QUICK FIX - Disable RLS on email_verifications
-- =====================================================
-- Run this FIRST to fix the permission denied error
-- =====================================================

-- This is the main fix for your OTP issue
ALTER TABLE email_verifications DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT 'RLS disabled on email_verifications!' AS status;
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'email_verifications';

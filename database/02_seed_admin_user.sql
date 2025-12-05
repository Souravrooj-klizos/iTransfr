-- =====================================================
-- SEED ADMIN USER
-- =====================================================
-- This creates a default admin user for testing
-- Run this AFTER creating your first user via Supabase Auth
-- =====================================================

-- INSTRUCTIONS:
-- 1. First, manually create a user in Supabase Auth Dashboard or via signup
-- 2. Copy the UUID from auth.users table
-- 3. Replace 'YOUR-USER-UUID-HERE' below with that UUID
-- 4. Run this script

-- Example: Update existing user to admin
UPDATE profiles 
SET 
  role = 'admin',
  status = 'active'
WHERE id = 'YOUR-USER-UUID-HERE';

-- Verify admin user
SELECT 
  p.id,
  u.email,
  p.first_name,
  p.last_name,
  p.role,
  p.status
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('admin', 'super_admin');

-- NOTE: After running this, the user will have admin access
-- They can then access the Admin Console at /admin/*

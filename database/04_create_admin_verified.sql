-- =====================================================
-- CREATE ADMIN USER - VERIFIED SCRIPT
-- =====================================================

-- Step 1: First check if user exists in auth.users
SELECT id, email, raw_user_meta_data->>'full_name' as full_name 
FROM auth.users 
WHERE email = 'sourav.rooj@klizos.com';

-- Step 2: Check if admin already exists
SELECT * FROM admin_profiles WHERE id = '786387ea-b3fb-4de0-bff1-26d3efe260ee';

-- Step 3: Insert admin (use the actual UUID from auth.users)
INSERT INTO admin_profiles (id, first_name, last_name, role, department)
VALUES (
  '786387ea-b3fb-4de0-bff1-26d3efe260ee',  -- Your user ID from auth.users
  'Test',
  'Domain',
  'super_admin',
  'Operations'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  department = 'Operations';

-- Step 4: Verify
SELECT * FROM admin_profiles;

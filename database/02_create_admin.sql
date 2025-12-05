-- =====================================================
-- CREATE ADMIN USER
-- =====================================================
-- Run this AFTER creating a user via signup
-- Replace the email with your admin's email
-- =====================================================

-- Step 1: First, create the user via the signup form on the website

-- Step 2: Get the user's Supabase Auth ID
-- SELECT id, email FROM auth.users WHERE email = 'admin@yourdomain.com';

-- Step 3: Insert into admin_profiles (replace VALUES with your data)
-- Note: The user must already exist in auth.users

INSERT INTO admin_profiles (id, first_name, last_name, role, department)
SELECT
  id,
  -- Extract first and last name from full_name in metadata
  SPLIT_PART(raw_user_meta_data->>'full_name', ' ', 1) as first_name,
  CASE
    WHEN array_length(string_to_array(raw_user_meta_data->>'full_name', ' '), 1) > 1
    THEN array_to_string((string_to_array(raw_user_meta_data->>'full_name', ' '))[2:], ' ')
    ELSE ''
  END as last_name,
  'super_admin',
  'Operations'
FROM auth.users
WHERE email = 'sourav.rooj@klizos.com'  -- Replace with your email
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  department = 'Operations';

-- Step 4: Verify
SELECT * FROM admin_profiles;

-- =====================================================
-- OR: Quick method - Make existing client an admin
-- =====================================================

-- If you have a client who needs admin access too,
-- just add them to admin_profiles (they can exist in both tables)

-- INSERT INTO admin_profiles (id, first_name, last_name, role, department)
-- SELECT id, first_name, last_name, 'admin', 'Support'
-- FROM client_profiles
-- WHERE first_name || ' ' || last_name = 'Support User';

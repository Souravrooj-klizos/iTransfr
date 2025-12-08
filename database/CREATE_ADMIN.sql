-- =====================================================
-- CREATE ADMIN/SUPER ADMIN USER
-- =====================================================
-- Run this AFTER:
--   1. PRODUCTION_SETUP.sql has been executed
--   2. User has signed up via the app with this email
--
-- This script promotes an existing user to super_admin
-- =====================================================

-- =====================================================
-- STEP 1: SET ADMIN EMAIL HERE
-- =====================================================
-- Change this email to your admin's email address

DO $$
DECLARE
    admin_email TEXT := 'sourav.rooj@klizos.com';  -- <-- CHANGE THIS IF NEEDED
    admin_user_id UUID;
    admin_exists BOOLEAN;
BEGIN
    -- Find user ID from auth.users
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = admin_email;

    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION '❌ User with email % not found in auth.users. Please sign up first!', admin_email;
    END IF;

    -- Check if already an admin
    SELECT EXISTS(SELECT 1 FROM admin_profiles WHERE id = admin_user_id) INTO admin_exists;

    IF admin_exists THEN
        -- Update existing admin to super_admin
        UPDATE admin_profiles
        SET role = 'super_admin',
            "updatedAt" = NOW()
        WHERE id = admin_user_id;

        RAISE NOTICE '✅ Updated existing admin to super_admin: %', admin_email;
    ELSE
        -- Create new admin profile
        INSERT INTO admin_profiles (
            id,
            first_name,
            last_name,
            role,
            department,
            "createdAt",
            "updatedAt"
        ) VALUES (
            admin_user_id,
            'Super',
            'Admin',
            'super_admin',
            'Management',
            NOW(),
            NOW()
        );

        RAISE NOTICE '✅ Created super_admin profile for: %', admin_email;
    END IF;

    -- Also ensure user is NOT in client_profiles (admins shouldn't be clients)
    -- This is optional - uncomment if you want to remove from clients
    -- DELETE FROM client_profiles WHERE id = admin_user_id;

    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ ADMIN SETUP COMPLETED!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Email: %', admin_email;
    RAISE NOTICE 'Role: super_admin';
    RAISE NOTICE 'User can now access: /admin/*';
    RAISE NOTICE '=====================================================';
END $$;

-- Verify admin was created
SELECT
    ap.id,
    au.email,
    ap.first_name,
    ap.last_name,
    ap.role,
    ap.department,
    ap."createdAt"
FROM admin_profiles ap
JOIN auth.users au ON ap.id = au.id
ORDER BY ap."createdAt" DESC
LIMIT 5;

-- Refresh cache
NOTIFY pgrst, 'reload schema';

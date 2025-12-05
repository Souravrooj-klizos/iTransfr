-- =====================================================
-- MIGRATE EXISTING DATA (when tables already exist)
-- =====================================================
-- Run this if tables exist but data migration is needed
-- =====================================================

-- Check if we have data to migrate
SELECT
  'Profiles table exists: ' ||
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
  THEN 'YES - ready to migrate' ELSE 'NO - nothing to migrate' END as migration_status,

  'Client profiles has data: ' ||
  CASE WHEN EXISTS (SELECT 1 FROM client_profiles LIMIT 1)
  THEN 'YES - already migrated' ELSE 'NO - needs migration' END as client_data_status,

  'Admin profiles has data: ' ||
  CASE WHEN EXISTS (SELECT 1 FROM admin_profiles LIMIT 1)
  THEN 'YES - already migrated' ELSE 'NO - needs migration' END as admin_data_status;

-- =====================================================
-- ONLY RUN MIGRATION IF NEEDED
-- =====================================================

-- Migrate client data (only if profiles table exists and client_profiles is empty)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
     AND NOT EXISTS (SELECT 1 FROM client_profiles LIMIT 1) THEN

    -- Migrate client data
    INSERT INTO client_profiles (
      id, first_name, last_name, mobile, country_code, city, country, pincode,
      company_name, business_type, status, created_at, updated_at
    )
    SELECT
      id, first_name, last_name, mobile, country_code, city, country, pincode,
      company_name, business_type, status, created_at, updated_at
    FROM profiles
    WHERE role = 'client';

    RAISE NOTICE 'Migrated % client profiles', (SELECT COUNT(*) FROM client_profiles);

  ELSE
    RAISE NOTICE 'Client profiles migration skipped - already done or no data to migrate';
  END IF;
END $$;

-- Migrate admin data (only if profiles table exists and admin_profiles is empty)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
     AND NOT EXISTS (SELECT 1 FROM admin_profiles LIMIT 1) THEN

    -- Migrate admin data
    INSERT INTO admin_profiles (
      id, first_name, last_name, mobile, country_code, city, country,
      role, created_at, updated_at
    )
    SELECT
      id, first_name, last_name, mobile, country_code, city, country,
      CASE WHEN role = 'super_admin' THEN 'super_admin' ELSE 'admin' END,
      created_at, updated_at
    FROM profiles
    WHERE role IN ('admin', 'super_admin');

    RAISE NOTICE 'Migrated % admin profiles', (SELECT COUNT(*) FROM admin_profiles);

  ELSE
    RAISE NOTICE 'Admin profiles migration skipped - already done or no data to migrate';
  END IF;
END $$;

-- =====================================================
-- UPDATE POLICIES (only if needed)
-- =====================================================

-- Check if policies exist and update if necessary
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Check if we have the new admin policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'kyc_records'
  AND policyname LIKE '%Admins can%';

  IF policy_count = 0 THEN
    -- Create new admin policies using admin_profiles
    CREATE POLICY "Admins can read all KYC records" ON kyc_records
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM admin_profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'super_admin')
        )
      );

    CREATE POLICY "Admins can update KYC records" ON kyc_records
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM admin_profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'super_admin')
        )
      );

    CREATE POLICY "Admins can read all KYC documents" ON kyc_documents
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM admin_profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'super_admin')
        )
      );

    RAISE NOTICE 'Created admin policies for KYC tables';
  ELSE
    RAISE NOTICE 'Admin policies already exist - skipped';
  END IF;
END $$;

-- =====================================================
-- CREATE HELPER FUNCTIONS (only if they don't exist)
-- =====================================================

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  -- Check if user is admin
  IF EXISTS (SELECT 1 FROM admin_profiles WHERE id = user_uuid) THEN
    RETURN (SELECT role FROM admin_profiles WHERE id = user_uuid);
  -- Check if user is client
  ELSIF EXISTS (SELECT 1 FROM client_profiles WHERE id = user_uuid) THEN
    RETURN 'client';
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = user_uuid
    AND role IN ('admin', 'super_admin')
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = user_uuid
    AND role = 'super_admin'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

SELECT
  'Migration completed!' AS status,
  NOW() AS completion_timestamp,
  (SELECT COUNT(*) FROM client_profiles) as client_profiles_count,
  (SELECT COUNT(*) FROM admin_profiles) as admin_profiles_count,
  (SELECT COUNT(*) FROM email_verifications) as email_verifications_count;

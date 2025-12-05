# Database Setup Instructions

## 🚨 IMPORTANT: Read Before Running

This directory contains SQL migration scripts to set up the iTransfr database schema.

## 📋 Prerequisites

1. **Supabase Project**: You must have a Supabase project created
2. **Database Access**: Access to Supabase SQL Editor
3. **Backup**: If you have existing data, **BACK IT UP** before running reset script

## 🔄 Setup Process

### Step 1: Reset Database (⚠️ WARNING: Deletes ALL data)

Run this in Supabase SQL Editor:

```sql
-- File: 00_reset_database.sql
```

This will:
- Drop all existing tables
- Drop all policies
- Clean slate for proper schema

### Step 2: Create Core Tables

Run this in Supabase SQL Editor:

```sql
-- File: 01_create_core_tables.sql
```

This creates:
- `email_verifications` - OTP storage
- `profiles` - User profile data
- `kyc_records` - KYC verification tracking
- `kyc_documents` - Document metadata (files in S3)

### Step 3: Separate Client and Admin Tables

Run this to properly separate client and admin data:

```sql
-- File: 04_separate_client_admin_tables.sql
```

This creates:
- `client_profiles` - Client user data
- `admin_profiles` - Admin user data
- Migrates existing data from `profiles` table
- Updates RLS policies and functions

### Step 4: Create Admin User (Optional)

After creating your first user via signup:

1. Go to Supabase Dashboard → Authentication → Users
2. Copy the user's UUID
3. Edit `02_seed_admin_user.sql`
4. Replace `'YOUR-USER-UUID-HERE'` with the UUID
5. Run the script

## 📊 Schema Overview

### Tables

| Table | Purpose | User Type | Storage |
|-------|---------|-----------|---------|
| `email_verifications` | OTP codes for email verification | All | Postgres |
| `client_profiles` | Client user profile data | Clients | Postgres |
| `admin_profiles` | Admin user profile data | Admins | Postgres |
| `kyc_records` | KYC verification status | Clients | Postgres |
| `kyc_documents` | Document metadata | Clients | Postgres (files in S3) |
| `wallets` | Customer wallets (Turnkey) | Clients | Postgres |
| `transactions` | All transactions (deposits, swaps, payouts) | Clients | Postgres |
| `ledger_entries` | Double-entry bookkeeping records | Clients | Postgres |
| `fx_orders` | FX swap orders from Bitso | Clients | Postgres |
| `payout_requests` | Payout requests to Infinitus | Clients | Postgres |
| `audit_log` | Admin action audit trail | Admins | Postgres |

### Key Changes from Old Schema

**OLD (single profiles table mixed everything):**
```
profiles (mixed client + admin data)
  - role: 'client' | 'admin' | 'super_admin'
  - All fields in one table
```

**NEW (proper separation by user type):**
```
client_profiles → Client-specific data (business info, KYC status)
admin_profiles → Admin-specific data (department, employee_id)
kyc_records → KYC verification status
kyc_documents → Document metadata (files in AWS S3)
```

## 🗂️ AWS S3 vs Supabase Storage

**We're using AWS S3 for KYC documents because:**

✅ Better security and compliance  
✅ Industry standard for fintech  
✅ Better scalability  
✅ Already integrated with AWS SES  
✅ Fine-grained IAM policies  
✅ Encryption at rest  
✅ Lifecycle policies for archiving  

## 🔐 Security Features

1. **Row Level Security (RLS)** enabled on all tables
2. **User Policies**: Users can only see their own data
3. **Admin Policies**: Admins can see all data
4. **Foreign Key Constraints**: Data integrity enforced
5. **Check Constraints**: Valid enum values only

## 🧪 Verification

After running scripts, verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should show:
- admin_profiles
- audit_log
- client_profiles
- email_verifications
- fx_orders
- kyc_documents
- kyc_records
- ledger_entries
- payout_requests
- transactions
- wallets

## 🔄 Updates and Migrations

For future schema changes:
1. Create new migration file: `03_add_feature_name.sql`
2. Number sequentially
3. Document changes in this README

## 🆘 Troubleshooting

**Error: "relation already exists"**
- Run `00_reset_database.sql` first

**Error: "foreign key violation"**
- Tables must be created in order (01, 02, 03)

**Error: "permission denied"**
- Ensure you're using Supabase SQL Editor with proper permissions

## 📞 Need Help?

- Check Supabase Dashboard → Database → Tables
- Review Supabase logs for errors
- Verify environment variables in `.env`

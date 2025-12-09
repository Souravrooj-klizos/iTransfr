# iTransfr Database Setup

## Quick Start

### Step 1: Create Tables
Run in Supabase SQL Editor:
```
PRODUCTION_SETUP.sql
```

### Step 2: Create Admin
Choose one of these options:

**Option A: Direct Admin Creation** (Recommended)
Run in Supabase SQL Editor:
```
CREATE_ADMIN_DIRECT.sql
```
This creates admin@klizos.com with password Password12@

**Option B: Manual Process**
- Sign up with admin email via the app
- Then run CREATE_ADMIN.sql to promote to super_admin

---

## Files

| File | Purpose | When to Run |
|------|---------|-------------|
| `PRODUCTION_SETUP.sql` | Creates all 11 tables | First, once |
| `CREATE_ADMIN_DIRECT.sql` | Creates admin user directly | After tables are created |
| `CREATE_ADMIN.sql` | Promotes existing user to super_admin | After user signs up |

---

## Tables Created

| Table | Purpose |
|-------|---------|
| `email_verifications` | OTP codes for signup |
| `client_profiles` | Customer accounts |
| `admin_profiles` | Admin accounts |
| `kyc_records` | KYC verification status |
| `kyc_documents` | Uploaded KYC files |
| `wallets` | User currency balances |
| `transactions` | All transactions |
| `ledger_entries` | Double-entry accounting |
| `fx_orders` | Currency exchange orders |
| `payout_requests` | Outbound payments |
| `audit_log` | Admin action logs |

---

## Complete Setup Steps

1. **Create Supabase Project** at [supabase.com](https://supabase.com)

2. **Run Database Setup**
   - Go to SQL Editor
   - Paste `PRODUCTION_SETUP.sql`
   - Click Run

3. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Create Admin User**
   Choose one option:

   **Quick Setup (Recommended):**
   - Go to SQL Editor
   - Run `CREATE_ADMIN_DIRECT.sql`
   - Admin: `admin@klizos.com` / `Password12@`

   **Manual Setup:**
   - Go to your app signup page
   - Sign up with admin email
   - Go to SQL Editor and run `CREATE_ADMIN.sql`

5. **Done!** Admin can now access `/admin/*` pages

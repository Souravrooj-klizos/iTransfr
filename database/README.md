# iTransfr Database Setup

## Quick Start

### Step 1: Create Tables
Run in Supabase SQL Editor:
```
PRODUCTION_SETUP.sql
```

### Step 2: Create Admin (after signing up)
Run in Supabase SQL Editor:
```
CREATE_ADMIN.sql
```

---

## Files

| File | Purpose | When to Run |
|------|---------|-------------|
| `PRODUCTION_SETUP.sql` | Creates all 11 tables | First, once |
| `CREATE_ADMIN.sql` | Promotes user to super_admin | After user signs up |

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

4. **Sign Up Admin User**
   - Go to your app signup page
   - Sign up with admin email (e.g., sourav.rooj@klizos.com)

5. **Promote to Super Admin**
   - Go to SQL Editor
   - Edit `CREATE_ADMIN.sql` if needed (change email)
   - Run the script

6. **Done!** Admin can now access `/admin/*` pages

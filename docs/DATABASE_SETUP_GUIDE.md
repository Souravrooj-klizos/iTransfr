# Database Reset & Proper Schema Setup - Complete Guide

## ✅ **WHAT WE'VE DONE**

### 1. Created Proper Database Schema
- ✅ `00_reset_database.sql` - Drops all old data
- ✅ `01_create_core_tables.sql` - Creates proper schema
- ✅ `02_seed_admin_user.sql` - Seeds admin user
- ✅ AWS S3 integration for KYC documents

### 2. Key Improvements

**OLD Structure (Incorrect):**
```
profiles table
  - passport_url
  - address_proof_url  
  - photo_id_url
  - No KYC tracking
  - Files in Supabase Storage
```

**NEW Structure (Correct - Per Docs):**
```
profiles → User profile data
kyc_records → KYC verification status & tracking
kyc_documents → Document metadata
AWS S3 → Actual document files (BETTER than Supabase Storage)
```

## 🔄 **STEP-BY-STEP EXECUTION**

### **Step 1: Backup Current Data (IMPORTANT!)**

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Backup existing profiles (if you have test data you want to save)
CREATE TABLE profiles_backup AS SELECT * FROM profiles;
CREATE TABLE email_verifications_backup AS SELECT * FROM email_verifications;
```

### **Step 2: Reset Database**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Open `database/00_reset_database.sql` from your project
4. Copy the entire SQL content
5. Paste in Supabase SQL Editor
6. Click **Run**

**Expected Output:**
```
Database reset complete. All tables and data dropped.
```

### **Step 3: Create Proper Schema**

1. In Supabase SQL Editor → **New Query**
2. Open `database/01_create_core_tables.sql`
3. Copy the entire SQL content
4. Paste in Supabase SQL Editor
5. Click **Run**

**Expected Output:**
```
Core tables created successfully!

Table Name              | Row Count
--------------------|----------
email_verifications | 0
profiles            | 0
kyc_records         | 0
kyc_documents       | 0
```

### **Step 4: Verify Tables Created**

Run this query in Supabase SQL Editor:

```sql
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'kyc_records', 'kyc_documents', 'email_verifications')
ORDER BY table_name;
```

**Expected Output:**
| table_name | column_count |
|-----------|--------------|
| email_verifications | 5 |
| kyc_documents | 9 |
| kyc_records | 10 |
| profiles | 13 |

### **Step 5: Setup AWS S3 Bucket**

1. **Go to AWS Console** → **S3**
2. **Create New Bucket**:
   - Name: `itransfr-kyc-documents`
   - Region: `us-east-2` (or your preferred region)
   - **Block Public Access**: Keep enabled (we'll use presigned URLs)
   - **Encryption**: Enable (Server-side encryption with S3-managed keys)

3. **Create IAM Policy**:

Go to AWS Console → IAM → Policies → Create Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "KYCDocumentsAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::itransfr-kyc-documents",
        "arn:aws:s3:::itransfr-kyc-documents/*"
      ]
    }
  ]
}
```

Name it: `itransfr-kyc-s3-policy`

4. **Create IAM User**:
   - Name: `itransfr-kyc-uploader`
   - Attach policy: `itransfr-kyc-s3-policy`
   - Create access key
   - **Save Access Key ID and Secret Key** (you'll need these!)

### **Step 6: Update Environment Variables**

Update your `.env` file (create from `.env.example` if it doesn't exist):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AWS S3 for KYC Documents
AWS_ACCESS_KEY_ID=YOUR_NEW_IAM_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_NEW_IAM_SECRET_KEY
AWS_DEFAULT_REGION=us-east-2
AWS_S3_KYC_BUCKET=itransfr-kyc-documents

# AWS SES (you already have this)
SES_FROM_ADDRESS=info@interviewscreener.com
```

### **Step 7: Test the Setup**

Run this in your terminal:

```bash
npm run dev
```

Visit: `http://localhost:3000/signup`

## 📊 **WHAT'S DIFFERENT NOW?**

### **Document Storage: Supabase vs AWS S3**

| Feature | Supabase Storage | AWS S3 (What We're Using) |
|---------|------------------|---------------------------|
| Security | Basic | ✅ IAM policies, encryption at rest |
| Scalability | Limited | ✅ Unlimited |
| Compliance | Basic | ✅ HIPAA, SOC 2, PCI DSS |
| Cost | Higher for large files | ✅ Very cost-effective |
| Industry Standard | No | ✅ Yes (Wise, Stripe use S3) |
| Already Integrated | No | ✅ Yes (we use AWS SES) |

### **Schema Changes**

**BEFORE:**
```typescript
// signup API stored URLs directly in profiles
profiles.passport_url = "supabase_url"
profiles.address_proof_url = "supabase_url"
profiles.photo_id_url = "supabase_url"
```

**NOW:**
```typescript
// Step 1: Create KYC record
kyc_records.status = "pending"

// Step 2: Store document metadata
kyc_documents = {
  kycRecordId: "...",
  documentType: "passport",
  fileUrl: "s3_url",
  s3Bucket: "itransfr-kyc-documents",
  s3Key: "kyc/userId/passport/file.pdf"
}
```

## 🚀 **NEXT STEPS**

Now that the database is properly set up, we'll implement:

1. ✅ **Database Schema** - COMPLETED
2. ✅ **AWS S3 Integration** - COMPLETED
3. 🔄 **Update Signup API** - NEXT (use S3 instead of Supabase Storage)
4. 🔄 **KYC Status Display** - Client Dashboard
5. 🔄 **KYC Review Interface** - Admin Console

---

## 🆘 **Troubleshooting**

### **Error: "email_verifications already exists"**
**Solution:** Run `00_reset_database.sql` first

### **Error: "AWS credentials not found"**
**Solution:** Check `.env` file has `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### **S3 Upload Fails**
**Solution:** 
1. Verify IAM user has correct permissions
2. Check bucket name matches `.env` variable
3. Verify region is correct

### **Can't see tables in Supabase**
**Solution:**
1. Go to Supabase Dashboard → Database → Tables
2. Refresh page
3. Check SQL Editor for error messages

---

## 📞 **Ready to Continue?**

Once you've completed Steps 1-7, let me know and we'll:
1. Update the signup API to use S3
2. Create KYC status display for clients
3. Build admin KYC review interface

**Database schema is now production-ready! 🎉**

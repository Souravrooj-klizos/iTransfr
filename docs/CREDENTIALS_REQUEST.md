# Integration Credentials Request

## For: Sourav (Developer)
## Date: December 8, 2025

---

## Summary

Please provide the following API credentials to complete the iTransfr integration:

| Integration | Purpose | Status |
|-------------|---------|--------|
| ✅ AMLBot | Transaction screening | Complete |
| ✅ Bitso | Currency exchange (FX) | Complete |
| ❌ **Turnkey** | Wallet management | **Needs credentials** |
| ❌ **Infinitus** | Bank payouts | **Needs credentials** |

---

# 1. TURNKEY Integration

## What is Turnkey?
Turnkey is a **wallet infrastructure provider** that handles:
- Creating cryptocurrency/digital wallets for each user
- Securely storing private keys
- Managing wallet balances
- Signing transactions

## How iTransfr Uses Turnkey:
```
User signs up → Turnkey creates wallet → User deposits funds → Wallet stores balance
```

## Credentials Needed:

### Required from Turnkey Dashboard (https://app.turnkey.com):

| Credential | Description | Where to Find |
|------------|-------------|---------------|
| **Organization ID** | Your Turnkey organization identifier | Dashboard → Organization Settings |
| **API Public Key** | Public key for API authentication | Dashboard → User Details → API Keys |
| **API Private Key** | Private key for signing requests | Generated when creating API key (save securely!) |

### Environment Variables Format:
```env
# Turnkey Credentials
TURNKEY_ORGANIZATION_ID=your-org-id-here
TURNKEY_API_PUBLIC_KEY=your-public-key-here
TURNKEY_API_PRIVATE_KEY=your-private-key-here
TURNKEY_BASE_URL=https://api.turnkey.com
```

### How to Get Turnkey Credentials:

1. **Create Account**: Go to https://app.turnkey.com/dashboard/auth/initial
2. **Create Organization**: Set up your organization
3. **Get Organization ID**: Found in organization settings
4. **Generate API Key**:
   - Go to User Details
   - Click "Create an API key"
   - Choose key generation method (CLI or Dashboard)
   - Save BOTH public and private keys securely
5. **Share with Developer**:
   - Organization ID
   - API Public Key
   - API Private Key

### Important Notes:
- Turnkey uses **cryptographic key pairs** (not simple API keys)
- Private key is generated ONCE and cannot be recovered
- Keep private key extremely secure (like Bitso secret)

---

# 2. INFINITUS Integration

## What is Infinitus?
Infinitus (InfinitusPay) is a **global payout provider** that handles:
- Sending money to bank accounts in 150+ countries
- Processing international wire transfers
- Handling local payment rails (SPEI in Mexico, UPI in India, ACH in Colombia, etc.)
- Currency settlement and FX

## How iTransfr Uses Infinitus:
```
User requests payout → System calls Infinitus → Infinitus sends to recipient bank → Recipient receives funds
```

## ⚠️ Important Finding:

**Infinitus API access is NOT self-service.** Unlike Bitso or Turnkey, you cannot:
- Sign up online and get API keys immediately
- Access public API documentation
- Use a sandbox without business verification

**Their API portal is private** - you must contact them directly.

## How to Get Infinitus Credentials:

### Step 1: Contact Infinitus Sales
```
Email: support@infinituspay.com
       kipp@infinituspay.com
Phone: +1 (908) 872-9135

Subject: API Access Request for Remittance Platform
```

### Step 2: Request Template

```
Subject: API Access Request - iTransfr Remittance Platform

Hello,

We are building a remittance platform (iTransfr) and would like to integrate
InfinitusPay for international bank payouts.

Our use case:
- Cross-border remittances from USA to Mexico, Colombia, India
- Automated payout processing via API
- Target volume: [specify expected volume]

We need:
1. API Documentation / Developer Portal access
2. Sandbox/Testing environment credentials
3. API Key and Secret
4. Webhook configuration details

Company: [Your company name]
Contact: [Name]
Email: [Email]
Phone: [Phone]

Thank you,
[Your name]
```

### Step 3: What to Expect

Based on research, Infinitus will likely need:
- Business verification documents
- Compliance/AML documentation
- Expected transaction volumes
- Use case explanation

They may schedule a call before providing API access.

## Credentials Expected (Based on Similar Fintech APIs):

| Credential | Description |
|------------|-------------|
| **API Key** | Authentication identifier |
| **API Secret** | For request signing |
| **Merchant ID** | Business identifier |
| **Webhook URL** | For payout status updates |
| **Sandbox URL** | Testing environment |
| **Production URL** | Live environment |

## Environment Variables Format (Expected):
```env
# Infinitus Credentials (to be provided by Infinitus)
INFINITUS_API_KEY=your-api-key-here
INFINITUS_API_SECRET=your-api-secret-here
INFINITUS_MERCHANT_ID=your-merchant-id-here
INFINITUS_WEBHOOK_SECRET=your-webhook-secret-here
INFINITUS_BASE_URL=https://[to-be-provided].infinituspay.com
```

## Alternative: Create Mock Integration

While waiting for Infinitus credentials, I can create a **mock integration** that:
- Has the same function signatures as the real API
- Returns realistic mock responses
- Allows testing the full payout flow
- Can be swapped with real API when credentials arrive

---

## Contact Information Summary

| Contact | Details |
|---------|---------|
| Email (Support) | support@infinituspay.com |
| Email (Sales) | kipp@infinituspay.com |
| Phone | +1 (908) 872-9135 |
| Website | https://infinituspay.com |


---

## Quick Request Template

### Message to Superior:

```
Subject: API Credentials Needed for Integration

Hi,

To complete the iTransfr integrations, I need the following credentials:

1. TURNKEY (Wallet Management)
   - Organization ID
   - API Public Key
   - API Private Key

   Get from: https://app.turnkey.com/dashboard

2. INFINITUS (Bank Payouts)
   - API Key
   - API Secret
   - Merchant ID
   - Webhook Secret

   Contact: support@infinituspay.com or +1 (908) 872-9135

Current Status:
✅ AMLBot - Complete
✅ Bitso - Complete
❌ Turnkey - Waiting for credentials
❌ Infinitus - Waiting for credentials

Please let me know if you need any additional information.

Thanks,
Sourav
```

---

## Summary Table

| Service | Website | Contact | Credentials Needed |
|---------|---------|---------|-------------------|
| Turnkey | turnkey.com | Dashboard | Org ID, API Public Key, API Private Key |
| Infinitus | infinituspay.com | support@infinituspay.com | API Key, API Secret, Merchant ID, Webhook Secret |

---

## Once Credentials Are Received

After receiving credentials, I will:

1. Add to `.env.local` file
2. Create `src/lib/integrations/turnkey.ts` - Wallet management
3. Create `src/lib/integrations/infinitus.ts` - Payout processing
4. Create API endpoints for each service
5. Wire to Admin Console buttons
6. Create documentation

Estimated time after receiving credentials: **1-2 days per integration**

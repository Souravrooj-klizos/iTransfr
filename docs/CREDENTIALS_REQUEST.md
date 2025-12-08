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
- Handling local payment rails (SPEI in Mexico, UPI in India, etc.)
- Currency settlement

## How iTransfr Uses Infinitus:
```
User requests payout → System calls Infinitus → Infinitus sends to recipient bank → Recipient receives funds
```

## Credentials Needed:

### Required from Infinitus (Contact: support@infinituspay.com):

| Credential | Description |
|------------|-------------|
| **API Key** | Your Infinitus API authentication key |
| **API Secret** | Secret for signing requests |
| **Merchant ID** | Your merchant/business identifier |
| **Webhook Secret** | For verifying payout status callbacks |

### Environment Variables Format:
```env
# Infinitus Credentials
INFINITUS_API_KEY=your-api-key-here
INFINITUS_API_SECRET=your-api-secret-here
INFINITUS_MERCHANT_ID=your-merchant-id-here
INFINITUS_WEBHOOK_SECRET=your-webhook-secret-here
INFINITUS_BASE_URL=https://api.infinituspay.com
```

### How to Get Infinitus Credentials:

1. **Contact Sales**: Email support@infinituspay.com or call +1 (908) 872-9135
2. **Complete Business Verification**:
   - Provide company documents
   - Explain use case (remittance platform)
3. **Request API Access**:
   - Ask for Developer/Sandbox account
   - Request API documentation
4. **Receive Credentials**:
   - API Key
   - API Secret
   - Merchant ID
   - Webhook Secret (if using callbacks)

### Important Notes:
- Infinitus may require business verification before providing API access
- Ask for **sandbox/testing environment** first
- Request their API documentation PDF

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

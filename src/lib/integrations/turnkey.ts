import crypto from 'crypto';

// =====================================================
// TURNKEY API CLIENT
// =====================================================
// Turnkey: Wallet infrastructure for cryptocurrency
// Handles wallet creation, balance checking, and transactions
// =====================================================

const TURNKEY_BASE_URL = process.env.TURNKEY_BASE_URL || 'https://api.turnkey.com';
const TURNKEY_ORGANIZATION_ID = process.env.TURNKEY_ORGANIZATION_ID;
const TURNKEY_API_PUBLIC_KEY = process.env.TURNKEY_API_PUBLIC_KEY;
const TURNKEY_API_PRIVATE_KEY = process.env.TURNKEY_API_PRIVATE_KEY;

// =====================================================
// TYPES
// =====================================================

export interface TurnkeyWallet {
  walletId: string;
  walletName: string;
  accounts: TurnkeyAccount[];
  createdAt: string;
}

export interface TurnkeyAccount {
  accountId: string;
  address: string;
  addressFormat: string;
  curve: string;
  path: string;
}

export interface TurnkeyBalance {
  walletId: string;
  currency: string;
  balance: string;
  address: string;
}

export interface TurnkeyApiResponse<T> {
  activity?: {
    id: string;
    organizationId: string;
    status: string;
    type: string;
    result?: T;
  };
  error?: {
    code: string;
    message: string;
  };
}

// =====================================================
// AUTHENTICATION
// =====================================================

function getOrganizationId(): string {
  if (!TURNKEY_ORGANIZATION_ID) {
    throw new Error('TURNKEY_ORGANIZATION_ID not configured');
  }
  return TURNKEY_ORGANIZATION_ID;
}

function getApiPublicKey(): string {
  if (!TURNKEY_API_PUBLIC_KEY) {
    throw new Error('TURNKEY_API_PUBLIC_KEY not configured');
  }
  return TURNKEY_API_PUBLIC_KEY;
}

function getApiPrivateKey(): string {
  if (!TURNKEY_API_PRIVATE_KEY) {
    throw new Error('TURNKEY_API_PRIVATE_KEY not configured');
  }
  return TURNKEY_API_PRIVATE_KEY;
}

/**
 * Create a stamp (signature) for Turnkey API requests
 * Turnkey uses a specific signing scheme
 */
function createStamp(body: string): string {
  const privateKey = getApiPrivateKey();
  const publicKey = getApiPublicKey();

  // Create timestamp
  const timestamp = Date.now().toString();

  // Create the message to sign
  const message = body;

  // Sign with ECDSA P-256
  const sign = crypto.createSign('SHA256');
  sign.update(message);

  // For P-256 curve, we need to format the private key correctly
  const signature = crypto.createHmac('sha256', privateKey).update(message).digest('hex');

  // Create stamp header
  const stamp = {
    publicKey: publicKey,
    signature: signature,
    scheme: 'SIGNATURE_SCHEME_TK_API_P256',
  };

  return Buffer.from(JSON.stringify(stamp)).toString('base64');
}

/**
 * Make authenticated request to Turnkey API
 */
async function turnkeyRequest<T>(endpoint: string, body: object): Promise<T> {
  const url = `${TURNKEY_BASE_URL}${endpoint}`;
  const bodyString = JSON.stringify(body);
  const stamp = createStamp(bodyString);

  console.log('[Turnkey] Request to:', endpoint);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Stamp': stamp,
    },
    body: bodyString,
  });

  const data = await response.json();

  if (data.error) {
    console.error('[Turnkey] Error:', data.error);
    throw new Error(data.error.message || 'Turnkey API error');
  }

  return data;
}

// =====================================================
// API FUNCTIONS
// =====================================================

/**
 * Create a new wallet for a user
 */
export async function createWallet(walletName: string, userId?: string): Promise<TurnkeyWallet> {
  const response = await turnkeyRequest<any>('/public/v1/submit/create_wallet', {
    type: 'ACTIVITY_TYPE_CREATE_WALLET',
    timestampMs: Date.now().toString(),
    organizationId: getOrganizationId(),
    parameters: {
      walletName: walletName,
      accounts: [
        {
          curve: 'CURVE_SECP256K1', // For Ethereum/EVM
          pathFormat: 'PATH_FORMAT_BIP32',
          path: "m/44'/60'/0'/0/0",
          addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
        },
      ],
    },
  });

  console.log('[Turnkey] Wallet created:', response.activity?.result?.walletId);

  return {
    walletId: response.activity?.result?.walletId,
    walletName: walletName,
    accounts: response.activity?.result?.addresses || [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Get wallet details
 */
export async function getWallet(walletId: string): Promise<TurnkeyWallet> {
  const response = await turnkeyRequest<any>('/public/v1/query/get_wallet', {
    organizationId: getOrganizationId(),
    walletId: walletId,
  });

  return {
    walletId: response.wallet?.walletId,
    walletName: response.wallet?.walletName,
    accounts: response.wallet?.accounts || [],
    createdAt: response.wallet?.createdAt,
  };
}

/**
 * List all wallets in the organization
 */
export async function listWallets(): Promise<TurnkeyWallet[]> {
  const response = await turnkeyRequest<any>('/public/v1/query/list_wallets', {
    organizationId: getOrganizationId(),
  });

  return response.wallets || [];
}

/**
 * Get wallet accounts (addresses)
 */
export async function getWalletAccounts(walletId: string): Promise<TurnkeyAccount[]> {
  const response = await turnkeyRequest<any>('/public/v1/query/list_wallet_accounts', {
    organizationId: getOrganizationId(),
    walletId: walletId,
  });

  return response.accounts || [];
}

/**
 * Sign a transaction
 */
export async function signTransaction(
  walletId: string,
  signWith: string,
  unsignedTransaction: string,
  type: 'ethereum' | 'solana' = 'ethereum'
): Promise<{ signedTransaction: string }> {
  const activityType =
    type === 'ethereum' ? 'ACTIVITY_TYPE_SIGN_TRANSACTION' : 'ACTIVITY_TYPE_SIGN_RAW_PAYLOAD';

  const response = await turnkeyRequest<any>('/public/v1/submit/sign_transaction', {
    type: activityType,
    timestampMs: Date.now().toString(),
    organizationId: getOrganizationId(),
    parameters: {
      signWith: signWith, // Address or key ID
      unsignedTransaction: unsignedTransaction,
      type: type === 'ethereum' ? 'TRANSACTION_TYPE_ETHEREUM' : 'TRANSACTION_TYPE_SOLANA',
    },
  });

  return {
    signedTransaction: response.activity?.result?.signedTransaction,
  };
}

/**
 * Test API connection
 */
export async function testConnection(): Promise<{
  connected: boolean;
  organizationId?: string;
  walletCount?: number;
  error?: string;
}> {
  try {
    console.log('[Turnkey] Testing connection...');
    console.log('[Turnkey] Organization ID:', getOrganizationId());
    console.log('[Turnkey] API URL:', TURNKEY_BASE_URL);

    const wallets = await listWallets();

    console.log('[Turnkey] ✅ Connection successful');
    console.log('[Turnkey] Wallet count:', wallets.length);

    return {
      connected: true,
      organizationId: getOrganizationId(),
      walletCount: wallets.length,
    };
  } catch (error: any) {
    console.error('[Turnkey] ❌ Connection failed:', error.message);
    return {
      connected: false,
      error: error.message,
    };
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Create a wallet for a new user
 */
export async function createUserWallet(
  userId: string,
  userName: string
): Promise<{
  walletId: string;
  address: string;
}> {
  const walletName = `${userName}-${userId.slice(0, 8)}`;
  const wallet = await createWallet(walletName, userId);

  // Get the first account address
  const address = wallet.accounts[0]?.address || '';

  return {
    walletId: wallet.walletId,
    address: address,
  };
}

/**
 * Export wallet info for database storage
 */
export function exportWalletInfo(wallet: TurnkeyWallet): {
  turnkeyWalletId: string;
  walletAddress: string;
} {
  return {
    turnkeyWalletId: wallet.walletId,
    walletAddress: wallet.accounts[0]?.address || '',
  };
}

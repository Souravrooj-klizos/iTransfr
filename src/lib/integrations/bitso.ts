import crypto from 'crypto';

// =====================================================
// BITSO API CLIENT
// =====================================================
// Bitso API for currency conversions (FX swaps)
// Supports: Colombia + Mexico (SPEI, ACH/PSE)
// =====================================================

const BITSO_API_URL = process.env.BITSO_API_URL || 'https://api.bitso.com';
const BITSO_API_KEY = process.env.BITSO_API_KEY;
const BITSO_API_SECRET = process.env.BITSO_API_SECRET;

// =====================================================
// TYPES
// =====================================================

export interface BitsoQuote {
  id: string;
  from_amount: string;
  from_currency: string;
  to_amount: string;
  to_currency: string;
  rate: string;
  plain_rate: string;
  rate_currency: string;
  expires: number;
  created: number;
  book: string;
  padding: string;
  estimated_slippage: {
    value: string;
    level: string;
    message: string;
  };
}

export interface BitsoConversion {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  from_amount: string;
  from_currency: string;
  to_amount: string;
  to_currency: string;
  rate: string;
  created: number;
  executed_at?: number;
}

export interface BitsoBalance {
  currency: string;
  available: string;
  locked: string;
  total: string;
}

export interface BitsoApiResponse<T> {
  success: boolean;
  payload: T;
  error?: {
    code: string;
    message: string;
  };
}

// =====================================================
// AUTHENTICATION
// =====================================================

function getApiKey(): string {
  const key = BITSO_API_KEY;
  if (!key) {
    throw new Error('BITSO_API_KEY not configured in environment variables');
  }
  return key;
}

function getApiSecret(): string {
  const secret = BITSO_API_SECRET;
  if (!secret) {
    throw new Error('BITSO_API_SECRET not configured in environment variables');
  }
  return secret;
}

/**
 * Create HMAC-SHA256 signature for Bitso API
 * Signature = HMAC-SHA256(nonce + method + path + body, secret)
 */
function createSignature(nonce: string, method: string, path: string, body: string = ''): string {
  const secret = getApiSecret();
  const data = nonce + method + path + body;

  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Get authentication headers for Bitso API
 * Format: Authorization: Bitso {key}:{nonce}:{signature}
 */
function getAuthHeaders(method: string, path: string, body: string = ''): Record<string, string> {
  const key = getApiKey();
  const nonce = Date.now().toString();
  const signature = createSignature(nonce, method, path, body);

  return {
    Authorization: `Bitso ${key}:${nonce}:${signature}`,
    'Content-Type': 'application/json',
  };
}

// =====================================================
// API FUNCTIONS
// =====================================================

/**
 * Request a conversion quote
 * Quote is valid for 30 seconds
 *
 * @param fromCurrency - Source currency (e.g., 'USD', 'MXN')
 * @param toCurrency - Target currency (e.g., 'MXN', 'COP')
 * @param amount - Amount to convert
 * @param type - 'spend' (from amount) or 'receive' (to amount)
 */
export async function requestQuote(
  fromCurrency: string,
  toCurrency: string,
  amount: number,
  type: 'spend' | 'receive' = 'spend'
): Promise<BitsoQuote> {
  const path = '/api/v4/currency_conversions';
  const body = JSON.stringify({
    from_currency: fromCurrency.toLowerCase(),
    to_currency: toCurrency.toLowerCase(),
    ...(type === 'spend'
      ? { spend_amount: amount.toFixed(8) }
      : { receive_amount: amount.toFixed(8) }),
  });

  console.log('[Bitso] Requesting quote:', { fromCurrency, toCurrency, amount, type });

  const response = await fetch(`${BITSO_API_URL}${path}`, {
    method: 'POST',
    headers: getAuthHeaders('POST', path, body),
    body,
  });

  const data: BitsoApiResponse<BitsoQuote> = await response.json();

  if (!data.success) {
    console.error('[Bitso] Quote error:', data.error);
    throw new Error(data.error?.message || 'Failed to get quote from Bitso');
  }

  console.log('[Bitso] Quote received:', {
    id: data.payload.id,
    rate: data.payload.rate,
    fromAmount: data.payload.from_amount,
    toAmount: data.payload.to_amount,
  });

  return data.payload;
}

/**
 * Execute a conversion quote
 * Must be called within 30 seconds of receiving quote
 *
 * @param quoteId - The quote ID from requestQuote()
 */
export async function executeQuote(quoteId: string): Promise<BitsoConversion> {
  const path = `/api/v4/currency_conversions/${quoteId}`;

  console.log('[Bitso] Executing quote:', quoteId);

  const response = await fetch(`${BITSO_API_URL}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders('PUT', path),
  });

  const data: BitsoApiResponse<BitsoConversion> = await response.json();

  if (!data.success) {
    console.error('[Bitso] Execute error:', data.error);
    throw new Error(data.error?.message || 'Failed to execute conversion');
  }

  console.log('[Bitso] Conversion executed:', {
    id: data.payload.id,
    status: data.payload.status,
    fromAmount: data.payload.from_amount,
    toAmount: data.payload.to_amount,
  });

  return data.payload;
}

/**
 * Get conversion status
 *
 * @param conversionId - The conversion ID from executeQuote()
 */
export async function getConversionStatus(conversionId: string): Promise<BitsoConversion> {
  const path = `/api/v4/currency_conversions/${conversionId}`;

  const response = await fetch(`${BITSO_API_URL}${path}`, {
    method: 'GET',
    headers: getAuthHeaders('GET', path),
  });

  const data: BitsoApiResponse<BitsoConversion> = await response.json();

  if (!data.success) {
    console.error('[Bitso] Status error:', data.error);
    throw new Error(data.error?.message || 'Failed to get conversion status');
  }

  return data.payload;
}

/**
 * Get account balances
 */
export async function getBalances(): Promise<BitsoBalance[]> {
  const path = '/api/v3/balance/';

  const response = await fetch(`${BITSO_API_URL}${path}`, {
    method: 'GET',
    headers: getAuthHeaders('GET', path),
  });

  const data: BitsoApiResponse<{ balances: BitsoBalance[] }> = await response.json();

  if (!data.success) {
    console.error('[Bitso] Balance error:', data.error);
    throw new Error(data.error?.message || 'Failed to get balances');
  }

  return data.payload.balances;
}

/**
 * Get available trading books (currency pairs)
 */
export async function getAvailableBooks(): Promise<any[]> {
  const path = '/api/v3/available_books/';

  const response = await fetch(`${BITSO_API_URL}${path}`, {
    method: 'GET',
    // This is a public endpoint, no auth needed
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to get available books');
  }

  return data.payload;
}

/**
 * Test API connection
 */
export async function testConnection(): Promise<{
  connected: boolean;
  balances?: BitsoBalance[];
  error?: string;
}> {
  try {
    console.log('[Bitso] Testing connection...');
    console.log('[Bitso] API URL:', BITSO_API_URL);
    console.log('[Bitso] API Key configured:', !!BITSO_API_KEY);

    const balances = await getBalances();

    console.log('[Bitso] ✅ Connection successful');
    console.log('[Bitso] Currencies available:', balances.map(b => b.currency).join(', '));

    return {
      connected: true,
      balances,
    };
  } catch (error: any) {
    console.error('[Bitso] ❌ Connection failed:', error.message);
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
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  amount: number = 1000 // Default amount for rate calculation
): Promise<{
  rate: string;
  fromAmount: string;
  toAmount: string;
  quoteId: string;
  expiresAt: Date;
}> {
  const quote = await requestQuote(fromCurrency, toCurrency, amount, 'spend');

  return {
    rate: quote.rate,
    fromAmount: quote.from_amount,
    toAmount: quote.to_amount,
    quoteId: quote.id,
    expiresAt: new Date(quote.expires),
  };
}

/**
 * Execute a full swap (get quote + execute)
 */
export async function executeSwap(
  fromCurrency: string,
  toCurrency: string,
  amount: number
): Promise<{
  quote: BitsoQuote;
  conversion: BitsoConversion;
}> {
  // Step 1: Get quote
  const quote = await requestQuote(fromCurrency, toCurrency, amount, 'spend');

  // Step 2: Execute immediately (within 30 seconds)
  const conversion = await executeQuote(quote.id);

  return { quote, conversion };
}

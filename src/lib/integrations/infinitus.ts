// =====================================================
// INFINITUS API CLIENT
// =====================================================
// Infinitus: Global payout provider
// Handles bank payouts to 150+ countries in 60+ currencies
// Supported: Mexico (SPEI), Colombia (ACH/PSE), India (IMPS/NEFT/UPI), Brazil (PIX/TED)
// =====================================================

const INFINITUS_API_KEY = process.env.INFINITUS_API_KEY;
const INFINITUS_BASE_URL = process.env.INFINITUS_BASE_URL;

function getBaseUrl(): string {
  if (!INFINITUS_BASE_URL) {
    throw new Error('INFINITUS_BASE_URL not configured in environment variables');
  }
  return INFINITUS_BASE_URL;
}

// =====================================================
// TYPES
// =====================================================

export interface InfinitusRecipient {
  name: string;
  email?: string;
  phone?: string;
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountType?: 'checking' | 'savings';
  country: string;  // ISO 2-letter code (MX, CO, IN)
  currency: string; // ISO currency code (MXN, COP, INR)
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
}

export interface InfinitusPayout {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: number;
  currency: string;
  recipient: InfinitusRecipient;
  reference?: string;
  trackingNumber?: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface InfinitusPayoutRequest {
  amount: number;
  currency: string;
  recipient: InfinitusRecipient;
  reference?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface InfinitusApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// =====================================================
// AUTHENTICATION
// =====================================================

function getApiKey(): string {
  if (!INFINITUS_API_KEY) {
    throw new Error('INFINITUS_API_KEY not configured in environment variables');
  }
  return INFINITUS_API_KEY;
}

/**
 * Get authentication headers for Infinitus API
 * Using Bearer token authentication (common pattern)
 */
function getAuthHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

// =====================================================
// API FUNCTIONS
// =====================================================

/**
 * Create a new payout
 */
export async function createPayout(
  request: InfinitusPayoutRequest
): Promise<InfinitusPayout> {
  const path = '/api/v1/payouts';

  console.log('[Infinitus] Creating payout:', {
    amount: request.amount,
    currency: request.currency,
    recipientCountry: request.recipient.country,
  });

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      amount: request.amount,
      currency: request.currency,
      recipient: {
        name: request.recipient.name,
        email: request.recipient.email,
        phone: request.recipient.phone,
        bank_name: request.recipient.bankName,
        bank_code: request.recipient.bankCode,
        account_number: request.recipient.accountNumber,
        account_type: request.recipient.accountType || 'checking',
        country: request.recipient.country,
        address: request.recipient.address,
      },
      reference: request.reference,
      description: request.description,
      metadata: request.metadata,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    console.error('[Infinitus] Payout error:', data);
    throw new Error(data.error?.message || `HTTP ${response.status}: Failed to create payout`);
  }

  console.log('[Infinitus] Payout created:', data.data?.id || data.id);

  return mapPayoutResponse(data.data || data);
}

/**
 * Get payout status
 */
export async function getPayoutStatus(payoutId: string): Promise<InfinitusPayout> {
  const path = `/api/v1/payouts/${payoutId}`;

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    console.error('[Infinitus] Get payout error:', data);
    throw new Error(data.error?.message || 'Failed to get payout status');
  }

  return mapPayoutResponse(data.data || data);
}

/**
 * List payouts
 */
export async function listPayouts(
  options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<InfinitusPayout[]> {
  const params = new URLSearchParams();
  if (options?.status) params.append('status', options.status);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const path = `/api/v1/payouts?${params.toString()}`;

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to list payouts');
  }

  const payouts = data.data || data.payouts || data;
  return Array.isArray(payouts) ? payouts.map(mapPayoutResponse) : [];
}

/**
 * Cancel a payout (if still pending)
 */
export async function cancelPayout(payoutId: string): Promise<InfinitusPayout> {
  const path = `/api/v1/payouts/${payoutId}/cancel`;

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'Failed to cancel payout');
  }

  return mapPayoutResponse(data.data || data);
}

/**
 * Get supported countries and currencies
 */
export async function getSupportedCountries(): Promise<Array<{
  country: string;
  currencies: string[];
  paymentMethods: string[];
}>> {
  const path = '/api/v1/countries';

  try {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data.data || data.countries || [];
  } catch (error) {
    console.error('[Infinitus] Get countries error:', error);
    // Return common supported countries as fallback
    return [
      { country: 'MX', currencies: ['MXN'], paymentMethods: ['SPEI', 'WIRE'] },
      { country: 'CO', currencies: ['COP'], paymentMethods: ['ACH', 'PSE'] },
      { country: 'IN', currencies: ['INR'], paymentMethods: ['IMPS', 'NEFT', 'UPI'] },
      { country: 'BR', currencies: ['BRL'], paymentMethods: ['PIX', 'TED'] },
    ];
  }
}

/**
 * Get exchange rate for payout
 */
export async function getPayoutRate(
  fromCurrency: string,
  toCurrency: string,
  amount: number
): Promise<{
  rate: string;
  fromAmount: number;
  toAmount: number;
  fee: number;
}> {
  const path = '/api/v1/rates';

  try {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: amount,
      }),
    });

    const data = await response.json();

    return {
      rate: data.rate || data.exchange_rate,
      fromAmount: amount,
      toAmount: data.converted_amount || amount * parseFloat(data.rate || '1'),
      fee: data.fee || 0,
    };
  } catch (error) {
    console.error('[Infinitus] Get rate error:', error);
    throw error;
  }
}

/**
 * Test API connection
 * Uses the configured INFINITUS_BASE_URL from environment variables
 */
export async function testConnection(): Promise<{
  connected: boolean;
  environment?: string;
  baseUrl?: string;
  error?: string;
}> {
  try {
    const baseUrl = getBaseUrl();
    const apiKey = getApiKey();

    console.log('[Infinitus] Testing connection...');
    console.log('[Infinitus] API URL:', baseUrl);
    console.log('[Infinitus] API Key configured:', !!apiKey);

    // Try health endpoint first
    const healthResponse = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (healthResponse.ok) {
      console.log('[Infinitus] ✅ Connection successful (health endpoint)');
      return {
        connected: true,
        environment: baseUrl.includes('sandbox') ? 'sandbox' : 'production',
        baseUrl,
      };
    }

    // Try account endpoint
    const accountResponse = await fetch(`${baseUrl}/account`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (accountResponse.ok) {
      console.log('[Infinitus] ✅ Connection successful (account endpoint)');
      return {
        connected: true,
        environment: baseUrl.includes('sandbox') ? 'sandbox' : 'production',
        baseUrl,
      };
    }

    throw new Error(`API returned status ${healthResponse.status}`);

  } catch (error: any) {
    console.error('[Infinitus] ❌ Connection failed:', error.message);
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
 * Map API response to our payout type
 */
function mapPayoutResponse(data: any): InfinitusPayout {
  return {
    id: data.id || data.payout_id,
    status: data.status?.toUpperCase() || 'PENDING',
    amount: parseFloat(data.amount),
    currency: data.currency,
    recipient: {
      name: data.recipient?.name || data.recipient_name,
      email: data.recipient?.email,
      phone: data.recipient?.phone,
      bankName: data.recipient?.bank_name || data.bank_name,
      bankCode: data.recipient?.bank_code || data.bank_code,
      accountNumber: data.recipient?.account_number || data.account_number,
      accountType: data.recipient?.account_type,
      country: data.recipient?.country || data.country,
      currency: data.currency,
    },
    reference: data.reference,
    trackingNumber: data.tracking_number,
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    completedAt: data.completed_at || data.completedAt,
    errorMessage: data.error_message || data.failure_reason,
  };
}

/**
 * Validate recipient data before creating payout
 */
export function validateRecipient(recipient: InfinitusRecipient): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!recipient.name) errors.push('Recipient name is required');
  if (!recipient.bankName) errors.push('Bank name is required');
  if (!recipient.accountNumber) errors.push('Account number is required');
  if (!recipient.country) errors.push('Country is required');
  if (!recipient.currency) errors.push('Currency is required');

  // Country-specific validation
  if (recipient.country === 'MX' && !recipient.bankCode) {
    errors.push('CLABE or bank code is required for Mexico');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format amount for display
 */
export function formatPayoutAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

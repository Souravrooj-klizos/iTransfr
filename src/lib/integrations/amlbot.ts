/**
 * AMLBot Integration Client
 *
 * AMLBot API documentation: https://docs.amlbot.com
 * Base URL: https://kyc-api.amlbot.com
 *
 * This client handles:
 * - Creating applicants for KYC verification
 * - Creating and managing verifications
 * - Fetching verification status and results
 */

// =====================================================
// TYPES & INTERFACES
// =====================================================

export type ApplicantType = 'PERSON' | 'COMPANY';

export type VerificationStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'expired';

export type VerificationResult =
  | 'approved'
  | 'declined'
  | 'review_needed';

export interface AMLBotApplicant {
  id: string;
  external_id: string;
  type: ApplicantType;
  first_name?: string;
  last_name?: string;
  dob?: string;
  email?: string;
  phone?: string;
  residence_country?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicantRequest {
  type: ApplicantType;
  external_id: string;
  first_name?: string;
  last_name?: string;
  dob?: string;
  email?: string;
  phone?: string;
  residence_country?: string;
}

export interface AMLBotVerification {
  id: string;
  applicant_id: string;
  status: VerificationStatus;
  result?: VerificationResult;
  risk_score?: number;
  types: string[];
  callback_url?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateVerificationRequest {
  applicant_id: string;
  types: string[];
  callback_url?: string;
}

export interface AMLBotWebhookPayload {
  event: 'verification.completed' | 'verification.failed' | 'verification.updated';
  data: {
    verification_id: string;
    applicant_id: string;
    status: VerificationStatus;
    result?: VerificationResult;
    risk_score?: number;
    completed_at?: string;
  };
  timestamp: string;
}

export interface AMLBotError {
  error: string;
  message: string;
  status_code: number;
}

// =====================================================
// FORMS API TYPES (AMLBot uses Forms for KYC)
// =====================================================

export interface AMLBotForm {
  id: string;
  form_id: string;
  type: string;
  status: string;
  created_at: string;
}

export interface AMLBotFormUrl {
  form_url: string;
  verification_id: string;
  applicant_id: string;
  expires_at: string;
}

export interface CreateFormUrlRequest {
  external_applicant_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  redirect_url?: string;
}

// =====================================================
// CLIENT CONFIGURATION
// =====================================================

const AMLBOT_BASE_URL = 'https://kyc-api.amlbot.com';

// TEMPORARY: Hardcoded API key (move to env variable in production)
// const AMLBOT_API_KEY = '841037a01227c24d100b78e572faa55f3a83';

function getApiKey(): string {
  const apiKey = process.env.AML_BOT_API_KEY;
  if (!apiKey) {
    throw new Error('AML_BOT_API_KEY environment variable is not set');
  }
  return apiKey;
  // Use hardcoded key for now, fallback to env
  // return AMLBOT_API_KEY || process.env.AML_BOT_API_KEY || '';
}

function getHeaders(): HeadersInit {
  return {
    'Authorization': `Token ${getApiKey()}`,
    'Content-Type': 'application/json',
  };
}

// =====================================================
// API RESPONSE HANDLER
// =====================================================

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (!response.ok) {
    let errorMessage = `AMLBot API Error: ${response.status} ${response.statusText}`;

    if (contentType?.includes('application/json')) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Use default error message
      }
    }

    throw new Error(errorMessage);
  }

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return {} as T;
}

// =====================================================
// APPLICANT FUNCTIONS
// =====================================================

/**
 * Create a new applicant in AMLBot
 * Call this before creating a verification
 */
export async function createApplicant(
  data: CreateApplicantRequest
): Promise<AMLBotApplicant> {
  console.log('[AMLBot] Creating applicant:', data.external_id);

  const response = await fetch(`${AMLBOT_BASE_URL}/applicants`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const result = await handleResponse<AMLBotApplicant>(response);
  console.log('[AMLBot] Applicant created:', result.id);

  return result;
}

/**
 * Get an existing applicant by ID
 */
export async function getApplicant(applicantId: string): Promise<AMLBotApplicant> {
  console.log('[AMLBot] Fetching applicant:', applicantId);

  const response = await fetch(`${AMLBOT_BASE_URL}/applicants/${applicantId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<AMLBotApplicant>(response);
}

/**
 * Get an applicant by external ID (your user ID)
 */
export async function getApplicantByExternalId(
  externalId: string
): Promise<AMLBotApplicant | null> {
  console.log('[AMLBot] Searching applicant by external ID:', externalId);

  const response = await fetch(
    `${AMLBOT_BASE_URL}/applicants?external_id=${encodeURIComponent(externalId)}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  const result = await handleResponse<{ data: AMLBotApplicant[] }>(response);
  return result.data?.[0] || null;
}

/**
 * Update an existing applicant
 */
export async function updateApplicant(
  applicantId: string,
  data: Partial<CreateApplicantRequest>
): Promise<AMLBotApplicant> {
  console.log('[AMLBot] Updating applicant:', applicantId);

  const response = await fetch(`${AMLBOT_BASE_URL}/applicants/${applicantId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<AMLBotApplicant>(response);
}

// =====================================================
// VERIFICATION FUNCTIONS
// =====================================================

/**
 * Create a new verification for an applicant
 * Types can include: 'document-verification', 'selfie-verification', 'aml-screening'
 */
export async function createVerification(
  data: CreateVerificationRequest
): Promise<AMLBotVerification> {
  console.log('[AMLBot] Creating verification for applicant:', data.applicant_id);

  const response = await fetch(`${AMLBOT_BASE_URL}/verifications`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const result = await handleResponse<AMLBotVerification>(response);
  console.log('[AMLBot] Verification created:', result.id);

  return result;
}

/**
 * Get verification by ID
 */
export async function getVerification(verificationId: string): Promise<AMLBotVerification> {
  console.log('[AMLBot] Fetching verification:', verificationId);

  const response = await fetch(`${AMLBOT_BASE_URL}/verifications/${verificationId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<AMLBotVerification>(response);
}

/**
 * Get all verifications for an applicant
 */
export async function getVerificationsForApplicant(
  applicantId: string
): Promise<AMLBotVerification[]> {
  console.log('[AMLBot] Fetching verifications for applicant:', applicantId);

  const response = await fetch(
    `${AMLBOT_BASE_URL}/verifications?applicant_id=${applicantId}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  const result = await handleResponse<{ data: AMLBotVerification[] }>(response);
  return result.data || [];
}

// =====================================================
// FORMS API FUNCTIONS (Primary method for KYC)
// =====================================================

/**
 * Get list of available forms
 */
export async function getForms(): Promise<AMLBotForm[]> {
  console.log('[AMLBot] Fetching forms list...');

  const response = await fetch(`${AMLBOT_BASE_URL}/forms`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const result = await handleResponse<{ items: AMLBotForm[] }>(response);
  console.log('[AMLBot] Forms retrieved:', result.items?.length || 0);
  return result.items || [];
}

/**
 * Get a form URL for a user to complete KYC
 * This is the primary method to start KYC verification
 */
export async function getFormUrl(
  formId: string,
  data: CreateFormUrlRequest
): Promise<AMLBotFormUrl> {
  console.log('[AMLBot] Getting form URL for:', data.external_applicant_id);

  const response = await fetch(`${AMLBOT_BASE_URL}/forms/${formId}/urls`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const result = await handleResponse<AMLBotFormUrl>(response);
  console.log('[AMLBot] Form URL created, verification ID:', result.verification_id);
  return result;
}

// =====================================================
// WEBHOOK VERIFICATION
// =====================================================

/**
 * Verify webhook signature (if webhook secret is configured)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.AML_BOT_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('[AMLBot] Webhook secret not configured, skipping verification');
    return true; // Allow if no secret configured
  }

  // AMLBot typically uses HMAC-SHA256 for webhook signatures
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Test API connection
 * Use this to verify your API key is working
 * Returns detailed error info for debugging
 */
export async function testConnection(): Promise<{ success: boolean; details: string; status?: number }> {
  try {
    console.log('[AMLBot] Testing connection...');
    console.log('[AMLBot] Base URL:', AMLBOT_BASE_URL);
    console.log('[AMLBot] API Key (first 8 chars):', getApiKey().substring(0, 8) + '...');

    const response = await fetch(`${AMLBOT_BASE_URL}/forms`, {
      method: 'GET',
      headers: getHeaders(),
    });

    console.log('[AMLBot] Response status:', response.status);

    if (response.ok) {
      console.log('[AMLBot] ✅ Connection successful');
      return { success: true, details: 'Connection successful', status: response.status };
    }

    // Get error details
    let errorDetails = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.text();
      console.log('[AMLBot] Error response body:', errorBody);
      errorDetails += ` - ${errorBody}`;
    } catch {
      // ignore
    }

    console.error('[AMLBot] ❌ Connection failed:', errorDetails);
    return { success: false, details: errorDetails, status: response.status };
  } catch (error: any) {
    console.error('[AMLBot] ❌ Connection error:', error);
    return { success: false, details: error.message || 'Network error' };
  }
}


/**
 * Map AMLBot result to internal KYC status
 */
export function mapVerificationResultToKycStatus(
  result: VerificationResult | undefined
): 'approved' | 'rejected' | 'under_review' {
  switch (result) {
    case 'approved':
      return 'approved';
    case 'declined':
      return 'rejected';
    case 'review_needed':
    default:
      return 'under_review';
  }
}

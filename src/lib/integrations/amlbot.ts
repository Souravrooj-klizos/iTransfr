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
 *
 * Refactored to use Axios with proper error handling.
 */

import axios, { AxiosError, AxiosInstance } from 'axios';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export type ApplicantType = 'PERSON' | 'COMPANY';
export type VerificationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
export type VerificationResult = 'approved' | 'declined' | 'review_needed';

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
// AXIOS CLIENT CONFIGURATION
// =====================================================

const AMLBOT_BASE_URL = 'https://kyc-api.amlbot.com';

function getApiKey(): string {
  const apiKey = process.env.AML_BOT_API_KEY;
  if (!apiKey) {
    throw new Error('AML_BOT_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Create AMLBot Axios instance with auth headers
 */
function createAmlBotClient(): AxiosInstance {
  const client = axios.create({
    baseURL: AMLBOT_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth interceptor
  client.interceptors.request.use(config => {
    config.headers.Authorization = `Token ${getApiKey()}`;
    console.log(`[AMLBot] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });

  // Add response interceptor for logging
  client.interceptors.response.use(
    response => {
      console.log(`[AMLBot] Response ${response.status}:`, response.config.url);
      return response;
    },
    (error: AxiosError) => {
      const status = error.response?.status;
      const data = error.response?.data as any;
      console.error(`[AMLBot] Error ${status}:`, data?.message || error.message);
      throw error;
    }
  );

  return client;
}

// Lazy-initialized client
let amlBotClient: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (!amlBotClient) {
    amlBotClient = createAmlBotClient();
  }
  return amlBotClient;
}

// =====================================================
// APPLICANT FUNCTIONS
// =====================================================

/**
 * Create a new applicant in AMLBot
 */
export async function createApplicant(data: CreateApplicantRequest): Promise<AMLBotApplicant> {
  console.log('[AMLBot] Creating applicant:', data.external_id);
  const response = await getClient().post<AMLBotApplicant>('/applicants', data);
  console.log('[AMLBot] Applicant created:', response.data.id);
  return response.data;
}

/**
 * Get an existing applicant by ID
 */
export async function getApplicant(applicantId: string): Promise<AMLBotApplicant> {
  console.log('[AMLBot] Fetching applicant:', applicantId);
  const response = await getClient().get<AMLBotApplicant>(`/applicants/${applicantId}`);
  return response.data;
}

/**
 * Get an applicant by external ID (your user ID)
 */
export async function getApplicantByExternalId(
  externalId: string
): Promise<AMLBotApplicant | null> {
  console.log('[AMLBot] Searching applicant by external ID:', externalId);
  const response = await getClient().get<{ data: AMLBotApplicant[] }>(
    `/applicants?external_id=${encodeURIComponent(externalId)}`
  );
  return response.data.data?.[0] || null;
}

/**
 * Update an existing applicant
 */
export async function updateApplicant(
  applicantId: string,
  data: Partial<CreateApplicantRequest>
): Promise<AMLBotApplicant> {
  console.log('[AMLBot] Updating applicant:', applicantId);
  const response = await getClient().patch<AMLBotApplicant>(`/applicants/${applicantId}`, data);
  return response.data;
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
  const response = await getClient().post<AMLBotVerification>('/verifications', data);
  console.log('[AMLBot] Verification created:', response.data.id);
  return response.data;
}

/**
 * Get verification by ID
 */
export async function getVerification(verificationId: string): Promise<AMLBotVerification> {
  console.log('[AMLBot] Fetching verification:', verificationId);
  const response = await getClient().get<AMLBotVerification>(`/verifications/${verificationId}`);
  return response.data;
}

/**
 * Get all verifications for an applicant
 */
export async function getVerificationsForApplicant(
  applicantId: string
): Promise<AMLBotVerification[]> {
  console.log('[AMLBot] Fetching verifications for applicant:', applicantId);
  const response = await getClient().get<{ data: AMLBotVerification[] }>(
    `/verifications?applicant_id=${applicantId}`
  );
  return response.data.data || [];
}

// =====================================================
// FORMS API FUNCTIONS (Primary method for KYC)
// =====================================================

/**
 * Get list of available forms
 */
export async function getForms(): Promise<AMLBotForm[]> {
  console.log('[AMLBot] Fetching forms list...');
  const response = await getClient().get<{ items: AMLBotForm[] }>('/forms');
  console.log('[AMLBot] Forms retrieved:', response.data.items?.length || 0);
  return response.data.items || [];
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
  const response = await getClient().post<AMLBotFormUrl>(`/forms/${formId}/urls`, data);
  console.log('[AMLBot] Form URL created, verification ID:', response.data.verification_id);
  return response.data;
}

// =====================================================
// WEBHOOK VERIFICATION
// =====================================================

/**
 * Verify webhook signature (if webhook secret is configured)
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.AML_BOT_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('[AMLBot] Webhook secret not configured, skipping verification');
    return true;
  }

  const crypto = require('crypto');
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return signature === expectedSignature;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Test API connection
 */
export async function testConnection(): Promise<{
  success: boolean;
  details: string;
  status?: number;
}> {
  try {
    console.log('[AMLBot] Testing connection...');
    console.log('[AMLBot] Base URL:', AMLBOT_BASE_URL);
    console.log('[AMLBot] API Key (first 8 chars):', getApiKey().substring(0, 8) + '...');

    const response = await getClient().get('/forms');

    console.log('[AMLBot] ✅ Connection successful');
    return { success: true, details: 'Connection successful', status: response.status };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      console.error('[AMLBot] ❌ Connection failed:', status, message);
      return { success: false, details: `HTTP ${status}: ${message}`, status };
    }
    console.error('[AMLBot] ❌ Connection error:', error.message);
    return { success: false, details: error.message };
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

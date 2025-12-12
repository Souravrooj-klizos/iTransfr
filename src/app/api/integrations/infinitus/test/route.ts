import { getSupportedCountries, testConnection } from '@/lib/integrations/infinitus';
import { NextResponse } from 'next/server';

/**
 * GET /api/integrations/infinitus/test
 *
 * Test Infinitus API connection
 */
export async function GET() {
  try {
    const result = await testConnection();

    if (!result.connected) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to connect to Infinitus',
          hint: 'Check INFINITUS_API_KEY and INFINITUS_BASE_URL in environment variables',
        },
        { status: 500 }
      );
    }

    // Try to get supported countries
    let countries: any[] = [];
    try {
      countries = await getSupportedCountries();
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json({
      success: true,
      message: 'Infinitus API connection successful',
      data: {
        environment: result.environment,
        supportedCountries: countries.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error('[Infinitus Test] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

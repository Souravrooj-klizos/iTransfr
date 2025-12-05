import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get total clients
    const { count: totalClients } = await supabaseAdmin
      .from('client_profiles')
      .select('*', { count: 'exact', head: true });

    // Get KYC stats
    const { data: kycStats } = await supabaseAdmin.from('kyc_records').select('status');

    const pendingKYC = kycStats?.filter(k => k.status === 'pending').length || 0;
    const approvedKYC = kycStats?.filter(k => k.status === 'approved').length || 0;
    const rejectedKYC = kycStats?.filter(k => k.status === 'rejected').length || 0;

    // Get recent KYC requests
    const { data: recentKYC } = await supabaseAdmin
      .from('kyc_records')
      .select(
        `
        id,
        userId,
        status,
        createdAt,
        client_profiles:userId (
          first_name,
          last_name,
          company_name
        )
      `
      )
      .order('createdAt', { ascending: false })
      .limit(5);

    return NextResponse.json({
      stats: {
        totalClients: totalClients || 0,
        pendingKYC,
        approvedKYC,
        rejectedKYC,
        pendingTransactions: 0,
        completedTransactions: 0,
      },
      recentKYC: recentKYC || [],
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

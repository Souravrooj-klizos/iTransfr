import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select(
        `
        *,
        client_profiles:userId (
          first_name,
          last_name,
          company_name
        )
      `
      )
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ transactions: transactions || [] });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

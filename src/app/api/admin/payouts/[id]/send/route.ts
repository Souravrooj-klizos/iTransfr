import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { id } = await params;

    // Get payout request
    const { data: payout, error: fetchError } = await supabaseAdmin
      .from('payout_requests')
      .select('*, transactions:transactionId (*)')
      .eq('id', id)
      .single();

    if (fetchError || !payout) {
      return NextResponse.json({ error: 'Payout request not found' }, { status: 404 });
    }

    if (payout.status !== 'pending') {
      return NextResponse.json({ error: 'Payout already processed' }, { status: 400 });
    }

    // TODO: Call Infinitus API to send payout
    // const infinitusResult = await initiateInfinitusPayout({
    //   amount: payout.amount,
    //   currency: payout.currency,
    //   recipientName: payout.recipientName,
    //   recipientAccount: payout.recipientAccount,
    //   recipientBank: payout.recipientBank,
    //   recipientBankCode: payout.recipientBankCode,
    //   recipientCountry: payout.recipientCountry
    // })

    // Mock Infinitus response for now
    const mockInfinitusResult = {
      requestId: `INF-${Date.now()}`,
      trackingNumber: `TRK-${Date.now()}`,
      status: 'sent',
    };

    // Update payout request
    const { error: updateError } = await supabaseAdmin
      .from('payout_requests')
      .update({
        status: 'sent',
        sentAt: new Date().toISOString(),
        infinitusRequestId: mockInfinitusResult.requestId,
        infinitusTrackingNumber: mockInfinitusResult.trackingNumber,
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Update transaction status
    await supabaseAdmin
      .from('transactions')
      .update({
        status: 'payout_sent',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', payout.transactionId);

    // Create ledger entry
    await supabaseAdmin.from('ledger_entries').insert({
      transactionId: payout.transactionId,
      account: `payout:${payout.recipientCountry}`,
      debit: payout.amount,
      credit: 0,
      currency: payout.currency,
      description: `Payout sent to ${payout.recipientName} via Infinitus`,
    });

    console.log(`✅ Payout ${id} sent - Tracking: ${mockInfinitusResult.trackingNumber}`);

    return NextResponse.json({
      success: true,
      trackingNumber: mockInfinitusResult.trackingNumber,
      message: 'Payout sent successfully',
    });
  } catch (error: any) {
    console.error('Error sending payout:', error);
    return NextResponse.json({ error: error.message || 'Failed to send payout' }, { status: 500 });
  }
}

import { createPayout } from '@/lib/integrations/infinitus';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

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

    // Call Infinitus API to send payout
    console.log(`[Admin Payout] Initiating Infinitus payout for ${payout.id}`);

    let infinitusResult;
    try {
      infinitusResult = await createPayout({
        amount: payout.amount,
        currency: payout.currency,
        recipient: {
          name: payout.recipientName,
          accountNumber: payout.recipientAccount,
          bankName: payout.recipientBank,
          bankCode: payout.recipientBankCode,
          country: payout.recipientCountry,
          currency: payout.currency, // Assuming payout currency same as recipient wallet currency
        },
        reference: payout.transactionId, // Link to our transaction ID
        description: `Payout for user ${payout.userId}`,
      });
    } catch (infError: any) {
      console.error('[Admin Payout] Infinitus Error:', infError);
      return NextResponse.json(
        {
          error: `Infinitus Payout Failed: ${infError.message}`,
        },
        { status: 502 }
      );
    }

    // Update payout request with real Infantry data
    const { error: updateError } = await supabaseAdmin
      .from('payout_requests')
      .update({
        status: 'sent',
        sentAt: new Date().toISOString(),
        infinitusRequestId: infinitusResult.id,
        infinitusTrackingNumber: infinitusResult.trackingNumber,
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

    console.log(`✅ Payout ${id} sent - Tracking: ${infinitusResult.trackingNumber}`);

    return NextResponse.json({
      success: true,
      trackingNumber: infinitusResult.trackingNumber,
      message: 'Payout sent successfully',
    });
  } catch (error: any) {
    console.error('Error sending payout:', error);
    return NextResponse.json({ error: error.message || 'Failed to send payout' }, { status: 500 });
  }
}

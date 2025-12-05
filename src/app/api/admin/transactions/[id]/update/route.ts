import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { id } = await params;
    const { action } = await request.json();

    // Get current transaction
    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    let newStatus = transaction.status;
    let ledgerEntry = null;

    switch (action) {
      case 'mark_received':
        // Mark deposit as received - per docs
        if (transaction.type !== 'deposit') {
          return NextResponse.json(
            { error: 'Invalid action for this transaction type' },
            { status: 400 }
          );
        }
        newStatus = 'deposit_received';

        // Create ledger entry
        ledgerEntry = {
          transactionId: id,
          account: `wallet:${transaction.userId}:${transaction.currency}`,
          credit: transaction.amount,
          debit: 0,
          currency: transaction.currency,
          description: `Deposit received - ${transaction.referenceNumber}`,
        };
        break;

      case 'execute_swap':
        // Execute FX swap via Bitso - per docs
        if (transaction.type !== 'swap') {
          return NextResponse.json(
            { error: 'Invalid action for this transaction type' },
            { status: 400 }
          );
        }

        // TODO: Call Bitso API here
        // const bitsoResult = await executeBitsoSwap(...)

        newStatus = 'swap_completed';

        // Create ledger entries for swap
        // Debit source currency, credit destination currency
        break;

      case 'send_payout':
        // Send payout via Infinitus - per docs
        if (transaction.type !== 'payout') {
          return NextResponse.json(
            { error: 'Invalid action for this transaction type' },
            { status: 400 }
          );
        }

        // TODO: Call Infinitus API here
        // const infinitusResult = await initiateInfinitusPayout(...)

        newStatus = 'payout_completed';

        // Create ledger entry for payout
        ledgerEntry = {
          transactionId: id,
          account: `wallet:${transaction.userId}:${transaction.currency}`,
          debit: transaction.amount,
          credit: 0,
          currency: transaction.currency,
          description: `Payout sent - ${transaction.referenceNumber}`,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update transaction status
    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({
        status: newStatus,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Create ledger entry if applicable
    if (ledgerEntry) {
      await supabaseAdmin.from('ledger_entries').insert(ledgerEntry);
    }

    console.log(`✅ Transaction ${id} updated: ${action} → ${newStatus}`);

    return NextResponse.json({
      success: true,
      newStatus,
      message: `Transaction ${action.replace('_', ' ')} successfully`,
    });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

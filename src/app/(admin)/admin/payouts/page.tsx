'use client';

import adminApi from '@/lib/api/admin';
import { Building, CreditCard, MapPin, Send } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PayoutRequest {
  id: string;
  transactionId: string;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  recipientBankCode: string;
  recipientCountry: string;
  amount: number;
  currency: string;
  status: string;
  sentAt: string | null;
  completedAt: string | null;
  createdAt: string;
  infinitusRequestId: string | null;
  infinitusTrackingNumber: string | null;
  transactions?: {
    userId: string;
    referenceNumber: string;
    client_profiles?: {
      first_name: string;
      last_name: string;
      company_name: string;
    };
  };
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, []);

  async function fetchPayouts() {
    try {
      const { data: payouts } = await adminApi.payouts.list();
      setPayouts(payouts || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendPayout(id: string) {
    if (!confirm('Are you sure you want to send this payout? This action cannot be undone.'))
      return;

    setActionLoading(true);
    try {
      // Assuming sendPayout in adminApi triggers the 'send_payout' action on transaction
      // But adminApi.payouts doesn't have a 'send' method directly mapped to just an ID in my quick review of admin.ts
      // Let's check admin.ts again.
      // admin.ts has: adminTransactionApi.sendPayout(txId, details).
      // But PayoutsPage seems to iterate 'PayoutRequest' objects, which have 'transactionId'.

      // Wait, PayoutsPage uses /api/admin/payouts/${id}/send currently.
      // Does adminApi have this?
      // adminApi.payouts has: list, getStatus, cancel.
      // It DOES NOT have 'send'.
      // I should add 'process' or 'send' to adminApi.payouts OR update backend to use the transaction action.
      // The current backend route /api/admin/payouts/${id}/send implies a specific payout endpoint.
      // Let's use generic fetch for now OR update admin.ts.
      // Better to update admin.ts to include this method.

      // For this step, I will stick to fetch for the missing method but use api for list.
      // Actually, I'll update admin.ts first.

      const response = await fetch(`/api/admin/payouts/${id}/send`, { method: 'POST' });
      if (response.ok) {
        await fetchPayouts();
        setSelectedPayout(null);
        alert('Payout sent successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      // ...
    }
    // ...
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800' },
      sent: { bg: 'bg-purple-100', text: 'text-purple-800' },
      completed: { bg: 'bg-green-100', text: 'text-green-800' },
      failed: { bg: 'bg-red-100', text: 'text-red-800' },
    };
    const config = configs[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>Payout Requests</h1>
        <button
          onClick={fetchPayouts}
          className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className='py-12 text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      ) : payouts.length === 0 ? (
        <div className='rounded-lg border border-gray-200 bg-white p-12 text-center'>
          <Send className='mx-auto mb-4 h-12 w-12 text-gray-300' />
          <h3 className='text-lg font-medium text-gray-900'>No Payout Requests</h3>
          <p className='mt-1 text-gray-500'>
            Payout requests will appear here when clients initiate them.
          </p>
        </div>
      ) : (
        <div className='grid gap-4'>
          {payouts.map(payout => (
            <div
              key={payout.id}
              className='rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-3'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      {payout.amount.toLocaleString()} {payout.currency}
                    </h3>
                    {getStatusBadge(payout.status)}
                  </div>

                  <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
                    <div className='flex items-start gap-2'>
                      <CreditCard className='mt-0.5 h-4 w-4 text-gray-400' />
                      <div>
                        <p className='font-medium text-gray-700'>Recipient</p>
                        <p className='text-gray-600'>{payout.recipientName}</p>
                        <p className='font-mono text-xs text-gray-500'>{payout.recipientAccount}</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-2'>
                      <Building className='mt-0.5 h-4 w-4 text-gray-400' />
                      <div>
                        <p className='font-medium text-gray-700'>Bank</p>
                        <p className='text-gray-600'>{payout.recipientBank}</p>
                        <p className='font-mono text-xs text-gray-500'>
                          {payout.recipientBankCode}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-2'>
                      <MapPin className='mt-0.5 h-4 w-4 text-gray-400' />
                      <div>
                        <p className='font-medium text-gray-700'>Country</p>
                        <p className='text-gray-600'>{payout.recipientCountry}</p>
                      </div>
                    </div>
                  </div>

                  {payout.infinitusTrackingNumber && (
                    <div className='mt-3 rounded bg-green-50 p-2 text-sm'>
                      <span className='font-medium text-green-700'>Tracking: </span>
                      <span className='font-mono text-green-600'>
                        {payout.infinitusTrackingNumber}
                      </span>
                    </div>
                  )}
                </div>

                <div className='ml-4 flex flex-col gap-2'>
                  {payout.status === 'pending' && (
                    <button
                      onClick={() => sendPayout(payout.id)}
                      disabled={actionLoading}
                      className='rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50'
                    >
                      <Send className='mr-1 inline h-4 w-4' />
                      Send Payout
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPayout(payout)}
                    className='rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200'
                  >
                    View Details
                  </button>
                </div>
              </div>

              <div className='mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500'>
                <span>Created: {new Date(payout.createdAt).toLocaleString()}</span>
                {payout.sentAt && <span>Sent: {new Date(payout.sentAt).toLocaleString()}</span>}
                {payout.completedAt && (
                  <span>Completed: {new Date(payout.completedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPayout && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4'>
          <div className='w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl'>
            <h2 className='mb-4 text-xl font-bold text-gray-900'>Payout Details</h2>

            <div className='space-y-4'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Amount</span>
                <span className='font-semibold'>
                  {selectedPayout.amount.toLocaleString()} {selectedPayout.currency}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Status</span>
                {getStatusBadge(selectedPayout.status)}
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Recipient</span>
                <span className='font-medium'>{selectedPayout.recipientName}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Account</span>
                <span className='font-mono text-sm'>{selectedPayout.recipientAccount}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Bank</span>
                <span>{selectedPayout.recipientBank}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Bank Code</span>
                <span className='font-mono text-sm'>{selectedPayout.recipientBankCode}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Country</span>
                <span>{selectedPayout.recipientCountry}</span>
              </div>
              {selectedPayout.infinitusRequestId && (
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Infinitus ID</span>
                  <span className='font-mono text-sm'>{selectedPayout.infinitusRequestId}</span>
                </div>
              )}
            </div>

            <div className='mt-6 flex justify-end gap-2'>
              <button
                onClick={() => setSelectedPayout(null)}
                className='rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

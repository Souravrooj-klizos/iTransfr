'use client';

import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'swap' | 'payout';
  status: string;
  amount: number;
  currency: string;
  referenceNumber: string;
  createdAt: string;
  client_profiles?: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'swap' | 'payout'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const response = await fetch('/api/admin/transactions/list');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateTransactionStatus(id: string, action: string) {
    if (!confirm(`Are you sure you want to ${action} this transaction?`)) return;

    try {
      const response = await fetch(`/api/admin/transactions/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchTransactions();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction');
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className='h-5 w-5 text-green-600' />;
      case 'swap':
        return <RefreshCw className='h-5 w-5 text-blue-600' />;
      case 'payout':
        return <ArrowUpRight className='h-5 w-5 text-orange-600' />;
      default:
        return <Clock className='h-5 w-5 text-gray-600' />;
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      pending_deposit: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      deposit_received: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      swap_pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      swap_completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      payout_pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      payout_completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };
    const config = configs[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: AlertCircle,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
      >
        <config.icon className='h-3 w-3' />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (statusFilter === 'pending' && !t.status.includes('pending')) return false;
    if (statusFilter === 'completed' && !t.status.includes('completed')) return false;
    return true;
  });

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>Transactions</h1>
        <button
          onClick={fetchTransactions}
          className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className='mb-6 flex gap-4'>
        <div className='flex gap-2'>
          {['all', 'deposit', 'swap', 'payout'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <div className='flex gap-2'>
          {['all', 'pending', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`rounded-full px-3 py-1 text-sm ${
                statusFilter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className='py-12 text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className='rounded-lg border border-gray-200 bg-white p-12 text-center'>
          <Clock className='mx-auto mb-4 h-12 w-12 text-gray-300' />
          <h3 className='text-lg font-medium text-gray-900'>No Transactions</h3>
          <p className='mt-1 text-gray-500'>No transactions match your filters.</p>
        </div>
      ) : (
        <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Client
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Amount
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Reference
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {filteredTransactions.map(txn => (
                <tr key={txn.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      {getTypeIcon(txn.type)}
                      <span className='text-sm font-medium text-gray-900 capitalize'>
                        {txn.type}
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {txn.client_profiles?.first_name} {txn.client_profiles?.last_name}
                    </div>
                    <div className='text-sm text-gray-500'>{txn.client_profiles?.company_name}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-semibold text-gray-900'>
                      {txn.amount.toLocaleString()} {txn.currency}
                    </div>
                  </td>
                  <td className='px-6 py-4 font-mono text-sm whitespace-nowrap text-gray-500'>
                    {txn.referenceNumber || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>{getStatusBadge(txn.status)}</td>
                  <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                    {new Date(txn.createdAt).toLocaleString()}
                  </td>
                  <td className='space-x-2 px-6 py-4 text-sm whitespace-nowrap'>
                    {txn.type === 'deposit' && txn.status === 'pending_deposit' && (
                      <button
                        onClick={() => updateTransactionStatus(txn.id, 'mark_received')}
                        className='font-medium text-green-600 hover:text-green-800'
                      >
                        Mark Received
                      </button>
                    )}
                    {txn.type === 'swap' && txn.status === 'swap_pending' && (
                      <button
                        onClick={() => updateTransactionStatus(txn.id, 'execute_swap')}
                        className='font-medium text-blue-600 hover:text-blue-800'
                      >
                        Execute Swap
                      </button>
                    )}
                    {txn.type === 'payout' && txn.status === 'payout_pending' && (
                      <button
                        onClick={() => updateTransactionStatus(txn.id, 'send_payout')}
                        className='font-medium text-orange-600 hover:text-orange-800'
                      >
                        Send Payout
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

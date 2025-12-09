'use client';

import Receipt from '@/components/icons/Receipt';
import { TransactionDetailsModal } from '@/components/transactions/TransactionDetailsModal';
import { DataTable, getStatusIcon, type TableColumn } from '@/components/ui/DataTable';
import { DatePicker } from '@/components/ui/DatePicker';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Download, Eye, MoreVertical, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  date: string;
  time: string;
  recipient: string;
  transactionType: 'Deposit' | 'Withdrawal' | 'Bank Payment';
  paymentMethod: 'Crypto' | 'Fedwire' | 'SWIFT';
  status: 'Completed' | 'Processing' | 'Failed' | 'Pending';
  amount: string;
  fromAmount?: string;
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: 'Dec 28, 2025',
    time: '14:32 UTC',
    recipient: 'Global Industries',
    transactionType: 'Deposit',
    paymentMethod: 'Crypto',
    status: 'Completed',
    amount: '16,750 USDT',
  },
  {
    id: '2',
    date: 'Dec 27, 2025',
    time: '09:15 CST',
    recipient: 'OmniCorp Logistics',
    transactionType: 'Withdrawal',
    paymentMethod: 'Fedwire',
    status: 'Processing',
    amount: '$44,775',
    fromAmount: 'From: 45,000 USDT',
  },
  {
    id: '3',
    date: 'Dec 23, 2025',
    time: '16:45 CST',
    recipient: 'StellarTech Enterprises',
    transactionType: 'Bank Payment',
    paymentMethod: 'SWIFT',
    status: 'Processing',
    amount: '820,000 MXN',
    fromAmount: 'From: $32,000',
  },
  {
    id: '4',
    date: 'Dec 23, 2025',
    time: '10:45 CST',
    recipient: 'NovaTech Solutions',
    transactionType: 'Withdrawal',
    paymentMethod: 'Crypto',
    status: 'Completed',
    amount: '70,000 USDT',
  },
  {
    id: '5',
    date: 'Dec 23, 2025',
    time: '10:45 CST',
    recipient: 'Apex Dynamic Systems',
    transactionType: 'Bank Payment',
    paymentMethod: 'Fedwire',
    status: 'Completed',
    amount: '$25,000',
  },
  {
    id: '6',
    date: 'Dec 23, 2025',
    time: '16:45 CST',
    recipient: 'Zenith Global Group',
    transactionType: 'Deposit',
    paymentMethod: 'Crypto',
    status: 'Processing',
    amount: '15.75',
  },
  {
    id: '7',
    date: 'Dec 23, 2025',
    time: '16:45 CST',
    recipient: 'VanGuard Dynamics',
    transactionType: 'Bank Payment',
    paymentMethod: 'SWIFT',
    status: 'Completed',
    amount: '8,000',
    fromAmount: 'From: $8,000',
  },
  {
    id: '10',
    date: 'Dec 27, 2025',
    time: '09:15 CST',
    recipient: 'InnoVision Creations',
    transactionType: 'Withdrawal',
    paymentMethod: 'Fedwire',
    status: 'Processing',
    amount: '$44,775',
    fromAmount: 'From: 45,000 USDT',
  },
  {
    id: '11',
    date: 'Dec 26, 2025',
    time: '11:20 UTC',
    recipient: 'Quantum Solutions Ltd',
    transactionType: 'Deposit',
    paymentMethod: 'Crypto',
    status: 'Failed',
    amount: '5,000 USDT',
  },
  {
    id: '12',
    date: 'Dec 25, 2025',
    time: '15:45 CST',
    recipient: 'Nexus Enterprises',
    transactionType: 'Bank Payment',
    paymentMethod: 'SWIFT',
    status: 'Pending',
    amount: '12,500 EUR',
    fromAmount: 'From: $13,200',
  },
];

export default function TransactionsPage() {
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter states
  const [filter, setFilter] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [status, setStatus] = useState('all');
  const [recipient, setRecipient] = useState('all');
  const [paymentType, setPaymentType] = useState('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [activePage, setActivePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState('10');

  const handleSelectionChange = (ids: Set<string>) => {
    setSelectedIds(ids);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside dropdown menu
      if (showActionsMenu && !target.closest('.relative')) {
        setShowActionsMenu(null);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Deposit':
        return 'bg-green-100 text-green-600';
      case 'Withdrawal':
        return 'bg-red-100 text-red-600';
      case 'Bank Payment':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const columns: TableColumn<Transaction>[] = [
    {
      key: 'date',
      header: 'Date & Time',
      render: row => (
        <div>
          <div className='text-sm font-medium text-gray-900'>{row.date}</div>
          <div className='text-xs text-gray-500'>{row.time}</div>
        </div>
      ),
    },
    {
      key: 'recipient',
      header: 'Recipient',
      render: row => <div className='text-sm text-gray-900'>{row.recipient}</div>,
    },
    {
      key: 'transactionType',
      header: 'Transaction Type',
      render: row => (
        <span
          className={`inline-block rounded-lg px-3 py-1.5 text-xs font-medium ${getTransactionTypeColor(row.transactionType)}`}
        >
          {row.transactionType}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      render: row => <div className='text-sm text-gray-700'>{row.paymentMethod}</div>,
    },
    {
      key: 'status',
      header: 'Status',
      render: row => (
        <span
          className='inline-flex items-center text-sm font-medium'
          style={{
            color:
              row.status === 'Completed'
                ? 'var(--color-success-green)'
                : row.status === 'Failed'
                  ? 'var(--color-error-red)'
                  : row.status === 'Pending'
                    ? '#FF9500'
                    : 'var(--color-primary-blue)',
          }}
        >
          {getStatusIcon(row.status)}
          {row.status}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: row => (
        <div className='text-right'>
          <div
            className={`text-sm font-semibold ${
              row.transactionType === 'Deposit'
                ? 'text-green-600'
                : row.transactionType === 'Withdrawal'
                  ? 'text-red-600'
                  : 'text-gray-900'
            }`}
          >
            {row.amount}
          </div>
          {row.fromAmount && <div className='text-xs text-gray-500'>{row.fromAmount}</div>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row, index) => (
        <div className='relative'>
          <button
            onClick={() => setShowActionsMenu(showActionsMenu === row.id ? null : row.id)}
            className='cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600'
          >
            <MoreVertical className='h-5 w-5' />
          </button>
          {showActionsMenu === row.id && (
            <div
              className={`absolute ${index !== undefined && index < 3 ? 'top-8' : 'bottom-8'} right-0 z-10 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg`}
            >
              <button
                onClick={() => {
                  setSelectedTransaction(row);
                  setIsDetailsModalOpen(true);
                  setShowActionsMenu(null);
                }}
                className='flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100'
              >
                <Eye className='h-4 w-4' />
                View Details
              </button>
              <button className='flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100'>
                <Receipt />
                View Receipt
              </button>
              <button className='flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100'>
                <Download className='h-4 w-4' />
                Export PDF
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Search and Filters */}
      <div className='rounded-xl border border-gray-200 bg-white p-6'>
        <div className='mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center'>
          {/* Left Side: Search + Filters */}
          <div className='flex flex-1 flex-col gap-3 lg:flex-row lg:items-center'>
            {/* Search */}
            <div className='relative w-full lg:w-64'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
              <input
                type='text'
                placeholder='Search transactions'
                className='w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm text-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              />
            </div>

            {/* Filters Row */}
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:flex-wrap md:items-center'>
              <Select
                options={[
                  { value: 'all', label: 'All Transactions' },
                  { value: 'deposit', label: 'Deposit' },
                  { value: 'withdrawal', label: 'Withdrawal' },
                  { value: 'bank-payment', label: 'Bank Payment' },
                ]}
                value={filter}
                onChange={setFilter}
                className='w-full md:w-40'
              />

              <Select
                options={[
                  { value: 'all', label: 'All Payments' },
                  { value: 'crypto', label: 'Crypto' },
                  { value: 'fedwire', label: 'Fedwire' },
                  { value: 'swift', label: 'SWIFT' },
                ]}
                value={paymentType}
                onChange={setPaymentType}
                className='w-full md:w-40'
              />

              <Select
                options={[
                  { value: 'all', label: 'All Currencies' },
                  { value: 'usd', label: 'USD' },
                  { value: 'eur', label: 'EUR' },
                  { value: 'gbp', label: 'GBP' },
                  { value: 'brl', label: 'BRL' },
                  { value: 'usdt', label: 'USDT' },
                  { value: 'usdc', label: 'USDC' },
                  { value: 'mxn', label: 'MXN' },
                ]}
                value={currency}
                onChange={setCurrency}
                className='w-full md:w-40'
              />

              <Select
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'pending', label: 'Pending' },
                ]}
                value={status}
                onChange={setStatus}
                className='w-full md:w-40'
              />

              <Select
                options={[{ value: 'all', label: 'All Recipients' }]}
                value={recipient}
                onChange={setRecipient}
                className='w-full md:w-40'
              />
            </div>
          </div>

          {/* Right Side: Date Picker */}
          <div className='w-full md:w-auto'>
            <DatePicker value={dateFilter} onChange={setDateFilter} className='w-full md:w-40' />
          </div>
        </div>

        {/* Table */}
        <DataTable
          data={mockTransactions}
          columns={columns}
          getRowId={row => row.id}
          showCheckbox={true}
          onSelectionChange={handleSelectionChange}
          selectedIds={selectedIds}
        />

        {/* Pagination */}
        <Pagination
          currentPage={activePage}
          totalPages={25}
          onPageChange={setActivePage}
          itemsPerPage={rowsPerPage}
          onItemsPerPageChange={setRowsPerPage}
        />
      </div>

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className='bg-gradient-dark fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-xl px-4 py-3 text-white shadow-xl md:left-[calc(50%+8rem)]'>
          <span className='text-sm font-light'>{selectedIds.size} transaction(s) selected</span>

          <div className='flex items-center gap-3 border-l border-gray-600 pl-4'>
            <button className='flex cursor-pointer items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-light text-white transition-colors hover:bg-white/20'>
              <Eye className='h-3.5 w-3.5' />
              View Receipt
            </button>
            <button className='bg-gradient-blue flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-light text-white transition-colors hover:bg-blue-700'>
              <Download className='h-3.5 w-3.5' />
              Export PDF
            </button>
            <button
              onClick={handleDeselectAll}
              className='ml-1 cursor-pointer text-xs font-light text-gray-400 hover:text-white'
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}

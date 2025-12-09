'use client';

import DeleteIcon from '@/components/icons/DeleteIcon';
import PenEdit from '@/components/icons/PenEdit';
import TransacionIcon from '@/components/icons/TransacionIcon';
import { AddRecipientModal } from '@/components/recipients/AddRecipientModal';
import { ViewRecipientModal } from '@/components/recipients/ViewRecipientModal';
import { DataTable, type TableColumn } from '@/components/ui/DataTable';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import {
  Filter,
  Globe,
  Home,
  MoreVertical,
  Plus,
  Search,
  Users,
  Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'Domestic' | 'International' | 'Crypto';
  details: string;
  lastUsed: string;
  added: string;
  bankName?: string;
  currency?: string;
  routingNumber?: string;
  accountNumber?: string;
  address?: string;
}

// Mock data
const mockRecipients: Recipient[] = [
  {
    id: '1',
    name: 'Alex Chan',
    email: 'aichan@acme.com',
    phone: '+1(555) 123-4567',
    type: 'Crypto',
    details: 'USDT - TRC-20',
    lastUsed: 'Dec 28, 2025 14:32 UTC',
    added: 'Dec 28, 2025 | 14:32 UTC',
  },
  {
    id: '2',
    name: 'James Wilson',
    email: 'jwilson@acme.com',
    phone: '+1(555) 123-4567',
    type: 'International',
    details: 'HSBC - UK - GBP',
    lastUsed: 'Dec 28, 2025 14:32 UTC',
    added: 'Dec 28, 2025 | 14:32 UTC',
    bankName: 'HSBC UK',
    currency: 'GBP',
    routingNumber: '021000021',
    accountNumber: '****7890',
    address: '123 Main Street, New York, NY 10001, United States',
  },
  {
    id: '3',
    name: 'John Smith',
    email: 'jsmith@acme.com',
    phone: '+1(555) 123-4567',
    type: 'Domestic',
    details: 'Chase Bank - USD',
    lastUsed: 'Dec 28, 2025 14:32 UTC',
    added: 'Dec 28, 2025 | 14:32 UTC',
    bankName: 'Chase Bank',
    currency: 'USD',
    routingNumber: '021000021',
    accountNumber: '****7890',
    address: '123 Main Street, New York, NY 10001, United States',
  },
  {
    id: '4',
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@acme.com',
    phone: '+1(555) 123-4567',
    type: 'Crypto',
    details: 'USDC - ERC-20',
    lastUsed: 'Dec 28, 2025 14:32 UTC',
    added: 'Dec 28, 2025 | 14:32 UTC',
  },
  {
    id: '5',
    name: 'Marie Dubois',
    email: 'marie@acme.com',
    phone: '+1(555) 123-4567',
    type: 'International',
    details: 'BNP Paribas - EUR',
    lastUsed: 'Dec 28, 2025 14:32 UTC',
    added: 'Dec 28, 2025 | 14:32 UTC',
    bankName: 'BNP Paribas',
    currency: 'EUR',
    routingNumber: '021000021',
    accountNumber: '****7890',
    address: '45 Baker Street, London, England NW1 6XE, United Kingdom',
  },
  {
    id: '6',
    name: 'Sarah Johnson',
    email: 'sarah329@acme.com',
    phone: '+1(555) 123-4567',
    type: 'Domestic',
    details: 'Bank of America - USD',
    lastUsed: 'Dec 28, 2025 14:32 UTC',
    added: 'Dec 28, 2025 | 14:32 UTC',
    bankName: 'Bank of America',
    currency: 'USD',
    routingNumber: '021000021',
    accountNumber: '****7890',
    address: '456 Oak Avenue, Los Angeles, CA 90001, United States',
  },
];

export default function RecipientsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const toast = useToast();

  const tabs = [
    { id: 'all', label: 'All Recipients', icon: <Users className='h-4 w-4' /> },
    { id: 'domestic', label: 'Domestic', icon: <Home className='h-4 w-4' /> },
    { id: 'international', label: 'International', icon: <Globe className='h-4 w-4' /> },
    { id: 'crypto', label: 'Crypto', icon: <Wallet className='h-4 w-4' /> },
  ];

  const filteredRecipients =
    activeTab === 'all'
      ? mockRecipients
      : mockRecipients.filter(r => r.type.toLowerCase() === activeTab);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Crypto':
        return 'bg-purple-100 text-purple-600';
      case 'International':
        return 'bg-green-100 text-green-600';
      case 'Domestic':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const columns: TableColumn<Recipient>[] = [
    {
      key: 'type',
      header: 'Type',
      render: row => (
        <span
          className={`inline-block rounded-lg p-2 text-xs font-medium ${getTypeColor(row.type)}`}
        >
          {row.type}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: row => <div className='text-sm font-medium text-gray-700'>{row.name}</div>,
    },
    {
      key: 'email',
      header: 'Email',
      render: row => <div className='text-sm text-gray-700'>{row.email}</div>,
    },
    {
      key: 'details',
      header: 'Details',
      render: row => <div className='text-sm text-gray-700'>{row.details}</div>,
    },
    {
      key: 'lastUsed',
      header: 'Last Used',
      render: row => (
        <div>
          <div className='text-sm font-medium text-gray-700'>
            {row.lastUsed.split(' ')[0] +
              ' ' +
              row.lastUsed.split(' ')[1] +
              ' ' +
              row.lastUsed.split(' ')[2]}
          </div>
          <div className='text-xs text-gray-500'>{row.lastUsed.split(' ')[3]}</div>
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
                  setSelectedRecipient(row);
                  setIsViewModalOpen(true);
                  setShowActionsMenu(null);
                }}
                className='flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100'
              >
                <TransacionIcon />
                View Transactions
              </button>
              <button className='flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100'>
                <PenEdit />
                Edit
              </button>
              <button className='flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-gray-100'>
                <DeleteIcon />
                Remove
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleAddRecipient = (data: any) => {
    console.log('Adding recipient:', data);
    toast.success('New Domestic Recipient Successfully Added!');
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

  return (
    <div className='space-y-6'>
      {/* <ToastContainer /> */}

      {/* Header */}
      <div className='flex flex-col items-start justify-between gap-4 px-1 sm:flex-row sm:items-center'>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant='pills' />
        <button
          onClick={() => setIsAddModalOpen(true)}
          className='bg-gradient-blue flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90'
        >
          <Plus className='h-4 w-4' />
          Add Recipient
        </button>
      </div>

      {/* Search and Filter */}
      <div className='rounded-xl border border-gray-200 bg-white p-6'>
        <div className='mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
          <div className='flex w-full items-center gap-3 sm:w-auto'>
            <div className='relative flex-1 sm:flex-initial'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
              <input
                type='text'
                placeholder='Search recipients by name, bank, or currency...'
                className='w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm text-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-100'
              />
            </div>
            <button className='flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>
              <Filter className='h-4 w-4' />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <DataTable
          data={filteredRecipients}
          columns={columns}
          getRowId={row => row.id}
          showCheckbox={true}
        />
      </div>

      {/* Modals */}
      <ViewRecipientModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        recipient={selectedRecipient}
        onEdit={() => {
          setIsViewModalOpen(false);
          // Open edit modal
        }}
      />

      <AddRecipientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddRecipient}
      />
    </div>
  );
}

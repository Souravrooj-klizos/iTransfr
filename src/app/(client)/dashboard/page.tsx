'use client';

import { WalletCard } from '@/components/dashboard/WalletCard';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { TransactionAnalytics } from '@/components/dashboard/TransactionAnalytics';
import { QuickActionButton } from '@/components/dashboard/QuickActionButton';
import { Search, Filter, ArrowDownCircle, Send, CreditCard, Repeat } from 'lucide-react';
import Image from 'next/image';

// Mock data - will be replaced with real API calls
const mockWallets = [
  {
    currency: 'USDT',
    amount: '$ 471,001.00',
    network: 'Tron Network',
    networkType: 'Trc-20',
    address: 'TLFmga...ooLe',
    icon: <Image src='/Ellipse 3 (1).svg' alt='USDT' width={36} height={36} />,
    bgColor: 'bg-green-100',
  },
  {
    currency: 'USDC',
    amount: '$ 127,321.00',
    network: 'Ethereum Network',
    networkType: 'Erc-20',
    address: '0x40e4...d338',
    icon: <Image src='/Ellipse 3.svg' alt='USDC' width={36} height={36} />,
    bgColor: 'bg-blue-100',
  },
];

const mockTransactions = [
  {
    id: '1',
    date: 'Dec 28, 2025',
    time: '09:15 CST',
    recipient: 'Global Industries',
    type: 'Crypto',
    status: 'Completed' as const,
    amount: '16,710 USDT',
    currency: 'USDT',
    amountColor: 'success' as const,
  },
  {
    id: '2',
    date: 'Dec 27, 2025',
    time: '14:32 CST',
    recipient: 'OmniCorp Logistics',
    type: 'Fedwire',
    status: 'Processing' as const,
    amount: '$44,775',
    fromAmount: 'From 45000 USDT',
    amountColor: 'error' as const,
  },
  {
    id: '3',
    date: 'Dec 23, 2025',
    time: '16:02 CST',
    recipient: 'StellarTech Enterprises',
    type: 'Swift',
    status: 'Processing' as const,
    amount: '520,000 MXN',
    fromAmount: 'From $30000',
    amountColor: 'neutral' as const,
  },
  {
    id: '4',
    date: 'Dec 23, 2025',
    time: '16:02 CST',
    recipient: 'NovaTech Solutions',
    type: 'Crypto',
    status: 'Completed' as const,
    amount: '75,000 USDT',
    currency: 'USDT',
    amountColor: 'success' as const,
  },
  {
    id: '5',
    date: 'Dec 23, 2025',
    time: '16:02 CST',
    recipient: 'Apex Dynamic Systems',
    type: 'Fedwire',
    status: 'Completed' as const,
    amount: '28,000 USDT',
    currency: 'USDT',
    amountColor: 'error' as const,
  },
  {
    id: '6',
    date: 'Dec 23, 2025',
    time: '16:02 CST',
    recipient: 'Zenith Global Group',
    type: 'Crypto',
    status: 'Processing' as const,
    amount: '16,710 USDT',
    currency: 'USDT',
    amountColor: 'success' as const,
  },
  {
    id: '7',
    date: 'Dec 22, 2025',
    time: '09:32 UTC',
    recipient: 'Synergy Tech Corp',
    type: 'Crypto',
    status: 'Completed' as const,
    amount: '28,000 USDT',
    currency: 'USDT',
    amountColor: 'success' as const,
  },
  {
    id: '8',
    date: 'Dec 23, 2025',
    time: '16:02 CST',
    recipient: 'Techsphere Inc',
    type: 'Fedwire',
    status: 'Completed' as const,
    amount: '520,000 MXN',
    fromAmount: 'From $30000',
    amountColor: 'neutral' as const,
  },
  {
    id: '9',
    date: 'Dec 27, 2025',
    time: '09:15 CST',
    recipient: 'InnoVision Creations',
    type: 'Fedwire',
    status: 'Processing' as const,
    amount: '$44,775',
    fromAmount: 'From 45000 USDT',
    amountColor: 'error' as const,
  },
  {
    id: '10',
    date: 'Dec 23, 2025',
    time: '16:02 CST',
    recipient: 'VanGuard Dynamics',
    type: 'Crypto',
    status: 'Completed' as const,
    amount: '28,000 USDT',
    currency: 'USDT',
    amountColor: 'error' as const,
  },
];

const analyticsData = [
  {
    label: 'Crypto Deposits',
    value: '$208K',
    percentage: '30%',
    color: 'bg-blue-500',
  },
  {
    label: 'Wire Transfers',
    value: '$125K',
    percentage: '25%',
    color: 'bg-green-500',
  },
  {
    label: 'SWIFT International',
    value: '$57K',
    percentage: '20%',
    color: 'bg-yellow-500',
  },
  {
    label: 'SEPA Payments',
    value: '$95K',
    percentage: '18%',
    color: 'bg-orange-500',
  },
  {
    label: 'Crypto Transfers',
    value: '$45K',
    percentage: '7%',
    color: 'bg-gray-500',
  },
];

import KYCStatus from '@/components/client/KYCStatus';
import CryptoDeposit from '@/components/icons/CryptoDeposit';
import CryptoSend from '@/components/icons/CryptoSend';
import DepositMoney from '@/components/icons/DepositMoney';
import SendMoney from '@/components/icons/SendMoney';

export default function ClientDashboard() {
  return (
    <div className='space-y-6'>
      {/* KYC Status Banner */}
      <KYCStatus />

      {/* Wallet Cards and Quick Actions */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-5'>
        {/* Wallet Cards */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2 xl:col-span-3'>
          {mockWallets.map((wallet, index) => (
            <WalletCard key={index} {...wallet} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className='flex flex-col rounded-xl border border-gray-200 bg-white px-6 py-4 transition-shadow hover:shadow-md lg:col-span-1 xl:col-span-2'>
          <div className='grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4'>
            <QuickActionButton
              icon={<CryptoDeposit />}
              label='Deposit Crypto'
              variant='primary'
            />
            <QuickActionButton
              icon={<CryptoSend />}
              label='Send Crypto'
            />
            <QuickActionButton
              icon={<DepositMoney />}
              label='Deposit Money'
            />
            <QuickActionButton
              icon={<SendMoney />}
              label='Send Money'
            />
          </div>
        </div>
      </div>

      {/* Transactions and Analytics */}
      <div className='mb-3 grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Recent Transactions */}
        <div className='rounded-xl border border-gray-200 bg-white px-6 py-3 lg:col-span-2'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-normal text-gray-500'>Recent Transactions</h2>
            <div className='flex flex-col items-center gap-3 lg:flex-row'>
              <div className='relative'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
                <input
                  type='text'
                  placeholder='Search'
                  className='rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm text-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                />
              </div>
              <button className='flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>
                <Filter className='h-4 w-4' />
                Filter
              </button>
            </div>
          </div>
          <TransactionTable transactions={mockTransactions} />
        </div>

        {/* Transaction Analytics */}
        <div>
          <TransactionAnalytics totalVolume='$485K' data={analyticsData} />
        </div>
      </div>
    </div>
  );
}

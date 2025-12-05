'use client';

import { CryptoTransactionsTable } from '@/components/balance/CryptoTransactionsTable';
import { WalletBalanceCard } from '@/components/balance/WalletBalanceCard';
import Image from 'next/image';

// Mock data for wallets
const mockWallets = [
  {
    currency: 'USDT',
    amount: '$ 471,001.00',
    network: 'Tron Network',
    networkType: 'Trc-20',
    address: 'TLFmga...ooLe',
    icon: <Image src='/Ellipse 3 (1).svg' alt='USDT' width={36} height={36} />,
  },
  {
    currency: 'USDC',
    amount: '$ 127,321.00',
    network: 'Ethereum Network',
    networkType: 'Erc-20',
    address: '0x40e4...d338',
    icon: <Image src='/Ellipse 3.svg' alt='USDC' width={36} height={36} />,
  },
];

// Mock data for crypto transactions
const mockCryptoTransactions = [
  {
    id: '1',
    date: 'Dec 28, 2025',
    time: '14:30 UTC',
    asset: {
      name: 'USDT',
      icon: <Image src='/Ellipse 3 (1).svg' alt='USDT' width={24} height={24} />,
    },
    network: 'TRC-20',
    direction: 'Sent' as const,
    status: 'Completed' as const,
    amount: '120,000 USDT',
  },
  {
    id: '2',
    date: 'Dec 28, 2025',
    time: '14:30 UTC',
    asset: {
      name: 'USDT',
      icon: <Image src='/Ellipse 3 (1).svg' alt='USDT' width={24} height={24} />,
    },
    network: 'TRC-20',
    direction: 'Deposit' as const,
    status: 'Processing' as const,
    amount: '9,000 USDT',
  },
  {
    id: '3',
    date: 'Dec 28, 2025',
    time: '14:32 UTC',
    asset: {
      name: 'USDC',
      icon: <Image src='/Ellipse 3.svg' alt='USDC' width={24} height={24} />,
    },
    network: 'ERC-20',
    direction: 'Received' as const,
    status: 'Completed' as const,
    amount: '22,500 USDC',
  },
  {
    id: '4',
    date: 'Dec 28, 2025',
    time: '14:32 UTC',
    asset: {
      name: 'USDC',
      icon: <Image src='/Ellipse 3.svg' alt='USDC' width={24} height={24} />,
    },
    network: 'ERC-20',
    direction: 'Received' as const,
    status: 'Completed' as const,
    amount: '50,000 USDC',
  },
  {
    id: '5',
    date: 'Dec 28, 2025',
    time: '14:32 UTC',
    asset: {
      name: 'USDC',
      icon: <Image src='/Ellipse 3.svg' alt='USDC' width={24} height={24} />,
    },
    network: 'ERC-20',
    direction: 'Received' as const,
    status: 'Completed' as const,
    amount: '8,600 USDC',
  },
  {
    id: '6',
    date: 'Dec 28, 2025',
    time: '14:32 UTC',
    asset: {
      name: 'USDT',
      icon: <Image src='/Ellipse 3 (1).svg' alt='USDT' width={24} height={24} />,
    },
    network: 'TRC-20',
    direction: 'Sent' as const,
    status: 'Processing' as const,
    amount: '15,000 USDC',
  },
  {
    id: '7',
    date: 'Dec 28, 2025',
    time: '14:32 UTC',
    asset: {
      name: 'USDT',
      icon: <Image src='/Ellipse 3 (1).svg' alt='USDT' width={24} height={24} />,
    },
    network: 'TRC-20',
    direction: 'Received' as const,
    status: 'Completed' as const,
    amount: '2,250 USDT',
  },
  {
    id: '8',
    date: 'Dec 28, 2025',
    time: '14:32 UTC',
    asset: {
      name: 'USDC',
      icon: <Image src='/Ellipse 3.svg' alt='USDC' width={24} height={24} />,
    },
    network: 'ERC-20',
    direction: 'Received' as const,
    status: 'Completed' as const,
    amount: '1,250 USDC',
  },
  {
    id: '9',
    date: 'Dec 28, 2025',
    time: '14:32 UTC',
    asset: {
      name: 'USDT',
      icon: <Image src='/Ellipse 3 (1).svg' alt='USDT' width={24} height={24} />,
    },
    network: 'TRC-20',
    direction: 'Sent' as const,
    status: 'Processing' as const,
    amount: '19,760 USDT',
  },
  {
    id: '10',
    date: 'Dec 28, 2025',
    time: '14:32 UTC',
    asset: {
      name: 'USDT',
      icon: <Image src='/Ellipse 3 (1).svg' alt='USDT' width={24} height={24} />,
    },
    network: 'TRC-20',
    direction: 'Received' as const,
    status: 'Completed' as const,
    amount: '3,000 USDT',
  },
];

export default function BalancePage() {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left Column - Wallet Balance Card */}
        <div className='lg:col-span-1 rounded-xl border border-gray-200 bg-white p-6'>
          <WalletBalanceCard
            totalBalance='$ 598,322.00'
            wallets={mockWallets}
            onDepositClick={() => console.log('Deposit clicked')}
            onSendClick={() => console.log('Send clicked')}
            onAddWalletClick={() => console.log('Add wallet clicked')}
          />
        </div>

        {/* Right Column - Crypto Transactions Table */}
        <div className='lg:col-span-2'>
          <CryptoTransactionsTable transactions={mockCryptoTransactions} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';

interface HeaderProps {
  user: any;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Overview';
      case '/balance':
        return 'Balance';
      case '/deposit':
        return 'Deposit';
      case '/send':
        return 'Send Money';
      case '/recipients':
        return 'Recipients';
      case '/transactions':
        return 'Transactions';
      case '/team':
        return 'Team';
      case '/settings':
        return 'Settings';
      case '/help':
        return 'Help Center';
      default:
        return 'Dashboard';
    }
  };

  const title = getPageTitle(pathname);

  return (
    <header className='fixed top-0 right-0 z-40 my-3 mr-5 ml-2 rounded-lg border border-[#E3E3E3] bg-white md:left-64'>
      <div style={{ padding: '10px 20px' }}>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-semibold text-gray-900'>{title}</h1>
          <div className='flex items-center gap-4'>
            <button className='relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600'>
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                />
              </svg>
              <span className='absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500'></span>
            </button>
            <div className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600'>
              <span className='text-sm font-medium text-white'>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

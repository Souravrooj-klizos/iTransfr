'use client';

import BalanceIcon from '@/components/icons/BalanceIcon';
import DashboardIcon from '@/components/icons/DashboardIcon';
import Deposit from '@/components/icons/Deposit';
import HelpIcon from '@/components/icons/HelpIcon';
import ItransfrLogo from '@/components/icons/ItransfrLogo';
import ItransfrText from '@/components/icons/ItransfrText';
import RecipientsIcon from '@/components/icons/RecipientsIcon';
import SendIcon from '@/components/icons/SendIcon';
import TeamIcon from '@/components/icons/TeamIcon';
import TransacionIcon from '@/components/icons/TransacionIcon';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/providers/UserProvider';
import {
  ChevronDown,
  LogOut,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: DashboardIcon },
    { name: 'Balance', href: '/balance', icon: BalanceIcon },
    { name: 'Deposit', href: '/deposit', icon: Deposit },
    { name: 'Send', href: '/send', icon: SendIcon },
    { name: 'Recipients', href: '/recipients', icon: RecipientsIcon },
    { name: 'Transactions', href: '/transactions', icon: TransacionIcon },
    { name: 'Team', href: '/team', icon: TeamIcon },
  ];

  const bottomNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help Center', href: '/help', icon: HelpIcon },
  ];

  return (
    <div className='fixed inset-y-0 z-50 hidden md:flex md:w-64 md:flex-col'>
      <div className='my-3 mr-1 ml-5 flex grow flex-col rounded-lg border-2 border-r border-gray-200 bg-white'>
        {/* Logo */}
        <div className='flex h-16 items-center border-b border-gray-200 px-4'>
          <div className='flex items-center gap-2'>
            <ItransfrLogo />
            <ItransfrText />
          </div>
        </div>

        {/* User Info */}
        <div className='border-b border-gray-200 px-2 py-4'>
          <Link href='/profile'>
            <div className='flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-600'>
                  <span className='text-sm font-medium text-white'>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-gray-900'>Liberty Trading Inc.</p>
                  <p className='truncate text-xs text-gray-500'>Sheridan, USA</p>
                </div>
              </div>
              <ChevronDown className='h-4 w-4 text-gray-400' />
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className='flex-1 space-y-1 overflow-y-auto px-3 py-4'>
          {navigation.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-blue text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className='space-y-1 border-t border-gray-200 px-3 py-4'>
          {bottomNavigation.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-linear-to-b from-[#588CFF] to-[#2462EB] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className='group flex w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 group-hover:text-red-600'
          >
            <LogOut className='mr-3 h-5 w-5 shrink-0 text-red-500 ' />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

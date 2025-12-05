'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { LogOut, Home, UserCheck, FileText, CreditCard } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'KYC Review', href: '/admin/kyc-review', icon: UserCheck },
    { name: 'Transactions', href: '/admin/transactions', icon: FileText },
    { name: 'Payouts', href: '/admin/payouts', icon: CreditCard },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex'>
        {/* Sidebar */}
        <div className='hidden md:flex md:w-64 md:flex-col'>
          <div className='flex grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5'>
            <div className='flex shrink-0 items-center px-4'>
              <h1 className='text-xl font-bold text-gray-900'>iTransfer Admin</h1>
            </div>
            <div className='mt-8 flex grow flex-col'>
              <nav className='flex-1 space-y-1 px-2 pb-4'>
                {navigation.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                        isActive
                          ? 'border-r-2 border-blue-700 bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 shrink-0 ${
                          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className='flex shrink-0 border-t border-gray-200 p-4'>
              <div className='flex w-full items-center'>
                <div className='flex-1'>
                  <p className='truncate text-sm font-medium text-gray-900'>{user?.email}</p>
                  <p className='text-xs text-gray-500'>Admin</p>
                </div>
                <Button onClick={handleLogout} variant='ghost' size='sm' className='ml-2'>
                  <LogOut className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className='flex-1'>
          <main className='p-6'>{children}</main>
        </div>
      </div>
    </div>
  );
}

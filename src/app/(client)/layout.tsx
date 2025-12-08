'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserProvider } from '@/providers/UserProvider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className='min-h-screen bg-gray-50'>
        <div className='flex'>
          <Sidebar />

          {/* Main content */}
          <div className='w-full flex-1 md:pl-64'>
            <Header />

            <main className='mb-3 max-w-full overflow-x-hidden pt-20 pr-5 pl-2'>{children}</main>
          </div>
        </div>
      </div>
    </UserProvider>
  );
}

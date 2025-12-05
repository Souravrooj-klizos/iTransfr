'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

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

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex'>
        <Sidebar user={user} />

        {/* Main content */}
        <div className='w-full flex-1 md:pl-64'>
          <Header user={user} />

          <main className='mb-3 max-w-full overflow-x-hidden pt-20 pr-5 pl-2'>{children}</main>
        </div>
      </div>
    </div>
  );
}

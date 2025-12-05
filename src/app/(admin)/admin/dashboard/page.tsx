'use client';

import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabaseClient';
import {
  Users,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface DashboardStats {
  totalClients: number;
  pendingKYC: number;
  approvedKYC: number;
  rejectedKYC: number;
  pendingTransactions: number;
  completedTransactions: number;
}

interface RecentKYC {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  client_profiles: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    pendingKYC: 0,
    approvedKYC: 0,
    rejectedKYC: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
  });
  const [recentKYC, setRecentKYC] = useState<RecentKYC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch stats
      const response = await fetch('/api/admin/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentKYC(data.recentKYC || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'bg-blue-500' },
    { label: 'Pending KYC', value: stats.pendingKYC, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Approved KYC', value: stats.approvedKYC, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Rejected KYC', value: stats.rejectedKYC, icon: XCircle, color: 'bg-red-500' },
  ];

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className='mb-6 text-2xl font-bold text-gray-900'>Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {statCards.map(stat => (
          <div key={stat.label} className='rounded-lg border border-gray-200 bg-white p-6 shadow'>
            <div className='flex items-center'>
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>{stat.label}</p>
                <p className='text-2xl font-semibold text-gray-900'>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent KYC Requests */}
      <div className='rounded-lg border border-gray-200 bg-white shadow'>
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-gray-900'>Recent KYC Requests</h2>
          <a href='/admin/kyc-review' className='text-sm text-blue-600 hover:text-blue-800'>
            View All →
          </a>
        </div>
        <div className='divide-y divide-gray-200'>
          {recentKYC.length === 0 ? (
            <div className='px-6 py-8 text-center text-gray-500'>
              <FileCheck className='mx-auto mb-2 h-12 w-12 text-gray-300' />
              <p>No pending KYC requests</p>
            </div>
          ) : (
            recentKYC.map(kyc => (
              <div
                key={kyc.id}
                className='flex items-center justify-between px-6 py-4 hover:bg-gray-50'
              >
                <div className='flex items-center'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-500'>
                    {kyc.client_profiles?.first_name?.charAt(0) || '?'}
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-900'>
                      {kyc.client_profiles?.first_name} {kyc.client_profiles?.last_name}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {kyc.client_profiles?.company_name || 'No company'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      kyc.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : kyc.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : kyc.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {kyc.status}
                  </span>
                  <a
                    href='/admin/kyc-review'
                    className='text-sm font-medium text-blue-600 hover:text-blue-800'
                  >
                    Review
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className='mt-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
        <a
          href='/admin/kyc-review'
          className='rounded-lg border border-gray-200 bg-white p-6 shadow transition-shadow hover:shadow-md'
        >
          <FileCheck className='mb-3 h-8 w-8 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Review KYC</h3>
          <p className='mt-1 text-sm text-gray-500'>Approve or reject pending verifications</p>
        </a>
        <a
          href='/admin/transactions'
          className='rounded-lg border border-gray-200 bg-white p-6 shadow transition-shadow hover:shadow-md'
        >
          <TrendingUp className='mb-3 h-8 w-8 text-green-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Transactions</h3>
          <p className='mt-1 text-sm text-gray-500'>Manage deposits, swaps, and payouts</p>
        </a>
        <a
          href='/admin/payouts'
          className='rounded-lg border border-gray-200 bg-white p-6 shadow transition-shadow hover:shadow-md'
        >
          <AlertCircle className='mb-3 h-8 w-8 text-orange-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Pending Payouts</h3>
          <p className='mt-1 text-sm text-gray-500'>Process and send payouts</p>
        </a>
      </div>
    </div>
  );
}

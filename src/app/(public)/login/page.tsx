'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { AuthCard } from '@/components/auth/AuthCard';
import { FormInput } from '@/components/auth/FormInput';
import { FormCheckbox } from '@/components/auth/FormCheckbox';
import { OAuthButton } from '@/components/auth/OAuthButton';
import { Divider } from '@/components/auth/Divider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🚀 Starting Google OAuth login...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ Google OAuth error:', error);
        setError(`Google login failed: ${error.message}`);
        return;
      }

      console.log('✅ Google OAuth initiated, redirecting...');
      // OAuth will redirect automatically
    } catch (err: any) {
      console.error('❌ Google login exception:', err);
      setError('Failed to initiate Google login. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title='Log in to your Account' subtitle='Welcome back! Select method to log in'>
      {/* Login Form */}
      <form onSubmit={handleLogin} className='space-y-4'>
        <FormInput
          icon='email'
          type='email'
          placeholder='Email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <FormInput
          icon='password'
          type='password'
          placeholder='Password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <div className='flex items-center justify-between'>
          <FormCheckbox
            id='keepLoggedIn'
            label='Keep me on this device for 30 days'
            checked={keepLoggedIn}
            onChange={e => setKeepLoggedIn(e.target.checked)}
          />
        </div>

        {error && <div className='rounded-md bg-red-50 p-3 text-sm text-red-600'>{error}</div>}

        <button
          type='submit'
          disabled={loading}
          className='h-11 w-full rounded-md bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      {/* Divider */}
      <Divider />

      {/* OAuth Button */}
      <OAuthButton onClick={handleGoogleLogin} />

      {/* Sign Up Link */}
      <div className='mt-6 text-center'>
        <p className='text-sm text-gray-600'>
          Don't have an account?{' '}
          <Link href='/signup' className='font-medium text-blue-600 hover:text-blue-700'>
            Open Account
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}

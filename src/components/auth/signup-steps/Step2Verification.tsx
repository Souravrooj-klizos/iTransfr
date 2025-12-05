'use client';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OTPInput } from '@/components/ui/OTPInput';

interface Step2Props {
  formData: any;
  onNext: (otp: string) => void;
}

export function Step2Verification({ formData, onNext }: Step2Props) {
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    setLoading(true);
    setTimer(30);
    setCanResend(false);
    // Call API to resend OTP
    try {
      await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (enteredOtp: string) => {
    setOtp(enteredOtp);
  };

  const handleVerify = async () => {
    if (otp && otp.length === 5) {
      setLoading(true);
      try {
        await onNext(otp);
      } catch (error) {
        console.error('Verification failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='relative space-y-6'>
      {loading && (
        <div className='bg-opacity-75 absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      )}

      <div className='mb-8 text-center'>
        <h2 className='mb-2 text-xl font-semibold text-gray-900'>Check your email for a code</h2>
        <p className='text-sm text-gray-600'>
          We have sent a verification code to{' '}
          <span className='font-medium text-gray-900'>{formData.email || 'user@example.com'}</span>
        </p>
      </div>

      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
        <div className='mb-4 flex items-center justify-between'>
          <span className='text-sm text-gray-600'>Enter code</span>
          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className={`text-xs ${canResend && !loading ? 'cursor-pointer text-blue-600 hover:text-blue-700' : 'cursor-not-allowed text-gray-400'}`}
          >
            {loading && !canResend
              ? 'Sending...'
              : canResend
                ? 'Resend Code'
                : `Resend Code (${timer}s)`}
          </button>
        </div>

        <OTPInput length={5} onComplete={handleComplete} />
      </div>

      <button
        onClick={handleVerify}
        disabled={!otp || otp.length !== 5 || loading}
        className='h-11 w-full rounded-md bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {loading ? 'Verifying...' : 'Verify & Continue'}
      </button>

      <div className='mt-4 text-center'>
        <p className='text-sm text-gray-600'>
          Already have an account?{' '}
          <Link href='/login' className='font-medium text-blue-600 hover:text-blue-700'>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

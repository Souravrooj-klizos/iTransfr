'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FormInput } from '@/components/auth/FormInput';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';

interface Step3Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

export function Step3Password({ formData, updateFormData, onNext }: Step3Props) {
  const [strength, setStrength] = useState<0 | 1 | 2 | 3 | 4>(0);

  const calculateStrength = (password: string) => {
    let score = 0;
    if (!password) return 0;
    if (password.length > 6) score += 1;
    if (password.length > 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    return score as 0 | 1 | 2 | 3 | 4;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    updateFormData({ password: newPassword });
    setStrength(calculateStrength(newPassword));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className='space-y-6'>
      <div className='mb-6 text-center'>
        <h2 className='mb-2 text-xl font-semibold text-gray-900'>Create a Password</h2>
        <p className='text-sm text-gray-600'>Fill out a new password for your account</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <FormInput
            icon='password'
            type='password'
            placeholder='New Password'
            value={formData.password}
            onChange={handlePasswordChange}
            required
          />
          <PasswordStrengthMeter strength={strength} />
        </div>

        <button
          type='submit'
          className='h-11 w-full rounded-md bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700'
        >
          Continue
        </button>

        <div className='mt-4 text-center'>
          <p className='text-sm text-gray-600'>
            Already have an account?{' '}
            <Link href='/login' className='font-medium text-blue-600 hover:text-blue-700'>
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

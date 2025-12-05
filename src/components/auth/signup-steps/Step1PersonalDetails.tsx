'use client';

import React from 'react';
import Link from 'next/link';
import { FormInput } from '@/components/auth/FormInput';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface Step1Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

export function Step1PersonalDetails({ formData, updateFormData, onNext }: Step1Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <FormInput
          icon='user'
          placeholder='First Name'
          value={formData.firstName}
          onChange={e => updateFormData({ firstName: e.target.value })}
          required
        />
        <FormInput
          icon='user'
          placeholder='Last Name'
          value={formData.lastName}
          onChange={e => updateFormData({ lastName: e.target.value })}
          required
        />
      </div>

      <FormInput
        icon='building'
        placeholder='Company Name'
        value={formData.companyName}
        onChange={e => updateFormData({ companyName: e.target.value })}
        required
      />

      <FormInput
        icon='email'
        type='email'
        placeholder='Work Email'
        value={formData.email}
        onChange={e => updateFormData({ email: e.target.value })}
        required
      />

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>Mobile Number *</label>
        <PhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry='US'
          value={formData.mobile}
          onChange={value => updateFormData({ mobile: value || '' })}
          className='custom-phone-input'
          style={{
            '--PhoneInputCountryFlag-aspectRatio': '1.5',
            '--PhoneInputCountryFlag-height': '1rem',
          }}
        />
      </div>

      <button
        type='submit'
        className='mt-6 h-11 w-full rounded-md bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700'
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
  );
}

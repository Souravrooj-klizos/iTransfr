'use client';

import React from 'react';
import Link from 'next/link';
import { FormInput } from '@/components/auth/FormInput';

interface Step4Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

export function Step4CompanyDetails({ formData, updateFormData, onNext }: Step4Props) {
  const businessTypes = ['Company', 'Fintech', 'Manufacturer', 'Importer/Exporter', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-4'>
        <FormInput
          icon='building'
          placeholder='City'
          value={formData.city}
          onChange={e => updateFormData({ city: e.target.value })}
          required
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormInput
            icon='globe'
            placeholder='Country'
            value={formData.country}
            onChange={e => updateFormData({ country: e.target.value })}
            required
          />
          <FormInput
            icon='map'
            placeholder='Pincode'
            value={formData.pincode}
            onChange={e => updateFormData({ pincode: e.target.value })}
            required
          />
        </div>
      </div>

      <div className='space-y-3'>
        <label className='block text-sm font-medium text-gray-700'>What best describes you?</label>
        <div className='space-y-2'>
          {businessTypes.map(type => (
            <label
              key={type}
              className={`flex cursor-pointer items-center rounded-lg border p-3 transition-colors ${
                formData.businessType === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type='radio'
                name='businessType'
                value={type}
                checked={formData.businessType === type}
                onChange={e => updateFormData({ businessType: e.target.value })}
                className='h-4 w-4 border-gray-300 text-blue-600 accent-blue-600 focus:ring-blue-500 focus:ring-offset-0'
              />
              <span className='ml-3 text-sm text-gray-700'>{type}</span>
            </label>
          ))}
        </div>
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
  );
}

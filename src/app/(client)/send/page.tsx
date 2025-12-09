'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { TransferMethodCard } from '@/components/transfer/TransferMethodCard';
import { FormInput } from '@/components/transfer/FormInput';
import { FormSelect } from '@/components/transfer/FormSelect';
import { SummaryItem } from '@/components/transfer/SummaryItem';
import { FeeBreakdown } from '@/components/transfer/FeeBreakdown';
import { InfoBanner } from '@/components/transfer/InfoBanner';
import DomesticIcon from '@/components/icons/DomesticIcon';
import InternationShift from '@/components/icons/InternationShift';
import CryptoTransfer from '@/components/icons/CryptoTransfer';

type TransferMethod = 'domestic' | 'international' | 'crypto';

const TRANSFER_METHODS = [
  {
    id: 'domestic' as TransferMethod,
    iconBgColor: 'bg-blue-100',
    icon: <DomesticIcon />,
    title: 'Domestic Transfer',
    subtitle: 'Send to U.S. Bank Accounts',
    timing: 'Same Day',
    description: 'Same day processing within 2 hours before 4pm EST',
  },
  {
    id: 'international' as TransferMethod,
    iconBgColor: 'bg-green-100',
    icon: <InternationShift />,
    title: 'International Wire',
    subtitle: 'Global SWIFT Transfers',
    timing: '1 Day',
    description: 'Same day (before 4pm EST) / Overnight (after 10am EST)',
  },
  {
    id: 'crypto' as TransferMethod,
    iconBgColor: 'bg-purple-100',
    icon: <CryptoTransfer />,
    title: 'Crypto Transfers',
    subtitle: 'Send to Crypto Wallets',
    timing: 'Instant',
    description: 'Direct USDT/USDC/BTC transfer - processed instantly on blockchain',
  },
];

export default function SendMoneyPage() {
  const [selectedMethod, setSelectedMethod] = useState<TransferMethod>('domestic');
  const [amount, setAmount] = useState('55.00');
  const [agreed, setAgreed] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  // Dynamic data based on selected method
  const recipientData = {
    domestic: {
      name: 'John Smith',
      bank: 'Chase Bank - USD',
      address: '123 Main Street, New York, NY 10001 United States',
    },
    international: {
      name: 'James Wilson',
      bank: 'HSBC UK - GBP',
      address: '45 Baker Street, London, England NW1 6XE, United Kingdom',
    },
    crypto: {
      name: 'Alex Chan',
      bank: 'USDT - TRC-20',
      address: 'TQjsfcJ3J5... ...PQbeV',
    },
  }[selectedMethod];

  const feesData = {
    domestic: {
      recipientGets: '$29.17 USD',
      rate: '0.9900 USDC/USDC',
      quotedRate: '0.9900 USDC/USDC',
      fxFee: '$0.43 USD',
      wireFeeLabel: 'Fed/Wire Fee',
      wireFee: '$25.00 USD',
      totalFees: '$25.43 USD',
      showFees: true,
    },
    international: {
      recipientGets: '€16.05 EUR',
      rate: '0.8572 EUR/USDT',
      quotedRate: '0.8572 EUR/USDT',
      fxFee: '$0.83 USD',
      wireFeeLabel: 'SWIFT Fee',
      wireFee: '$30.00 USD',
      totalFees: '$30.83 USD',
      showFees: true,
    },
    crypto: {
      recipientGets: 'USDT 55.00',
      rate: 'Direct transfer - no conversion',
      quotedRate: '',
      fxFee: '',
      wireFeeLabel: '',
      wireFee: '',
      totalFees: '',
      showFees: false,
    },
  }[selectedMethod];

  const infoBanner = {
    domestic: 'Domestic transfers are processed same day within 2 hours before 4pm EST.',
    international: 'Same day (before 4pm EST) / Overnight (after 10am EST)',
    crypto: 'Crypto transfers are processed instantly once confirmed on the blockchain.',
  }[selectedMethod];

  const showOutputCurrency = selectedMethod === 'international';
  const sourceCurrency = selectedMethod === 'international' ? 'USDT' : 'USDC';

  return (
    <>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        {/* LEFT SIDE - Transfer Method Cards + Form */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Transfer Method Selection - Responsive Grid */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3'>
            {TRANSFER_METHODS.map(method => (
              <TransferMethodCard
                key={method.id}
                id={method.id}
                icon={method.icon}
                title={method.title}
                subtitle={method.subtitle}
                timing={method.timing}
                iconBgColor={method.iconBgColor}
                description={method.description}
                isSelected={selectedMethod === method.id}
                onClick={() => setSelectedMethod(method.id)}
              />
            ))}
          </div>

          {/* Transfer Details Form */}
          <div className='rounded-lg border border-gray-200 bg-white p-6'>
            <h2 className='mb-6 text-lg font-semibold text-gray-900'>Transfer Details</h2>

            <div className='space-y-3'>
              {/* Send To */}
              <FormSelect
                label='Send to'
                value={`${recipientData.name} | ${recipientData.bank}`}
                options={[
                  {
                    value: `${recipientData.name} | ${recipientData.bank}`,
                    label: `${recipientData.name} | ${recipientData.bank}`,
                  },
                ]}
                required
              />

              {/* Amount, Source Currency, and Output Currency */}
              <div
                className={`grid grid-cols-1 ${showOutputCurrency ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}
              >
                <FormInput
                  label='Amount'
                  type='number'
                  value={amount}
                  onChange={setAmount}
                  placeholder='55.00'
                  showMax
                  required
                />

                <FormSelect
                  label='Source Currency'
                  value={sourceCurrency}
                  options={[
                    { value: 'USDC', label: '💵 USDC' },
                    { value: 'USDT', label: '💵 USDT' },
                    { value: 'USD', label: '💵 USD' },
                  ]}
                  required
                />

                {showOutputCurrency && (
                  <FormSelect
                    label='Output Currency'
                    value='EUR'
                    options={[
                      { value: 'EUR', label: 'EUR' },
                      { value: 'GBP', label: 'GBP' },
                      { value: 'USD', label: 'USD' },
                    ]}
                    required
                  />
                )}
              </div>

              {/* Available Balance */}
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-gray-600'>Available Balance:</span>
                <span className='font-semibold' style={{ color: 'var(--color-gray-900)' }}>
                  {showBalance ? '1,234.56 USDT' : '••••••••• USDT'}
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className='cursor-pointer text-blue-600 hover:text-blue-700'
                >
                  {showBalance ? <Eye className='h-4 w-4' /> : <EyeOff className='h-4 w-4' />}
                </button>
              </div>

              {/* Note */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Note (Optional)
                </label>
                <textarea
                  rows={5}
                  className='w-full resize-none rounded-lg border border-gray-300 px-4 py-3 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  placeholder='Payment reference or note'
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Transfer Summary */}
        <div className='lg:col-span-1'>
          <div className='sticky rounded-lg border border-gray-200 bg-white p-6'>
            <h2 className='mb-5 text-lg font-semibold text-gray-900'>Transfer Summary</h2>

            <SummaryItem
              label='Transfer Method'
              value={TRANSFER_METHODS.find(m => m.id === selectedMethod)?.title || ''}
              icon={TRANSFER_METHODS.find(m => m.id === selectedMethod)?.icon}
            />
            <hr className='my-4' />

            <SummaryItem
              label='Recipient'
              value={recipientData.name}
              subtext={[recipientData.bank, recipientData.address]}
            />
            <hr className='my-4' />
            <SummaryItem
              label='Source Currency'
              value={`${sourceCurrency} ${amount}`}
              valueStyle={{ fontWeight: 600 }}
            />
            <hr className='my-4' />
            <SummaryItem
              label='Recipient Gets'
              value={feesData.recipientGets}
              subtext={`Rate: ${feesData.rate}`}
              valueStyle={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--color-success-green)',
              }}
            />

            {/* Fees */}
            {feesData.showFees && (
              <FeeBreakdown
                quotedRate={feesData.quotedRate}
                fxFee={feesData.fxFee}
                wireFeeLabel={feesData.wireFeeLabel}
                wireFee={feesData.wireFee}
                totalFees={feesData.totalFees}
              />
            )}

            {!feesData.showFees && (
              <div className='mb-6 border-t border-gray-200 pt-4'>
                <p className='text-sm text-gray-600 italic'>No fees for crypto transfers</p>
              </div>
            )}

            {/* Terms Checkbox */}
            <label className='mb-4 flex cursor-pointer items-center gap-2'>
              <input
                type='checkbox'
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className='h-4 w-4 cursor-pointer'
              />
              <span className='text-xs text-gray-600'>
                I agree to the terms and conditions and confirm the transfer details are correct
              </span>
            </label>

            {/* Continue Button */}
            <button
              disabled={!agreed}
              className={`w-full rounded-lg py-3 font-medium transition-colors ${
                agreed
                  ? 'bg-gradient-blue cursor-pointer text-white hover:bg-blue-700'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className='mt-6'>
        <InfoBanner message={infoBanner} variant='warning' />
      </div>
    </>
  );
}

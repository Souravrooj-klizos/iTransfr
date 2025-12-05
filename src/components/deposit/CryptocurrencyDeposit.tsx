'use client';

import { useState } from 'react';
import { Check, ChevronDown, Copy } from 'lucide-react';
import Image from 'next/image';
import { BankDetailsField } from '@/components/ui/BankDetailsField';
import { Button } from '@/components/ui/Button';

const cryptocurrencies = [
  { id: 'usdt-trc20', name: 'USDT (TRC-20) Tron Network', network: 'Tron Network' },
];

export function CryptocurrencyDeposit() {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptocurrencies[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const depositAddress = 'TLFmgA1XevcqBSXYE28BbLe';
  const bridgeUrl = 'pay.itransfr.com/bridge/TLFmgA1XevcqBSXYE28BbLe';

  const handleOpenPaymentPage = () => {
    window.open(`https://${bridgeUrl}`, '_blank');
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bridgeUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold text-gray-900'>Cryptocurrency Deposit</h2>

      {/* Cryptocurrency Selector and Deposit Address */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {/* Cryptocurrency Selector */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Select Cryptocurrency</label>
          <div className='relative mt-1'>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className='flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors hover:bg-gray-50'
              type='button'
            >
              <div className='flex items-center gap-2'>
                <Image src='/Ellipse 3 (1).svg' alt='USDT' width={20} height={20} />
                <span className='font-medium'>{selectedCrypto.name}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <div className='absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg'>
                {cryptocurrencies.map(crypto => (
                  <button
                    key={crypto.id}
                    onClick={() => {
                      setSelectedCrypto(crypto);
                      setIsDropdownOpen(false);
                    }}
                    className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-900 transition-colors hover:bg-gray-50'
                    type='button'
                  >
                    <Image src='/Ellipse 3 (1).svg' alt='USDT' width={20} height={20} />
                    <span className='font-medium'>{crypto.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deposit Address */}
        <BankDetailsField label='Deposit Address' value={depositAddress} />
      </div>

      {/* Share Wallet Address */}
      <div className='space-y-3 border-t border-gray-200 pt-4'>
        <div className='flex items-center gap-2'>
          <h3 className='text-lg font-semibold text-gray-900'>Share Wallet Address</h3>
          <div className='group relative'>
            <div className='flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-gray-400'>
              <span className='text-xs text-gray-400'>?</span>
            </div>
            <div className='absolute bottom-full left-0 mb-2 hidden w-64 rounded-lg bg-gray-900 p-2 text-xs text-white group-hover:block'>
              Share this URL with others to receive payments directly to your wallet
            </div>
          </div>
        </div>

        <div className='w-2/3 space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Bridge URL</label>
          <div className='flex items-center gap-3'>
            <div className='flex flex-1 items-center justify-between rounded-lg border border-gray-200 bg-gray-50 py-0.5 pr-0.5 pl-4'>
              <span className='font-mono text-sm break-all text-blue-600'>{bridgeUrl}</span>
              <button
                onClick={handleCopyUrl}
                className='z-10 ml-2 flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-500 transition-colors hover:text-gray-700'
                type='button'
              >
                {copiedUrl ? (
                  <>
                    <Check className='h-4 w-4 text-green-600' />
                    <span className='text-green-600'>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className='h-4 w-4' />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <Button
              onClick={handleOpenPaymentPage}
              className='flex shrink-0 items-center gap-2 bg-[#B762FF] px-6 py-2.5 text-white hover:bg-[#B762FF]/90'
            >
              <Image src='/share.svg' alt='Share' width={16} height={16} />
              Open Payment Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

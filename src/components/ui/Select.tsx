'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm transition-all hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''
        }`}
      >
        <span className={`truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-600'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className='animate-in fade-in zoom-in-95 absolute top-full left-0 z-50 mt-1.5 w-full min-w-[180px] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg duration-100'>
          <div className='max-h-60 overflow-y-auto'>
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                  option.value === value
                    ? 'bg-blue-50 font-medium text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className='truncate'>{option.label}</span>
                {option.value === value && <Check className='ml-2 h-4 w-4 text-blue-600' />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

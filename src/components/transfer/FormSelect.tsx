import { ChevronDown } from 'lucide-react';

interface FormSelectProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

export function FormSelect({ label, value, onChange, options, required = false }: FormSelectProps) {
  return (
    <div className='w-full'>
      {label && (
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          {label}
          {required && <span className='ml-1 text-red-500'>*</span>}
        </label>
      )}
      <div className='relative'>
        <select
          value={value}
          onChange={e => onChange?.(e.target.value)}
          required={required}
          className='h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50'
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className='pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
      </div>
    </div>
  );
}

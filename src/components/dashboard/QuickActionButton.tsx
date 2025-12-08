interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'default';
}

export function QuickActionButton({
  icon,
  label,
  onClick,
  variant = 'default',
}: QuickActionButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={onClick}
      className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border p-4 transition-all ${
        isPrimary ? 'bg-gradient-blue' : 'border-gray-200 hover:border-blue-500 hover:shadow-md'
      } `}
    >
      <div
        className={`mb-3 flex items-center justify-center rounded-full transition-colors ${
          isPrimary ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
        } `}
      >
        {icon}
      </div>
      <span
        className={`text-center text-xs font-medium transition-colors ${isPrimary ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'} `}
      >
        {label}
      </span>
    </button>
  );
}

import React from 'react';

'use client';

import CompleteIcon from '@/components/icons/CompleteIcon';
import ProcessingIcon from '@/components/icons/ProcessingIcon';
import { useState } from 'react';

// Generic column definition
export interface TableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  getRowId: (row: T) => string;
  showCheckbox?: boolean;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  showCheckbox = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      onSelectionChange?.(new Set());
    } else {
      const allIds = new Set(data.map(row => getRowId(row)));
      setSelectedRows(allIds);
      onSelectionChange?.(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === data.length);
    onSelectionChange?.(newSelected);
  };

  return (
    <div className='overflow-hidden rounded-lg border border-gray-200'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-200 bg-gray-50'>
              {showCheckbox && (
                <th className='px-6 py-3 text-left'>
                  <input
                    type='checkbox'
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className='h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500'
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase ${
                    column.align === 'right'
                      ? 'text-right'
                      : column.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {data.map(row => {
              const rowId = getRowId(row);
              return (
                <tr key={rowId} className='transition-colors hover:bg-gray-50'>
                  {showCheckbox && (
                    <td className='px-6 py-4'>
                      <input
                        type='checkbox'
                        checked={selectedRows.has(rowId)}
                        onChange={() => handleSelectRow(rowId)}
                        className='h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500'
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap ${
                        column.align === 'right'
                          ? 'text-right'
                          : column.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                      }`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function to get status icon
export const getStatusIcon = (status: string) => {
  if (status === 'Completed') {
    return <CompleteIcon />;
  }
  return <ProcessingIcon />;
};

// Helper function to get amount color
export const getAmountColor = (amountColor?: 'success' | 'error' | 'neutral') => {
  switch (amountColor) {
    case 'success':
      return 'var(--color-success-green)';
    case 'error':
      return 'var(--color-error-red)';
    default:
      return 'var(--color-gray-900)';
  }
};

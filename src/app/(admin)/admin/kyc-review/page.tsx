'use client';

import { useEffect, useState } from 'react';
import { XCircle, Eye, FileText, AlertCircle } from 'lucide-react';

interface KYCRecord {
  id: string;
  userId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
  notes: string[];
  client_profiles: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
  kyc_documents: {
    id: string;
    documentType: string;
    fileUrl: string;
    fileName: string;
  }[];
}

export default function KYCReviewPage() {
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchKYCRecords();
  }, []);

  async function fetchKYCRecords() {
    try {
      const response = await fetch('/api/admin/kyc/list');
      const data = await response.json();
      if (data.kycRecords) {
        setKycRecords(data.kycRecords);
      }
    } catch (error) {
      console.error('Error fetching KYC records:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateKYCStatus(id: string, status: string, notes: string[]) {
    if (!confirm(`Are you sure you want to mark this KYC as ${status}?`)) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/kyc/${id}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        await fetchKYCRecords();
        setSelectedRecord(null);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
      alert('Failed to update KYC status');
    } finally {
      setActionLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return configs[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className='p-8'>
      <div className='mb-8 flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900'>KYC Review</h1>
        <button
          onClick={fetchKYCRecords}
          className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
        >
          Refresh List
        </button>
      </div>

      {loading ? (
        <div className='py-12 text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-500'>Loading records...</p>
        </div>
      ) : kycRecords.length === 0 ? (
        <div className='rounded-lg border border-gray-200 bg-white py-12 text-center'>
          <FileText className='mx-auto mb-4 h-12 w-12 text-gray-400' />
          <h3 className='text-lg font-medium text-gray-900'>No Pending KYC Requests</h3>
          <p className='mt-2 text-gray-500'>
            All caught up! There are no KYC documents waiting for review.
          </p>
        </div>
      ) : (
        <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  User
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Company
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Submitted
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {kycRecords.map(record => (
                <tr key={record.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-500'>
                        {record.client_profiles?.first_name?.charAt(0) || '?'}
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {record.client_profiles?.first_name} {record.client_profiles?.last_name}
                        </div>
                        <div className='text-sm text-gray-500'>User ID: {record.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                    {record.client_profiles?.company_name || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold ${getStatusBadge(record.status)}`}
                    >
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                  <td className='space-x-3 px-6 py-4 text-sm font-medium whitespace-nowrap'>
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className='flex items-center gap-1 text-blue-600 hover:text-blue-900'
                    >
                      <Eye className='h-4 w-4' /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Review Modal */}
      {selectedRecord && (
        <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4'>
          <div className='flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-2xl'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>Review KYC Documents</h2>
                <p className='text-sm text-gray-500'>
                  {selectedRecord.client_profiles?.first_name}{' '}
                  {selectedRecord.client_profiles?.last_name} •{' '}
                  {selectedRecord.client_profiles?.company_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className='text-gray-400 hover:text-gray-500'
              >
                <XCircle className='h-6 w-6' />
              </button>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {selectedRecord.kyc_documents?.map(doc => (
                  <div key={doc.id} className='overflow-hidden rounded-lg border border-gray-200'>
                    <div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 capitalize'>
                      {doc.documentType.replace('_', ' ')}
                      <a
                        href={doc.fileUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs text-blue-600 hover:text-blue-800'
                      >
                        Open Original
                      </a>
                    </div>
                    <div className='relative flex aspect-[3/4] items-center justify-center bg-gray-100'>
                      {doc.fileName.toLowerCase().endsWith('.pdf') ? (
                        <div className='p-4 text-center'>
                          <FileText className='mx-auto mb-2 h-16 w-16 text-gray-400' />
                          <p className='text-sm break-all text-gray-500'>{doc.fileName}</p>
                          <a
                            href={doc.fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='mt-4 inline-block rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
                          >
                            View PDF
                          </a>
                        </div>
                      ) : (
                        <div className='relative h-full w-full'>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={doc.fileUrl}
                            alt={doc.documentType}
                            className='h-full w-full object-contain'
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(!selectedRecord.kyc_documents || selectedRecord.kyc_documents.length === 0) && (
                <div className='rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center'>
                  <AlertCircle className='mx-auto mb-2 h-12 w-12 text-gray-400' />
                  <p className='text-gray-500'>No documents uploaded for this record.</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className='flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4'>
              <div className='text-sm text-gray-500'>
                Status:{' '}
                <span
                  className={`font-medium ${getStatusBadge(selectedRecord.status)} rounded-full px-2 py-0.5`}
                >
                  {selectedRecord.status}
                </span>
              </div>

              <div className='flex space-x-3'>
                {selectedRecord.status !== 'approved' && (
                  <>
                    <button
                      onClick={() => {
                        const reason = prompt('Please enter a reason for rejection:');
                        if (reason) updateKYCStatus(selectedRecord.id, 'rejected', [reason]);
                      }}
                      disabled={actionLoading}
                      className='rounded-md border border-red-300 bg-white px-4 py-2 text-red-700 hover:bg-red-50 disabled:opacity-50'
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateKYCStatus(selectedRecord.id, 'approved', [])}
                      disabled={actionLoading}
                      className='rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50'
                    >
                      {actionLoading ? 'Processing...' : 'Approve KYC'}
                    </button>
                  </>
                )}
                {selectedRecord.status === 'approved' && (
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className='rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300'
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

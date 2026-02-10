'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { instance } from '../../../../../../hooks/api';
import { useAdminGuideLevelDetail } from '../../../../../../hooks/guides';

const MAIN_COLOR = '#A60E07';

const AdminMainPdfPage = () => {
  const { courseId, levelId } = useParams();
  const router = useRouter();

  const { data, isLoading } = useAdminGuideLevelDetail(levelId);
  const mainPdf = data?.main_pdf || null;
  const fileUrl = useMemo(
    () => mainPdf?.protected_file_url || `/api/admin/guides/levels/${levelId}/main-pdf/file`,
    [mainPdf, levelId]
  );

  const [pdfUrl, setPdfUrl] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);

  useEffect(() => {
    const onContextMenu = (e) => e.preventDefault();
    const onKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === 'U')
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const loadPdf = async () => {
      if (!fileUrl) return;
      setLoadingPdf(true);
      try {
        const response = await instance.get(fileUrl, { responseType: 'blob' });
        if (!active) return;
        objectUrl = URL.createObjectURL(response.data);
        setPdfUrl(objectUrl);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load main PDF');
      } finally {
        if (active) setLoadingPdf(false);
      }
    };

    loadPdf();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileUrl]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFullScreenMode(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-12 px-3 sm:px-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/admin/guide/${courseId}/${levelId}`)} className="rounded-md bg-gray-100 hover:bg-gray-200 p-2">
            <ArrowLeftIcon className="h-4 w-4 text-gray-700" />
          </button>
          <h1 className="text-sm font-semibold text-gray-800">Main PDF preview</h1>
        </div>
        <button
          onClick={() => setIsFullScreenMode(true)}
          className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 sm:px-3"
        >
          <ArrowsPointingOutIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Full screen</span>
        </button>
      </div>

      <div className="h-[calc(100vh-48px)] overflow-auto p-4 sm:p-6 md:p-8">
        {isLoading || loadingPdf ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: MAIN_COLOR }} />
              <p className="text-gray-600 mt-3">PDF is loading...</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-5xl bg-white shadow-xl rounded-sm overflow-hidden">
            <iframe title="Main PDF" src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="w-full h-[calc(100vh-180px)] sm:h-[calc(100vh-120px)]" />
          </div>
        )}
      </div>

      {isFullScreenMode ? (
        <div className="fixed inset-0 z-[9999] bg-[#0f172a]">
          <div className="h-12 border-b border-white/10 px-3 sm:px-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Main PDF - Full screen</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreenMode(false)}
                className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
              >
                <ArrowsPointingInIcon className="h-4 w-4" />
                Exit
              </button>
              <button onClick={() => setIsFullScreenMode(false)} className="rounded-md bg-white/10 p-2 text-white hover:bg-white/20">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="h-[calc(100vh-48px)] bg-[#0b1220]">
            <iframe title="Main PDF Full Screen" src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="h-full w-full" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminMainPdfPage;

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowUpTrayIcon, ArrowLeftIcon, DocumentIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { instance } from '../../../../../../../hooks/api';
import {
  useAdminDeleteLessonPdf,
  useAdminGuideLessonDetail,
  useAdminUpdateLessonPdf,
  useAdminUploadLessonPdf,
} from '../../../../../../../hooks/guides';

const MAIN_COLOR = '#A60E07';

const stripExtension = (name = '') => name.replace(/\.[^/.]+$/, '').trim();

const AdminGuideLessonPage = () => {
  const { courseId, levelId, lessonId } = useParams();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const { data, isLoading, error } = useAdminGuideLessonDetail(lessonId);
  const uploadPdfMutation = useAdminUploadLessonPdf();
  const updatePdfMutation = useAdminUpdateLessonPdf();
  const deletePdfMutation = useAdminDeleteLessonPdf();

  const lesson = data?.lesson || null;
  const pdfs = useMemo(() => (Array.isArray(data?.pdfs) ? data.pdfs : []), [data]);

  const [previews, setPreviews] = useState({});
  const [renameModal, setRenameModal] = useState({ open: false, pdfId: null, title: '', file: null });

  // Har bir hujjatning birinchi sahifasini muqova sifatida yuklab olamiz
  useEffect(() => {
    let active = true;
    const objectUrls = [];

    const loadPreviews = async () => {
      if (!pdfs.length) {
        setPreviews({});
        return;
      }
      const entries = await Promise.all(
        pdfs.map(async (pdf) => {
          const url = pdf.protected_file_url || `/api/admin/guides/lessons/${lessonId}/pdfs/${pdf.id}/file`;
          try {
            const response = await instance.get(url, { responseType: 'blob' });
            const objectUrl = URL.createObjectURL(response.data);
            objectUrls.push(objectUrl);
            return [pdf.id, objectUrl];
          } catch {
            return [pdf.id, ''];
          }
        })
      );
      if (active) setPreviews(Object.fromEntries(entries));
    };

    loadPreviews();
    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pdfs, lessonId]);

  const handleUpload = async (file) => {
    if (!file) return;
    try {
      await uploadPdfMutation.mutateAsync({
        lessonId,
        title: stripExtension(file.name) || 'Hujjat',
        file,
      });
      toast.success('Hujjat yuklandi');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Hujjat yuklashda xatolik');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRename = async () => {
    const title = String(renameModal.title || '').trim();
    if (!title) {
      toast.error('Hujjat nomini kiriting');
      return;
    }
    try {
      await updatePdfMutation.mutateAsync({
        lessonId,
        pdfId: renameModal.pdfId,
        title,
        file: renameModal.file || undefined,
      });
      toast.success('Hujjat yangilandi');
      setRenameModal({ open: false, pdfId: null, title: '', file: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Hujjatni yangilashda xatolik');
    }
  };

  const handleDelete = async (pdfId) => {
    if (!window.confirm('Ushbu hujjatni o‘chirmoqchimisiz?')) return;
    try {
      await deletePdfMutation.mutateAsync({ lessonId, pdfId });
      toast.success('Hujjat o‘chirildi');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Hujjatni o‘chirishda xatolik');
    }
  };

  const openPdf = (pdfId) => {
    const url = previews[pdfId];
    if (!url) {
      toast.error('Hujjat hali yuklanmoqda...');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="py-10 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2" style={{ borderColor: MAIN_COLOR }} />
          <p className="mt-3 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Xatolik</p>
          <p className="text-sm">Dars ma&apos;lumotlarini yuklab bo&apos;lmadi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => router.push(`/admin/guide/${courseId}/${levelId}`)} className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200">
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </button>
            <div className="min-w-0">
              <h1 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">{lesson.topic_name || lesson.title}</h1>
              <p className="text-sm text-gray-600">{lesson.level_title}</p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadPdfMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-50"
            style={{ backgroundColor: MAIN_COLOR }}
            type="button"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            {uploadPdfMutation.isPending ? 'Yuklanmoqda...' : 'Hujjat yuklash'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => handleUpload(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>

        {pdfs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-10 text-center">
            <DocumentIcon className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-3 text-sm text-gray-600">Hali hujjat yuklanmagan</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
            {pdfs.map((pdf) => (
              <div key={pdf.id} className="group rounded-2xl border border-gray-100 bg-white p-3 shadow-md">
                <button
                  type="button"
                  onClick={() => openPdf(pdf.id)}
                  className="relative block h-64 w-48 overflow-hidden rounded-l-md rounded-r-xl bg-white transition-transform duration-200 hover:-translate-y-1"
                  style={{ borderLeft: `10px solid ${MAIN_COLOR}` }}
                  title="Ochish"
                >
                  {previews[pdf.id] ? (
                    <iframe
                      title={pdf.title || 'Hujjat'}
                      src={`${previews[pdf.id]}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=page-width&page=1`}
                      className="pointer-events-none absolute inset-0 h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2" style={{ borderColor: MAIN_COLOR }} />
                    </div>
                  )}
                  <span className="pointer-events-none absolute left-0 top-0 h-full w-2 bg-white/30" />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                    <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800">Ochish</span>
                  </span>
                </button>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900" title={pdf.title}>
                    {pdf.title || 'Hujjat'}
                  </p>
                  <button
                    onClick={() => setRenameModal({ open: true, pdfId: pdf.id, title: pdf.title || '', file: null })}
                    className="shrink-0 rounded-lg bg-gray-100 p-1.5 text-gray-700 hover:bg-gray-200"
                    title="Tahrirlash"
                    type="button"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pdf.id)}
                    className="shrink-0 rounded-lg bg-red-50 p-1.5 text-red-700 hover:bg-red-100"
                    title="O'chirish"
                    type="button"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {renameModal.open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setRenameModal({ open: false, pdfId: null, title: '', file: null })}
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Hujjatni tahrirlash</h3>
              <button onClick={() => setRenameModal({ open: false, pdfId: null, title: '', file: null })} className="rounded-md p-1 hover:bg-gray-100" type="button">
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Hujjat nomi</label>
            <input
              value={renameModal.title}
              onChange={(e) => setRenameModal((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
              placeholder="Hujjat nomi"
              autoFocus
            />

            <label className="mb-1 mt-4 block text-sm font-medium text-gray-700">Faylni almashtirish (ixtiyoriy)</label>
            {renameModal.file ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
                <p className="line-clamp-1 text-sm font-semibold text-gray-700">{renameModal.file.name}</p>
                <button
                  onClick={() => setRenameModal((p) => ({ ...p, file: null }))}
                  className="shrink-0 rounded-full bg-red-500 p-1 text-white"
                  type="button"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#A60E07]/40 bg-white px-4 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setRenameModal((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                  className="hidden"
                />
                <ArrowUpTrayIcon className="h-5 w-5 text-gray-400" />
                Yangi PDF tanlash
              </label>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setRenameModal({ open: false, pdfId: null, title: '', file: null })}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
                type="button"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleRename}
                disabled={updatePdfMutation.isPending}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: MAIN_COLOR }}
                type="button"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminGuideLessonPage;

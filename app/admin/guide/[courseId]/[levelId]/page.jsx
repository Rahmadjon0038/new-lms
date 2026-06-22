'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowUpTrayIcon, ArrowLeftIcon, DocumentIcon, PencilSquareIcon, PlusCircleIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import {
  useAdminCreateLesson,
  useAdminDeleteLesson,
  useAdminDeleteMainPdf,
  useAdminGuideLevelDetail,
  useAdminReorderLessons,
  useAdminUpdateLesson,
  useAdminUploadMainPdf,
} from '../../../../../hooks/guides';
import { instance } from '../../../../../hooks/api';

const MAIN_COLOR = '#A60E07';

const Modal = ({ isOpen, title, onClose, children, onSave, loading }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {children}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Bekor qilish
          </button>
          <button disabled={loading} onClick={onSave} className="rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminGuideLevelPage = () => {
  const { courseId, levelId } = useParams();
  const router = useRouter();

  const { data, isLoading, error } = useAdminGuideLevelDetail(levelId);

  const uploadMainPdfMutation = useAdminUploadMainPdf();
  const deleteMainPdfMutation = useAdminDeleteMainPdf();
  const createLessonMutation = useAdminCreateLesson();
  const updateLessonMutation = useAdminUpdateLesson();
  const deleteLessonMutation = useAdminDeleteLesson();
  const reorderLessonsMutation = useAdminReorderLessons();

  const level = data?.level || data || null;
  const mainPdf = data?.main_pdf || null;
  const lessons = useMemo(() => (Array.isArray(data?.lessons) ? data.lessons : []), [data]);

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [lessonCreateModal, setLessonCreateModal] = useState(false);
  const [lessonEditModal, setLessonEditModal] = useState({ open: false, lessonId: null });
  const [localLessons, setLocalLessons] = useState([]);
  const [draggingLessonId, setDraggingLessonId] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');

  const [pdfForm, setPdfForm] = useState({ file: null });
  const [lessonForm, setLessonForm] = useState({ topic_name: '' });
  const [editForm, setEditForm] = useState({ topic_name: '' });

  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  // Asosiy PDF muqovasi uchun birinchi sahifani yuklab olamiz (himoyalangan stream)
  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const loadPreview = async () => {
      if (!mainPdf) {
        setPdfPreviewUrl('');
        return;
      }
      const url = mainPdf.protected_file_url || `/api/admin/guides/levels/${levelId}/main-pdf/file`;
      try {
        const response = await instance.get(url, { responseType: 'blob' });
        if (!active) return;
        objectUrl = URL.createObjectURL(response.data);
        setPdfPreviewUrl(objectUrl);
      } catch {
        if (active) setPdfPreviewUrl('');
      }
    };

    loadPreview();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mainPdf, levelId]);

  const hasOrderChanged = useMemo(() => {
    if (localLessons.length !== lessons.length) return true;
    return localLessons.some((lesson, idx) => lesson.id !== lessons[idx]?.id);
  }, [localLessons, lessons]);

  const openEditLessonModal = (lesson) => {
    setEditForm({ topic_name: lesson.topic_name || lesson.title || '' });
    setLessonEditModal({ open: true, lessonId: lesson.id });
  };

  const handleDragStart = (lessonId) => {
    setDraggingLessonId(lessonId);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (targetLessonId) => {
    if (!draggingLessonId || draggingLessonId === targetLessonId) return;
    const fromIndex = localLessons.findIndex((lesson) => lesson.id === draggingLessonId);
    const toIndex = localLessons.findIndex((lesson) => lesson.id === targetLessonId);
    if (fromIndex < 0 || toIndex < 0) return;

    const reordered = [...localLessons];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setLocalLessons(reordered);
    setDraggingLessonId(null);
  };

  const handleSaveOrder = async () => {
    if (!hasOrderChanged) return;
    try {
      const payload = localLessons.map((lesson, idx) => ({
        id: lesson.id,
        order_index: idx + 1,
      }));
      await reorderLessonsMutation.mutateAsync({ levelId, lessons: payload });
      toast.success('Darslar tartibi saqlandi');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Tartibni saqlashda xatolik');
    }
  };

  const handleSaveMainPdf = async () => {
    if (!pdfForm.file) {
      toast.error('Iltimos, PDF tanlang');
      return;
    }

    try {
      await uploadMainPdfMutation.mutateAsync({ levelId, file: pdfForm.file });
      toast.success('Asosiy PDF yuklandi');
      setPdfForm({ file: null });
      setPdfModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'PDF yuklashda xatolik');
    }
  };

  const handleDeleteMainPdf = async () => {
    if (!window.confirm('Asosiy PDFni o‘chirmoqchimisiz?')) return;

    try {
      await deleteMainPdfMutation.mutateAsync(levelId);
      toast.success('Asosiy PDF o‘chirildi');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'PDFni o‘chirishda xatolik');
    }
  };

  const handleCreateLesson = async () => {
    if (!lessonForm.topic_name.trim()) {
      toast.error('Mavzu nomini kiriting');
      return;
    }

    try {
      await createLessonMutation.mutateAsync({
        levelId,
        topic_name: lessonForm.topic_name.trim(),
      });
      toast.success('Dars qo‘shildi');
      setLessonForm({ topic_name: '' });
      setLessonCreateModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Dars qo‘shishda xatolik');
    }
  };

  const handleUpdateLesson = async () => {
    if (!editForm.topic_name.trim()) {
      toast.error('Mavzu nomini kiriting');
      return;
    }

    try {
      await updateLessonMutation.mutateAsync({
        levelId,
        lessonId: lessonEditModal.lessonId,
        topic_name: editForm.topic_name.trim(),
      });
      toast.success('Dars yangilandi');
      setLessonEditModal({ open: false, lessonId: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Darsni yangilashda xatolik');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Ushbu darsni o‘chirmoqchimisiz?')) return;

    try {
      await deleteLessonMutation.mutateAsync({ lessonId, levelId });
      toast.success('Dars o‘chirildi');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Darsni o‘chirishda xatolik');
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Xatolik</p>
          <p className="text-sm">Daraja ma&apos;lumotlarini yuklab bo&apos;lmadi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-6 flex items-start gap-3">
        <button onClick={() => router.push('/admin/guide')} className="rounded-xl bg-white p-2 shadow">
          <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
        </button>
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-slate-900 md:text-3xl">{level?.title || 'Daraja'}</h1>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-md sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Asosiy qo&apos;llanma (PDF)</h2>
        </div>

        {mainPdf ? (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
            {/* Kitob ko'rinishidagi karta — birinchi sahifa muqova sifatida */}
            <button
              type="button"
              onClick={() => router.push(`/admin/guide/${courseId}/${levelId}/main-pdf`)}
              className="group relative block h-64 w-48 shrink-0 overflow-hidden rounded-l-md rounded-r-xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:-translate-y-1"
              style={{ borderLeft: `10px solid ${MAIN_COLOR}` }}
              title="Ochish"
            >
              {pdfPreviewUrl ? (
                <iframe
                  title="PDF muqova"
                  src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=page-width&page=1`}
                  className="pointer-events-none absolute inset-0 h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2" style={{ borderColor: MAIN_COLOR }} />
                </div>
              )}
              {/* kitob jildidagi yorug'lik chizig'i */}
              <span className="pointer-events-none absolute left-0 top-0 h-full w-2 bg-white/30" />
              {/* hover overlay */}
              <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800">Ochish</span>
              </span>
            </button>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{mainPdf.file_name || 'Asosiy PDF'}</h3>
              <p className="text-sm text-slate-600">PDF yuklangan</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <button
                  onClick={() => setPdfModalOpen(true)}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200"
                  title="Tahrirlash"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button onClick={handleDeleteMainPdf} className="rounded-lg bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
            <p className="mb-3 text-sm text-gray-600">Asosiy PDF hali yuklanmagan</p>
            <button onClick={() => setPdfModalOpen(true)} className="rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white">
              PDF yuklash
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-md sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Darslar ro&apos;yxati</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveOrder}
              disabled={!hasOrderChanged || reorderLessonsMutation.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tartibni saqlash
            </button>
            <button
              onClick={() => setLessonCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Dars qo&apos;shish
            </button>
          </div>
        </div>

        <p className="mb-3 text-xs text-gray-500">Darslarni tartiblash uchun sudrab joylashtiring, so&apos;ng &quot;Tartibni saqlash&quot; tugmasini bosing.</p>

        {localLessons.length === 0 ? <p className="text-sm text-gray-500">Dars topilmadi.</p> : null}

        <div className="space-y-3">
          {localLessons.map((lesson, idx) => (
            <Link
              href={`/admin/guide/${courseId}/${levelId}/lesson/${lesson.id}`}
              key={lesson.id}
              draggable
              onDragStart={() => handleDragStart(lesson.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(lesson.id)}
              onDragEnd={() => setDraggingLessonId(null)}
              className={`block rounded-lg border p-4 ${
                draggingLessonId === lesson.id ? 'border-[#A60E07] bg-red-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A60E07] text-sm font-bold text-white">{idx + 1}</div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{lesson.title}</h3>
                    <p className="truncate text-sm text-slate-600">{lesson.topic_name || lesson.title}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openEditLessonModal(lesson);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Tahrirlash
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteLesson(lesson.id);
                    }}
                    className="rounded-lg bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Modal
        isOpen={pdfModalOpen}
        title="Asosiy PDF yuklash"
        onClose={() => setPdfModalOpen(false)}
        onSave={handleSaveMainPdf}
        loading={uploadMainPdfMutation.isPending}
      >
        <div className="space-y-3">
          {pdfForm.file ? (
            <div className="relative flex h-28 items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 px-4">
              <button
                onClick={() => setPdfForm((p) => ({ ...p, file: null }))}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
              <DocumentIcon className="h-8 w-8 text-red-600" />
              <p className="line-clamp-2 text-sm font-semibold text-gray-700">{pdfForm.file.name}</p>
            </div>
          ) : (
            <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#A60E07]/40 bg-white text-gray-600 hover:bg-gray-50">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                className="hidden"
              />
              <ArrowUpTrayIcon className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-semibold">PDF yuklash</p>
            </label>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={lessonCreateModal}
        title="Yangi dars qo'shish"
        onClose={() => setLessonCreateModal(false)}
        onSave={handleCreateLesson}
        loading={createLessonMutation.isPending}
      >
        <div className="space-y-3">
          <input
            value={lessonForm.topic_name}
            onChange={(e) => setLessonForm((prev) => ({ ...prev, topic_name: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Mavzu nomi"
          />
        </div>
      </Modal>

      <Modal
        isOpen={lessonEditModal.open}
        title="Darsni tahrirlash"
        onClose={() => setLessonEditModal({ open: false, lessonId: null })}
        onSave={handleUpdateLesson}
        loading={updateLessonMutation.isPending}
      >
        <div className="space-y-3">
          <input
            value={editForm.topic_name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, topic_name: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Mavzu nomi"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminGuideLevelPage;

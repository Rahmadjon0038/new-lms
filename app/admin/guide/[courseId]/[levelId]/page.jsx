'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, DocumentIcon, EyeIcon, PencilSquareIcon, PlusCircleIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
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

const MAIN_COLOR = '#A60E07';

const Modal = ({ isOpen, title, onClose, children, onSave, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {children}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Cancel
          </button>
          <button disabled={loading} onClick={onSave} className="rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Save
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

  const [pdfForm, setPdfForm] = useState({ file: null });
  const [lessonForm, setLessonForm] = useState({ topic_name: '' });
  const [editForm, setEditForm] = useState({ topic_name: '' });

  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

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
      toast.success('Lesson order saved');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save lesson order');
    }
  };

  const handleSaveMainPdf = async () => {
    if (!pdfForm.file) {
      toast.error('Please select a PDF');
      return;
    }

    try {
      await uploadMainPdfMutation.mutateAsync({ levelId, file: pdfForm.file });
      toast.success('Main PDF uploaded');
      setPdfForm({ file: null });
      setPdfModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload main PDF');
    }
  };

  const handleDeleteMainPdf = async () => {
    if (!window.confirm('Are you sure you want to delete the main PDF?')) return;

    try {
      await deleteMainPdfMutation.mutateAsync(levelId);
      toast.success('Main PDF deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete main PDF');
    }
  };

  const handleCreateLesson = async () => {
    if (!lessonForm.topic_name.trim()) {
      toast.error('Topic name is required');
      return;
    }

    try {
      await createLessonMutation.mutateAsync({
        levelId,
        topic_name: lessonForm.topic_name.trim(),
      });
      toast.success('Lesson added');
      setLessonForm({ topic_name: '' });
      setLessonCreateModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add lesson');
    }
  };

  const handleUpdateLesson = async () => {
    if (!editForm.topic_name.trim()) {
      toast.error('Topic name is required');
      return;
    }

    try {
      await updateLessonMutation.mutateAsync({
        levelId,
        lessonId: lessonEditModal.lessonId,
        topic_name: editForm.topic_name.trim(),
      });
      toast.success('Lesson updated');
      setLessonEditModal({ open: false, lessonId: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await deleteLessonMutation.mutateAsync({ lessonId, levelId });
      toast.success('Lesson deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete lesson');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: MAIN_COLOR }} />
          <p className="text-gray-600 mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-semibold">Error</p>
          <p className="text-sm">Failed to load level details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push('/admin/guide')} className="rounded-xl bg-white p-2 shadow">
          <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{level?.title || 'Level'}</h1>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-white p-4 sm:p-5 shadow-md border border-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Main PDF guide</h2>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${mainPdf ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {mainPdf ? 'PDF available' : 'PDF missing'}
          </span>
        </div>

        <div className="rounded-lg border-2 border-dashed border-gray-200 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="rounded-lg bg-red-100 p-3">
                <DocumentIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">{mainPdf?.file_name || `${level?.title || 'Level'} - Main guide`}</h3>
                <p className="text-sm text-slate-600">{mainPdf ? 'PDF uploaded' : 'Main PDF not uploaded yet'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {mainPdf ? (
                <>
                  <Link
                    href={`/admin/guide/${courseId}/${levelId}/main-pdf`}
                    className="rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Open
                  </Link>
                  <button onClick={handleDeleteMainPdf} className="rounded-lg bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button onClick={() => setPdfModalOpen(true)} className="rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white">
                  Upload
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 sm:p-5 shadow-md border border-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Lesson list</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveOrder}
              disabled={!hasOrderChanged || reorderLessonsMutation.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save order
            </button>
            <button
              onClick={() => setLessonCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Add lesson
            </button>
          </div>
        </div>

        <p className="mb-3 text-xs text-gray-500">Drag and drop lessons to reorder them, then click &quot;Save order&quot;.</p>

        {localLessons.length === 0 ? <p className="text-sm text-gray-500">Lesson topilmadi.</p> : null}

        <div className="space-y-3">
          {localLessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              draggable
              onDragStart={() => handleDragStart(lesson.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(lesson.id)}
              onDragEnd={() => setDraggingLessonId(null)}
              className={`rounded-lg border p-4 ${
                draggingLessonId === lesson.id ? 'border-[#A60E07] bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A60E07] text-sm font-bold text-white">{idx + 1}</div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">{lesson.title}</h3>
                    <p className="text-sm text-slate-600 truncate">{lesson.topic_name || lesson.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => openEditLessonModal(lesson)} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button onClick={() => handleDeleteLesson(lesson.id)} className="rounded-lg bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  <Link
                    href={`/admin/guide/${courseId}/${levelId}/lesson/${lesson.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={pdfModalOpen}
        title="Upload main PDF"
        onClose={() => setPdfModalOpen(false)}
        onSave={handleSaveMainPdf}
        loading={uploadMainPdfMutation.isPending}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfForm({ file: e.target.files?.[0] || null })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </Modal>

      <Modal
        isOpen={lessonCreateModal}
        title="Add new lesson"
        onClose={() => setLessonCreateModal(false)}
        onSave={handleCreateLesson}
        loading={createLessonMutation.isPending}
      >
        <div className="space-y-3">
          <input
            value={lessonForm.topic_name}
            onChange={(e) => setLessonForm((prev) => ({ ...prev, topic_name: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Topic name"
          />
        </div>
      </Modal>

      <Modal
        isOpen={lessonEditModal.open}
        title="Update lesson"
        onClose={() => setLessonEditModal({ open: false, lessonId: null })}
        onSave={handleUpdateLesson}
        loading={updateLessonMutation.isPending}
      >
        <div className="space-y-3">
          <input
            value={editForm.topic_name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, topic_name: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Topic name"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminGuideLevelPage;

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { instance } from '../../../../../../../hooks/api';
import { useTeacherGuideLessonDetail } from '../../../../../../../hooks/guides';

const MAIN_COLOR = '#A60E07';

const toList = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const direct = [
      ...(Array.isArray(value.global) ? value.global : []),
      ...(Array.isArray(value.private) ? value.private : []),
    ];
    if (direct.length > 0) return direct;
  }
  return [];
};

const TeacherGuideLessonPage = () => {
  const { courseId, levelId, lessonId } = useParams();
  const router = useRouter();
  const { data, isLoading, error } = useTeacherGuideLessonDetail(lessonId);

  const lesson = data?.lesson || null;
  const pdfs = useMemo(() => toList(data?.pdfs), [data]);

  const [previews, setPreviews] = useState({});

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
          const url = pdf.protected_file_url || `/api/teacher/guides/lessons/${lessonId}/pdfs/${pdf.id}/file`;
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
        <div className="mb-6 flex min-w-0 items-center gap-3">
          <button onClick={() => router.push(`/teacher/guide/${courseId}/${levelId}`)} className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200">
            <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">{lesson.topic_name || lesson.title}</h1>
            <p className="text-sm text-gray-600">{lesson.level_title}</p>
          </div>
        </div>

        {pdfs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-10 text-center">
            <DocumentIcon className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-3 text-sm text-gray-600">Hujjat mavjud emas</p>
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

                <p className="mt-3 w-48 truncate text-center text-sm font-semibold text-slate-900" title={pdf.title}>
                  {pdf.title || 'Hujjat'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherGuideLessonPage;

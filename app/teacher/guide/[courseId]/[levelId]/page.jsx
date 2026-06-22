'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, ArrowRightIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { instance } from '../../../../../hooks/api';
import { useTeacherGuideLevelDetail, useTeacherGuideLevelLessons } from '../../../../../hooks/guides';

const MAIN_COLOR = '#A60E07';

const TeacherGuideLevelPage = () => {
  const { levelId, courseId } = useParams();
  const router = useRouter();

  const { data, isLoading, error } = useTeacherGuideLevelDetail(levelId);
  const { data: lessons = [], isLoading: lessonsLoading } = useTeacherGuideLevelLessons(levelId);

  const level = data?.level || data || null;
  const mainPdf = data?.main_pdf || null;
  const lessonList = lessons.length > 0 ? lessons : Array.isArray(data?.lessons) ? data.lessons : [];

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');

  // Asosiy PDF muqovasi (birinchi sahifa)
  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const loadPreview = async () => {
      if (!mainPdf) {
        setPdfPreviewUrl('');
        return;
      }
      const url = mainPdf.protected_file_url || `/api/teacher/guides/levels/${levelId}/main-pdf/file`;
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

  if (isLoading || lessonsLoading) {
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
        <button onClick={() => router.push('/teacher/guide')} className="rounded-xl bg-white p-2 shadow">
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
            <button
              type="button"
              onClick={() => router.push(`/teacher/guide/${courseId}/${levelId}/main-pdf`)}
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
              <span className="pointer-events-none absolute left-0 top-0 h-full w-2 bg-white/30" />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800">Ochish</span>
              </span>
            </button>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{mainPdf.file_name || 'Asosiy PDF'}</h3>
              <p className="text-sm text-slate-600">PDF mavjud</p>
              <Link
                href={`/teacher/guide/${courseId}/${levelId}/main-pdf`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Ochish
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
            <DocumentIcon className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-3 text-sm text-gray-600">Asosiy PDF hali yuklanmagan</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-md sm:p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 sm:text-xl">Darslar ro&apos;yxati</h2>

        {lessonList.length === 0 ? <p className="text-sm text-gray-500">Dars topilmadi.</p> : null}

        <div className="space-y-3">
          {lessonList.map((lesson, idx) => (
            <Link
              href={`/teacher/guide/${courseId}/${levelId}/lesson/${lesson.id}`}
              key={lesson.id}
              className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A60E07] text-sm font-bold text-white">{idx + 1}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{lesson.title}</h3>
                  <p className="truncate text-sm text-slate-600">{lesson.topic_name || lesson.title}</p>
                </div>
                <ArrowRightIcon className="h-5 w-5 shrink-0 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherGuideLevelPage;

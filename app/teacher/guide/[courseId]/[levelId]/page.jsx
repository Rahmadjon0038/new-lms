'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, DocumentIcon, EyeIcon } from '@heroicons/react/24/outline';
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

  if (isLoading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: MAIN_COLOR }} />
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-semibold">Error</p>
          <p className="text-sm">Failed to load level information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3 md:p-4">
      <div>
        <div className="mb-4 flex items-start gap-2 sm:mb-5 sm:gap-3">
          <button onClick={() => router.push('/teacher/guide')} className="rounded-lg bg-white p-2 shadow-sm transition-all hover:shadow-md">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>

          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">{level?.title || 'Level'}</h1>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-white p-4 shadow-md sm:mb-5 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Main PDF guide</h2>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${mainPdf ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {mainPdf ? 'PDF available' : 'PDF missing'}
            </span>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border-2 border-dashed border-gray-200 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <DocumentIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{mainPdf?.file_name || `${level?.title || 'Level'} - Main guide`}</h3>
              <p className="text-sm text-gray-600">
                {mainPdf ? 'Click to open the PDF guide' : 'Main PDF has not been uploaded for this level'}
              </p>
            </div>

            {mainPdf ? (
              <Link
                href={`/teacher/guide/${courseId}/${levelId}/main-pdf`}
                className="bg-[#A60E07] hover:bg-[#8b0c06] text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
              >
                Open
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-md sm:p-5">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">Lesson list</h2>

          {lessonList.length > 0 ? (
            <div className="space-y-2.5 sm:space-y-3">
              {lessonList.map((lesson, index) => (
                <div key={lesson.id} className="rounded-lg border border-gray-200 p-3 transition-colors hover:border-[#A60E07] sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="bg-[#A60E07] text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{lesson.topic_name || lesson.title || `Lesson ${index + 1}`}</h3>
                      </div>
                    </div>

                    <Link
                      href={`/teacher/guide/${courseId}/${levelId}/lesson/${lesson.id}`}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 sm:w-auto"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center sm:py-12">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 sm:mb-4 sm:h-16 sm:w-16">
                <DocumentIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons available</h3>
              <p className="text-gray-500">No lessons have been added for this level yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherGuideLevelPage;

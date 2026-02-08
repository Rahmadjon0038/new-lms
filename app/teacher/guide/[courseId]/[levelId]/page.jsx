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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: MAIN_COLOR }} />
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-semibold">Error</p>
          <p className="text-sm">Failed to load level information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push('/teacher/guide')} className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{level?.title || 'Level'}</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Main PDF guide</h2>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${mainPdf ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {mainPdf ? 'PDF available' : 'PDF missing'}
            </span>
          </div>

          <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-lg">
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
                className="bg-[#A60E07] hover:bg-[#8b0c06] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Open
              </Link>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lesson list</h2>

          {lessonList.length > 0 ? (
            <div className="space-y-3">
              {lessonList.map((lesson, index) => (
                <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#A60E07] transition-colors">
                  <div className="flex items-center justify-between gap-3">
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
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
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

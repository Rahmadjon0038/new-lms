'use client';

import React from 'react';
import Link from 'next/link';
import { AcademicCapIcon, ArrowRightIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useTeacherGuideLevels } from '../../../hooks/guides';

const MAIN_COLOR = '#A60E07';

const TeacherGuidePage = () => {
  const { data: levels = [], isLoading, error } = useTeacherGuideLevels();

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Study Guides</h1>
          <p className="text-gray-600">Choose the level you need and explore the lesson plans</p>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: MAIN_COLOR }} />
            <p className="text-gray-600 mt-3">Loading...</p>
          </div>
        ) : null}

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">Failed to load level information.</p>
          </div>
        ) : null}

        {!isLoading && !error ? (
          levels.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <p className="text-gray-600">No levels found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {levels.map((level) => (
                <div
                  key={level.id}
                  className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-t-4 border-[#A60E07] transition duration-150 hover:shadow-xl flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-6 w-6 sm:h-7 sm:w-7 text-[#A60E07] mr-2" />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">{level.title}</h3>
                      </div>

                      {level.has_main_pdf ? (
                        <span className="px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-green-100 text-green-700 shrink-0">
                          PDF available
                        </span>
                      ) : null}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 leading-relaxed min-h-12">{level.description}</p>

                    {(level.lesson_count || 0) > 0 ? (
                      <div className="mb-4 flex items-center border-b border-gray-100 pb-4 text-sm text-gray-700">
                        <BookOpenIcon className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-[#A60E07]">{level.lesson_count} lessons</span>
                      </div>
                    ) : null}
                  </div>

                  <Link
                    href={`/teacher/guide/${level.course_id || level.courseId || 1}/${level.id}`}
                    className="flex items-center justify-center w-full py-3 rounded-lg font-bold text-white bg-[#A60E07] hover:bg-[#8b0c06] active:scale-[0.98] transition-all duration-150 shadow-md text-sm sm:text-base"
                  >
                    View lessons
                    <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                  </Link>
                </div>
              ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default TeacherGuidePage;

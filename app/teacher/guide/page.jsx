'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpenIcon,
  ArrowRightIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const mockCourseData = {
  1: {
    id: 1,
    name: "English Language",
    levels: [
      {
        id: 1,
        name: "Beginner (A1)",
        description: "Ingliz tilining asoslari - harflar, tovushlar va eng oddiy kundalik so'zlar.",
        lesson_count: 32,
        difficulty: "Boshlang'ich",
        color: "bg-emerald-500"
      },
      {
        id: 2,
        name: "Elementary (A2)", 
        description: "Kundalik muloqot va oddiy grammatik strukturalarni tushunish va qo'llash.",
        lesson_count: 28,
        difficulty: "Boshlang'ich+",
        color: "bg-blue-500"
      },
      {
        id: 3,
        name: "Pre-Intermediate (B1)",
        description: "Sayohat va ish faoliyatida erkinroq muloqot qilish ko'nikmalari.",
        lesson_count: 30,
        difficulty: "O'rta",
        color: "bg-orange-500"
      },
      {
        id: 4,
        name: "Intermediate (B2)",
        description: "Murakkab mavzularda bahslashish va professional darajada muloqot.",
        lesson_count: 22,
        difficulty: "Ilg'or",
        color: "bg-red-500"
      }
    ]
  }
};

const TeachingGuidePage = () => {
  const course = mockCourseData[1];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            O'quv Qo'llanmalari
          </h1>
          <p className="text-gray-600">
            O'zingizga kerakli darajani tanlang va dars rejalari bilan tanishing
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {course.levels.map((level) => (
            <div 
              key={level.id} 
              className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-t-4 border-[#A60E07] transition duration-150 hover:shadow-xl flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-6 w-6 sm:h-7 sm:w-7 text-[#A60E07] mr-2" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                      {level.name}
                    </h3>
                  </div>
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider bg-blue-100 text-blue-700 shrink-0">
                    {level.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {level.description}
                </p>

                <div className="flex items-center text-sm text-gray-700 mb-4 pb-4 border-b border-gray-100">
                  <BookOpenIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-semibold text-[#A60E07]">
                    {level.lesson_count} ta dars
                  </span>
                </div>
              </div>

              <Link 
                href={`/teacher/guide/${course.id}/${level.id}`}
                className="flex items-center justify-center w-full py-3 rounded-lg font-bold text-white bg-[#A60E07] hover:bg-[#8b0c06] active:scale-[0.98] transition-all duration-150 shadow-md text-sm sm:text-base"
              >
                Darslarni ko'rish
                <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeachingGuidePage;
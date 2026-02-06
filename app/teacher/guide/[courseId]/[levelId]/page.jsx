'use client';

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  PlayCircleIcon,
  ClockIcon,
  TagIcon,
  DocumentIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

const MAIN_COLOR = "#dc2626";

const mockLevelData = {
  1: {
    1: {
      id: 1,
      name: "Beginner (A1)",
      duration: "4-6 oy / 32 dars", 
      lessons: [
        { id: 1, title: "Alphabet and Pronunciation", duration: "45 min", type: "Alifbo" },
        { id: 2, title: "Basic Greetings", duration: "45 min", type: "Salomlashish" },
        { id: 3, title: "Present Simple Tense", duration: "45 min", type: "Grammatika" },
        { id: 4, title: "Colors and Objects", duration: "45 min", type: "Leksika" },
        { id: 5, title: "Food and Drinks", duration: "45 min", type: "Leksika" }
      ]
    },
    2: {
      id: 2,
      name: "Elementary (A2)",
      duration: "5-7 oy / 28 dars",
      lessons: [
        { id: 1, title: "Present Simple Tense", duration: "45 min", type: "Grammatika" }
      ]
    }
  }
};

const LevelDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { courseId, levelId } = params;
  
  const courseIdInt = parseInt(courseId, 10);
  const levelIdInt = parseInt(levelId, 10);
  const levelData = mockLevelData[courseIdInt]?.[levelIdInt];
  
  if (!levelData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Daraja topilmadi</h2>
          <p className="text-gray-600 mb-6">Kechirasiz, siz qidirayotgan sahifa mavjud emas.</p>
          <button 
            onClick={() => router.push('/teacher/guide')}
            className="text-white bg-[#A60E07] hover:bg-[#8b0c06] px-6 py-3 rounded-lg font-bold transition-all"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {levelData.name}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              {levelData.duration}
            </p>
          </div>
        </div>

        {/* PDF Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Asosiy PDF darslik</h2>
            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
              PDF mavjud
            </span>
          </div>
          
          <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-[#A60E07] transition-colors cursor-pointer">
            <div className="bg-red-100 p-3 rounded-lg">
              <DocumentIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{levelData.name} - Asosiy darslik</h3>
              <p className="text-sm text-gray-600">PDF darslikni ochish uchun bosing</p>
            </div>
            <button className="bg-[#A60E07] hover:bg-[#8b0c06] text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Ochish
            </button>
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Darslar ro'yxati</h2>
          
          {levelData.lessons.length > 0 ? (
            <div className="space-y-3">
              {levelData.lessons.map((lesson, index) => (
                <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#A60E07] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#A60E07] text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 inline mr-1" />
                            {lesson.duration}
                          </span>
                          <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {lesson.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/teacher/guide/${courseIdInt}/${levelIdInt}/lesson/${lesson.id}`}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Ko'rish
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Darslar mavjud emas</h3>
              <p className="text-gray-500">Hozircha bu daraja uchun darslar qo'shilmagan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelDetailPage;
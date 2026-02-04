"use client";
import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const MAIN_COLOR = "#dc2626";

// Mock data for level details and lessons  
const mockLevelData = {
  1: {
    1: {
      id: 1,
      name: "Beginner (A1)",
      duration: "4-6 oy / 32 dars", 
      lessons: [
        {
          id: 1,
          title: "Alphabet and Pronunciation",
          duration: "45 min",
          type: "Alifbo"
        },
        {
          id: 2,
          title: "Basic Greetings",
          duration: "45 min",
          type: "Salomlashish"
        },
        {
          id: 3,
          title: "Present Simple Tense",
          duration: "45 min",
          type: "Grammatika"
        },
        {
          id: 4,
          title: "Colors and Objects",
          duration: "45 min",
          type: "Leksika"
        },
        {
          id: 5,
          title: "Food and Drinks",
          duration: "45 min",
          type: "Leksika"
        }
      ]
    },
    2: {
      id: 2,
      name: "Elementary (A2)",
      duration: "5-7 oy / 28 dars",
      lessons: [
        {
          id: 1,
          title: "Present Simple Tense", 
          duration: "45 min",
          type: "Grammatika"
        }
      ]
    },
    3: {
      id: 3,
      name: "Pre-Intermediate (B1)", 
      duration: "6-8 oy / 30 dars",
      lessons: []
    },
    4: {
      id: 4,
      name: "Intermediate (B2)",
      duration: "4-6 oy / 22 dars",
      lessons: []
    }
  }
};

const LevelDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { courseId, levelId } = params;
  
  // Convert string params to integers
  const courseIdInt = parseInt(courseId, 10);
  const levelIdInt = parseInt(levelId, 10);
  
  const levelData = mockLevelData[courseIdInt]?.[levelIdInt];
  
  if (!levelData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Level topilmadi</h2>
          <p className="text-gray-600 mb-4">So'ralgan level mavjud emas.</p>
          <Link href="/teacher/guide" className="text-blue-600 hover:text-blue-800">
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6">
        {/* Header */}
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
            <p className="text-gray-600 text-sm">
              {levelData.duration}
            </p>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          {levelData.lessons.map((lesson) => (
            <Link 
              key={lesson.id} 
              href={`/teacher/guide/${courseIdInt}/${levelIdInt}/lesson/${lesson.id}`}
            >
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4" 
                   style={{ borderLeftColor: MAIN_COLOR }}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Dars {lesson.id}: {lesson.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {lesson.duration} • {lesson.type}
                    </p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelDetailPage;
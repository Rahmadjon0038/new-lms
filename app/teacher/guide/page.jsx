'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const MAIN_COLOR = '#dc2626'; // Red color

// Mock data for teaching guide
const mockCourseData = {
  1: {
    id: 1,
    name: "English Language",
    description: "Comprehensive English language curriculum",
    total_lessons: 112,
    color: "#dc2626",
    levels: {
      1: {
        id: 1,
        name: "Beginner (A1)",
        description: "Ingliz tilining asoslari - harflar, tovushlar, oddiy so'zlar",
        lesson_count: 32,
        duration: "4-6 oy",
        difficulty: "Boshlang'ich",
        lessons: {
          1: {
            id: 1,
            title: "Alphabet and Pronunciation", 
            description: "Ingliz tilidagi 26 ta harfni o'rganish",
            duration: "45 daqiqa",
            materials: ["Flashcards", "Audio files", "Worksheet"],
            objectives: ["ABC harflarini tanish", "Harflar tovushini aytish", "Oddiy so'zlarni talaffuz qilish"]
          },
          2: {
            id: 2,
            title: "Basic Greetings",
            description: "Kundalik salomlashuv va tanishuv",
            duration: "45 daqiqa", 
            materials: ["Dialog cards", "Role play scenarios"],
            objectives: ["Hello, Hi, Good morning aytish", "What's your name? so'rash", "Nice to meet you javob berish"]
          }
        }
      },
      2: {
        id: 2,
        name: "Elementary (A2)", 
        description: "Oddiy grammatika qoidalari va kundalik muloqot",
        lesson_count: 28,
        duration: "5-7 oy",
        difficulty: "Boshlang'ich+",
        lessons: {
          1: {
            id: 1,
            title: "Present Simple Tense",
            description: "Hozirgi oddiy zamon - fe'llarning asosiy shakli",
            duration: "45 daqiqa",
            materials: ["Grammar charts", "Exercise sheets", "Practice games"],
            objectives: ["I am, You are, He/She is", "Positive sentences", "Daily routines"]
          }
        }
      },
      3: {
        id: 3,
        name: "Pre-Intermediate (B1)",
        description: "Murakkab grammatika va gaplashish ko'nikmalari",
        lesson_count: 30,
        duration: "6-8 oy", 
        difficulty: "O'rta",
        lessons: {
          1: {
            id: 1,
            title: "Past Simple vs Present Perfect",
            description: "O'tmish va tugallangan zamonlar farqi",
            duration: "45 daqiqa",
            materials: ["Timeline charts", "Story cards", "Audio exercises"],
            objectives: ["Past Simple formation", "Present Perfect usage", "Time expressions"]
          }
        }
      },
      4: {
        id: 4,
        name: "Intermediate (B2)",
        description: "Ilg'or grammatika va professional muloqot",
        lesson_count: 22,
        duration: "4-6 oy",
        difficulty: "Ilg'or",
        lessons: {
          1: {
            id: 1,
            title: "Conditional Sentences", 
            description: "Shart gaplar - real va irreal holatlar",
            duration: "45 daqiqa",
            materials: ["Conditional charts", "Situation cards", "Writing prompts"],
            objectives: ["First conditional", "Second conditional", "Mixed conditionals"]
          }
        }
      }
    }
  }
};

const TeachingGuidePage = () => {
  const courses = Object.values(mockCourseData);
  const course = courses[0]; // Faqat birinchi kurs
  const levels = Object.values(course.levels);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Teaching Guide</h1>
        </div>

        {/* Levels List */}
        <div className="space-y-4">
          {levels.map((level) => (
            <Link key={level.id} href={`/teacher/guide/${course.id}/${level.id}`}>
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4" 
                   style={{ borderLeftColor: MAIN_COLOR }}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{level.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{level.description}</p>
                    <p className="text-gray-500 text-xs mt-2">{level.duration}</p>
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

export default TeachingGuidePage;
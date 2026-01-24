"use client";
import React from "react";
import {
  CalendarIcon,
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useGetAttendanceGroups } from "../../../hooks/attendance";

// --- Guruh Kartochkasi ---
const GroupCard = ({ group }) => {
  const scheduleDisplay = group.schedule ? 
    `${group.schedule.days?.join(', ')} - ${group.schedule.time}` : 
    'Vaqt belgilanmagan';
  
  return (
    <Link
      href={`/teacher/attendance/${group.id}`}
      className="block bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-blue-600 hover:translate-x-1"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
            {group.name}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <AcademicCapIcon className="h-4 w-4 text-gray-400" />
            {group.subject_name}
          </p>
        </div>
        <ChevronRightIcon className="h-6 w-6 text-gray-400" />
      </div>

      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-gray-400" />
          <span className="text-xs">{scheduleDisplay}</span>
        </div>

        <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs">Talabalar: <span className="font-bold">{group.students_count || 0}</span></span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// --- Asosiy Komponent ---
const TeacherAttendance = () => {
  // Attendance API - Backend avtomatik TEACHER rolga qarab faqat o'z guruhlarini qaytaradi
  const { data: attendanceData, isLoading, error } = useGetAttendanceGroups();

  // API response: {success: true, data: [groups...]}
  const groups = attendanceData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            Davomat Tizimi
          </h1>
          <p className="text-gray-600">
            Guruhlaringizni tanlang va davomat qiling
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Yuklanmoqda...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold mb-2">Xatolik yuz berdi:</p>
            <p className="text-sm">{error.message || 'API bilan bog\'lanishda xatolik'}</p>
          </div>
        )}

        {/* Groups list */}
        {!isLoading && !error && (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Jami <span className="font-bold text-blue-600">{groups.length}</span> ta guruh
              </p>
            </div>

            {groups.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow-md text-center">
                <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Guruhlar topilmadi</p>
                <p className="text-gray-400 text-sm mt-2">Sizga biriktirilgan guruhlar yo'q</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;

"use client";
import React, { useState } from "react";
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

const MAIN_COLOR = "#A60E07";

// --- Guruh Kartochkasi ---
const GroupCard = ({ group }) => {
  // Schedule ma'lumotini olish
  const scheduleDisplay = group.schedule ? 
    `${group.schedule.days?.join(', ')} - ${group.schedule.time}` : 
    'Vaqt belgilanmagan';
  
  // Class start date formatting
  const classStartDate = group.class_start_date 
    ? new Date(group.class_start_date).toLocaleDateString('uz-UZ')
    : 'Belgilanmagan';
  
  return (
    <Link
      href={`/teacher/attendance/${group.id}`}
      className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 hover:translate-x-1"
      style={{ borderTopColor: MAIN_COLOR }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
            {group.name}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <AcademicCapIcon className="h-4 w-4 text-gray-400" />
            {group.subject_name} {group.room_number && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {group.room_number}-xona
              </span>
            )}
          </p>
        </div>
        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-gray-400" />
          <span className="text-xs">{scheduleDisplay}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          <span className="text-xs">Dars boshlangan: {classStartDate}</span>
        </div>
      </div>
      
      {/* Student Count */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600">Jami talabalar:</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-bold text-gray-800">{group.students_count || 0} ta</span>
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

  // Xona raqamiga qarab tartiblash
  const sortedGroups = [...groups].sort((a, b) => {
    if (!a.room_number && !b.room_number) return 0;
    if (!a.room_number) return 1;
    if (!b.room_number) return -1;
    return parseInt(a.room_number) - parseInt(b.room_number);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="px-2">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" style={{ color: MAIN_COLOR }} />
            Davomat Tizimi
          </h1>
          <p className="text-sm text-gray-600">
            Guruhlaringizni tanlang va davomat qiling
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: MAIN_COLOR }}></div>
            <p className="text-gray-600 mt-3">Yuklanmoqda...</p>
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
            {/* Statistics Summary */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
                  <span className="text-sm font-medium text-gray-700">
                    Jami <span className="font-bold" style={{ color: MAIN_COLOR }}>{sortedGroups.length}</span> ta guruh
                  </span>
                </div>
              </div>
            </div>

            {sortedGroups.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">Guruhlar topilmadi</p>
                <p className="text-gray-400 text-sm mt-1">Sizga biriktirilgan guruhlar yo'q</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedGroups.map((group) => (
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

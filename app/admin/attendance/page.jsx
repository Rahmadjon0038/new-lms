"use client";
import React, { useState } from "react";
import {
  CalendarIcon,
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useGetAttendanceGroups } from "../../../hooks/attendance";
import TeacherSelect from "../../../components/teacher/Select";
import SubjectsSelect from "../../../components/SubjectsSelect";

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
    
  // Status color and text
  const getStatusInfo = () => {
    if (group.status === 'blocked') {
      return {
        color: 'border-red-300',
        bgColor: 'bg-white',
        badge: 'bg-red-100 text-red-700',
        text: 'Bloklangan',
        dot: 'bg-red-500'
      };
    }
    return {
      color: 'border-green-200',
      bgColor: 'bg-white',
      badge: 'bg-green-100 text-green-700',
      text: 'Faol',
      dot: 'bg-green-500'
    };
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <Link
      href={`/admin/attendance/${group.id}`}
      className={`block rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${statusInfo.color} ${statusInfo.bgColor}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-gray-800">
            <UserGroupIcon className="h-5 w-5 text-red-600" />
            {group.name}
          </h3>
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <AcademicCapIcon className="h-4 w-4 text-gray-400" />
            {group.subject_name} {group.room_number && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {group.room_number}-xona
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusInfo.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}></span>
            {statusInfo.text}
          </span>
          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-gray-400" />
          <span>O&apos;qituvchi:</span>
          <span className="font-medium">{group.teacher_name}</span>
        </div>

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
      <div className="mt-3 border-t border-gray-200 pt-3">
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
const Attendance = () => {
  // Filter states
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // yangi: active, blocked

  // Attendance API - Backend avtomatik ADMIN/TEACHER rolga qarab guruhlarni qaytaradi
  const { data: attendanceData, isLoading, error } = useGetAttendanceGroups({
    teacher_id: selectedTeacher || undefined,
    subject_id: selectedSubject || undefined,
    status_filter: statusFilter
  });

  // API response: {success: true, data: [groups...]}
  const groups = attendanceData?.data || [];

  // Xona raqamiga qarab tartiblash
  const sortedGroups = [...groups].sort((a, b) => {
    // Xona raqami bo'lmagan guruhlarni oxiriga qo'yish
    if (!a.room_number && !b.room_number) return 0;
    if (!a.room_number) return 1;
    if (!b.room_number) return -1;
    
    // Xona raqamlarini raqam sifatida solishtirish
    return parseInt(a.room_number) - parseInt(b.room_number);
  });

  // Clear all filters
  const clearFilters = () => {
    setSelectedTeacher('');
    setSelectedSubject('');
    setStatusFilter('active'); // default holatga qaytarish
  };

  const hasActiveFilters = selectedTeacher || selectedSubject || statusFilter !== 'active';

  return (
    <div className="min-h-screen bg-gray-50 px-3 pb-6 pt-2 md:px-4 lg:px-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-5 pt-3 md:pt-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-red-600" />
            Davomat Tizimi
          </h1>
          <p className="text-sm text-gray-600">
            Guruhlarni tanlang va davomat qiling
          </p>
        </div>

        {/* Status Tabs */}
        <div className="mb-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStatusFilter('active')}
                className={`rounded-xl px-2 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                  statusFilter === 'active'
                    ? 'bg-green-100 text-green-700 shadow-sm ring-1 ring-green-300'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Faol Guruhlar
                </span>
              </button>
              <button
                onClick={() => setStatusFilter('blocked')}
                className={`rounded-xl px-2 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                  statusFilter === 'blocked'
                    ? 'bg-red-100 text-red-700 shadow-sm ring-1 ring-red-300'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Bloklangan Guruhlar
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <FunnelIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">Filterlar:</span>
              </div>
              
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
                <div className="w-full min-w-0">
                  <TeacherSelect
                    value={selectedTeacher}
                    onChange={setSelectedTeacher}
                    placeholder="O'qituvchini tanlang"
                    className="text-sm"
                  />
                </div>
                
                <div className="w-full min-w-0">
                  <SubjectsSelect
                    value={selectedSubject}
                    onChange={setSelectedSubject}
                    placeholder="Fanni tanlang"
                    className="text-sm"
                  />
                </div>
                
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200 sm:col-span-2 lg:col-span-1"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Tozalash
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
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
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {hasActiveFilters ? 'Filterlangan' : 'Jami'} <span className="font-bold text-red-600">{sortedGroups.length}</span> ta guruh
                  </span>
                </div>
                
               
              </div>
            </div>

            {sortedGroups.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">
                  {hasActiveFilters ? 'Filterga mos guruhlar topilmadi' : 'Guruhlar topilmadi'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {hasActiveFilters 
                    ? 'Filterni o\'zgartirib ko\'ring yoki tozalang' 
                    : 'Sizga biriktirilgan guruhlar yo\'q'
                  }
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Filterlarni tozalash
                  </button>
                )}
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

export default Attendance;

"use client";
import React, { useState } from "react";
import {
  BookOpenIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useGetTeacherGroups } from "../../hooks/groups";

// --- Guruh Kartochkasi ---
const GroupCard = ({ group }) => {
  const groupInfo = group.group_info;
  const subjectInfo = group.subject_info;
  const roomInfo = group.room_info;
  const studentsStats = group.students_stats;

  const getStatusDisplay = () => {
    const statusMap = {
      active: { text: 'Faol', className: 'bg-green-100 text-green-700' },
      inactive: { text: 'Nofaol', className: 'bg-red-100 text-red-700' },
    };
    return statusMap[groupInfo.status] || statusMap.inactive;
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="flex flex-col justify-between bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-t-4 border-[#A60E07] transition duration-150 hover:shadow-xl h-full">
      <div className="mb-3 sm:mb-4">
        <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-start">
            <BookOpenIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1.5 sm:mr-2 text-[#A60E07] mt-0.5 sm:mt-1 shrink-0" />
            <span className="leading-tight">{groupInfo.name}</span>
          </h3>
          <span className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider shrink-0 ${statusDisplay.className}`}>
            {statusDisplay.text}
          </span>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <p className="flex items-center">
            <BookOpenIcon className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
            <span className="text-gray-600">Fan:</span>
            <span className="ml-1 font-semibold truncate">{subjectInfo.name}</span>
          </p>
          
          <p className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
            <span className="text-gray-600">Talabalar:</span>
            <span className="ml-1 font-semibold text-[#A60E07]">
              {studentsStats.active}
            </span>
          </p>

          <p className="flex items-center">
            <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
            <span className="text-gray-600">Xona:</span>
            <span className="ml-1 font-semibold">{roomInfo.room_number}</span>
          </p>

          {groupInfo.schedule && (
            <div className="flex items-start">
              <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-gray-600">Jadval:</span>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {groupInfo.schedule.days.map((day, index) => (
                    <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] sm:text-xs font-medium border border-blue-100">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-y-2 justify-between items-center pt-2 border-t border-gray-50">
            {groupInfo.schedule?.time && (
              <p className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
                <span className="font-semibold">{groupInfo.schedule.time}</span>
              </p>
            )}

            <p className="text-[#A60E07] font-bold text-base">
              {groupInfo.price.toLocaleString()} so'm
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <Link
          href={`/teacher/my-groups/${groupInfo.id}`}
          className="flex items-center justify-center w-full py-3 rounded-lg font-bold text-white bg-[#A60E07] hover:bg-[#8b0c06] active:scale-[0.98] transition-all duration-150 shadow-md text-sm sm:text-base"
        >
          Guruhga Kirish
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

// --- Asosiy Komponent ---
function TeacherGroups() {
  const { data: groupsData, isLoading, error } = useGetTeacherGroups();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-lg font-medium text-gray-400">Yuklanmoqda...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-xl border border-red-100 w-full max-w-md">
          <p className="font-bold">Xatolik yuz berdi</p>
          <p className="text-sm opacity-80">{error.message}</p>
        </div>
      </div>
    );
  }

  const groups = groupsData?.data?.groups || [];

  return (
    <div className="min-h-full p-2 sm:p-4 md:p-0">
      <header className="mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 leading-tight">
          Mening Guruhlarim
        </h1>
        <p className="text-xs sm:text-sm md:text-lg text-gray-500 mt-1">
          Jami {groupsData?.data?.total_groups || 0} ta faol guruh
        </p>
      </header>

      {/* Grid: Mobil - 1 ta, Planshet - 2 ta, Desktop - 3 ta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {groups.map((group) => (
          <GroupCard key={group.group_info.id} group={group} />
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mt-8">
          <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <UsersIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-bold text-gray-400">
            Hozirda sizga biriktirilgan guruhlar mavjud emas.
          </p>
        </div>
      )}
    </div>
  );
}

export default TeacherGroups;
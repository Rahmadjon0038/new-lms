"use client";
import React, { useState } from "react";
import {
  BookOpenIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowRightIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useGetTeacherGroups } from "../../hooks/groups";

// --- Guruh Kartochkasi ---
const GroupCard = ({ group }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const groupInfo = group.group_info;
  const subjectInfo = group.subject_info;
  const roomInfo = group.room_info;
  const studentsStats = group.students_stats;


  // Status ranglarini aniqlash
  const getStatusDisplay = () => {
    const statusMap = {
      active: { text: 'Faol', className: 'bg-green-100 text-green-700' },
      inactive: { text: 'Nofaol', className: 'bg-red-100 text-red-700' },
    };
    return statusMap[groupInfo.status] || statusMap.inactive;
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="flex flex-col justify-between bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#A60E07] transition duration-150 hover:shadow-xl">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <BookOpenIcon className="h-6 w-6 mr-2 text-[#A60E07]" />
            {groupInfo.name}
          </h3>
          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${statusDisplay.className}`}>
            {statusDisplay.text}
          </span>
        </div>

       
        <div className="space-y-2 text-sm text-gray-700">
          <p className="flex items-center">
            <BookOpenIcon className="h-4 w-4 mr-2 text-gray-500" />
            Fan: <span className="ml-1 font-semibold">{subjectInfo.name}</span>
          </p>
          
          <p className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2 text-gray-500" />
            Talabalar:{" "}
            <span className="ml-1 font-semibold text-[#A60E07]">
              {studentsStats.active} faol / {studentsStats.total} ta
            </span>
          </p>

          <p className="flex items-center">
            <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-500" />
            Xona: <span className="ml-1 font-semibold">{roomInfo.room_number}</span>
          </p>

          {groupInfo.schedule && (
            <div className="flex items-start">
              <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
              <div>
                <span className="font-semibold">Jadval:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {groupInfo.schedule.days.map((day, index) => (
                    <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {groupInfo.schedule?.time && (
            <p className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
              Vaqt: <span className="ml-1 font-semibold">{groupInfo.schedule.time}</span>
            </p>
          )}

          {groupInfo.class_status && (
            <p className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
              Dars holati:{" "}
              <span className={`ml-1 text-xs px-2 py-1 rounded font-medium ${
                groupInfo.class_status === 'started' ? 'bg-blue-100 text-blue-800' :
                groupInfo.class_status === 'not_started' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {groupInfo.class_status === 'started' ? 'Boshlangan' :
                 groupInfo.class_status === 'not_started' ? 'Boshlanmagan' :
                 groupInfo.class_status}
              </span>
            </p>
          )}

          <p className="flex items-center text-[#A60E07] font-bold">
            Narxi: {groupInfo.price.toLocaleString()} so'm
          </p>
        </div>
      </div>

      {/* Tugmalar Bloki */}
      <div className="mt-4">
        <Link
          href={`/teacher/my-groups/${groupInfo.id}`}
          className="flex items-center justify-center w-full py-2.5 rounded-lg font-semibold text-white bg-[#A60E07] hover:opacity-90 transition duration-150 shadow-md"
        >
          <ArrowRightIcon className="h-5 w-5 mr-2" />
          Guruhga Kirish
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
      <div className="min-h-full flex items-center justify-center">
        <div className="text-lg text-gray-600">Yuklanmoqda...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-lg text-red-600">Xatolik yuz berdi: {error.message}</div>
      </div>
    );
  }

  const groups = groupsData?.data?.groups || [];

  return (
    <div className="min-h-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Mening Guruhlarim
      </h1>
      <p className="text-lg text-gray-500 mb-8">
        Faoliyat yuritayotgan guruhlar ro'yxati ({groupsData?.data?.total_groups || 0} ta)
      </p>

      {/* Guruhlar Ro'yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {groups.map((group) => (
          <GroupCard key={group.group_info.id} group={group} />
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl shadow-inner mt-8 border-t-2" style={{ borderColor: '#F8D7DA' }}>
          <p className="text-xl font-medium" style={{ color: '#A60E07' }}>
            Hozirda sizga biriktirilgan guruhlar mavjud emas.
          </p>
        </div>
      )}
    </div>
  );
}

export default TeacherGroups;

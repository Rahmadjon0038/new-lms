"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeftIcon,
  CalendarDaysIcon,
  UsersIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  ClockIcon,
  PhoneIcon,
  DocumentDuplicateIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useGetTeacherGroupById } from "../../../../hooks/groups";

// Status ranglarini aniqlash
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'stopped': return 'bg-yellow-100 text-yellow-800';
    case 'finished': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// --- Asosiy Komponent ---
function TeacherGroupDetail() {
  const params = useParams();
  const groupId = params.id;
  const { data: groupData, isLoading, error } = useGetTeacherGroupById(groupId);
  const [isCopied, setIsCopied] = useState(false);

  

  if (isLoading) {
    return (
      <div className="min-h-full p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-[#A60E07] text-xl font-bold">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-xl font-bold">❌ Xatolik yuz berdi</div>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!groupData?.success || !groupData?.data) {
    return (
      <div className="min-h-full p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 mb-4 text-xl font-bold">⚠️ Guruh topilmadi</div>
        </div>
      </div>
    );
  }

  const groupInfo = groupData.data.group_info;
  const subjectInfo = groupData.data.subject_info;
  const roomInfo = groupData.data.room_info;
  const studentsStats = groupData.data.students_stats;
  const students = groupData.data.students || [];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6 lg:p-0">
      <div className="">
        {/* Orqaga Qaytish Tugmasi */}
        <Link
          href="/teacher"
          className="inline-flex items-center text-[#A60E07] hover:opacity-80 mb-4 sm:mb-6 font-bold transition duration-150 text-xs sm:text-sm"
        >
          <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          Orqaga qaytish
        </Link>

        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4 lg:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center">
              <BookOpenIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-[#A60E07] flex-shrink-0" />
              <span className="break-words truncate">{groupInfo.name}</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500">Guruh tafsilotlari va talabalar ro'yxati</p>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 mt-0.5 sm:mt-1">Fan: {subjectInfo.name}</p>
            
           
          </div>
          
          {/* Guruh Holati */}
          <div className="bg-white px-3 sm:px-4 lg:px-5 py-3 sm:py-4 rounded-xl shadow-lg border border-gray-100 w-full sm:w-auto sm:min-w-[160px] lg:min-w-[180px]">
            <div className="text-center">
              <h3 className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wide">Guruh Holati</h3>
              <span className={`inline-flex px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-full ${
                groupInfo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {groupInfo.status === 'active' ? 'Faol' : 'Nofaol'}
              </span>
              {groupInfo.class_status && (
                <div className="mt-2 sm:mt-3">
                  <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Dars holati</div>
                  <span className={`inline-flex px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full ${
                    groupInfo.class_status === 'started' ? 'bg-blue-100 text-blue-800' :
                    groupInfo.class_status === 'not_started' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {groupInfo.class_status === 'started' ? 'Boshlangan' :
                     groupInfo.class_status === 'not_started' ? 'Boshlanmagan' :
                     groupInfo.class_status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 1. Asosiy Ma'lumotlar Bloki */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Guruh Narxi */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-t-4 border-[#A60E07]">
            <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 sm:mb-3">
              Guruh Narxi
            </h3>
            <div className="text-base sm:text-lg lg:text-xl font-bold text-[#A60E07]">
              {groupInfo.price.toLocaleString()} so'm
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
              Oylik to'lov miqdori
            </div>
          </div>

          {/* O'quv xonasi */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-t-4 border-purple-500">
            <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 flex items-center">
              <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-500" />
              O'quv xonasi
            </h3>
            <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
              {roomInfo?.room_number || 'Tayinlanmagan'}
            </div>
            {roomInfo?.capacity && (
              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                Sig'imi: {roomInfo.capacity} ta
              </div>
            )}
          </div>

          {/* Talabalar Statistikasi */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-t-4 border-green-500">
            <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 flex items-center">
              <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-500" />
              Talabalar
            </h3>
            <div className="space-y-1">
              <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">
                {studentsStats.total} ta
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Faol: {studentsStats.active}, To'xtatilgan: {studentsStats.stopped}
              </p>
            </div>
          </div>

          {/* Yaratilgan sana */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl shadow-lg border-t-4 border-blue-500">
            <h3 className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 flex items-center">
              <CalendarDaysIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-500" />
              Sana
            </h3>
            <div className="text-xs sm:text-sm lg:text-base font-bold text-gray-800">
              {groupInfo.created_at || '-'}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
              Yaratilgan sana
            </div>
          </div>
        </div>

        {/* 2. Dars jadvali */}
        {groupInfo.schedule && (
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-[#A60E07]" />
              Dars jadvali
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Dars kunlari:</p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {groupInfo.schedule.days.map((day, index) => (
                    <span key={index} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-800 rounded-lg text-xs sm:text-sm font-semibold">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Dars vaqti:</p>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-400" />
                  <span className="text-base sm:text-lg font-bold text-gray-800">{groupInfo.schedule.time}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Talabalar Ro'yxati - TABLE FORMAT */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-[#A60E07]" />
                <span>Talabalar ro'yxati</span>
              </h2>
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#A60E07] text-white rounded-xl font-bold shadow-md w-fit">
                {students.length} ta talaba
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            {students.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-12 sm:w-16">
                      #
                    </th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      F.I.O
                    </th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 hidden sm:table-cell">
                      Telefon
                    </th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 hidden lg:table-cell">
                      Ota-ona
                    </th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 hidden md:table-cell">
                      Qo'shilgan Sana
                    </th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Holati
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student, index) => (
                    <tr key={student.id} className="hover:bg-red-50 transition-colors duration-150">
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm font-bold text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#A60E07] flex items-center justify-center mr-2 sm:mr-3">
                            <span className="text-white font-bold text-xs sm:text-sm">
                              {student.name?.charAt(0)}{student.surname?.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs sm:text-sm font-semibold text-gray-800 block truncate">{student.full_name}</span>
                            <div className="sm:hidden">
                              <a href={`tel:${student.phone}`} className="text-[10px] text-blue-600 hover:underline flex items-center mt-0.5">
                                <PhoneIcon className="h-2 w-2 mr-1" />
                                {student.phone}
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 hidden sm:table-cell">
                        <div className="flex flex-col">
                          <a href={`tel:${student.phone}`} className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center">
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            {student.phone}
                          </a>
                          {student.phone2 && (
                            <a href={`tel:${student.phone2}`} className="text-xs text-gray-500 hover:underline mt-1">
                              {student.phone2}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 hidden lg:table-cell">
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm text-gray-800">{student.father_name || '-'}</span>
                          {student.father_phone && (
                            <a href={`tel:${student.father_phone}`} className="text-xs text-gray-500 hover:underline mt-1 flex items-center">
                              <PhoneIcon className="h-3 w-3 mr-1" />
                              {student.father_phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                        {student.join_date}
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full ${getStatusColor(student.group_status)}`}>
                          {student.status_description || 'Noma\'lum'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Talabalar yo'q</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Bu guruhda hozircha talabalar mavjud emas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherGroupDetail;

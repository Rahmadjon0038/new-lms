"use client";
import React from "react";
import { useParams } from "next/navigation";
import {
  ClockIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChevronLeftIcon,
  UserCircleIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { useGetGroupView } from "../../../../hooks/groups";

// Status ranglarini aniqlash
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-red-100 text-red-800';
    case 'stopped': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// --- Asosiy Komponent ---
function GroupDetails() {
  const params = useParams();
  const groupId = params.id;
  const { data: groupData, isLoading, error } = useGetGroupView(groupId);

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

  const groupDetails = groupData.data.group_details;
  const subject = groupData.data.subject;
  const teacher = groupData.data.teacher;
  const stats = groupData.data.group_statistics;
  const groupmates = groupData.data.groupmates || [];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="">
        {/* Orqaga Qaytish Tugmasi */}
        <a
          href="/student"
          className="inline-flex items-center text-[#A60E07] hover:opacity-80 mb-6 font-bold transition duration-150 text-sm"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
          Orqaga qaytish
        </a>

        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <BookOpenIcon className="h-8 w-8 mr-3 text-[#A60E07]" />
              {groupDetails.name}
            </h1>
            <p className="text-lg text-gray-500">Guruh tafsilotlari va a'zolar ro'yxati</p>
            <p className="text-sm text-gray-400">Fan: {subject.name}</p>
          </div>
          
          {/* Guruh Holati - Header ning o'ng tomonida */}
          <div className="bg-white px-5 py-4 rounded-xl shadow-lg border border-gray-100 min-w-[180px]">
            <div className="text-center">
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Guruh Holati</h3>
              <span className={`inline-flex px-4 py-1.5 text-xs font-bold rounded-full ${
                groupDetails.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {groupDetails.status === 'active' ? 'Faol' : 'Nofaol'}
              </span>
              {groupDetails.class_status && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">Dars holati</div>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    groupDetails.class_status === 'started' ? 'bg-blue-100 text-blue-800' :
                    groupDetails.class_status === 'not_started' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {groupDetails.class_status === 'started' ? 'Boshlangan' :
                     groupDetails.class_status === 'not_started' ? 'Boshlanmagan' :
                     groupDetails.class_status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 1. Asosiy Ma'lumotlar Bloki */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* O'qituvchi Ma'lumotlari */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-orange-500">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
              <AcademicCapIcon className="h-4 w-4 mr-2 text-orange-500" />
              O'qituvchi
            </h3>
            <p className="text-xl font-bold text-gray-800">
              {teacher.name || 'Tayinlanmagan'}
            </p>
          </div>

          {/* Guruh Narxi */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-[#A60E07]">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Guruh Narxi
            </h3>
            <div className="text-xl font-bold text-[#A60E07]">
              {groupDetails.price.toLocaleString()} so'm
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Oylik to'lov miqdori
            </div>
          </div>

          {/* Guruh Statistikasi */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-green-500">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
              <UsersIcon className="h-4 w-4 mr-2 text-green-500" />
              Statistika
            </h3>
            <div className="space-y-1">
              <p className="text-2xl font-extrabold text-gray-900">
                {stats.total_members} ta
              </p>
              <p className="text-xs text-gray-500">
                Jami: {stats.total_members}, Faol: {stats.active_members}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Guruhdoshlar Ro'yxati - TABLE FORMAT */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <UsersIcon className="h-6 w-6 mr-3 text-[#A60E07]" />
                Guruhdoshlaringiz
              </h2>
              <span className="px-4 py-2 text-sm bg-[#A60E07] text-white rounded-xl font-bold shadow-md">
                {groupmates.length} ta a'zo
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            {groupmates.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-16">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      F.I.O
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Qo'shilgan Sana
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Holati
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groupmates.map((member, index) => (
                    <tr key={member.id} className="hover:bg-red-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-bold text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-[#A60E07] flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">
                              {member.name.charAt(0)}{member.surname.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{member.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.join_date}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(member.status)}`}>
                          {member.status_description || 'Noma\'lum'}
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
                <h3 className="text-lg font-bold text-gray-800 mb-2">Hech kim yo'q</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Bu guruhda hozircha boshqa a'zolar yo'q.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupDetails;

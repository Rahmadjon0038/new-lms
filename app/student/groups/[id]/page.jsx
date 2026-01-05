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
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { useGetGroupView } from "../../../../hooks/groups";

// --- Yordamchi Komponent: Guruhdoshlar Kartochkasi ---
const PeerCard = ({ member }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 transition duration-150 hover:bg-red-50 hover:border-[#A60E07] hover:shadow-md">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-[#A60E07] flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {member.name.charAt(0)}{member.surname.charAt(0)}
          </span>
        </div>
      </div>
      <div className="ml-3">
        <p className="text-sm font-bold text-gray-800">{member.name} {member.surname}</p>
        <p className="text-xs font-medium text-gray-500">Guruh a'zosi</p>
      </div>
    </div>
  </div>
);

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

  if (!groupData?.success || !groupData?.group) {
    return (
      <div className="min-h-full p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 mb-4 text-xl font-bold">⚠️ Guruh topilmadi</div>
        </div>
      </div>
    );
  }

  const group = groupData.group;
  const members = groupData.members || [];
  const totalMembers = groupData.totalMembers || 0;

  return (
    <div className="min-h-full  bg-gray-50">
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
              {group.name}
            </h1>
            <p className="text-lg text-gray-500">Guruh tafsilotlari va a'zolar ro'yxati</p>
          </div>
          
          {/* Guruh Holati - Header ning o'ng tomonida */}
          <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 min-w-[180px]">
            <div className="text-center">
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Guruh Holati</h3>
              <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg ${
                group.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {group.is_active ? 'Faol' : 'Nofaol'}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Asosiy Ma'lumotlar Bloki */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* O'qituvchi Ma'lumotlari */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-orange-500">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
              <AcademicCapIcon className="h-4 w-4 mr-2 text-orange-500" />
              O'qituvchi
            </h3>
            <p className="text-lg font-bold text-gray-800 mb-3">
              {group.teacher_name || 'Tayinlanmagan'}
            </p>
            {group.teacher_phone && (
              <div className="space-y-1">
                <div className="flex items-center text-xs text-gray-600">
                  <PhoneIcon className="h-3 w-3 mr-2 text-gray-400" />
                  <a 
                    href={`tel:${group.teacher_phone.replace(/\s/g, "")}`}
                    className="hover:text-[#A60E07] font-medium transition"
                  >
                    {group.teacher_phone}
                  </a>
                </div>
                {group.teacher_phone2 && (
                  <div className="flex items-center text-xs text-gray-600">
                    <PhoneIcon className="h-3 w-3 mr-2 text-gray-400" />
                    <a 
                      href={`tel:${group.teacher_phone2.replace(/\s/g, "")}`}
                      className="hover:text-[#A60E07] font-medium transition"
                    >
                      {group.teacher_phone2}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dars Jadvali Kartochkasi */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#A60E07]">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-2 text-[#A60E07]" />
              Dars Jadvali
            </h3>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {group.schedule?.days?.map((day, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-bold bg-[#A60E07] text-white rounded-lg"
                  >
                    {day}
                  </span>
                ))}
              </div>
              <div className="flex items-center mt-3 text-sm font-semibold text-gray-700">
                <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                Vaqt: {group.schedule?.time || 'Belgilanmagan'}
              </div>
            </div>
          </div>

          {/* Boshlanish Sanasi */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-2 text-blue-500" />
              Boshlanish Sanasi
            </h3>
            <p className="text-xl font-bold text-gray-800">
              {group.start_date ? new Date(group.start_date).toLocaleDateString('uz-UZ') : 'Belgilanmagan'}
            </p>
          </div>

          {/* Guruh A'zolari Soni */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
              <UsersIcon className="h-4 w-4 mr-2 text-green-500" />
              Talabalar Soni
            </h3>
            <p className="text-3xl font-extrabold text-gray-900">
              {totalMembers} ta
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Jami guruh a'zolari
            </p>
          </div>
        </div>

        {/* 3. Guruhdoshlar Ro'yxati */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center uppercase tracking-tight">
                <UsersIcon className="h-6 w-6 mr-3 text-[#A60E07]" />
                Guruhdoshlaringiz
              </h2>
              <span className="px-4 py-2 text-sm bg-[#A60E07] text-white rounded-xl font-bold shadow-md">
                {members.length} ta a'zo
              </span>
            </div>
          </div>
          <div className="p-6">
            {members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member, index) => (
                  <PeerCard key={index} member={member} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
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

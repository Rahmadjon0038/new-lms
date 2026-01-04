"use client";
import React, { useState } from "react";
import {
  BookOpenIcon,
  ClockIcon,
  UsersIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useGetStudentGroups, useJoinGroupByCode } from '../../hooks/groups';
import { toast } from 'react-hot-toast';

// --- Guruh Kartochkasi Komponenti ---
const GroupCard = ({ group }) => {
  const isStatusActive = group.is_active;

  // Schedule formatini to'g'rilash
  const scheduleDisplay = group.schedule.days.join(' / ') + ' - ' + group.schedule.time;

  return (
    <div 
      className="flex flex-col bg-white p-6 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:translate-y-[-2px] border-t-4"
      style={{ borderTopColor: '#A60E07' }}
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 leading-tight">
            <span className="mr-2" style={{ color: '#A60E07' }}>
              <BookOpenIcon className="h-6 w-6 inline" />
            </span>
            {group.group_name}
          </h3>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
              isStatusActive
                ? "bg-green-100 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isStatusActive ? 'Faol' : 'Nofaol'}
          </span>
        </div>

        <div className="space-y-3 text-sm text-gray-700 mt-5 mb-8">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-3 text-gray-400" />
            <span className="font-semibold">O'qituvchi:</span>{" "}
            <span className="ml-1 text-gray-800">{group.teacher_name || 'Tayinlanmagan'}</span>
          </div>

          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
            <span className="font-semibold">Jadval:</span>{" "}
            <span className="ml-1 text-gray-800">{scheduleDisplay}</span>
          </div>

          <div className="flex items-center">
            <UsersIcon className="h-5 w-5 mr-3 text-gray-400" />
            <span className="font-semibold">Narx:</span>{" "}
            <span className="ml-1 font-bold" style={{ color: '#A60E07' }}>
              {Number(group.price).toLocaleString()} so'm
            </span>
          </div>

          <div className="flex items-center">
            <span className="font-semibold text-xs text-gray-500">Status:</span>{" "}
            <span className={`ml-1 text-xs font-medium ${group.student_status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
              {group.student_status === 'active' ? 'Faol' : 'Nofaol'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-none mt-4 space-y-3 pt-4 border-t border-gray-100">
        <Link
          href={`/student/groups/${group.group_id}`}
          className="block text-center w-full text-white py-2.5 rounded-xl font-bold transition duration-150 ease-in-out text-base shadow-md hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#A60E07' }}
        >
          Guruhni ko'rish
        </Link>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Qo'shilgan sana:</div>
          <div className="text-sm font-medium text-gray-800">
            {new Date(group.joined_at).toLocaleDateString('uz-UZ')}
          </div>
        </div>
      </div>
    </div>
  );
};
// --- Asosiy Komponent ---
function StudetGroup() {
  const [joinCode, setJoinCode] = useState("");
  
  // API hooks
  const { data: studentGroupsData, isLoading, error } = useGetStudentGroups();
  const joinGroupMutation = useJoinGroupByCode();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error("Iltimos, guruh kodini kiriting.");
      return;
    }

    console.log('Guruhga qo\'shilish jarayoni boshlandi, kod:', joinCode.trim());

    joinGroupMutation.mutate(joinCode.trim(), {
      onSuccess: (data) => {
        console.log('API dan kelgan success response:', data);
        toast.success(data.message || 'Guruhga muvaffaqiyatli qo\'shildingiz!');
        setJoinCode("");
        // Page-ni reload qilamiz yoki manual refetch qilamiz
        window.location.reload();
      },
      onError: (error) => {
        console.log('API dan kelgan error response:', error);
        console.log('Error response data:', error.response?.data);
        
        // Faqat haqiqiy xatolik bo'lsagina error toast ko'rsatamiz
        const errorMessage = error.response?.data?.message || error.message || 'Guruhga qo\'shilishda xatolik yuz berdi!';
        
        // Agar server 200 status bilan success message yuborgan bo'lsa, error ko'rsatmaymiz
        if (error.response?.data?.success === true) {
          console.log('Server success yubordi, error toast ko\'rsatmaymiz');
          return;
        }
        
        toast.error(errorMessage);
      }
    });
  };

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

  const groups = studentGroupsData?.groups || [];

  return (
    <div className="min-h-full">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
        Mening Guruhlarim
      </h1>
      <p className="text-base text-gray-500 mb-8">
        Siz ro'yxatdan o'tgan barcha faol va tugatilgan guruhlar.
      </p>

      {/* Guruhga qo'shilish formasi */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-10 max-w-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center" style={{ color: '#A60E07' }}>
          <PlusCircleIcon className="h-6 w-6 mr-2" />
          Yangi Guruhga Qo'shilish
        </h2>
        <form onSubmit={handleJoin} className="flex space-x-3 items-end">
          <div className="flex-grow">
            <label
              htmlFor="joinCode"
              className="block text-sm font-bold text-gray-600 mb-1 ml-1"
            >
              Guruhning Noyob KODI
            </label>
            <input
              type="text"
              id="joinCode"
              placeholder="Masalan: GR-A1B2C3"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none transition-all placeholder-gray-400 text-base shadow-sm"
              style={{ 
                borderWidth: '1px',
                borderColor: joinCode ? '#A60E07' : '#D1D5DB'
              }}
              disabled={joinGroupMutation.isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={joinGroupMutation.isLoading}
            className="flex-none text-white py-2.5 px-8 rounded-lg font-bold hover:opacity-90 transition duration-150 ease-in-out text-base shadow-lg h-[46px] disabled:opacity-50 flex items-center"
            style={{ backgroundColor: '#A60E07' }}
          >
            {joinGroupMutation.isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Qo'shilmoqda...
              </>
            ) : (
              'Qo\'shilish'
            )}
          </button>
        </form>
      </div>

      {/* Guruhlar ro'yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {groups.map((group) => (
          <GroupCard key={group.group_id} group={group} />
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12 rounded-2xl shadow-inner mt-8 border-t-2" style={{ backgroundColor: '#FDF2F2', borderColor: '#F8D7DA' }}>
          <p className="text-lg font-bold" style={{ color: '#A60E07' }}>
            Siz hali birorta guruhga a'zo emassiz.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Yuqoridagi maydonga kodni kiritib, yangi guruhga qo'shiling.
          </p>
        </div>
      )}
    </div>
  );
}

export default StudetGroup;
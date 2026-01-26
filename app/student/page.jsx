"use client";
import React, { useState } from "react";
import {
  BookOpenIcon,
  ClockIcon,
  UsersIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useGetStudentGroups, useJoinGroupByCode } from '../../hooks/groups';
import { toast } from 'react-hot-toast';

// --- Guruh Kartochkasi Komponenti ---
const GroupCard = ({ group }) => {
  const groupInfo = group.group_info;
  const subjectInfo = group.subject_info;
  const teacherInfo = group.teacher_info;
  const roomInfo = group.room_info; // Added room_info
  const myStatus = group.my_status;

  // Status ranglarini aniqlash
  const getStatusDisplay = () => {
    const statusMap = {
      active: { text: 'Faol', className: 'bg-green-100 text-green-700' },
      stopped: { text: 'To\'xtatilgan', className: 'bg-yellow-100 text-yellow-700' },
      finished: { text: 'Tugagan', className: 'bg-blue-100 text-blue-700' },
      inactive: { text: 'Nofaol', className: 'bg-red-50 text-red-600' }
    };
    
    return statusMap[myStatus.status] || statusMap.inactive;
  };

  const statusDisplay = getStatusDisplay();

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
            {groupInfo.name}
          </h3>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${statusDisplay.className}`}
          >
            {statusDisplay.text}
          </span>
        </div>

        <div className="space-y-3 text-sm text-gray-700 mt-5 mb-8">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-3 text-gray-400" />
            <span className="font-semibold">O'qituvchi:</span>{" "}
            <span className="ml-1 text-gray-800">{teacherInfo.name || 'Tayinlanmagan'}</span>
          </div>

          <div className="flex items-center">
            <BookOpenIcon className="h-5 w-5 mr-3 text-gray-400" />
            <span className="font-semibold">Fan:</span>{" "}
            <span className="ml-1 text-gray-800">{subjectInfo.name || 'Belgilanmagan'}</span>
          </div>

          {teacherInfo.phone && (
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
              <span className="font-semibold">Telefon:</span>{" "}
              <span className="ml-1 text-gray-800">{teacherInfo.phone}</span>
            </div>
          )}

          <div className="flex items-center">
            <UsersIcon className="h-5 w-5 mr-3 text-gray-400" />
            <span className="font-semibold">Talabalar:</span>{" "}
            <span className="ml-1 text-gray-800">{groupInfo.total_students} ta</span>
          </div>

          {roomInfo?.room_number && (
            <div className="flex items-center">
              <UsersIcon className="h-5 w-5 mr-3 text-gray-400" />
              <span className="font-semibold">Xona raqami:</span>{" "}
              <span className="ml-1 text-gray-800">{roomInfo.room_number}</span>
            </div>
          )}

          {groupInfo.class_status && (
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
              <span className="font-semibold">Dars holati:</span>{" "}
              <span className={`ml-1 text-xs px-2 py-1 rounded ${
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

      <div className="flex-none space-y-3  border-t border-gray-100">
        <Link
          href={`/student/groups/${groupInfo.id}`}
          className="block text-center w-full text-white py-2.5 rounded-xl font-bold transition duration-150 ease-in-out text-base shadow-md hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#A60E07' }}
        >
          Guruhni ko'rish
        </Link>

        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-gray-500 mb-1">Qo'shilgan:</div>
            <div className="font-medium text-gray-800">
              {myStatus.join_date}
            </div>
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

  const groups = studentGroupsData?.data?.groups || [];

  return (
    <div className="min-h-full">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
        Mening Guruhlarim
      </h1>
      <p className="text-base text-gray-500 mb-8">
        Siz ro'yxatdan o'tgan barcha faol va tugatilgan guruhlar.
      </p>

     

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
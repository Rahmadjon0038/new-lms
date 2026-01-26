"use client";
import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useGetStudentMonthlyAttendance } from "../../../hooks/attendance";
import { usegetProfile } from "../../../hooks/user";

// Status ranglarini aniqlash
const getAttendanceStatusStyle = (status) => {
  switch (status) {
    case 'keldi':
      return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircleIcon };
    case 'kelmadi':
      return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircleIcon };
    case 'kech_qoldi':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: ClockIcon };
    case 'belgilanmagan':
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-500', icon: null };
  }
};


// Joriy oyni YYYY-MM formatda olish
const getCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

function MyAttendance() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Profildan student_id olish
  const { data: profileData, isLoading: profileLoading } = usegetProfile();
  const studentId = profileData?.id;
  console.log(profileData,'----')

  // Debug: Profil va studentId ni konsolga chiqarish
  console.log('Profile Data:', profileData);
  console.log('Student ID:', studentId);
  console.log('Selected Month:', selectedMonth);

  // Davomat ma'lumotlarini olish
  const { data: attendanceData, isLoading, error } = useGetStudentMonthlyAttendance(studentId, selectedMonth);

  // Debug: Attendance data ni konsolga chiqarish
  console.log('Attendance Data:', attendanceData);
  console.log('Attendance Error:', error);

  // Guruhlar ro'yxati
  const groups = attendanceData?.data?.groups || [];

  // Birinchi guruhni default tanlash
  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].group_id);
    }
  }, [groups, selectedGroupId]);

  // Oy o'zgarganda guruh tanlovini reset qilish
  useEffect(() => {
    setSelectedGroupId(null);
  }, [selectedMonth]);

  // Tanlangan guruh ma'lumotlari
  const selectedGroup = groups.find(g => g.group_id === selectedGroupId);

  if (profileLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-lg text-gray-600">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <CalendarDaysIcon className="h-7 w-7 mr-3 text-[#A60E07]" />
          Mening Davomatim
        </h1>
        <p className="text-sm text-gray-500">Oylik davomat hisobotingizni ko'ring</p>
      </div>

      {/* Oy tanlash */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-shrink-0">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Oyni tanlang
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent transition cursor-pointer"
            />
          </div>

          {/* Guruhlar ro'yxati */}
          {groups.length > 0 && (
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Guruh tanlang
              </label>
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <button
                    key={group.group_id}
                    onClick={() => setSelectedGroupId(group.group_id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      selectedGroupId === group.group_id
                        ? 'bg-[#A60E07] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {group.group_name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="animate-pulse text-[#A60E07] text-xl font-bold">Yuklanmoqda...</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-red-500 text-xl font-bold mb-2">❌ Xatolik yuz berdi</div>
          <p className="text-gray-600">{error.message}</p>
        </div>
      )}

      {/* No data state */}
      {!isLoading && !error && groups.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <CalendarDaysIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Ma'lumot topilmadi</h3>
          <p className="text-sm text-gray-500">
            Ushbu oy uchun davomat ma'lumotlari mavjud emas.
          </p>
        </div>
      )}

      {/* Tanlangan guruh davomat ma'lumotlari */}
      {!isLoading && !error && selectedGroup && (
        <>
          {/* Statistika */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-blue-500">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jami Darslar</div>
              <div className="text-2xl font-extrabold text-blue-600">{selectedGroup.stats.total_lessons}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-green-500">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Keldi</div>
              <div className="text-2xl font-extrabold text-green-600">{selectedGroup.stats.present}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-red-500">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kelmadi</div>
              <div className="text-2xl font-extrabold text-red-600">{selectedGroup.stats.absent}</div>
            </div>
          
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-[#A60E07]">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Davomat %</div>
              <div className="text-2xl font-extrabold text-[#A60E07]">{selectedGroup.stats.attendance_percentage}%</div>
            </div>
          </div>

          {/* Guruh ma'lumotlari */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <AcademicCapIcon className="h-6 w-6 mr-3 text-[#A60E07]" />
                    {selectedGroup.group_name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedGroup.subject_name} • {selectedGroup.teacher_name}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  selectedGroup.student_group_status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedGroup.student_group_status_description}
                </span>
              </div>
            </div>

            {/* Davomat jadvali */}
            <div className="overflow-x-auto">
              {selectedGroup.lessons && selectedGroup.lessons.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-16">
                        #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Sana
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Kun
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Holat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedGroup.lessons.map((lesson, index) => {
                      const statusStyle = getAttendanceStatusStyle(lesson.attendance_status);
                      const StatusIcon = statusStyle.icon;
                      
                      return (
                        <tr key={lesson.lesson_id} className="hover:bg-red-50 transition-colors duration-150">
                          <td className="px-6 py-4 text-sm font-bold text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-800">
                              {lesson.formatted_date}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {lesson.day_name}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {StatusIcon && (
                                <StatusIcon className={`h-5 w-5 mr-2 ${statusStyle.text}`} />
                              )}
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                {lesson.attendance_status_description}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Darslar yo'q</h3>
                  <p className="text-sm text-gray-500">
                    Ushbu guruhda hali darslar o'tkazilmagan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MyAttendance;

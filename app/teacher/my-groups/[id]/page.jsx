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
  StarIcon,
} from "@heroicons/react/24/outline";
import { TrophyIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useGetTeacherGroupById } from "../../../../hooks/groups";
import PointModal from "../../../../components/teacher/PointModal";
import { MEDAL_COLORS } from "../../../../components/teacher/TopStudentsSection";

const formatPhoneNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  const normalized = digits.startsWith("998") ? digits.slice(3) : digits.startsWith("8") ? digits.slice(1) : digits;
  if (normalized.length !== 9) return value || "-";
  return `+998-${normalized.slice(0, 2)}-${normalized.slice(2, 5)}-${normalized.slice(5, 7)}-${normalized.slice(7, 9)}`;
};

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
  // Ball qo'yish modali ochilgan o'quvchi
  const [pointStudent, setPointStudent] = useState(null);


  if (isLoading) {
    return (
      <div className="min-h-full p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-[#A60E07] text-xl font-bold">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-xl font-bold">❌ Xatolik yuz berdi</div>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!groupData?.success || !groupData?.data) {
    return (
      <div className="min-h-full p-4 sm:p-8 flex items-center justify-center">
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

  // Ball bo'yicha kamayish tartibida — mobil ilova bilan bir xil.
  // Teng ball to'plaganlar bir xil o'rinni oladi.
  const students = [...(groupData.data.students || [])].sort(
    (a, b) => (Number(b.monthly_points) || 0) - (Number(a.monthly_points) || 0)
  );
  const ranks = {};
  let rank = 0;
  let previousPoints = null;
  students.forEach((student, index) => {
    const points = Number(student.monthly_points) || 0;
    if (previousPoints === null || points !== previousPoints) {
      rank = index + 1;
      previousPoints = points;
    }
    ranks[student.id] = rank;
  });

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-1 sm:p-4 md:p-6 lg:p-0">
      <div className="">
        {/* Orqaga Qaytish Tugmasi */}
       

        {/* Header */}
       

        {/* 1. Asosiy Ma'lumotlar Bloki */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-4 lg:gap-6 mb-3 sm:mb-8">
          {/* Guruh Narxi */}
          <div className="bg-white p-2.5 sm:p-5 lg:p-6 rounded-[8px] shadow-lg border-t-4 border-[#A60E07]">
            <h3 className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 sm:mb-3">
              Guruh Narxi
            </h3>
            <div className="text-sm sm:text-lg lg:text-xl font-bold text-[#A60E07]">
              {groupInfo.price.toLocaleString()} so&apos;m
            </div>
            <div className="text-[9px] sm:text-xs text-gray-500 mt-1">
              Oylik to&apos;lov miqdori
            </div>
          </div>

          {/* O&apos;quv xonasi */}
          <div className="bg-white p-2.5 sm:p-5 lg:p-6 rounded-[8px] shadow-lg border-t-4 border-purple-500">
            <h3 className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 sm:mb-3 flex items-center">
              <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-500" />
              O&apos;quv xonasi
            </h3>
            <div className="text-sm sm:text-lg lg:text-xl font-bold text-gray-800">
              {roomInfo?.room_number || 'Tayinlanmagan'}
            </div>
            {roomInfo?.capacity && (
              <div className="text-[9px] sm:text-xs text-gray-500 mt-1">
                Sig&apos;imi: {roomInfo.capacity} ta
              </div>
            )}
          </div>

          {/* Talabalar Statistikasi */}
          <div className="bg-white p-2.5 sm:p-5 lg:p-6 rounded-[8px] shadow-lg border-t-4 border-green-500">
            <h3 className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 sm:mb-3 flex items-center">
              <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-500" />
              Talabalar
            </h3>
            <div className="space-y-1">
              <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-gray-900">
                {studentsStats.total} ta
              </p>
              <p className="text-[9px] sm:text-xs text-gray-500">
                Faol: {studentsStats.active}, To&apos;xtatilgan: {studentsStats.stopped}
              </p>
            </div>
          </div>

          {/* Yaratilgan sana */}
          <div className="bg-white p-2.5 sm:p-5 lg:p-6 rounded-[8px] shadow-lg border-t-4 border-blue-500">
            <h3 className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 sm:mb-3 flex items-center">
              <CalendarDaysIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-500" />
              Sana
            </h3>
            <div className="text-[11px] sm:text-sm lg:text-base font-bold text-gray-800">
              {groupInfo.created_at || '-'}
            </div>
            <div className="text-[9px] sm:text-xs text-gray-500 mt-1">
              Yaratilgan sana
            </div>
          </div>
        </div>

        {/* 2. Dars jadvali */}
        {groupInfo.schedule && (
          <div className="bg-white p-2.5 sm:p-6 rounded-[8px] shadow-lg border border-gray-100 mb-4 sm:mb-8">
            <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-2.5 sm:mb-4 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-[#A60E07]" />
              Dars jadvali
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
              <div>
                <p className="text-[11px] sm:text-sm text-gray-500 mb-2">Dars kunlari:</p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {groupInfo.schedule.days.map((day, index) => (
                    <span key={index} className="px-2 py-0.5 sm:px-3 sm:py-1.5 bg-blue-100 text-blue-800 rounded-lg text-[11px] sm:text-sm font-semibold">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] sm:text-sm text-gray-500 mb-2">Dars vaqti:</p>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-400" />
                  <span className="text-sm sm:text-lg font-bold text-gray-800">{groupInfo.schedule.time}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Talabalar Ro&apos;yxati */}
        <div className="mt-2 sm:mt-4 mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-bold text-gray-800 flex items-center">
              <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-[#A60E07]" />
              <span>Talabalar ro&apos;yxati</span>
            </h2>
            <span className="px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm bg-[#A60E07] text-white rounded-xl font-bold shadow-md w-fit">
              {students.length} ta talaba
            </span>
          </div>

          {students.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {students.map((student, index) => {
                const points = Number(student.monthly_points) || 0;
                // Medal faqat ro'yxatdagi birinchi uchtaga va ball to'plaganlarga
                const hasMedal = index < 3 && points > 0;
                const medalColor = hasMedal
                  ? MEDAL_COLORS[Math.min(index, MEDAL_COLORS.length - 1)]
                  : null;

                return (
                  <div
                    key={student.id}
                    className="rounded-[8px] border border-gray-200 bg-white p-2.5 shadow-sm sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {/* O'rin raqami yoki medal */}
                          {hasMedal ? (
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                              style={{ backgroundColor: medalColor }}
                            >
                              <TrophyIcon className="h-3.5 w-3.5 text-white" />
                            </span>
                          ) : (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-extrabold text-gray-500">
                              {ranks[student.id]}
                            </span>
                          )}
                          {/* Avatar */}
                          {student.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={student.avatar_url}
                              alt={student.full_name}
                              className="h-9 w-9 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#A60E07] text-white rounded-full">
                              <span className="text-xs font-bold">
                                {student.surname?.charAt(0)}{student.name?.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div
                              className="truncate text-sm font-semibold sm:text-base"
                              style={{ color: medalColor || "#1f2937" }}
                            >
                              {student.full_name}
                            </div>
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                points > 0
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {points} ball
                            </span>
                          </div>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-600 sm:mt-2 sm:text-sm">
                          <a href={`tel:${student.phone}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                            <PhoneIcon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{formatPhoneNumber(student.phone)}</span>
                          </a>
                          {student.phone2 && (
                            <a href={`tel:${student.phone2}`} className="inline-flex items-center gap-1 text-gray-500 hover:underline">
                              <PhoneIcon className="h-3 w-3 shrink-0" />
                              <span className="truncate">{formatPhoneNumber(student.phone2)}</span>
                            </a>
                          )}
                          {student.father_name && (
                            <span className="truncate">
                              Ota-ona: {student.father_name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold ${getStatusColor(student.group_status)}`}>
                          {student.status_description || "Noma'lum"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPointStudent(student)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#A60E07] px-2.5 py-1.5 text-[10px] sm:text-xs font-extrabold text-white transition hover:bg-[#8b0c06]"
                        >
                          <StarIcon className="h-3.5 w-3.5" />
                          Ball qo&apos;yish
                        </button>
                      </div>
                    </div>

                    <div className="mt-1.5 text-[9px] text-gray-400 sm:mt-2 sm:text-xs">
                      Qo&apos;shilgan sana: {student.join_date || "-"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <UsersIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Talabalar yo&apos;q</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Bu guruhda hozircha talabalar mavjud emas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ball qo'yish modali */}
      {pointStudent && (
        <PointModal
          student={pointStudent}
          groupId={parseInt(groupId)}
          onClose={() => setPointStudent(null)}
        />
      )}
    </div>
  );
}

export default TeacherGroupDetail;

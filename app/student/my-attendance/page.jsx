"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useGetStudentMonthlyAttendance } from "../../../hooks/attendance";
import { useGetStudentGroups } from "../../../hooks/groups";
import { useGetProfile } from "../../../hooks/user";

const getAttendanceStatusStyle = (status) => {
  switch (status) {
    case "keldi":
      return { bg: "bg-green-100", text: "text-green-700", icon: CheckCircleIcon, label: "Keldi" };
    case "kelmadi":
      return { bg: "bg-red-100", text: "text-red-700", icon: XCircleIcon, label: "Kelmadi" };
    case "kech_qoldi":
      return { bg: "bg-yellow-100", text: "text-yellow-700", icon: ClockIcon, label: "Kech qoldi" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-500", icon: null, label: "Belgilanmagan" };
  }
};

const parseAttendanceDate = (rawDate) => {
  if (!rawDate) return null;
  const value = String(rawDate).trim();

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch.map(Number);
    return new Date(year, month - 1, day);
  }

  const dotMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    const [, day, month, year] = dotMatch.map(Number);
    return new Date(year, month - 1, day);
  }

  return null;
};

const isFutureAttendanceItem = (item) => {
  const date = parseAttendanceDate(item?.date || item?.lesson_date || item?.formatted_date);
  if (!date) return false;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return date.getTime() > todayStart.getTime();
};

const getNormalizedAttendanceStatus = (item) => {
  if (!item) return null;
  if (isFutureAttendanceItem(item)) return null;
  if (item.is_marked === false) return null;
  if (item.status === "keldi" || item.status === "kelmadi" || item.status === "kech_qoldi") {
    return item.status;
  }
  return null;
};

const getCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

function MyAttendance() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const { data: groupsData, isLoading: groupsLoading, error: groupsError } = useGetStudentGroups();
  const { data: profileData } = useGetProfile();
  const groups = useMemo(() => groupsData?.data?.groups || [], [groupsData]);
  const plannedSubject =
    groupsData?.data?.register_subject ||
    groupsData?.data?.register_subject_name ||
    groupsData?.data?.registered_subject_name ||
    groupsData?.data?.student?.register_subject ||
    groupsData?.data?.student?.register_subject_name ||
    groupsData?.data?.student?.registered_subject_name ||
    profileData?.register_subject ||
    profileData?.register_subject_name ||
    profileData?.registered_subject_name ||
    profileData?.data?.register_subject ||
    profileData?.data?.register_subject_name ||
    profileData?.data?.registered_subject_name ||
    "";
  const getGroupId = (group) => group?.group_id ?? group?.group_info?.id ?? null;

  const activeGroupId = selectedGroupId ?? getGroupId(groups[0]) ?? null;

  const attendanceQuery = useGetStudentMonthlyAttendance(activeGroupId, selectedMonth);
  const attendancePayload = attendanceQuery.data?.data || {};
  const attendanceStats = attendancePayload.attendance_statistics || {};
  const attendanceBreakdown = attendancePayload.attendance_breakdown || {};
  const dailyAttendance = attendancePayload.daily_attendance || [];
  const monthlyStatus = attendancePayload.monthly_status;

  const computedStats = useMemo(() => {
    if (!Array.isArray(dailyAttendance) || dailyAttendance.length === 0) return null;

    const counts = {
      keldi: 0,
      kelmadi: 0,
      kech_qoldi: 0,
    };

    dailyAttendance.forEach((item) => {
      const status = getNormalizedAttendanceStatus(item);
      if (status && Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1;
      }
    });

    const totalLessons = counts.keldi + counts.kelmadi + counts.kech_qoldi;
    const attendedLessons = counts.keldi + counts.kech_qoldi;
    const attendancePercentage = totalLessons > 0 ? Math.round((attendedLessons / totalLessons) * 100) : 0;

    return {
      total_lessons: totalLessons,
      attended_lessons: attendedLessons,
      missed_lessons: counts.kelmadi,
      late_lessons: counts.kech_qoldi,
      attendance_percentage: attendancePercentage,
      breakdown: counts,
    };
  }, [dailyAttendance]);

  const effectiveStats = useMemo(() => {
    if (Array.isArray(dailyAttendance) && dailyAttendance.length > 0) {
      return computedStats || {
        total_lessons: 0,
        attended_lessons: 0,
        missed_lessons: 0,
        late_lessons: 0,
        attendance_percentage: 0,
        breakdown: { keldi: 0, kelmadi: 0, kech_qoldi: 0 },
      };
    }

    const attendedFallback = attendanceBreakdown.keldi ?? attendanceStats.attended_lessons ?? 0;
    const missedFallback = attendanceBreakdown.kelmadi ?? attendanceStats.missed_lessons ?? 0;
    const lateFallback = attendanceBreakdown.kech_qoldi ?? attendanceStats.late_lessons ?? 0;

    return {
      total_lessons: attendanceStats.total_lessons || 0,
      attended_lessons: attendedFallback,
      missed_lessons: missedFallback,
      late_lessons: lateFallback,
      attendance_percentage: attendanceStats.attendance_percentage || 0,
      breakdown: {
        keldi: attendanceBreakdown.keldi ?? attendanceStats.attended_lessons ?? 0,
        kelmadi: attendanceBreakdown.kelmadi ?? attendanceStats.missed_lessons ?? 0,
        kech_qoldi: attendanceBreakdown.kech_qoldi ?? attendanceStats.late_lessons ?? 0,
      },
    };
  }, [attendanceBreakdown, attendanceStats, computedStats, dailyAttendance]);

  const selectedGroup = groups.find((g) => Number(getGroupId(g)) === Number(activeGroupId));
  const groupName =
    attendancePayload.group_info?.name ||
    selectedGroup?.group_info?.name ||
    selectedGroup?.group_name ||
    "Guruh";
  const subjectName =
    attendancePayload.group_info?.subject ||
    selectedGroup?.subject_info?.name ||
    "";
  const teacherName =
    selectedGroup?.teacher_info?.name
      ? `${selectedGroup.teacher_info.surname || ""} ${selectedGroup.teacher_info.name}`.trim()
      : "";

  if (groupsLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-lg text-gray-600">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mb-6 hidden lg:block">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <CalendarDaysIcon className="h-7 w-7 mr-3 text-[#A60E07]" />
          Mening Davomatim
        </h1>
        <p className="text-sm text-gray-500">Oylik davomat hisobotingizni ko'ring</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-shrink-0">
            <label className="sr-only" htmlFor="attendance-month">
              Oyni tanlang
            </label>
            <input
              id="attendance-month"
              type="month"
              value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        setSelectedGroupId(null);
                      }}
              className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent transition cursor-pointer"
            />
          </div>

          {groups.length > 0 && (
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Guruh tanlang
              </label>
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => {
                  const groupId = getGroupId(group);
                  const label = group.group_info?.name || group.group_name || `Guruh #${group.group_id}`;
                  return (
                    <button
                      key={groupId}
                      onClick={() => setSelectedGroupId(groupId)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                        Number(activeGroupId) === Number(groupId)
                          ? "bg-[#A60E07] text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {groupsError && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Xatolik yuz berdi</div>
          <p className="text-gray-600">{groupsError?.response?.data?.message || groupsError.message}</p>
        </div>
      )}

      {attendanceQuery.isLoading && activeGroupId && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="animate-pulse text-[#A60E07] text-xl font-bold">Yuklanmoqda...</div>
        </div>
      )}

      {attendanceQuery.isError && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Xatolik yuz berdi</div>
          <p className="text-gray-600">{attendanceQuery.error?.response?.data?.message || attendanceQuery.error?.message}</p>
        </div>
      )}

      {!groupsLoading && !groupsError && groups.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <CalendarDaysIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Guruh topilmadi</h3>
          <p className="text-sm text-gray-500">Siz hali guruhga biriktirilmagansiz.</p>
          {plannedSubject && (
            <p className="text-sm text-gray-700 mt-2">
              Ro&apos;yxatdan o&apos;tgan fan: <span className="font-semibold">{plannedSubject}</span>
            </p>
          )}
        </div>
      )}

      {!attendanceQuery.isLoading && !attendanceQuery.isError && activeGroupId && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-blue-500">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jami darslar</div>
              <div className="text-2xl font-extrabold text-blue-600">{effectiveStats.total_lessons || 0}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-green-500">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Keldi</div>
              <div className="text-2xl font-extrabold text-green-600">
                {effectiveStats.breakdown?.keldi ?? effectiveStats.attended_lessons ?? 0}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-red-500">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kelmadi</div>
              <div className="text-2xl font-extrabold text-red-600">
                {effectiveStats.breakdown?.kelmadi ?? effectiveStats.missed_lessons ?? 0}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-[#A60E07]">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Davomat %</div>
              <div className="text-2xl font-extrabold text-[#A60E07]">{effectiveStats.attendance_percentage || 0}%</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <AcademicCapIcon className="h-6 w-6 mr-3 text-[#A60E07]" />
                    {groupName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {[subjectName, teacherName].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    monthlyStatus === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {monthlyStatus || "Noma'lum"}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {dailyAttendance.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-16">#</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">Sana</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">Holat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dailyAttendance.map((item, index) => {
                      const normalizedStatus = getNormalizedAttendanceStatus(item);
                      const statusStyle = getAttendanceStatusStyle(normalizedStatus);
                      const StatusIcon = statusStyle.icon;
                      return (
                        <tr key={`${item.date || item.formatted_date || index}`} className="hover:bg-red-50 transition-colors duration-150">
                          <td className="px-6 py-4 text-sm font-bold text-gray-500">{index + 1}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-800">{item.formatted_date || item.date || "-"}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {StatusIcon ? <StatusIcon className={`h-5 w-5 mr-2 ${statusStyle.text}`} /> : null}
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                {normalizedStatus ? (item.status_description || statusStyle.label) : "-"}
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
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Davomat topilmadi</h3>
                  <p className="text-sm text-gray-500">Ushbu oy uchun kunlik davomat yo&apos;q.</p>
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

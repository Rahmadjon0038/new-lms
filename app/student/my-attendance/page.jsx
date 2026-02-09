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
  const groups = useMemo(() => groupsData?.data?.groups || [], [groupsData]);
  const getGroupId = (group) => group?.group_id ?? group?.group_info?.id ?? null;

  const activeGroupId = selectedGroupId ?? getGroupId(groups[0]) ?? null;

  const attendanceQuery = useGetStudentMonthlyAttendance(activeGroupId, selectedMonth);
  const attendancePayload = attendanceQuery.data?.data || {};
  const attendanceStats = attendancePayload.attendance_statistics || {};
  const attendanceBreakdown = attendancePayload.attendance_breakdown || {};
  const dailyAttendance = attendancePayload.daily_attendance || [];
  const monthlyStatus = attendancePayload.monthly_status;

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
      ? `${selectedGroup.teacher_info.name} ${selectedGroup.teacher_info.surname || ""}`.trim()
      : "";

  if (groupsLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-lg text-gray-600">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <CalendarDaysIcon className="h-7 w-7 mr-3 text-[#A60E07]" />
          Mening Davomatim
        </h1>
        <p className="text-sm text-gray-500">Oylik davomat hisobotingizni ko'ring</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-shrink-0">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Oyni tanlang
            </label>
            <input
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
        </div>
      )}

      {!attendanceQuery.isLoading && !attendanceQuery.isError && activeGroupId && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-blue-500">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jami darslar</div>
              <div className="text-2xl font-extrabold text-blue-600">{attendanceStats.total_lessons || 0}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-green-500">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Keldi</div>
              <div className="text-2xl font-extrabold text-green-600">
                {attendanceBreakdown.keldi ?? attendanceStats.attended_lessons ?? 0}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-red-500">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kelmadi</div>
              <div className="text-2xl font-extrabold text-red-600">
                {attendanceBreakdown.kelmadi ?? attendanceStats.missed_lessons ?? 0}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-[#A60E07]">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Davomat %</div>
              <div className="text-2xl font-extrabold text-[#A60E07]">{attendanceStats.attendance_percentage || 0}%</div>
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
                      const statusStyle = getAttendanceStatusStyle(item.status);
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
                                {item.status_description || statusStyle.label}
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

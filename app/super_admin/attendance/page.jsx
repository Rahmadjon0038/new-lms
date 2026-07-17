"use client";

import React, { useState } from "react";
import { CalendarDaysIcon, ChartBarIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useGetAttendanceTeachers } from "../../../hooks/attendance";

const MAIN_COLOR = "#A60E07";

const getTodayYmd = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatNumber = (value) => new Intl.NumberFormat("uz-UZ").format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = String(value).split("-");
  return `${day}.${month}.${year}`;
};

export default function SuperAdminAttendancePage() {
  const [date, setDate] = useState(getTodayYmd());
  const teachersQuery = useGetAttendanceTeachers({ date });

  const teachers = Array.isArray(teachersQuery.data?.data) ? teachersQuery.data.data : [];
  const totalGroups = teachers.reduce((sum, item) => sum + (Number(item.today_groups_count) || 0), 0);
  const completedGroups = teachers.reduce((sum, item) => sum + (Number(item.today_marked_groups_count) || 0), 0);
  const pendingGroups = Math.max(totalGroups - completedGroups, 0);
  const totalStudents = teachers.reduce((sum, item) => sum + (Number(item.students_count) || 0), 0);
  const percent = totalGroups > 0 ? Math.round((completedGroups / totalGroups) * 100) : 0;

  if (teachersQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {teachersQuery.error?.response?.data?.message || teachersQuery.error?.message || "Davomat statistikasi yuklanmadi"}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Davomat monitoring</h1>
          <p className="text-xs text-gray-500 sm:text-sm">{formatDate(date)} kuni bo&apos;yicha umumiy nazorat</p>
        </div>
        <div className="w-full sm:w-56">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value || getTodayYmd())}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800"
          />
        </div>
      </div>

      {teachersQuery.isLoading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          ))}
        </div>
      ) : (
        <>
          <section className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:grid-cols-[260px_1fr] sm:p-5">
            <div className="flex items-center justify-center">
              <div
                className="relative flex h-44 w-44 items-center justify-center rounded-full sm:h-56 sm:w-56"
                style={{
                  background: `conic-gradient(${MAIN_COLOR} 0 ${percent}%, #F3F4F6 ${percent}% 100%)`,
                }}
              >
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner sm:h-40 sm:w-40">
                  <span className="text-4xl font-black text-gray-900 sm:text-5xl">{percent}%</span>
                  <span className="mt-1 text-xs font-semibold text-gray-500">bajarildi</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <StatCard icon={CalendarDaysIcon} label="Bugungi guruhlar" value={totalGroups} tone="blue" />
              <StatCard icon={CheckCircleIcon} label="Davomat qilingan" value={completedGroups} tone="green" />
              <StatCard icon={XCircleIcon} label="Qilinmagan" value={pendingGroups} tone="amber" />
              <StatCard icon={ChartBarIcon} label="Talabalar" value={totalStudents} tone="red" />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-gray-900 sm:text-base">Teacherlar kesimi</h2>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                {formatNumber(teachers.length)} teacher
              </span>
            </div>
            {teachers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500">
                Bu kunda darsi bor guruhlar topilmadi.
              </div>
            ) : (
              <div className="space-y-2">
                {teachers.map((item) => {
                  const fullName = item.full_name || `${item.surname || ""} ${item.name || ""}`.trim();
                  const teacherTotal = Number(item.today_groups_count) || 0;
                  const teacherDone = Number(item.today_marked_groups_count) || 0;
                  const teacherPercent = teacherTotal > 0 ? Math.round((teacherDone / teacherTotal) * 100) : 0;
                  return (
                    <div key={item.teacher_id} className="rounded-xl border border-gray-100 bg-gray-50 p-2.5 sm:p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-gray-900">{fullName || "Teacher"}</p>
                        <span className="shrink-0 text-xs font-bold text-gray-600">
                          {teacherDone}/{teacherTotal} guruh
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${teacherPercent}%`, backgroundColor: MAIN_COLOR }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    red: "bg-red-50 text-red-800",
    green: "bg-emerald-50 text-emerald-800",
    amber: "bg-amber-50 text-amber-800",
    blue: "bg-blue-50 text-blue-800",
  };

  return (
    <div className={`rounded-2xl p-3 ${tones[tone] || tones.red}`}>
      <Icon className="mb-3 h-6 w-6" />
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 sm:text-xs">{label}</p>
      <p className="mt-1 text-2xl font-black">{formatNumber(value)}</p>
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useGetAttendanceTeachers } from "../../../hooks/attendance";
import { useGetAllSubjects } from "../../../hooks/subjects";
import { findEnglishSubject } from "../../../utils/englishManager";

const MAIN_COLOR = "#A60E07";
const DONE_COLOR = "#10B981";
const PENDING_COLOR = "#F59E0B";

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

export default function EnglishManagerAttendancePage() {
  const [date, setDate] = useState(getTodayYmd());

  const subjectsQuery = useGetAllSubjects();
  const englishSubject = useMemo(() => findEnglishSubject(subjectsQuery.data?.subjects || []), [subjectsQuery.data]);
  const subjectId = englishSubject?.id;

  const teachersQuery = useGetAttendanceTeachers({ date, subject_id: subjectId }, { enabled: !!subjectId });

  const teachers = Array.isArray(teachersQuery.data?.data) ? teachersQuery.data.data : [];
  const totalGroups = teachers.reduce((sum, item) => sum + (Number(item.today_groups_count) || 0), 0);
  const completedGroups = teachers.reduce((sum, item) => sum + (Number(item.today_marked_groups_count) || 0), 0);
  const pendingGroups = Math.max(totalGroups - completedGroups, 0);
  const percent = totalGroups > 0 ? Math.round((completedGroups / totalGroups) * 100) : 0;

  if (subjectsQuery.isLoading) {
    return <div className="rounded-lg bg-white p-4 text-sm text-gray-500">Yuklanmoqda...</div>;
  }

  if (!subjectId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        English subject topilmadi.
      </div>
    );
  }

  if (teachersQuery.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {teachersQuery.error?.response?.data?.message || teachersQuery.error?.message || "Davomat statistikasi yuklanmadi"}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">Davomat monitoring</h1>
            <p className="text-xs text-gray-500">{formatDate(date)} kuni bo&apos;yicha English guruhlar nazorati</p>
          </div>
          <div className="w-full sm:w-56">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value || getTodayYmd())}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800"
            />
          </div>
        </div>
      </div>

      {teachersQuery.isLoading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-lg border border-gray-200 bg-white" />
          ))}
        </div>
      ) : (
        <>
          <section className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: MAIN_COLOR }}>
                  <UserGroupIcon className="h-5 w-5" />
                </span>
                <h2 className="truncate text-base font-bold text-gray-900">Bugungi davomat</h2>
              </div>
              <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                Jami: {formatNumber(totalGroups)} guruh
              </span>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex shrink-0 items-center justify-center">
                <div
                  className="relative flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background:
                      totalGroups > 0
                        ? `conic-gradient(${DONE_COLOR} 0 ${percent}%, ${PENDING_COLOR} ${percent}% 100%)`
                        : "conic-gradient(#E5E7EB 0 100%)",
                  }}
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
                    <span className="text-3xl font-black text-gray-900">{percent}%</span>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-sm space-y-3">
                <LegendRow color={DONE_COLOR} label="Davomat qilingan" value={`${formatNumber(completedGroups)} guruh`} />
                <LegendRow color={PENDING_COLOR} label="Qilinmagan" value={`${formatNumber(pendingGroups)} guruh`} />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-gray-900">Teacherlar kesimi</h2>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                {formatNumber(teachers.length)} teacher
              </span>
            </div>
            {teachers.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500">
                Bu kunda darsi bor English guruhlar topilmadi.
              </div>
            ) : (
              <div className="space-y-2">
                {teachers.map((item) => {
                  const fullName = item.full_name || `${item.surname || ""} ${item.name || ""}`.trim();
                  const teacherTotal = Number(item.today_groups_count) || 0;
                  const teacherDone = Number(item.today_marked_groups_count) || 0;
                  const teacherPercent = teacherTotal > 0 ? Math.round((teacherDone / teacherTotal) * 100) : 0;
                  return (
                    <div key={item.teacher_id} className="rounded-md border border-gray-100 bg-gray-50 p-2.5">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-gray-900">{fullName || "Teacher"}</p>
                        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-bold text-gray-700">
                          {teacherDone}/{teacherTotal} guruh • {teacherPercent}%
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

function LegendRow({ color, label, value }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-sm">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-bold text-gray-700">{label}</span>
      <span className="font-black" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

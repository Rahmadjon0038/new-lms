"use client";

import React, { useMemo, useState } from "react";
import { ChevronDownIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useGetAttendanceByDate, useGetAttendanceTeachers } from "../../../hooks/attendance";
import { useGetAllSubjects } from "../../../hooks/subjects";
import { findEnglishSubject } from "../../../utils/englishManager";
import MonthlyAttendanceInline from "../../../components/MonthlyAttendanceInline";

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
  const [expandedTeacherId, setExpandedTeacherId] = useState(null);

  const subjectsQuery = useGetAllSubjects();
  const englishSubject = useMemo(() => findEnglishSubject(subjectsQuery.data?.subjects || []), [subjectsQuery.data]);
  const subjectId = englishSubject?.id;

  const teachersQuery = useGetAttendanceTeachers({ date, subject_id: subjectId }, { enabled: !!subjectId });

  const allTeachers = Array.isArray(teachersQuery.data?.data) ? teachersQuery.data.data : [];
  // Jami — teacherlarning UMUMIY (barcha) guruhlari soni
  const allGroups = allTeachers.reduce((sum, item) => sum + (Number(item.groups_count) || 0), 0);
  // "Teacherlar kesimi" ro'yxatida faqat tanlangan sanada darsi bor teacherlar chiqadi
  const teachers = allTeachers.filter((item) => (Number(item.today_groups_count) || 0) > 0);
  // Bugun darsi bor — tanlangan sanada darsi rejalashtirilgan guruhlar soni
  const todayGroups = teachers.reduce((sum, item) => sum + (Number(item.today_groups_count) || 0), 0);
  const completedGroups = teachers.reduce((sum, item) => sum + (Number(item.today_marked_groups_count) || 0), 0);
  const pendingGroups = Math.max(todayGroups - completedGroups, 0);
  const percent = todayGroups > 0 ? Math.round((completedGroups / todayGroups) * 100) : 0;

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
              onChange={(e) => {
                setDate(e.target.value || getTodayYmd());
                setExpandedTeacherId(null);
              }}
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
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                  Bugun darsi bor: {formatNumber(todayGroups)} guruh
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                  Jami: {formatNumber(allGroups)} guruh
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex shrink-0 items-center justify-center">
                <div
                  className="relative flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background:
                      todayGroups > 0
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
                  const isOpen = expandedTeacherId === item.teacher_id;
                  return (
                    <div key={item.teacher_id} className="rounded-md border border-gray-100 bg-gray-50 p-2.5">
                      <button
                        type="button"
                        onClick={() => setExpandedTeacherId(isOpen ? null : item.teacher_id)}
                        className="w-full text-left"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-bold text-gray-900">
                            <ChevronDownIcon
                              className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                            <span className="truncate">{fullName || "Teacher"}</span>
                          </p>
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
                      </button>

                      {isOpen && (
                        <TeacherAttendanceDetails teacherId={item.teacher_id} date={date} subjectId={subjectId} />
                      )}
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

// Teacher qatori ochilganda — o'sha kundagi darsi bor guruhlarini va har biri
// uchun oylik davomat jadvalini (kelgan/kelmagan kunlar) ko'rsatadi.
function TeacherAttendanceDetails({ teacherId, date, subjectId }) {
  const query = useGetAttendanceByDate({ date, teacher_id: teacherId, subject_id: subjectId });
  const groups = Array.isArray(query.data?.data?.groups) ? query.data.data.groups : [];
  const month = String(date || "").slice(0, 7);

  if (query.isLoading) {
    return <div className="mt-3 py-3 text-center text-xs text-gray-500">Yuklanmoqda...</div>;
  }

  if (query.isError) {
    return (
      <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
        Ma&apos;lumot yuklanmadi
      </div>
    );
  }

  if (groups.length === 0) {
    return <div className="mt-3 py-3 text-center text-xs text-gray-500">Bu kunda darsi yo&apos;q.</div>;
  }

  return (
    <div className="mt-3 space-y-4 border-t border-gray-200 pt-3">
      {groups.map((group) => {
        const firstLesson = (group.lessons || [])[0];
        const start = String(firstLesson?.start_time || "").trim();
        const end = String(firstLesson?.end_time || "").trim();
        const timeLabel = start && end ? `${start}-${end}` : start || "";
        return (
          <div key={group.group_id} className="rounded-md bg-white p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="truncate text-xs font-bold text-gray-900">
                {group.group_name}
                {timeLabel && (
                  <span className="ml-1.5 font-semibold text-gray-500">({timeLabel})</span>
                )}
              </p>
              {group.room_number && (
                <span className="shrink-0 text-[11px] text-gray-500">{group.room_number}-xona</span>
              )}
            </div>
            <MonthlyAttendanceInline groupId={group.group_id} selectedMonth={month} />
          </div>
        );
      })}
    </div>
  );
}

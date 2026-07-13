"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { UserGroupIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useGetAttendanceGroups, useGetAttendanceTeachers, useGetStudentAttendanceSnapshot } from "../../../hooks/attendance";
import { format, parseISO, isValid } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { instance } from "../../../hooks/api";
import { toast } from "react-hot-toast";
import { normalizeMonth } from "../../../utils/date";

const MAIN_COLOR = "#A60E07";
const getTodayYmd = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const getMonthEndYmd = (month) => {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return getTodayYmd();
  const [year, mon] = month.split("-").map(Number);
  const end = new Date(Date.UTC(year, mon, 0));
  const yyyy = end.getUTCFullYear();
  const mm = String(end.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(end.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const getHolidays = async ({ month }) => {
  const normalizedMonth = normalizeMonth(month);
  const params = new URLSearchParams();
  if (normalizedMonth) params.append("month", normalizedMonth);
  const response = await instance.get(`/api/attendance/holidays?${params.toString()}`);
  return response.data;
};

const getMonthlySnapshotSummary = async ({ month }) => {
  const normalizedMonth = normalizeMonth(month);
  const params = new URLSearchParams();
  if (normalizedMonth) params.append("month", normalizedMonth);
  const response = await instance.get(`/api/snapshots/summary?${params.toString()}`);
  return response.data;
};

const parseSnapshotDate = (value) => {
  if (!value) return 0;
  if (typeof value !== "string") return 0;
  const [datePart, timePart = "00:00"] = value.trim().split(" ");
  const [day, month, year] = datePart.split(".").map(Number);
  if (!day || !month || !year) return 0;
  const [hours = 0, minutes = 0] = timePart.split(":").map(Number);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const weekdayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

const formatAttendanceDate = (value) => {
  if (!value) {
    return { dateLabel: "-", weekdayLabel: "" };
  }

  const parsed = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(parsed)) {
    return { dateLabel: String(value), weekdayLabel: "" };
  }

  return {
    dateLabel: format(parsed, "dd.MM.yyyy"),
    weekdayLabel: weekdayNames[parsed.getDay()] || "",
  };
};

const getStoppedSnapshotsForMonth = async ({ month }) => {
  const normalizedMonth = normalizeMonth(month);
  if (!normalizedMonth) {
    return { month: normalizedMonth, students: [], total: 0, summary: null };
  }

  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  let total = 0;
  let summary = null;
  const allStudents = [];

  while (page <= totalPages) {
    const params = new URLSearchParams();
    params.append("month", normalizedMonth);
    params.append("status", "stopped");
    params.append("page", String(page));
    params.append("limit", String(pageSize));

    const response = await instance.get(`/api/snapshots?${params.toString()}`);
    const payload = response.data?.data || {};
    const students = Array.isArray(payload.students) ? payload.students : [];

    if (page === 1) {
      summary = payload.summary || null;
      total = Number(payload.pagination?.total || students.length || 0);
      totalPages = Number(payload.pagination?.total_pages || 1);
    }

    allStudents.push(...students);
    page += 1;
  }

  const sortedStudents = [...allStudents].sort((a, b) => {
    const timeA = parseSnapshotDate(a.snapshot_updated_at || a.snapshot_created_at);
    const timeB = parseSnapshotDate(b.snapshot_updated_at || b.snapshot_created_at);
    return timeB - timeA;
  });

  return {
    month: normalizedMonth,
    students: sortedStudents,
    total,
    summary,
  };
};

const toggleHoliday = async ({ date, is_holiday }) => {
  const response = await instance.patch(`/api/attendance/holidays`, {
    date,
    is_holiday,
  });
  return response.data;
};

const StoppedStudentDetailsCard = ({ item, month, index }) => {
  const attendanceQuery = useGetStudentAttendanceSnapshot(item.student_id, item.group_id, month);
  const dailyAttendance = Array.isArray(attendanceQuery.data?.data?.daily_attendance)
    ? attendanceQuery.data.data.daily_attendance
    : [];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 bg-gray-50 px-2.5 py-2.5 sm:px-3 sm:py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-gray-900 sm:text-base">
              {item.student_name} {item.student_surname}
            </h4>
            <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 sm:px-2.5 sm:py-1 sm:text-[11px]">
              To&apos;xtatilgan
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-gray-600 sm:text-xs sm:gap-x-2 sm:text-sm">
            <span>
              <span className="font-medium text-gray-700">Teacher:</span> {item.teacher_name || "-"}
            </span>
            <span className="text-gray-300">|</span>
            <span>
              <span className="font-medium text-gray-700">Guruh:</span> {item.group_name || "-"}
            </span>
            <span className="text-gray-300">|</span>
            <span>
              <span className="font-medium text-gray-700">Fan:</span> {item.subject_name || "-"}
            </span>
          </div>
        </div>

        <div className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-gray-500 sm:px-3 sm:py-1 sm:text-xs">
          {formatAttendanceDate(item.snapshot_updated_at || item.snapshot_created_at).dateLabel}
        </div>
      </div>

      <div className="px-2.5 py-2.5 sm:px-3 sm:py-3">
        {attendanceQuery.isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500">
            Davomat yuklanmoqda...
          </div>
        ) : attendanceQuery.isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700">
            Davomat yuklanmadi.
          </div>
        ) : dailyAttendance.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-500">
            Bu oylik davomat topilmadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse overflow-hidden rounded-lg border border-gray-300 text-center text-sm">
              <thead className="bg-white">
                <tr>
                  {dailyAttendance.map((day) => {
                    const isMarked = day.status === "keldi" || day.status === "present";
                    const isMissed = day.status === "kelmadi" || day.status === "absent";
                    const isLate = day.status === "kechikdi" || day.status === "late";
                    const dayDate = formatAttendanceDate(day.lesson_date || day.formatted_date);
                    return (
                      <th
                        key={day.lesson_date || day.formatted_date}
                        className="min-w-20 border border-gray-300 px-1.5 py-1.5 align-top sm:min-w-24 sm:px-2 sm:py-2"
                      >
                        <div className="text-[11px] font-semibold text-gray-800 sm:text-xs">
                          {dayDate.dateLabel}
                        </div>
                        <div className="mt-0.5 text-[10px] text-gray-500 sm:text-[11px]">
                          {dayDate.weekdayLabel}
                        </div>
                        <div className="mt-1.5 flex min-h-8 items-center justify-center sm:mt-2 sm:min-h-10">
                          {day.is_holiday ? (
                            <span className="text-[10px] font-semibold text-gray-400 sm:text-[11px]">Dam olish</span>
                          ) : isMarked ? (
                            <span className="text-lg font-bold leading-none text-green-600 sm:text-xl">✓</span>
                          ) : isLate ? (
                            <span className="text-lg font-bold leading-none text-amber-500 sm:text-xl">!</span>
                          ) : isMissed ? (
                            <span className="text-lg font-bold leading-none text-red-500 sm:text-xl">×</span>
                          ) : (
                            <span className="text-lg font-bold leading-none text-gray-300 sm:text-xl">-</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminAttendancePage() {
  const [search, setSearch] = useState("");
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceDate, setAttendanceDate] = useState(getTodayYmd());
  const [holidayDate, setHolidayDate] = useState(getTodayYmd());
  const [holidayMonth, setHolidayMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isStoppedModalOpen, setIsStoppedModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const holidayDateLabel = useMemo(() => {
    if (!holidayDate) return "";
    const parsed = parseISO(holidayDate);
    if (!isValid(parsed)) return holidayDate;
    return holidayDate;
  }, [holidayDate]);
  const teachersQuery = useGetAttendanceTeachers({
    date: attendanceDate || undefined,
    month: attendanceMonth || undefined,
  });
  const allGroupsQuery = useGetAttendanceGroups({
    status_filter: "all",
    count_mode: "all",
  });
  const monthlySummaryQuery = useQuery({
    queryKey: ["monthly-snapshot-summary", attendanceMonth],
    queryFn: () => getMonthlySnapshotSummary({ month: attendanceMonth }),
    enabled: Boolean(attendanceMonth),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const stoppedSnapshotsQuery = useQuery({
    queryKey: ["attendance-stopped-snapshots", attendanceMonth],
    queryFn: () => getStoppedSnapshotsForMonth({ month: attendanceMonth }),
    enabled: Boolean(attendanceMonth && isStoppedModalOpen),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const holidaysQuery = useQuery({
    queryKey: ["attendance-holidays", holidayMonth],
    queryFn: () => getHolidays({ month: holidayMonth }),
    enabled: Boolean(holidayMonth),
  });

  const holidayDates = useMemo(() => {
    const dates = holidaysQuery.data?.data?.dates;
    return Array.isArray(dates) ? dates : [];
  }, [holidaysQuery.data]);

  const holidayDateSet = useMemo(() => new Set(holidayDates), [holidayDates]);
  const sortedHolidayDates = useMemo(() => {
    if (!Array.isArray(holidayDates)) return [];
    return [...holidayDates].sort();
  }, [holidayDates]);
  const toggleHolidayMutation = useMutation({
    mutationFn: toggleHoliday,
    onSuccess: (data) => {
      const isHoliday = data?.data?.is_holiday;
      toast.success(isHoliday ? "Dam olish kuni belgilandi!" : "Dam olish kuni bekor qilindi!");
      queryClient.invalidateQueries({ queryKey: ["attendance-holidays", holidayMonth] });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Dam olish kunini belgilashda xatolik";
      toast.error(message);
    },
  });

  const teachers = useMemo(() => {
    const payload = teachersQuery.data;
    const raw = payload?.data;
    return Array.isArray(raw) ? raw : [];
  }, [teachersQuery.data]);

  const filteredTeachers = useMemo(() => {
    const key = search.trim().toLowerCase();
    return teachers.filter((item) => {
      if (!key) return true;
      return String(item.full_name || `${item.surname || ""} ${item.name || ""}`)
        .toLowerCase()
        .includes(key);
    });
  }, [teachers, search]);

  const summaryStats = useMemo(() => {
    const stoppedValue = monthlySummaryQuery.data?.summary?.stopped_students;
    const stoppedStudents = monthlySummaryQuery.isLoading || monthlySummaryQuery.isFetching
      ? null
      : Number(stoppedValue || 0);
    return { stopped: stoppedStudents };
  }, [monthlySummaryQuery.data, monthlySummaryQuery.isLoading, monthlySummaryQuery.isFetching]);

  const totalStudents = useMemo(() => {
    const groups = Array.isArray(allGroupsQuery.data?.data) ? allGroupsQuery.data.data : [];
    return groups.reduce((sum, item) => sum + Number(item.students_count || 0), 0);
  }, [allGroupsQuery.data]);

  // Tanlangan kunda darsi bor guruhlar bo'yicha davomat holati (mobil dashboarddagi donut kabi)
  const dailyAttendanceStats = useMemo(() => {
    const total = teachers.reduce((sum, t) => sum + (Number(t.today_groups_count) || 0), 0);
    const marked = teachers.reduce((sum, t) => sum + (Number(t.today_marked_groups_count) || 0), 0);
    const pending = Math.max(0, total - marked);
    const percent = total > 0 ? Math.round((marked / total) * 100) : 0;
    return { total, marked, pending, percent };
  }, [teachers]);

  const handleToggleHoliday = () => {
    if (!holidayDate) {
      toast.error("Iltimos, sana tanlang");
      return;
    }
    const isHolidaySelected = holidayDateSet.has(holidayDate);
    toggleHolidayMutation.mutate({
      date: holidayDate,
      is_holiday: !isHolidaySelected,
    });
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 md:p-6">
      <div className="flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-3 rounded-full border border-[#A60E07]/15 bg-white px-4 py-2 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#A60E07]">Jami</span>
          <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-[#A60E07] px-3 py-1 text-sm font-bold text-white">
            {totalStudents}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsStoppedModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-sm font-black leading-none text-amber-700">{">"}</span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-amber-700">To&apos;xtatgan</span>
          <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-amber-500 px-3 py-1 text-sm font-bold text-white">
            {summaryStats.stopped === null ? "..." : summaryStats.stopped}
          </span>
        </button>
      </div>

      <div className="flex w-full justify-end">
        <div className="w-full rounded-xl border border-gray-200 bg-white p-3 sm:w-auto sm:border-0 sm:bg-transparent sm:p-0">
          <div className="mt-2 grid grid-cols-1 gap-2 sm:mt-0 sm:flex sm:items-center sm:gap-2">
            <input
              type="date"
              value={holidayDate}
              onChange={(e) => {
                const nextDate = e.target.value;
                setHolidayDate(nextDate);
                if (nextDate) setHolidayMonth(nextDate.slice(0, 7));
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-40"
            />
            <button
              type="button"
              onClick={handleToggleHoliday}
              disabled={toggleHolidayMutation.isLoading}
              className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              {toggleHolidayMutation.isLoading
                ? "Saqlanmoqda..."
                : holidayDateSet.has(holidayDate)
                  ? "Damni bekor qilish"
                  : "Dam olish"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Teacher ism bo'yicha qidirish"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="month"
            value={attendanceMonth}
            onChange={(e) => {
              const nextMonth = e.target.value;
              setAttendanceMonth(nextMonth);
              if (nextMonth) {
                setAttendanceDate(getMonthEndYmd(nextMonth));
              }
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => {
              const nextDate = e.target.value;
              setAttendanceDate(nextDate);
              if (nextDate) {
                setAttendanceMonth(nextDate.slice(0, 7));
              }
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {!teachersQuery.isLoading && !teachersQuery.isError ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: MAIN_COLOR }}
              >
                <UserGroupIcon className="h-5 w-5 text-white" />
              </span>
              {attendanceDate === getTodayYmd() ? "Bugungi davomat" : `${attendanceDate} davomati`}
            </h3>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
              Jami: {dailyAttendanceStats.total} guruh
            </span>
          </div>
          {dailyAttendanceStats.total === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              Bu kunda jadval bo&apos;yicha darsi bor guruhlar yo&apos;q.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
              <div className="relative h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { label: "Davomat qilingan", value: dailyAttendanceStats.marked },
                        { label: "Qilinmagan", value: dailyAttendanceStats.pending },
                      ].filter((item) => item.value > 0)}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={
                        dailyAttendanceStats.marked > 0 && dailyAttendanceStats.pending > 0 ? 3 : 0
                      }
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {dailyAttendanceStats.marked > 0 ? <Cell key="marked" fill="#10B981" /> : null}
                      {dailyAttendanceStats.pending > 0 ? <Cell key="pending" fill="#F59E0B" /> : null}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} guruh`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-gray-900">
                    {dailyAttendanceStats.percent}%
                  </span>
                </div>
              </div>
              <div className="w-full space-y-3 sm:w-auto sm:min-w-64">
                <div className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    Davomat qilingan
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {dailyAttendanceStats.marked} guruh
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    Qilinmagan
                  </span>
                  <span className="text-sm font-bold text-amber-600">
                    {dailyAttendanceStats.pending} guruh
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="text-xs text-gray-600 space-y-1">
        {holidayDateSet.has(holidayDate) ? (
          <div>{holidayDateLabel} — dam olish kuni</div>
        ) : null}
        {sortedHolidayDates.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sortedHolidayDates.map((dateStr) => (
              <span
                key={dateStr}
                className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-700"
              >
                {dateStr} — dam olish kuni
              </span>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-gray-400">Dam olish kunlari yo‘q</div>
        )}
      </div>

      {teachersQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 h-5 w-40 rounded bg-gray-200" />
              <div className="mb-2 h-4 w-32 rounded bg-gray-100" />
              <div className="mb-2 h-4 w-24 rounded bg-gray-100" />
              <div className="h-4 w-20 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : null}

      {teachersQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {teachersQuery.error?.response?.data?.message || teachersQuery.error?.message || "Teacherlar yuklanmadi"}
        </div>
      ) : null}

      {!teachersQuery.isLoading && !teachersQuery.isError ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((item) => {
            const fullName = item.full_name || `${item.surname || ""} ${item.name || ""}`.trim();
            const subjects = Array.isArray(item.subjects) ? item.subjects.join(", ") : "-";
            const rooms = Array.isArray(item.room_numbers) ? item.room_numbers.join(", ") : "-";
            const groupsCount = Number(item.groups_count) || 0;
            const todayGroupsCount = Number(item.today_groups_count) || 0;
            const todayMarkedGroupsCount = Number(item.today_marked_groups_count) || 0;
            const progressPercent =
              todayGroupsCount > 0
                ? Math.round((todayMarkedGroupsCount / todayGroupsCount) * 100)
                : 0;

            return (
              <Link
                href={`/admin/attendance/teachers/${item.teacher_id}`}
                key={item.teacher_id}
                className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-red-200 hover:shadow-md"
              >
                <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-gray-900">
                  <UserGroupIcon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
                  {fullName}
                </h3>
                <p className="text-sm text-gray-700"><span className="font-semibold">Fanlar:</span> {subjects}</p>
                <p className="text-sm text-gray-700"><span className="font-semibold">Xonalar:</span> {rooms}</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">Guruhlar soni: {groupsCount}</p>
                <p className="text-sm font-semibold text-gray-900">Bugun darsi bor guruhlar soni: {todayGroupsCount}</p>
                <p className="text-sm font-semibold text-gray-900">Talabalar soni: {Number(item.students_count || 0)}</p>
                <div className="text-xs text-gray-600">
                  Belgilangan guruhlar:{" "}
                  <span className="font-semibold text-gray-900">{todayMarkedGroupsCount}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Progress: {progressPercent}%
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}

      {!teachersQuery.isLoading && !teachersQuery.isError && filteredTeachers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Teacher topilmadi.
        </div>
      ) : null}

      {isStoppedModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4"
          onClick={() => setIsStoppedModalOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">To&apos;xtatilgan talabalar</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {attendanceMonth} oyi bo&apos;yicha to&apos;xtatilgan talabalar ro&apos;yxati
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStoppedModalOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[80vh] overflow-auto px-4 py-4 sm:px-6">
              {stoppedSnapshotsQuery.isLoading ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  Yuklanmoqda...
                </div>
              ) : stoppedSnapshotsQuery.isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {stoppedSnapshotsQuery.error?.response?.data?.message || stoppedSnapshotsQuery.error?.message || ("To" + "'" + "xtatilgan talabalar yuklanmadi")}
                </div>
              ) : (stoppedSnapshotsQuery.data?.students || []).length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  Bu oyda to&apos;xtatilgan talabalar topilmadi.
                </div>
              ) : (
                <div className="space-y-4">
                  {(stoppedSnapshotsQuery.data?.students || []).map((item, index) => (
                    <StoppedStudentDetailsCard
                      key={`${item.id || item.student_id}-${item.group_id}-${item.month}-${index}`}
                      item={item}
                      month={attendanceMonth}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

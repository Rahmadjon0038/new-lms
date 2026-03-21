"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CalendarIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useGetAttendanceTeachers } from "../../../hooks/attendance";
import { DayPicker } from "react-day-picker";
import { format, parseISO, isValid } from "date-fns";
import "react-day-picker/dist/style.css";
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
const getHolidays = async ({ month }) => {
  const normalizedMonth = normalizeMonth(month);
  const params = new URLSearchParams();
  if (normalizedMonth) params.append("month", normalizedMonth);
  const response = await instance.get(`/api/attendance/holidays?${params.toString()}`);
  return response.data;
};

const toggleHoliday = async ({ date, is_holiday }) => {
  const response = await instance.patch(`/api/attendance/holidays`, {
    date,
    is_holiday,
  });
  return response.data;
};
export default function AdminAttendancePage() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(getTodayYmd());
  const [holidayDate, setHolidayDate] = useState(getTodayYmd());
  const [holidayCalendarDate, setHolidayCalendarDate] = useState(getTodayYmd());
  const [isHolidayCalendarOpen, setIsHolidayCalendarOpen] = useState(false);
  const holidayCalendarRef = useRef(null);
  const [holidayMonth, setHolidayMonth] = useState(new Date().toISOString().slice(0, 7));
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (holidayCalendarRef.current && !holidayCalendarRef.current.contains(event.target)) {
        setIsHolidayCalendarOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const selectedHolidayDate = useMemo(() => {
    if (!holidayCalendarDate) return undefined;
    const parsed = parseISO(holidayCalendarDate);
    return isValid(parsed) ? parsed : undefined;
  }, [holidayCalendarDate]);
  const teachersQuery = useGetAttendanceTeachers({
    date: date || undefined,
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
  const holidayDateObjects = useMemo(
    () =>
      holidayDates
        .map((dateStr) => {
          const parsed = parseISO(String(dateStr));
          return isValid(parsed) ? parsed : null;
        })
        .filter(Boolean),
    [holidayDates]
  );

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
    if (!key) return teachers;
    return teachers.filter((item) =>
      String(item.full_name || `${item.surname || ""} ${item.name || ""}`)
        .toLowerCase()
        .includes(key)
    );
  }, [teachers, search]);

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
      <div className="w-full rounded-xl border border-gray-200 bg-white p-3 sm:ml-auto sm:w-auto sm:border-0 sm:bg-transparent sm:p-0">
        <div className="flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            Dam olish
          </div>
          <button
            type="button"
            onClick={() => setIsHolidayCalendarOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
            aria-label="Holiday calendar"
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 sm:mt-0 sm:flex sm:items-center sm:gap-2">
          <div className="relative hidden sm:block" ref={holidayCalendarRef}>
            <button
              type="button"
              onClick={() => setIsHolidayCalendarOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
              aria-label="Holiday calendar"
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
            {isHolidayCalendarOpen ? (
              <div className="absolute right-0 z-50 mt-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                <DayPicker
                  mode="single"
                  selected={selectedHolidayDate}
                  onSelect={(day) => {
                    if (!day) return;
                    const nextDate = format(day, "yyyy-MM-dd");
                    const nextMonth = nextDate.slice(0, 7);
                    setHolidayCalendarDate(nextDate);
                    setHolidayDate(nextDate);
                    setHolidayMonth(nextMonth);
                    setIsHolidayCalendarOpen(false);
                  }}
                  modifiers={{ holiday: holidayDateObjects }}
                  modifiersStyles={{
                    holiday: { backgroundColor: "#DBEAFE", color: "#1D4ED8" },
                  }}
                />
              </div>
            ) : null}
          </div>

          <div className="relative sm:hidden" ref={holidayCalendarRef}>
            {isHolidayCalendarOpen ? (
              <div className="absolute right-0 z-50 mt-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                <DayPicker
                  mode="single"
                  selected={selectedHolidayDate}
                  onSelect={(day) => {
                    if (!day) return;
                    const nextDate = format(day, "yyyy-MM-dd");
                    const nextMonth = nextDate.slice(0, 7);
                    setHolidayCalendarDate(nextDate);
                    setHolidayDate(nextDate);
                    setHolidayMonth(nextMonth);
                    setIsHolidayCalendarOpen(false);
                  }}
                  modifiers={{ holiday: holidayDateObjects }}
                  modifiersStyles={{
                    holiday: { backgroundColor: "#DBEAFE", color: "#1D4ED8" },
                  }}
                />
              </div>
            ) : null}
          </div>

          <input
            type="date"
            value={holidayDate}
            onChange={(e) => {
              const nextDate = e.target.value;
              setHolidayDate(nextDate);
              setHolidayCalendarDate(nextDate);
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

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Teacher ism bo'yicha qidirish"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="text-xs text-gray-600">
        {holidayDateSet.has(holidayDate) ? (
          <span>Bugun dam olish</span>
        ) : null}
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
                <div className="mt-2 text-xs text-gray-600">
                  Bugungi darsli guruhlar:{" "}
                  <span className="font-semibold text-gray-900">{todayGroupsCount}</span>
                </div>
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
    </div>
  );
}

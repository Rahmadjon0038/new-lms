"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useGetAttendanceTeachers } from "../../../hooks/attendance";

const MAIN_COLOR = "#A60E07";
const getTodayYmd = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
export default function AdminAttendancePage() {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(getTodayYmd());
  const teachersQuery = useGetAttendanceTeachers({
    date: date || undefined,
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

  return (
    <div className="space-y-4 p-3 sm:p-4 md:p-6">
      

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

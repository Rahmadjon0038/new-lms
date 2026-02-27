"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useGetAttendanceTeacherGroups } from "../../../../../hooks/attendance";

export default function SuperAdminTeacherGroupsPage() {
  const { teacher_id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();

  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [shift, setShift] = useState("");
  const hasActiveFilters = Boolean(date || day || shift);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (date) params.set("date", date); else params.delete("date");
    if (day) params.set("day", day); else params.delete("day");
    if (shift) params.set("shift", shift); else params.delete("shift");
    router.replace(`${pathname}?${params.toString()}`);
  }, [date, day, shift, pathname, router, searchString]);

  const query = useGetAttendanceTeacherGroups(teacher_id, {
    date: date || undefined,
    day: day || undefined,
    shift: shift || undefined,
  });

  const teacher = useMemo(() => {
    const payload = query.data?.data;
    return payload?.teacher || null;
  }, [query.data]);

  const groups = useMemo(() => {
    const payload = query.data?.data;
    return Array.isArray(payload?.groups) ? payload.groups : [];
  }, [query.data]);
  const activeGroups = groups;
  const isLoadingGroups = query.isLoading;
  const isErrorGroups = query.isError;

  return (
    <div className="space-y-4 p-3 sm:p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Link href="/super_admin/attendance" className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{teacher?.full_name || "Teacher Groups"}</h1>
          <p className="text-sm text-gray-600">Teacher guruhlari ro&apos;yxati</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-4">
        <label className="text-sm text-gray-700">
          <span className="mb-1 block font-medium">Day (ixtiyoriy)</span>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 ${day ? "border-[#A60E07] bg-red-50" : "border-gray-300"}`}
          >
            <option value="">Barchasi</option>
            <option value="dushanba">dushanba</option>
            <option value="seshanba">seshanba</option>
          </select>
        </label>

        <label className="text-sm text-gray-700">
          <span className="mb-1 block font-medium">Shift (ixtiyoriy)</span>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 ${shift ? "border-[#A60E07] bg-red-50" : "border-gray-300"}`}
          >
            <option value="">Barchasi</option>
            <option value="morning">kunduzgi</option>
            <option value="evening">kechki</option>
          </select>
        </label>

        <label className="text-sm text-gray-700">
          <span className="mb-1 block font-medium">Date (ixtiyoriy)</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 ${date ? "border-[#A60E07] bg-red-50" : "border-gray-300"}`}
          />
        </label>

        <div className="flex items-end">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setDate("");
                setDay("");
                setShift("");
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Filterlarni tozalash
            </button>
          ) : null}
        </div>
      </div>

      {isLoadingGroups ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 h-5 w-40 rounded bg-gray-200" />
              <div className="mb-2 h-4 w-28 rounded bg-gray-100" />
              <div className="h-4 w-20 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : null}

      {isErrorGroups ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {query.error?.response?.data?.message || query.error?.message || "Guruhlar yuklanmadi"}
        </div>
      ) : null}

      {!isLoadingGroups && !isErrorGroups ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeGroups.map((group) => (
            <div key={group.group_id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-bold text-gray-900">{group.group_name}</h3>
              <p className="text-sm text-gray-700"><span className="font-semibold">Fan:</span> {group.subject_name || "-"}</p>
              <p className="text-sm text-gray-700"><span className="font-semibold">Xona:</span> {group.room_number || "-"}</p>
              <p className="text-sm text-gray-700"><span className="font-semibold">Talabalar:</span> {Number(group.students_count) || 0}</p>
              <p className="text-sm text-gray-700"><span className="font-semibold">Jadval:</span> {Array.isArray(group.schedule?.days) ? group.schedule.days.join(", ") : "-"} {group.schedule?.time ? `(${group.schedule.time})` : ""}</p>
            </div>
          ))}
        </div>
      ) : null}

      {!isLoadingGroups && !isErrorGroups && activeGroups.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Guruh topilmadi.
        </div>
      ) : null}
    </div>
  );
}

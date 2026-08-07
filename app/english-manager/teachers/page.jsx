"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PhoneIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { instance } from "../../../hooks/api";
import { useGetAllSubjects } from "../../../hooks/subjects";
import { findEnglishSubject, formatCount } from "../../../utils/englishManager";

const normalizeText = (v) => String(v || "").toLowerCase().trim();

const formatPhoneNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  const normalized = digits.startsWith("998") ? digits.slice(3) : digits.startsWith("8") ? digits.slice(1) : digits;
  if (normalized.length !== 9) return value || "-";
  return `+998-${normalized.slice(0, 2)}-${normalized.slice(2, 5)}-${normalized.slice(5, 7)}-${normalized.slice(7, 9)}`;
};

const telHref = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  const normalized = digits.startsWith("998") ? digits : digits.startsWith("8") ? `998${digits.slice(1)}` : `998${digits}`;
  return `tel:+${normalized}`;
};

const initialsOf = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const AVATAR_COLORS = [
  "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500", "bg-violet-500",
  "bg-fuchsia-500", "bg-teal-500", "bg-orange-500", "bg-indigo-500", "bg-lime-600",
];
const avatarColor = (key) => {
  const s = String(key || "");
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

export default function EnglishManagerTeachersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const subjectsQuery = useGetAllSubjects();
  const englishSubject = useMemo(() => findEnglishSubject(subjectsQuery.data?.subjects || []), [subjectsQuery.data]);
  const subjectId = englishSubject?.id;

  const teachersQuery = useQuery({
    queryKey: ["english-manager-teachers-page", currentMonth],
    queryFn: async () => {
      const response = await instance.get("/api/teacher-statistics/manager/teachers", {
        params: { month: currentMonth },
      });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: !!subjectId,
  });

  const teachers = useMemo(
    () => (Array.isArray(teachersQuery.data) ? teachersQuery.data : []),
    [teachersQuery.data]
  );

  const filteredTeachers = useMemo(() => {
    const q = normalizeText(searchTerm);
    if (!q) return teachers;
    return teachers.filter(
      (teacher) =>
        normalizeText(teacher.teacher_name).includes(q) || normalizeText(teacher.phone).includes(q)
    );
  }, [teachers, searchTerm]);

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

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">Teacherlar</h1>
            <p className="text-xs text-gray-500">English fani bo'yicha o'qituvchilar ro'yxati</p>
          </div>
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ism yoki telefon bo'yicha qidirish"
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#A60E07]"
            />
          </div>
        </div>
      </div>

      {teachersQuery.isLoading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-lg border border-gray-200 bg-white" />
          ))}
        </div>
      ) : teachersQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {teachersQuery.error?.response?.data?.message || teachersQuery.error?.message || "Teacherlar yuklanmadi"}
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Teacher topilmadi.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
              {formatCount(filteredTeachers.length)} teacher
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.teacher_id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${avatarColor(
                      teacher.teacher_name
                    )}`}
                  >
                    {initialsOf(teacher.teacher_name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">{teacher.teacher_name || "Teacher"}</p>
                    {teacher.phone ? (
                      <a
                        href={telHref(teacher.phone)}
                        className="flex items-center gap-1 truncate text-xs font-semibold text-[#A60E07] hover:underline"
                      >
                        <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
                        {formatPhoneNumber(teacher.phone)}
                      </a>
                    ) : (
                      <p className="flex items-center gap-1 truncate text-xs text-gray-400">
                        <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
                        Telefon kiritilmagan
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-gray-50 px-2.5 py-2 text-center">
                    <p className="text-base font-black text-gray-900">{formatCount(teacher.groups_count)}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Guruh</p>
                  </div>
                  <div className="rounded-md bg-gray-50 px-2.5 py-2 text-center">
                    <p className="text-base font-black text-gray-900">{formatCount(teacher.students_count)}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">O'quvchi</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

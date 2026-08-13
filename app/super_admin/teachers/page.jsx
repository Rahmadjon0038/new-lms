"use client";

import React, { useMemo, useState } from "react";
import { usegetTeachers } from "../../../hooks/teacher";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const MAIN_COLOR = "#A60E07";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

const STATUS_LABELS = {
  active: { text: "Faol", className: "bg-emerald-100 text-emerald-700" },
  on_leave: { text: "Ta'tilda", className: "bg-amber-100 text-amber-700" },
  terminated: { text: "Bo'shatilgan", className: "bg-rose-100 text-rose-700" },
};

export default function SuperAdminTeachersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const teachersQuery = usegetTeachers("all", statusFilter);

  const teachers = useMemo(() => {
    const list = teachersQuery.data?.teachers;
    return Array.isArray(list) ? list : [];
  }, [teachersQuery.data]);

  const filteredTeachers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return teachers;
    return teachers.filter((teacher) => {
      const fullName = `${teacher?.surname || ""} ${teacher?.name || ""}`.toLowerCase();
      const subjectsList = String(teacher?.subjects_list || "").toLowerCase();
      return fullName.includes(query) || subjectsList.includes(query);
    });
  }, [teachers, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900">O&apos;qituvchilar</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ism yoki fan bo'yicha qidirish"
              className="rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm shadow-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
          >
            <option value="all">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="on_leave">Ta&apos;tilda</option>
            <option value="terminated">Bo&apos;shatilgan</option>
          </select>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            O&apos;qituvchilar ro&apos;yxati
          </h2>
          <span className="text-sm text-gray-500">
            Jami: {filteredTeachers.length}
          </span>
        </div>

        {teachersQuery.isLoading ? (
          <div className="py-6 text-center text-sm text-gray-500">Yuklanmoqda...</div>
        ) : teachersQuery.error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {teachersQuery.error?.response?.data?.message ||
              teachersQuery.error?.message ||
              "O'qituvchilar yuklanmadi"}
          </div>
        ) : (
          <div className="overflow-x-auto border-x border-t border-slate-700">
            <table className="min-w-[900px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <th className="py-2 pl-4 pr-2">FIO</th>
                  <th className="py-2 pr-2">Foydalanuvchi nomi</th>
                  <th className="py-2 pr-2">Telefon</th>
                  <th className="py-2 pr-2">Fanlar</th>
                  <th className="py-2 pr-2">Guruhlar</th>
                  <th className="py-2 pr-2">Holat</th>
                  <th className="py-2 pr-4">Ro&apos;yxatga olingan</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 pl-4 text-gray-500">
                      O&apos;qituvchilar topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => {
                    const statusInfo = STATUS_LABELS[teacher.status] || {
                      text: teacher.status || "-",
                      className: "bg-gray-100 text-gray-700",
                    };
                    return (
                      <tr
                        key={String(teacher.id)}
                        className="border-b border-slate-500 bg-white transition-colors duration-150 hover:bg-slate-100/80"
                      >
                        <td className="py-3 pl-4 pr-2 font-medium text-gray-900">
                          {teacher.surname} {teacher.name}
                        </td>
                        <td className="py-3 pr-2 text-gray-700">{teacher.username || "-"}</td>
                        <td className="py-3 pr-2 text-gray-700">{teacher.phone || "-"}</td>
                        <td className="py-3 pr-2 text-gray-700">{teacher.subjects_list || "-"}</td>
                        <td className="py-3 pr-2 text-gray-700">{teacher.groupCount || 0} ta</td>
                        <td className="py-3 pr-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.className}`}
                          >
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          {formatDate(teacher.registrationDate)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

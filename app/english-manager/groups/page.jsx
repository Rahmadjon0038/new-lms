"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpenIcon, UsersIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { useGetAllSubjects, useGetSubjectStats } from "../../../hooks/subjects";
import { useGetAllgroups } from "../../../hooks/groups";
import { findEnglishSubject, formatCount, formatMoney } from "../../../utils/englishManager";

const MAIN_COLOR = "#A60E07";

const Badge = ({ value }) => {
  const status = String(value || "").toLowerCase();
  const styles = {
    active: "bg-green-100 text-green-700",
    draft: "bg-amber-100 text-amber-700",
    blocked: "bg-red-100 text-red-700",
    started: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {value || "-"}
    </span>
  );
};

export default function EnglishManagerGroupsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const subjectsQuery = useGetAllSubjects();
  const subjects = useMemo(() => subjectsQuery.data?.subjects || [], [subjectsQuery.data]);
  const englishSubject = useMemo(() => findEnglishSubject(subjects), [subjects]);
  const subjectId = englishSubject?.id;

  const statsQuery = useGetSubjectStats(subjectId);
  const groupsQuery = useGetAllgroups("all", "all", subjectId, { enabled: !!subjectId });

  const groups = useMemo(() => (Array.isArray(groupsQuery.data?.groups) ? groupsQuery.data.groups : []), [groupsQuery.data]);
  const subjectStats = statsQuery.data?.stats || {};

  const filteredGroups = useMemo(() => {
    const text = search.trim().toLowerCase();
    return groups.filter((group) => {
      const matchesText = !text
        || String(group.name || group.group_name || "").toLowerCase().includes(text)
        || String(group.teacher_name || "").toLowerCase().includes(text);
      const matchesStatus = statusFilter === "all" || String(group.status || "").toLowerCase() === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [groups, search, statusFilter]);

  if (subjectsQuery.isLoading) {
    return <div className="rounded-3xl bg-white p-6 text-sm text-gray-500">Yuklanmoqda...</div>;
  }

  if (!subjectId) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        English subject topilmadi.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-[#A60E07]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#A60E07]">
            Groups
          </div>
          <h1 className="mt-3 text-3xl font-black text-gray-900">English guruhlar</h1>
          <p className="mt-1 text-sm text-gray-500">Faqat English subject bilan bog'langan guruhlar ko'rsatiladi.</p>
        </div>
        <Link href="/english-manager" className="inline-flex items-center gap-2 self-start rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700">
          Dashboard
          <BookOpenIcon className="h-4 w-4" />
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat title="Jami guruhlar" value={formatCount(subjectStats.total_groups || groups.length)} icon={BookOpenIcon} />
        <MiniStat title="Faol guruhlar" value={formatCount(subjectStats.active_groups || groups.filter((item) => item.status === "active").length)} icon={UsersIcon} />
        <MiniStat title="Talabalar" value={formatCount(subjectStats.total_students || 0)} icon={UsersIcon} />
        <MiniStat title="O'qituvchilar" value={formatCount(subjectStats.total_teachers || 0)} icon={AcademicCapIcon} />
      </section>

      <section className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900">Filtrlar</h2>
            <p className="text-sm text-gray-500">Nomi yoki teacher bo'yicha qidiring</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidiruv..."
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#A60E07] sm:w-80"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
            >
              <option value="all">Barchasi</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="blocked">Blocked</option>
              <option value="started">Started</option>
            </select>
          </div>
        </div>

        {groupsQuery.isLoading ? (
          <div className="py-10 text-center text-sm text-gray-500">Guruhlar yuklanmoqda...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Filtrga mos guruh topilmadi.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                <tr>
                  <th className="px-4 py-3">Guruh</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Talabalar</th>
                  <th className="px-4 py-3">Narx</th>
                  <th className="px-4 py-3">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="bg-white">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{group.name || group.group_name || "-"}</div>
                      <div className="text-xs text-gray-500">Room: {group.room_number || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{group.teacher_name || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCount(group.students_count || 0)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatMoney(group.price || 0)}</td>
                    <td className="px-4 py-3"><Badge value={group.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function MiniStat({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">{title}</div>
          <div className="mt-2 text-2xl font-black text-gray-900">{value}</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50">
          <Icon className="h-5 w-5 text-[#A60E07]" />
        </div>
      </div>
    </div>
  );
}

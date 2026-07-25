"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { UsersIcon, BookOpenIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { useGetAllSubjects, useGetSubjectStats } from "../../../hooks/subjects";
import { useGetAllStudentsAll } from "../../../hooks/students";
import { findEnglishSubject, formatCount } from "../../../utils/englishManager";

const Badge = ({ value }) => {
  const status = String(value || "").toLowerCase();
  const styles = {
    active: "bg-green-100 text-green-700",
    stopped: "bg-red-100 text-red-700",
    finished: "bg-blue-100 text-blue-700",
    not_started: "bg-gray-100 text-gray-700",
    inactive: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {value || "-"}
    </span>
  );
};

export default function EnglishManagerStudentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const subjectsQuery = useGetAllSubjects();
  const subjects = useMemo(() => subjectsQuery.data?.subjects || [], [subjectsQuery.data]);
  const englishSubject = useMemo(() => findEnglishSubject(subjects), [subjects]);
  const subjectId = englishSubject?.id;

  const statsQuery = useGetSubjectStats(subjectId);
  const studentsQuery = useGetAllStudentsAll({ subject_id: subjectId, limit: 100 }, { enabled: !!subjectId });

  const students = useMemo(() => (Array.isArray(studentsQuery.data?.students) ? studentsQuery.data.students : []), [studentsQuery.data]);
  const subjectStats = statsQuery.data?.stats || {};

  const filteredStudents = useMemo(() => {
    const text = search.trim().toLowerCase();
    return students.filter((student) => {
      const fullName = `${student.name || student.student_name || ""} ${student.surname || student.student_surname || ""}`.trim().toLowerCase();
      const groupName = String(student.group_name || student.student_group_name || "").toLowerCase();
      const teacherName = String(student.teacher_name || student.student_teacher_name || "").toLowerCase();
      const matchesText = !text || fullName.includes(text) || groupName.includes(text) || teacherName.includes(text);
      const currentStatus = String(student.monthly_status || student.status || "").toLowerCase();
      const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [search, statusFilter, students]);

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
            Students
          </div>
          <h1 className="mt-3 text-3xl font-black text-gray-900">English talabalar</h1>
          <p className="mt-1 text-sm text-gray-500">Faqat English guruhlariga tegishli studentlar.</p>
        </div>
        <Link href="/english-manager" className="inline-flex items-center gap-2 self-start rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700">
          Dashboard
          <BookOpenIcon className="h-4 w-4" />
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat title="Jami talabalar" value={formatCount(subjectStats.total_students || students.length)} icon={UsersIcon} />
        <MiniStat title="Faol guruhlar" value={formatCount(subjectStats.active_groups || 0)} icon={BookOpenIcon} />
        <MiniStat title="O'qituvchilar" value={formatCount(subjectStats.total_teachers || 0)} icon={AcademicCapIcon} />
        <MiniStat title="Ko'rinayotgan" value={formatCount(filteredStudents.length)} icon={UsersIcon} />
      </section>

      <section className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900">Filtrlar</h2>
            <p className="text-sm text-gray-500">Ism, guruh yoki teacher bo'yicha qidiring</p>
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
              <option value="stopped">Stopped</option>
              <option value="finished">Finished</option>
              <option value="not_started">Not started</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {studentsQuery.isLoading ? (
          <div className="py-10 text-center text-sm text-gray-500">Talabalar yuklanmoqda...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Filtrga mos talaba topilmadi.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                <tr>
                  <th className="px-4 py-3">Talaba</th>
                  <th className="px-4 py-3">Guruh</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => {
                  const fullName = `${student.name || student.student_name || ""} ${student.surname || student.student_surname || ""}`.trim() || "-";
                  return (
                    <tr key={student.id || student.student_id} className="bg-white">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{fullName}</div>
                        <div className="text-xs text-gray-500">{student.username || "-"}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{student.group_name || student.student_group_name || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{student.teacher_name || student.student_teacher_name || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{student.phone || "-"}</td>
                      <td className="px-4 py-3"><Badge value={student.monthly_status || student.status} /></td>
                    </tr>
                  );
                })}
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

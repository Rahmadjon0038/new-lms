"use client";
import React from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  UsersIcon,
  ArrowRightIcon,
  BanknotesIcon,
  UserGroupIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useGetTeacherGroups } from "../../hooks/groups";
import { useMonthlyPayments } from "../../hooks/payments";
import { monthKey, formatMonthLabel } from "../../utils/topStudents";
import TopStudentsSection from "../../components/teacher/TopStudentsSection";

const PAID_COLOR = "#16934F";
const PARTIAL_COLOR = "#FFC857";
const UNPAID_COLOR = "#DC2626";

// To'lov statistikasi kartasi — mobil dashboarddagi donut kabi
const PaymentStatsCard = ({ summary, month }) => {
  const total = Number(summary?.total_students) || 0;
  const paid = Number(summary?.paid_students) || 0;
  const partial = Number(summary?.partial_students) || 0;
  const unpaid = Number(summary?.unpaid_students) || 0;
  const percent = total > 0 ? Math.round((paid / total) * 100) : 0;

  const chartData = total
    ? [
        { name: "To'lagan", value: paid, color: PAID_COLOR },
        { name: "Qisman", value: partial, color: PARTIAL_COLOR },
        { name: "To'lamagan", value: unpaid, color: UNPAID_COLOR },
      ].filter((d) => d.value > 0)
    : [{ name: "Bo'sh", value: 1, color: "#E5E7EB" }];

  return (
    <div className="rounded-[8px] border border-gray-100 bg-white p-4 sm:p-5 shadow-md">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A60E07]/10">
          <BanknotesIcon className="h-4 w-4 text-[#A60E07]" />
        </span>
        <h2 className="flex-1 text-sm sm:text-base font-black text-gray-800">
          {formatMonthLabel(month)} to&apos;lovlari
        </h2>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-gray-600">
          Jami: {total}
        </span>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={38}
                outerRadius={52}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black text-gray-800">{percent}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {[
            { label: "To'lagan", value: paid, color: PAID_COLOR },
            { label: "Qisman", value: partial, color: PARTIAL_COLOR },
            { label: "To'lamagan", value: unpaid, color: UNPAID_COLOR },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              <span className="flex-1 text-xs sm:text-sm font-semibold text-gray-600">
                {row.label}
              </span>
              <span className="text-sm font-black text-gray-800">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Davomat ko'rsatkichlari: eng yaxshi davomat va ko'p dars qoldirganlar.
// Faqat davomat qilingan (belgilangan) darslar hisobga olinadi.
const AttendanceStatsCard = ({ students }) => {
  const withLessons = (students || []).filter(
    (s) => Number(s.marked_lessons) > 0
  );
  if (!withLessons.length) return null;

  const best = [...withLessons].sort((a, b) => {
    const ratioA = Number(a.attended_marked_lessons) / Number(a.marked_lessons);
    const ratioB = Number(b.attended_marked_lessons) / Number(b.marked_lessons);
    if (ratioB !== ratioA) return ratioB - ratioA;
    return (
      Number(b.attended_marked_lessons) - Number(a.attended_marked_lessons)
    );
  });

  const mostMissed = withLessons
    .filter((s) => Number(s.missed_marked_lessons) > 0)
    .sort(
      (a, b) =>
        Number(b.missed_marked_lessons) - Number(a.missed_marked_lessons)
    );

  const StudentLine = ({ snapshot, trailing, color }) => (
    <div className="flex items-center gap-2 py-1">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs sm:text-sm font-bold text-gray-800">
          {[snapshot.student_surname, snapshot.student_name]
            .filter(Boolean)
            .join(" ")}
        </p>
        <p className="truncate text-[10px] sm:text-xs text-gray-400">
          {snapshot.group_name}
        </p>
      </div>
      <span
        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-extrabold"
        style={{ color, backgroundColor: `${color}14` }}
      >
        {trailing}
      </span>
    </div>
  );

  return (
    <div className="rounded-[8px] border border-gray-100 bg-white p-4 sm:p-5 shadow-md">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600/10">
          <CheckBadgeIcon className="h-4 w-4 text-teal-700" />
        </span>
        <h2 className="text-sm sm:text-base font-black text-gray-800">
          Davomat ko&apos;rsatkichlari
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {best.length > 0 && (
          <div>
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-green-700">
              Eng yaxshi davomat
            </p>
            {best.slice(0, 3).map((s) => (
              <StudentLine
                key={`best-${s.student_id}-${s.group_id}`}
                snapshot={s}
                color="#16934F"
                trailing={`${Math.round(
                  (Number(s.attended_marked_lessons) /
                    Number(s.marked_lessons)) *
                    100
                )}% • ${s.attended_marked_lessons}/${s.marked_lessons}`}
              />
            ))}
          </div>
        )}
        {mostMissed.length > 0 && (
          <div>
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-red-600">
              Ko&apos;p dars qoldirganlar
            </p>
            {mostMissed.slice(0, 3).map((s) => (
              <StudentLine
                key={`missed-${s.student_id}-${s.group_id}`}
                snapshot={s}
                color="#DC2626"
                trailing={`${s.missed_marked_lessons} dars qoldirgan`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Teacher bosh sahifasi (dashboard): to'lov statistikasi,
 * oyning eng yaxshi o'quvchilari va davomat ko'rsatkichlari.
 * Mobil ilovadagi TeacherDashboardPage bilan bir xil ma'lumotlar.
 */
function TeacherDashboard() {
  const month = monthKey(new Date());
  const { data: groupsData, isLoading: groupsLoading } = useGetTeacherGroups();
  const { data: paymentsData, isLoading: paymentsLoading } = useMonthlyPayments(
    { month, limit: 200 }
  );

  const groups = groupsData?.data?.groups || [];
  const summary = paymentsData?.data?.summary;
  const snapshotStudents = paymentsData?.data?.students || [];

  if (groupsLoading && paymentsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-pulse text-lg font-medium text-gray-400">
          Yuklanmoqda...
        </div>
      </div>
    );
  }

  const activeStudents = groups.reduce(
    (acc, g) => acc + (Number(g.students_stats?.active) || 0),
    0
  );

  return (
    <div className="min-h-full space-y-4 p-1 sm:space-y-5 sm:p-4 md:p-0">
      {/* Qisqa ko'rsatkichlar + guruhlarga o'tish */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
        <div className="rounded-[8px] border border-gray-100 bg-white p-3 sm:p-5 shadow-md">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#A60E07]" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
              Guruhlarim
            </span>
          </div>
          <p className="mt-1.5 text-xl sm:text-3xl font-black text-gray-900">
            {groups.length}
          </p>
        </div>
        <div className="rounded-[8px] border border-gray-100 bg-white p-3 sm:p-5 shadow-md">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#A60E07]" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
              Faol o&apos;quvchilar
            </span>
          </div>
          <p className="mt-1.5 text-xl sm:text-3xl font-black text-gray-900">
            {activeStudents}
          </p>
        </div>
        <Link
          href="/teacher/my-groups"
          className="col-span-2 lg:col-span-1 flex items-center justify-between rounded-[8px] bg-[#A60E07] p-3 sm:p-5 text-white shadow-md transition hover:bg-[#8b0c06]"
        >
          <span className="flex items-center gap-2 text-sm sm:text-base font-bold">
            <UserGroupIcon className="h-5 w-5" />
            Mening guruhlarim
          </span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* To'lov statistikasi */}
      {summary && <PaymentStatsCard summary={summary} month={month} />}

      {/* Oyning eng yaxshi o'quvchilari — bosilganda oy filtri bilan sahifa */}
      <TopStudentsSection groups={groups} />

      {/* Davomat ko'rsatkichlari */}
      <AttendanceStatsCard students={snapshotStudents} />
    </div>
  );
}

export default TeacherDashboard;

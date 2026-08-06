"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AcademicCapIcon,
  BanknotesIcon,
  BookOpenIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useGetAllSubjects, useGetSubjectStats } from "../../hooks/subjects";
import { useGetAllgroups } from "../../hooks/groups";
import { useMonthlyPayments } from "../../hooks/payments";
import { useGetAttendanceTeachers } from "../../hooks/attendance";
import { findEnglishSubject, formatCount } from "../../utils/englishManager";

const getTodayYmd = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getTodayDMY = () => {
  const [y, m, d] = getTodayYmd().split("-");
  return `${d}.${m}.${y}`;
};

const MAIN_COLOR = "#A60E07";

const StatCard = ({ title, value, icon: Icon, accent = MAIN_COLOR }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{title}</p>
        <p className="mt-1 text-xl font-black tracking-tight text-gray-900">{value}</p>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
    </div>
  </div>
);

export default function EnglishManagerDashboardPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);

  const subjectsQuery = useGetAllSubjects();
  const subjects = useMemo(() => subjectsQuery.data?.subjects || [], [subjectsQuery.data]);
  const subjectId = useMemo(() => findEnglishSubject(subjects)?.id, [subjects]);

  const subjectStatsQuery = useGetSubjectStats(subjectId);
  const groupsQuery = useGetAllgroups("all", "all", subjectId, { enabled: !!subjectId });
  const paymentsQuery = useMonthlyPayments({ month, subject_id: subjectId, limit: 100 }, { enabled: !!subjectId && !!month });
  const todayAttendanceQuery = useGetAttendanceTeachers(
    { date: getTodayYmd(), subject_id: subjectId },
    { enabled: !!subjectId }
  );

  const subjectStats = subjectStatsQuery.data?.stats || {};
  const groups = useMemo(() => (Array.isArray(groupsQuery.data?.groups) ? groupsQuery.data.groups : []), [groupsQuery.data]);
  const paymentStudents = useMemo(
    () => (Array.isArray(paymentsQuery.data?.data?.students) ? paymentsQuery.data.data.students : []),
    [paymentsQuery.data]
  );
  const paymentSummary = paymentsQuery.data?.data?.summary || {};

  const paymentPieStats = useMemo(() => {
    const paid = parseInt(paymentSummary.paid_students || 0, 10);
    const partial = parseInt(paymentSummary.partial_students || 0, 10);
    const unpaid = parseInt(paymentSummary.unpaid_students || 0, 10);
    const total = paid + partial + unpaid;
    const percent = total ? Math.round(((paid + partial) / total) * 100) : 0;
    return { paid, partial, unpaid, total, percent };
  }, [paymentSummary]);

  const todayAttendanceStats = useMemo(() => {
    const teachers = Array.isArray(todayAttendanceQuery.data?.data) ? todayAttendanceQuery.data.data : [];
    const total = teachers.reduce((sum, item) => sum + (Number(item.today_groups_count) || 0), 0);
    const completed = teachers.reduce((sum, item) => sum + (Number(item.today_marked_groups_count) || 0), 0);
    const percent = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending: Math.max(0, total - completed), percent };
  }, [todayAttendanceQuery.data]);

  const todayPaidCount = useMemo(() => {
    const todayDmy = getTodayDMY();
    return paymentStudents.filter((student) => String(student.last_payment_date || "").startsWith(todayDmy)).length;
  }, [paymentStudents]);

  const subjectReady = Boolean(subjectId);

  if (subjectsQuery.isLoading) {
    return <div className="rounded-lg bg-white p-4 text-sm text-gray-500">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="inline-flex rounded-full bg-[#A60E07]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A60E07]">
          English manager
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <StatCard
            title="Jami talabalar"
            value={subjectReady ? formatCount(subjectStats.total_students || 0) : "-"}
            icon={UsersIcon}
          />
          <StatCard
            title="Jami o'qituvchilar"
            value={subjectReady ? formatCount(subjectStats.total_teachers || 0) : "-"}
            icon={AcademicCapIcon}
          />
          <StatCard
            title="Jami guruhlar"
            value={subjectReady ? formatCount(subjectStats.total_groups || groups.length) : "-"}
            icon={BookOpenIcon}
          />
        </div>
      </section>

      {!subjectReady ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-bold">English subject topilmadi</div>
          <p className="mt-1 leading-6">
            Bazada English fanini topa olmadim. Iltimos subject nomini <code>English</code> yoki <code>Ingliz tili</code> ko'rinishida tekshiring.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/english-manager/attendance"
              className="rounded-lg border border-gray-200 bg-white p-3 transition hover:border-[#A60E07]/30"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#A60E07] text-white">
                    <ClipboardDocumentListIcon className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-bold text-gray-900">Bugungi davomat</h2>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">
                  {formatCount(todayAttendanceStats.total)} guruh
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background:
                      todayAttendanceStats.total > 0
                        ? `conic-gradient(#10B981 0 ${todayAttendanceStats.percent}%, #F59E0B ${todayAttendanceStats.percent}% 100%)`
                        : "#E5E7EB",
                  }}
                >
                  <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white">
                    <span className="text-xs font-black text-gray-900">{todayAttendanceStats.percent}%</span>
                  </div>
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">Qilingan:</span>
                    <b className="text-gray-900">{formatCount(todayAttendanceStats.completed)}</b>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span className="text-gray-600">Qilinmagan:</span>
                    <b className="text-gray-900">{formatCount(todayAttendanceStats.pending)}</b>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href="/english-manager/payments"
              className="rounded-lg border border-gray-200 bg-white p-3 transition hover:border-[#A60E07]/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Bugun to&apos;lov qilganlar</p>
                  <p className="mt-1 text-2xl font-black tracking-tight text-gray-900">{formatCount(todayPaidCount)}</p>
                  <p className="mt-1 text-xs text-gray-500">{month} oyi ichida, bugungi to&apos;lovlar</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                  <BanknotesIcon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
                </div>
              </div>
            </Link>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Oylik to'lovlar</h2>
                <p className="text-xs text-gray-500">Tanlangan oy: {month}</p>
              </div>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
              />
            </div>

            {paymentsQuery.isLoading ? (
              <div className="py-6 text-center text-sm text-gray-500">To'lovlar yuklanmoqda...</div>
            ) : paymentPieStats.total === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">Bu oyda o&apos;quvchi ma&apos;lumoti yo&apos;q.</p>
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative h-28 w-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { label: "To'lagan", value: paymentPieStats.paid },
                          { label: "Qisman", value: paymentPieStats.partial },
                          { label: "To'lamagan", value: paymentPieStats.unpaid },
                        ].filter((item) => item.value > 0)}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={52}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={2}
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {paymentPieStats.paid > 0 ? <Cell key="paid" fill="#10B981" /> : null}
                        {paymentPieStats.partial > 0 ? <Cell key="partial" fill="#F59E0B" /> : null}
                        {paymentPieStats.unpaid > 0 ? <Cell key="unpaid" fill="#EF4444" /> : null}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} o'quvchi`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-black text-gray-900">{paymentPieStats.percent}%</span>
                  </div>
                </div>
                <div className="w-full space-y-1.5 text-sm">
                  <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5">
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      To&apos;lagan
                    </span>
                    <span className="font-black text-gray-900">{formatCount(paymentPieStats.paid)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5">
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Qisman
                    </span>
                    <span className="font-black text-gray-900">{formatCount(paymentPieStats.partial)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5">
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      To&apos;lamagan
                    </span>
                    <span className="font-black text-gray-900">{formatCount(paymentPieStats.unpaid)}</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

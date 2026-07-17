"use client";

import React, { useState } from "react";
import { useGetDashboardSuperAdmin } from "../../hooks/dashboard";

const MAIN_COLOR = "#A60E07";

const formatCurrency = (value) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) => new Intl.NumberFormat("uz-UZ").format(Number(value) || 0);

const formatPercent = (value) => `${Math.round((Number(value) || 0) * 100)}%`;

const monthLabel = (value) => {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return value || "-";
  const [year, month] = value.split("-");
  const names = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ];
  return `${names[Number(month) - 1] || month} ${year}`;
};

const Section = ({ title, right, children }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm sm:p-4">
    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
      <h2 className="text-sm font-semibold text-gray-900 sm:text-base">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

export default function SuperAdminDashboardPage() {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);

  const query = useGetDashboardSuperAdmin(month, null, null);
  const data = query.data || {};

  const monthly = data?.monthly || {};
  const students = data?.students || {};
  const expensesByCategory = Array.isArray(monthly?.expenses_by_category) ? monthly.expenses_by_category : [];
  const subjects = Array.isArray(data?.subjects) ? data.subjects : [];
  const subjectTotals = subjects.reduce(
    (acc, item) => {
      acc.totalStudents += Number(item.total_students_count || 0);
      acc.totalRevenue += Number(item.total_revenue || 0);
      acc.totalTeachers += Number(item.teachers_count || 0);
      return acc;
    },
    { totalStudents: 0, totalRevenue: 0, totalTeachers: 0 }
  );

  const totalExpensesByCategory = expensesByCategory.reduce(
    (sum, item) => sum + Number(item.total || item.amount || 0),
    0
  );

  const monthlyRows = [
    { label: "Joriy oy", value: monthLabel(monthly?.current_month || month) },
    { label: "Umumiy tushum", value: formatCurrency(monthly?.total_revenue) },
    { label: "Jami o'qituvchilarga berilgan oylik summasi", value: formatCurrency(monthly?.total_teacher_salary) },
    { label: "Jami adminlarga berilgan oylik summasi", value: formatCurrency(monthly?.total_admin_salary) },
    { label: "Umumiy rasxod", value: formatCurrency(monthly?.total_expenses) },
    { label: "Yangi talabalar", value: formatNumber(monthly?.new_students_count) },
    { label: "Faol davomat qilinayotgan talabalar", value: formatNumber(students?.active_students ?? students?.active_attendance_students) },
    { label: "Jami chegirma", value: formatCurrency(monthly?.total_discounts) },
    { label: "Sof foyda (alohida)", value: formatCurrency(monthly?.net_profit) },
  ];
  const studentStats = [
    { label: "Jami", value: students?.total_students, tone: "red" },
    { label: "Faol", value: students?.active_attendance_students ?? students?.active_students, tone: "green" },
    { label: "Guruhsiz", value: students?.unassigned_students, tone: "gray" },
    { label: "To'lov jadvalida", value: students?.snapshot_students, tone: "blue" },
  ];

  if (query.isLoading) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2" style={{ borderColor: MAIN_COLOR }} />
        <p className="mt-3 text-sm text-gray-600">Yuklanmoqda...</p>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {query.error?.response?.data?.message || query.error?.message || "Super administrator statistikasi yuklanmadi"}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-lg font-extrabold sm:text-2xl" style={{ color: MAIN_COLOR }}>
            Super Administrator Statistikasi
          </h1>
          <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">{monthLabel(month)} bo&apos;yicha umumiy nazorat</p>
        </div>
        <div className="w-full sm:w-60">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            title="Statistika oyi"
          />
        </div>
      </div>

      <Section title="Talabalar statistikasi">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {studentStats.map((item) => (
            <SmallStat key={item.label} {...item} />
          ))}
        </div>
      </Section>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Section title="Oylik KPI">
          <div className="overflow-x-auto rounded-lg border border-slate-300">
            <table className="min-w-[520px] w-full table-fixed border-collapse text-xs sm:min-w-[700px] sm:text-sm">
              <colgroup>
                <col className="w-1/2" />
                <col className="w-1/2" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-700 bg-emerald-700 text-left text-xs font-semibold uppercase tracking-wide text-white">
                  <th className="border-r border-slate-700 px-3 py-2.5 sm:px-6 sm:py-4">Ko&apos;rsatkich</th>
                  <th className="px-3 py-2.5 sm:px-6 sm:py-4">Qiymat</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map((row) => (
                  <tr key={row.label} className="border-b border-slate-500 bg-white transition-colors duration-150 hover:bg-slate-100/80">
                    <td className="border-r border-slate-700 px-3 py-3 font-medium text-gray-900 sm:px-6 sm:py-5">{row.label}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-gray-900 sm:px-6 sm:py-5 sm:text-base">{row.value}</td>
                  </tr>
                ))}
                <tr className="border-b border-slate-500 bg-slate-50">
                  <td className="border-r border-slate-700 px-3 py-3 font-semibold text-gray-900 sm:px-6 sm:py-5">Formula</td>
                  <td className="px-3 py-3 font-medium text-gray-700 sm:px-6 sm:py-5">tushum - teacher oyligi - admin oyligi - rasxod - chegirma</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Rasxod taqsimoti">
          {expensesByCategory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500 sm:p-8">
              Bu oy uchun rasxod kategoriyalari yo&apos;q
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {expensesByCategory.map((item) => {
                const name = item.category_name || item.name || "Kategoriya";
                const total = Number(item.total || item.amount || 0);
                const ratio = totalExpensesByCategory > 0 ? total / totalExpensesByCategory : 0;
                return (
                  <div key={name} className="rounded-xl border border-gray-100 bg-gray-50 p-2.5 sm:p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-gray-800">{name}</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(total)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full"
                        style={{ width: formatPercent(ratio), backgroundColor: MAIN_COLOR }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      <Section
        title="Oylik fanlar bo&apos;yicha tahlil"
        right={<span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">{formatNumber(subjectTotals.totalTeachers)} teacher</span>}
      >
        <div className="mb-2 overflow-x-auto rounded-lg border border-slate-300 sm:mb-4">
          <table className="min-w-[680px] w-full text-xs sm:min-w-[920px] sm:text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <th className="py-2 pl-3 pr-2 sm:pl-4">Fan nomi</th>
                <th className="py-2 pr-2">Jami talabalar</th>
                <th className="py-2 pr-2">Jami tushum</th>
                <th className="py-2 pr-2">Teacherlar</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-gray-500">Fanlar bo&apos;yicha ma&apos;lumot yo&apos;q</td>
                </tr>
              ) : (
                subjects.flatMap((item) => {
                  const teachers = Array.isArray(item.teachers) ? item.teachers : [];

                  const subjectRow = (
                    <tr
                      key={`subject-${String(item.subject_id)}`}
                      className="border-b border-slate-700 bg-emerald-700 font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-emerald-800 hover:shadow-md"
                    >
                      <td className="py-3 pl-3 pr-2 text-sm sm:py-4 sm:pl-4 sm:text-base">{item.subject_name || "-"}</td>
                      <td className="px-2 py-3 text-sm sm:py-4 sm:text-base">{formatNumber(item.total_students_count)}</td>
                      <td className="px-2 py-3 text-sm sm:py-4 sm:text-base">{formatCurrency(item.total_revenue)}</td>
                      <td className="py-3 pr-3 pl-2 text-xs font-semibold text-emerald-50 sm:py-4 sm:pr-4 sm:text-sm">{formatNumber(item.teachers_count)}</td>
                    </tr>
                  );

                  const teacherRows = teachers.length
                    ? teachers.map((teacher) => {
                        const required = Number(teacher.total_required || item.total_required || 0);
                        const revenue = Number(teacher.total_revenue || 0);
                        const ratio = required > 0 ? Math.min(revenue / required, 1) : 0;
                        return (
                          <tr
                            key={`teacher-${String(item.subject_id)}-${String(teacher.teacher_id)}`}
                            className="border-b border-slate-500 bg-slate-50/90 transition-colors duration-150 hover:bg-slate-200/90"
                          >
                            <td className="py-2.5 pr-2 pl-5 text-gray-800 sm:py-3 sm:pl-10">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#A60E07]" />
                                <span className="font-medium">{teacher.teacher_name || "Noma'lum teacher"}</span>
                              </div>
                            </td>
                            <td className="border-l border-slate-500 py-2.5 pr-2 pl-2 text-gray-700 sm:py-3">{formatNumber(teacher.total_students_count)}</td>
                            <td className="border-l border-slate-500 py-2.5 pr-2 pl-2 font-semibold text-[#A60E07] sm:py-3">
                              <div>{formatCurrency(teacher.total_revenue)}</div>
                              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white">
                                <div className="h-full rounded-full bg-[#A60E07]" style={{ width: formatPercent(ratio) }} />
                              </div>
                            </td>
                            <td className="border-l border-slate-500 py-2.5 pr-2 pl-2 sm:py-3" aria-hidden="true" />
                          </tr>
                        );
                      })
                    : [
                        <tr key={`teacher-empty-${String(item.subject_id)}`} className="border-b border-slate-500 bg-slate-50/70 transition-colors duration-150 hover:bg-slate-200/80">
                          <td colSpan={4} className="py-3 pl-10 text-sm text-gray-500">
                            Bu fandagi teacherlar bo&apos;yicha ma&apos;lumot yo&apos;q
                          </td>
                        </tr>,
                      ];

                  return [subjectRow, ...teacherRows];
                })
              )}
            </tbody>
            {subjects.length > 0 ? (
              <tfoot>
                <tr className="border-t border-slate-700 bg-slate-100 font-bold text-gray-900">
                  <td className="py-3 pl-3 pr-2 text-sm sm:py-4 sm:pl-4 sm:text-base">Jami</td>
                  <td className="px-2 py-3 text-sm sm:py-4 sm:text-base">{formatNumber(subjectTotals.totalStudents)}</td>
                  <td className="px-2 py-3 text-sm sm:py-4 sm:text-base">{formatCurrency(subjectTotals.totalRevenue)}</td>
                  <td className="py-3 pr-3 pl-2 text-xs sm:py-4 sm:pr-4 sm:text-sm">{formatNumber(subjectTotals.totalTeachers)}</td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </Section>

    </div>
  );
}

function SmallStat({ label, value, tone = "red" }) {
  const tones = {
    red: "border-red-200 bg-red-50 text-red-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    gray: "border-gray-200 bg-gray-50 text-gray-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    purple: "border-purple-200 bg-purple-50 text-purple-800",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
  };
  return (
    <div className={`rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3 ${tones[tone] || tones.red}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 sm:text-xs">{label}</p>
      <p className="mt-1 text-xl font-black sm:mt-2 sm:text-2xl">{formatNumber(value)}</p>
    </div>
  );
}

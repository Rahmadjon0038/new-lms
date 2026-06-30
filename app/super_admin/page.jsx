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

const Section = ({ title, subtitle, children }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
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
  const monthlyRows = [
    { label: "Joriy oy", value: monthly?.current_month || month },
    { label: "Umumiy tushum", value: formatCurrency(monthly?.total_revenue) },
    { label: "Jami o'qituvchilarga berilgan oylik summasi", value: formatCurrency(monthly?.total_teacher_salary) },
    { label: "Umumiy rasxod", value: formatCurrency(monthly?.total_expenses) },
    { label: "Yangi talabalar", value: formatNumber(monthly?.new_students_count) },
    { label: "Jami chegirma", value: formatCurrency(monthly?.total_discounts) },
    { label: "Sof foyda (alohida)", value: formatCurrency(monthly?.net_profit) },
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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: MAIN_COLOR }}>
            Super Administrator Statistikasi
          </h1>
        </div>
        <div className="w-full sm:w-60">
          {/* <label className="mb-1 block text-xs font-medium text-gray-600">Oy</label> */}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            title="Statistika oyi"
          />
        </div>
      </div>

      <Section title="Oylik KPI">
        <div className="overflow-x-auto border-x border-t border-slate-700">
          <table className="min-w-[700px] w-full table-fixed border-collapse text-sm">
            <colgroup>
              <col className="w-1/2" />
              <col className="w-1/2" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-700 bg-emerald-700 text-left text-xs font-semibold uppercase tracking-wide text-white">
                <th className="border-r border-slate-700 px-6 py-4">Ko&apos;rsatkich</th>
                <th className="px-6 py-4">Qiymat</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((row) => (
                <tr key={row.label} className="border-b border-slate-500 bg-white transition-colors duration-150 hover:bg-slate-100/80">
                  <td className="border-r border-slate-700 px-6 py-5 font-medium text-gray-900">{row.label}</td>
                  <td className="px-6 py-5 text-base font-semibold text-gray-900">{row.value}</td>
                </tr>
              ))}
              <tr className="border-b border-slate-500 bg-slate-50">
                <td className="border-r border-slate-700 px-6 py-5 font-semibold text-gray-900">Formula</td>
                <td className="px-6 py-5 font-medium text-gray-700">tushum - teacher oyligi - rasxod - chegirma</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Oylik fanlar bo&apos;yicha tahlil">
        <div className="mb-4 overflow-x-auto border-x border-t border-slate-700">
          <table className="min-w-[920px] w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <th className="py-2 pl-4 pr-2">Fan nomi</th>
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
                      <td className="py-4 pl-4 pr-2 text-base">{item.subject_name || "-"}</td>
                      <td className="py-4 px-2 text-base">{formatNumber(item.total_students_count)}</td>
                      <td className="py-4 px-2 text-base">{formatCurrency(item.total_revenue)}</td>
                      <td className="py-4 pr-4 pl-2 text-sm font-semibold text-emerald-50">{formatNumber(item.teachers_count)}</td>
                    </tr>
                  );

                  const teacherRows = teachers.length
                    ? teachers.map((teacher) => (
                        <tr
                          key={`teacher-${String(item.subject_id)}-${String(teacher.teacher_id)}`}
                          className="border-b border-slate-500 bg-slate-50/90 transition-colors duration-150 hover:bg-slate-200/90"
                        >
                          <td className="py-3 pr-2 pl-10 text-gray-800">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full bg-[#A60E07]" />
                              <span className="font-medium">{teacher.teacher_name || "Noma'lum teacher"}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-2 pl-2 text-gray-700 border-l border-slate-500">{formatNumber(teacher.total_students_count)}</td>
                          <td className="py-3 pr-2 pl-2 font-semibold text-[#A60E07] border-l border-slate-500">{formatCurrency(teacher.total_revenue)}</td>
                          <td className="py-3 pr-2 pl-2 border-l border-slate-500" aria-hidden="true" />
                        </tr>
                      ))
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
                  <td className="py-4 pl-4 pr-2 text-base">Jami</td>
                  <td className="py-4 px-2 text-base">{formatNumber(subjectTotals.totalStudents)}</td>
                  <td className="py-4 px-2 text-base">{formatCurrency(subjectTotals.totalRevenue)}</td>
                  <td className="py-4 pr-4 pl-2 text-sm">{formatNumber(subjectTotals.totalTeachers)}</td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>

      </Section>

    </div>
  );
}

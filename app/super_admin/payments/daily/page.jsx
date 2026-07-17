"use client";

import React, { useState } from "react";
import { BanknotesIcon, CalendarDaysIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useGetDashboardDailyStats } from "../../../../hooks/dashboard";

const MAIN_COLOR = "#A60E07";

const todayKey = () => new Date().toISOString().slice(0, 10);

const formatCurrency = (value) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) => new Intl.NumberFormat("uz-UZ").format(Number(value) || 0);

const formatDateTime = (value) => {
  if (!value) return "-";
  const normalized = String(value).replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const methodLabel = (value) => {
  const key = String(value || "").toLowerCase();
  if (key === "cash") return "Naqd";
  if (key === "card") return "Karta";
  if (key === "transfer") return "O'tkazma";
  return value || "-";
};

export default function SuperAdminDailyPaymentsPage() {
  const [date, setDate] = useState(todayKey());
  const query = useGetDashboardDailyStats(date, date);

  const payload = query.data?.data || query.data || {};
  const daily = payload?.daily || {};
  const summary = payload?.summary || {};
  const payments = Array.isArray(daily?.payments) ? daily.payments : [];
  const totalAmount = Number(daily?.payments_total_amount || 0);
  const uniqueStudents = new Set(payments.map((item) => item.student_id).filter(Boolean)).size;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: MAIN_COLOR }}>
            Kunlik to&apos;lov hisoboti
          </h1>
          <p className="mt-1 text-sm text-gray-500">Talabalar to&apos;lovi, admin va fan kesimida kunlik nazorat.</p>
        </div>
        <div className="w-full sm:w-64">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Sana</label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value || todayKey())}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#A60E07]"
          />
        </div>
      </div>

      {query.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {query.error?.response?.data?.message || query.error?.message || "Kunlik to'lov hisoboti yuklanmadi"}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={BanknotesIcon}
          label="Jami summa"
          value={formatCurrency(totalAmount)}
          loading={query.isLoading}
          tone="green"
        />
        <SummaryCard
          icon={UserGroupIcon}
          label="To'lovlar soni"
          value={`${formatNumber(payments.length)} ta`}
          loading={query.isLoading}
          tone="red"
        />
        <SummaryCard
          icon={CalendarDaysIcon}
          label="Talabalar soni"
          value={`${formatNumber(uniqueStudents || summary?.payments_count || 0)} ta`}
          loading={query.isLoading}
          tone="blue"
        />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-gray-900">To&apos;lov qilganlar ro&apos;yxati</h2>
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#A60E07]">
            {formatNumber(payments.length)} ta yozuv
          </span>
        </div>

        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            Tanlangan kunda to&apos;lov topilmadi.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-[1180px] w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Talaba</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Guruh</th>
                  <th className="px-4 py-3">Fan</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">To&apos;lov turi</th>
                  <th className="px-4 py-3">Vaqt</th>
                  <th className="px-4 py-3 text-right">Summa</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => {
                  const studentName = `${payment.surname || ""} ${payment.name || ""}`.trim() || payment.username || "-";
                  const adminName =
                    payment.admin_full_name ||
                    payment.admin_username ||
                    (payment.admin_id ? `Admin #${payment.admin_id}` : "-");
                  return (
                    <tr key={payment.payment_id || `${payment.student_id}-${payment.payment_time}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{studentName}</div>
                        <div className="text-xs text-gray-500">{payment.username ? `@${payment.username}` : ""}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div>{payment.phone || "-"}</div>
                        {payment.phone2 ? <div className="text-xs text-gray-500">{payment.phone2}</div> : null}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{payment.group_name || payment.student_group_name || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{payment.subject_name || payment.subject || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{payment.teacher_name || payment.student_teacher_name || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                          {adminName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{methodLabel(payment.payment_method)}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDateTime(payment.payment_time)}</td>
                      <td className="px-4 py-3 text-right text-base font-black text-emerald-700">{formatCurrency(payment.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-black text-gray-900">
                  <td colSpan={9} className="px-4 py-3 text-right">Jami</td>
                  <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, loading, tone }) {
  const tones = {
    red: "bg-red-50 text-red-800 ring-red-100",
    green: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    blue: "bg-blue-50 text-blue-800 ring-blue-100",
  };
  return (
    <div className={`rounded-2xl p-4 ring-1 ${tones[tone] || tones.red}`}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-black">{loading ? "..." : value}</p>
    </div>
  );
}

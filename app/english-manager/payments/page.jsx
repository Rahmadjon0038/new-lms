"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { BanknotesIcon, BookOpenIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useGetAllSubjects } from "../../../hooks/subjects";
import { useMonthlyPayments } from "../../../hooks/payments";
import { findEnglishSubject, formatCount, formatMoney } from "../../../utils/englishManager";

const StatusBadge = ({ value }) => {
  const status = String(value || "").toLowerCase();
  const styles = {
    paid: "bg-green-100 text-green-700",
    partial: "bg-amber-100 text-amber-700",
    unpaid: "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {value || "-"}
    </span>
  );
};

export default function EnglishManagerPaymentsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [paymentStatus, setPaymentStatus] = useState("all");

  const subjectsQuery = useGetAllSubjects();
  const englishSubject = useMemo(() => findEnglishSubject(subjectsQuery.data?.subjects || []), [subjectsQuery.data]);
  const subjectId = englishSubject?.id;

  const paymentsQuery = useMonthlyPayments(
    { month, subject_id: subjectId, payment_status: paymentStatus, limit: 100 },
    { enabled: !!subjectId && !!month }
  );

  const data = paymentsQuery.data?.data || {};
  const summary = data.summary || {};
  const students = Array.isArray(data.students) ? data.students : [];
  const paymentDistribution = data.payment_status_distribution || {};

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
            Payments
          </div>
          <h1 className="mt-3 text-3xl font-black text-gray-900">English to'lovlar</h1>
          <p className="mt-1 text-sm text-gray-500">Faqat English subject bo'yicha to'lovlar va qarzdorliklar.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Link href="/english-manager" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700">
            Dashboard
            <BookOpenIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat title="Talabalar" value={formatCount(summary.total_students || students.length)} icon={UsersIcon} />
        <MiniStat title="Talab qilinadi" value={formatMoney(summary.total_required || 0)} icon={BanknotesIcon} />
        <MiniStat title="To'langan" value={formatMoney(summary.total_paid || 0)} icon={BanknotesIcon} />
        <MiniStat title="Qarz" value={formatMoney(summary.total_debt || 0)} icon={BanknotesIcon} />
      </section>

      <section className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900">Filtrlar</h2>
            <p className="text-sm text-gray-500">Oy va payment status bo'yicha filtrlang</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
            />
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
            >
              <option value="all">Barchasi</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {(paymentDistribution.items || []).map((item) => (
            <div key={item.status} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">{item.label}</div>
              <div className="mt-2 text-2xl font-black text-gray-900">{formatCount(item.count)}</div>
              <div className="mt-1 text-sm text-gray-500">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-black text-gray-900">Talabalar to'lovlari</h2>
            <p className="text-sm text-gray-500">Tanlangan oy bo'yicha English talabalar</p>
          </div>

          {paymentsQuery.isLoading ? (
            <div className="py-10 text-center text-sm text-gray-500">Yuklanmoqda...</div>
          ) : students.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              Tanlangan oy uchun ma'lumot topilmadi.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Talaba</th>
                    <th className="px-4 py-3">Guruh</th>
                    <th className="px-4 py-3">To'langan</th>
                    <th className="px-4 py-3">Qarz</th>
                    <th className="px-4 py-3">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr key={`${student.student_id}-${student.group_id}`} className="bg-white">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{student.student_name || `${student.name || ""} ${student.surname || ""}`.trim() || "-"}</div>
                        <div className="text-xs text-gray-500">{student.phone || "-"}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{student.group_name || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatMoney(student.paid_amount || 0)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatMoney(student.debt_amount || 0)}</td>
                      <td className="px-4 py-3"><StatusBadge value={student.payment_status} /></td>
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

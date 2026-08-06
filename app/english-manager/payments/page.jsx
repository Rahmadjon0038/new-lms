"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpenIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useGetAllSubjects } from "../../../hooks/subjects";
import { useMonthlyPayments } from "../../../hooks/payments";
import { findEnglishSubject, formatCount, formatMoney } from "../../../utils/englishManager";

const normalizeText = (v) => String(v || "").toLowerCase().trim();

const paymentStateLabel = (status) => {
  if (status === "paid") return "To'liq to'lagan";
  if (status === "partial") return "Qisman to'lagan";
  return "To'lamagan";
};

const paymentStateStyle = (status) => {
  if (status === "paid") return "bg-emerald-100 text-emerald-700";
  if (status === "partial") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
};

// Har bir o'qituvchining o'quvchilari bo'yicha to'lov statistikasi
const computeStudentStats = (students) => {
  const list = Array.isArray(students) ? students : [];
  let paid = 0;
  let partial = 0;
  let unpaid = 0;
  let collected = 0;
  let requiredTotal = 0;
  let discountTotal = 0;
  for (const s of list) {
    const status = s?.payment_status;
    if (status === "paid") paid += 1;
    else if (status === "partial") partial += 1;
    else unpaid += 1;
    collected += Number(s?.paid_amount) || 0;
    requiredTotal += Number(s?.effective_required ?? s?.required_amount) || 0;
    discountTotal += Number(s?.discount_amount) || 0;
  }
  const total = list.length;
  const paidAny = paid + partial;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  return {
    total,
    paid,
    partial,
    unpaid,
    paidAny,
    collected,
    requiredTotal,
    discountTotal,
    paidPct: pct(paid),
    partialPct: pct(partial),
    unpaidPct: pct(unpaid),
    paidAnyPct: pct(paidAny),
  };
};

// Teacher ism-familiyasi tagidagi to'lov progress bari
const TeacherPaymentProgress = ({ stats }) => {
  if (!stats.total) {
    return (
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100" />
        <span className="shrink-0 text-[10px] font-medium text-gray-400">O'quvchi yo'q</span>
      </div>
    );
  }
  return (
    <div className="mt-1.5">
      <div className="flex items-center gap-2">
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          {stats.paidPct > 0 && <div className="h-full bg-emerald-500" style={{ width: `${stats.paidPct}%` }} />}
          {stats.partialPct > 0 && <div className="h-full bg-amber-400" style={{ width: `${stats.partialPct}%` }} />}
          {stats.unpaidPct > 0 && <div className="h-full bg-rose-400" style={{ width: `${stats.unpaidPct}%` }} />}
        </div>
        <span className="shrink-0 text-[11px] font-bold text-emerald-600">{stats.paidAnyPct}%</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-gray-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          To'lagan: <b className="text-gray-700">{stats.paid}</b>
        </span>
        {stats.partial > 0 && (
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Qisman: <b className="text-gray-700">{stats.partial}</b>
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          To'lamagan: <b className="text-gray-700">{stats.unpaid}</b>
        </span>
        <span className="text-gray-400">/ {stats.total} ta</span>
      </div>
    </div>
  );
};

export default function EnglishManagerPaymentsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState("");
  const [openTeacher, setOpenTeacher] = useState({});

  const subjectsQuery = useGetAllSubjects();
  const englishSubject = useMemo(() => findEnglishSubject(subjectsQuery.data?.subjects || []), [subjectsQuery.data]);
  const subjectId = englishSubject?.id;

  const paymentsQuery = useMonthlyPayments(
    { month, subject_id: subjectId, limit: 500 },
    { enabled: !!subjectId && !!month, keepPreviousData: true }
  );

  const data = paymentsQuery.data?.data || {};
  const summary = data.summary || {};
  const students = Array.isArray(data.students) ? data.students : [];

  const paymentStats = useMemo(() => {
    const paid = parseInt(summary.paid_students || 0, 10);
    const partial = parseInt(summary.partial_students || 0, 10);
    const unpaid = parseInt(summary.unpaid_students || 0, 10);
    const total = paid + partial + unpaid;
    const paidAny = paid + partial;
    const percent = total ? Math.round((paidAny / total) * 100) : 0;
    // "Jami" — student_groups asosidagi to'g'ri son (dashboard/super admin bilan bir xil).
    // Ba'zi faol talabalarga shu oy uchun hali to'lov jadvali (snapshot) yaratilmagan
    // bo'lishi mumkin — shuning uchun bu son paid+partial+unpaid yig'indisidan katta bo'lishi mumkin.
    const dashboardTotal = summary.subject_active_students != null
      ? parseInt(summary.subject_active_students, 10)
      : total;
    const missingSnapshot = Math.max(0, dashboardTotal - total);
    return { paid, partial, unpaid, total, paidAny, percent, dashboardTotal, missingSnapshot };
  }, [summary]);

  // O'quvchilarni teacher bo'yicha guruhlaymiz
  const teacherGroups = useMemo(() => {
    const map = new Map();
    students.forEach((student) => {
      const teacherName = student.teacher_name?.trim() || "Guruhga biriktirilmagan";
      if (!map.has(teacherName)) map.set(teacherName, []);
      map.get(teacherName).push(student);
    });
    return Array.from(map.entries())
      .map(([teacherName, list]) => ({ teacherName, students: list, stats: computeStudentStats(list) }))
      .sort((a, b) => a.teacherName.localeCompare(b.teacherName, "uz"));
  }, [students]);

  const filteredTeacherGroups = useMemo(() => {
    const q = normalizeText(searchTerm);
    if (!q) return teacherGroups;
    return teacherGroups.filter((group) => normalizeText(group.teacherName).includes(q));
  }, [teacherGroups, searchTerm]);

  const toggleTeacher = (teacherName) => {
    setOpenTeacher((prev) => ({ ...prev, [teacherName]: !prev[teacherName] }));
  };

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
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">English to'lovlar</h1>
            <p className="text-xs text-gray-500">Faqat English subject bo'yicha to'lovlar va qarzdorliklar</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="O'qituvchi"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
            />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
            />
            <Link href="/english-manager" className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
              <BookOpenIcon className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">To'lov holati ({month})</h2>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
            Jami: {formatCount(paymentStats.dashboardTotal)} o'quvchi
          </span>
        </div>
        {paymentStats.missingSnapshot > 0 && (
          <p className="mb-2 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
            {paymentStats.missingSnapshot} ta faol talabaga hali shu oy uchun to'lov jadvali yaratilmagan — pastdagi ro'yxatda ko'rinmaydi.
          </p>
        )}
        {paymentStats.total === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">Bu oyda o'quvchi ma'lumoti yo'q.</p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { label: "To'lagan", value: paymentStats.paid },
                      { label: "Qisman", value: paymentStats.partial },
                      { label: "To'lamagan", value: paymentStats.unpaid },
                    ].filter((item) => item.value > 0)}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {paymentStats.paid > 0 ? <Cell key="paid" fill="#10B981" /> : null}
                    {paymentStats.partial > 0 ? <Cell key="partial" fill="#F59E0B" /> : null}
                    {paymentStats.unpaid > 0 ? <Cell key="unpaid" fill="#EF4444" /> : null}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} o'quvchi`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-gray-900">{paymentStats.percent}%</span>
                <span className="text-[10px] font-medium text-gray-500">to'lov qilgan</span>
              </div>
            </div>
            <div className="w-full space-y-2 sm:w-auto sm:min-w-56">
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  To'lagan
                </span>
                <span className="text-sm font-bold text-emerald-600">{paymentStats.paid} o'quvchi</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Qisman
                </span>
                <span className="text-sm font-bold text-amber-600">{paymentStats.partial} o'quvchi</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  To'lamagan
                </span>
                <span className="text-sm font-bold text-rose-600">{paymentStats.unpaid} o'quvchi</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-gray-800">Oylik jadvali ({month})</h2>
        <div className="space-y-2">
          {paymentsQuery.isLoading ? (
            <div className="rounded-md border border-gray-200 p-3 text-sm text-gray-500">Yuklanmoqda...</div>
          ) : filteredTeacherGroups.length === 0 ? (
            <div className="rounded-md border border-gray-200 p-3 text-sm text-gray-500">Ma'lumot topilmadi</div>
          ) : (
            filteredTeacherGroups.map((group) => {
              const isOpen = !!openTeacher[group.teacherName];
              return (
                <div key={group.teacherName} className="rounded-md border border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggleTeacher(group.teacherName)}
                    className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{group.teacherName}</p>
                      <TeacherPaymentProgress stats={group.stats} />
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pt-0.5">
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
                        {isOpen ? "Yopiq" : "Ochiq"}
                      </span>
                      {isOpen ? (
                        <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-200 px-3 pb-3 pt-2">
                      <div className="mb-1.5 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">O'quvchilar ro'yxati</p>
                        <span className="text-xs text-gray-500">{group.stats.total} ta o'quvchi</span>
                      </div>
                      <div className="overflow-x-auto rounded-md border border-gray-200">
                        <table className="min-w-[1000px] w-full text-xs">
                          <thead>
                            <tr className="border-b bg-gray-50 text-left text-gray-500">
                              <th className="py-1.5 pl-2 pr-2">ID</th>
                              <th className="py-1.5 pr-2">F.I.Sh</th>
                              <th className="py-1.5 pr-2">Guruh</th>
                              <th className="py-1.5 pr-2">Telefon</th>
                              <th className="py-1.5 pr-2">Qo'shimcha telefon</th>
                              <th className="py-1.5 pr-2">Ota ismi</th>
                              <th className="py-1.5 pr-2">Ota telefoni</th>
                              <th className="py-1.5 pr-2">Manzil</th>
                              <th className="py-1.5 pr-2">Yosh</th>
                              <th className="py-1.5 pr-2">Holat</th>
                              <th className="py-1.5 pr-2">Kerakli summa</th>
                              <th className="py-1.5 pr-2">Chegirma</th>
                              <th className="py-1.5 pr-2">To'lagan summa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.students.map((s) => {
                              const fullName = `${s.student_surname || ""} ${s.student_name || ""}`.trim() || "-";
                              const requiredAmount = Number(s.effective_required ?? s.required_amount) || 0;
                              return (
                                <tr key={`${s.student_id}-${s.group_id}`} className="border-b border-gray-100">
                                  <td className="py-1.5 pl-2 pr-2">{s.student_id}</td>
                                  <td className="py-1.5 pr-2">{fullName}</td>
                                  <td className="py-1.5 pr-2">{s.group_name || "-"}</td>
                                  <td className="py-1.5 pr-2">{s.student_phone || "-"}</td>
                                  <td className="py-1.5 pr-2">{s.student_phone2 || "-"}</td>
                                  <td className="py-1.5 pr-2">{s.student_father_name || "-"}</td>
                                  <td className="py-1.5 pr-2">{s.student_father_phone || "-"}</td>
                                  <td className="py-1.5 pr-2">{s.student_address || "-"}</td>
                                  <td className="py-1.5 pr-2">{s.student_age ?? "-"}</td>
                                  <td className="py-1.5 pr-2">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${paymentStateStyle(s.payment_status)}`}>
                                      {paymentStateLabel(s.payment_status)}
                                    </span>
                                  </td>
                                  <td className="py-1.5 pr-2">{formatMoney(requiredAmount)}</td>
                                  <td className="py-1.5 pr-2">{formatMoney(s.discount_amount || 0)}</td>
                                  <td className="py-1.5 pr-2">{formatMoney(s.paid_amount || 0)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold text-gray-800">
                              <td colSpan={10} className="py-1.5 pr-2 pl-2 text-right">Jami:</td>
                              <td className="py-1.5 pr-2 text-gray-900">{formatMoney(group.stats.requiredTotal)}</td>
                              <td className="py-1.5 pr-2 text-orange-700">{formatMoney(group.stats.discountTotal)}</td>
                              <td className="py-1.5 pr-2 text-emerald-700">{formatMoney(group.stats.collected)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

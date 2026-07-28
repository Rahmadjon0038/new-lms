"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AcademicCapIcon,
  BanknotesIcon,
  BookOpenIcon,
  UsersIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useGetAllSubjects, useGetSubjectStats } from "../../hooks/subjects";
import { useGetAllgroups } from "../../hooks/groups";
import { useGetAllStudentsAll } from "../../hooks/students";
import { useMonthlyPayments } from "../../hooks/payments";
import { findEnglishSubject, formatCount, formatMoney } from "../../utils/englishManager";

const MAIN_COLOR = "#A60E07";

const StatCard = ({ title, value, icon: Icon, note, accent = MAIN_COLOR }) => (
  <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">{title}</p>
        <p className="mt-2 text-2xl font-black tracking-tight text-gray-900">{value}</p>
        {note ? <p className="mt-1 text-xs text-gray-500">{note}</p> : null}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
        <Icon className="h-6 w-6" style={{ color: accent }} />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ value }) => {
  const status = String(value || "").toLowerCase();
  const styles = {
    active: "bg-green-100 text-green-700",
    draft: "bg-amber-100 text-amber-700",
    blocked: "bg-red-100 text-red-700",
    started: "bg-blue-100 text-blue-700",
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

export default function EnglishManagerDashboardPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);

  const subjectsQuery = useGetAllSubjects();
  const subjects = useMemo(() => subjectsQuery.data?.subjects || [], [subjectsQuery.data]);
  const subjectId = useMemo(() => findEnglishSubject(subjects)?.id, [subjects]);

  const subjectStatsQuery = useGetSubjectStats(subjectId);
  const groupsQuery = useGetAllgroups("all", "all", subjectId, { enabled: !!subjectId });
  const studentsQuery = useGetAllStudentsAll({ subject_id: subjectId, limit: 100 }, { enabled: !!subjectId });
  const paymentsQuery = useMonthlyPayments({ month, subject_id: subjectId, limit: 100 }, { enabled: !!subjectId && !!month });

  const subjectStats = subjectStatsQuery.data?.stats || {};
  const groups = useMemo(() => (Array.isArray(groupsQuery.data?.groups) ? groupsQuery.data.groups : []), [groupsQuery.data]);
  const students = useMemo(() => (Array.isArray(studentsQuery.data?.students) ? studentsQuery.data.students : []), [studentsQuery.data]);
  const paymentStudents = useMemo(
    () => (Array.isArray(paymentsQuery.data?.data?.students) ? paymentsQuery.data.data.students : []),
    [paymentsQuery.data]
  );
  const paymentSummary = paymentsQuery.data?.data?.summary || {};
  const paymentGroups = Array.isArray(paymentsQuery.data?.data?.groups) ? paymentsQuery.data.data.groups : [];
  const paymentDistribution = paymentsQuery.data?.data?.payment_status_distribution || {};

  const recentGroups = useMemo(() => groups.slice(0, 6), [groups]);
  const recentStudents = useMemo(() => students.slice(0, 8), [students]);
  const recentPayments = useMemo(() => paymentStudents.slice(0, 8), [paymentStudents]);

  const subjectReady = Boolean(subjectId);

  if (subjectsQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl bg-white">
        <div className="text-sm font-semibold text-gray-500">English subject qidirilmoqda...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-white via-amber-50 to-orange-50 p-5 shadow-sm sm:p-7">
        <div className="inline-flex rounded-full bg-[#A60E07]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#A60E07]">
          English manager
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Jami guruhlar"
            value={subjectReady ? formatCount(subjectStats.total_groups || groups.length) : "-"}
            icon={BookOpenIcon}
          />
          <StatCard
            title="Faol guruhlar"
            value={subjectReady ? formatCount(subjectStats.active_groups || groups.filter((item) => item.status === "active").length) : "-"}
            icon={UserGroupIcon}
          />
          <StatCard
            title="Jami talabalar"
            value={subjectReady ? formatCount(subjectStats.total_students || students.length) : "-"}
            icon={UsersIcon}
          />
          <StatCard
            title="Jami o'qituvchilar"
            value={subjectReady ? formatCount(subjectStats.total_teachers || 0) : "-"}
            icon={AcademicCapIcon}
          />
        </div>
      </section>

      {!subjectReady ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <div className="text-lg font-bold">English subject topilmadi</div>
          <p className="mt-2 text-sm leading-7">
            Bazada English fanini topa olmadim. Iltimos subject nomini <code>English</code> yoki <code>Ingliz tili</code> ko'rinishida tekshiring.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-gray-900">So'nggi guruhlar</h2>
                  <p className="text-sm text-gray-500">English subject bo'yicha guruhlar ro'yxati</p>
                </div>
                <Link href="/english-manager/groups" className="inline-flex items-center gap-1 rounded-full bg-[#A60E07]/10 px-3 py-1.5 text-xs font-bold text-[#A60E07]">
                  Barchasi
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {groupsQuery.isLoading ? (
                <div className="py-10 text-center text-sm text-gray-500">Guruhlar yuklanmoqda...</div>
              ) : recentGroups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                  English subject uchun guruh topilmadi.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Guruh</th>
                        <th className="px-4 py-3">O'qituvchi</th>
                        <th className="px-4 py-3">Talabalar</th>
                        <th className="px-4 py-3">Holat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentGroups.map((group) => (
                        <tr key={group.id} className="bg-white">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{group.name || group.group_name || "Guruh"}</div>
                            <div className="text-xs text-gray-500">Room: {group.room_number || "-"}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{group.teacher_name || "-"}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{formatCount(group.students_count || group.total_students || 0)}</td>
                          <td className="px-4 py-3"><StatusBadge value={group.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-black text-gray-900">Oylik to'lovlar</h2>
                <p className="text-sm text-gray-500">Tanlangan oy: {month}</p>
              </div>

              <label className="mb-4 block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Oy</span>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
                />
              </label>

              {paymentsQuery.isLoading ? (
                <div className="py-10 text-center text-sm text-gray-500">To'lovlar yuklanmoqda...</div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">To'langan</div>
                    <div className="mt-2 text-2xl font-black text-emerald-800">{formatMoney(paymentSummary.total_paid || 0)}</div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Chegirma</div>
                    <div className="mt-2 text-2xl font-black text-amber-800">{formatMoney(paymentSummary.total_discount_amount || 0)}</div>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Talab etiladi</div>
                    <div className="mt-2 text-2xl font-black text-blue-800">{formatMoney(paymentSummary.total_required || 0)}</div>
                  </div>
                  <div className="rounded-2xl bg-rose-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">Qarz</div>
                    <div className="mt-2 text-2xl font-black text-rose-800">{formatMoney(paymentSummary.total_debt || 0)}</div>
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Status distribution</div>
                <div className="mt-3 space-y-2">
                  {(paymentDistribution.items || []).map((item) => (
                    <div key={item.status} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <span className="font-black text-gray-900">{formatCount(item.count)} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900">So'nggi talabalar</h2>
                  <p className="text-sm text-gray-500">English subject bo'yicha yangi ro'yxatlar</p>
                </div>
                <Link href="/english-manager/students" className="inline-flex items-center gap-1 text-sm font-semibold text-[#A60E07]">
                  Barchasi
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </Link>
              </div>

              {studentsQuery.isLoading ? (
                <div className="py-10 text-center text-sm text-gray-500">Talabalar yuklanmoqda...</div>
              ) : recentStudents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                  English subject uchun talaba topilmadi.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentStudents.map((student) => (
                    <div key={student.id || student.student_id} className="rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {student.name || student.student_name || "-"} {student.surname || student.student_surname || ""}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {student.group_name || student.student_group_name || "Guruhsiz"}
                          </div>
                        </div>
                        <StatusBadge value={student.status || student.monthly_status} />
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                        <div>Phone: {student.phone || "-"}</div>
                        <div>Teacher: {student.teacher_name || student.student_teacher_name || "-"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900">So'nggi to'lovlar</h2>
                  <p className="text-sm text-gray-500">Tanlangan oy bo'yicha English to'lovlari</p>
                </div>
                <Link href="/english-manager/payments" className="inline-flex items-center gap-1 text-sm font-semibold text-[#A60E07]">
                  Barchasi
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>

              {paymentsQuery.isLoading ? (
                <div className="py-10 text-center text-sm text-gray-500">To'lovlar yuklanmoqda...</div>
              ) : recentPayments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                  Tanlangan oy uchun to'lov topilmadi.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Talaba</th>
                        <th className="px-4 py-3">Guruh</th>
                        <th className="px-4 py-3">To'lov</th>
                        <th className="px-4 py-3">Holat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentPayments.map((student) => (
                        <tr key={`${student.student_id}-${student.group_id}`} className="bg-white">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">
                              {student.student_name || `${student.name || ""} ${student.surname || ""}`.trim() || "-"}
                            </div>
                            <div className="text-xs text-gray-500">{student.teacher_name || "-"}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{student.group_name || student.student_group_name || "-"}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {formatMoney(student.paid_amount || 0)} / {formatMoney(student.required_amount || 0)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge value={student.payment_status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900">Quick actions</h2>
                <p className="text-sm text-gray-500">English section uchun tezkor havolalar</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Only English data
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Link href="/english-manager/groups" className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-[#A60E07]/20 hover:bg-[#A60E07]/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Guruhlar</div>
                    <div className="mt-1 text-xs text-gray-500">English guruhlar</div>
                  </div>
                  <BookOpenIcon className="h-5 w-5 text-[#A60E07]" />
                </div>
              </Link>
              <Link href="/english-manager/students" className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-[#A60E07]/20 hover:bg-[#A60E07]/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Talabalar</div>
                    <div className="mt-1 text-xs text-gray-500">English studentlar</div>
                  </div>
                  <UsersIcon className="h-5 w-5 text-[#A60E07]" />
                </div>
              </Link>
              <Link href="/english-manager/payments" className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-[#A60E07]/20 hover:bg-[#A60E07]/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">To'lovlar</div>
                    <div className="mt-1 text-xs text-gray-500">Oylar kesimida</div>
                  </div>
                  <BanknotesIcon className="h-5 w-5 text-[#A60E07]" />
                </div>
              </Link>
              <Link href="/english-manager/settings" className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-[#A60E07]/20 hover:bg-[#A60E07]/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Sozlamalar</div>
                    <div className="mt-1 text-xs text-gray-500">Role va scope</div>
                  </div>
                  <AcademicCapIcon className="h-5 w-5 text-[#A60E07]" />
                </div>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  UserPlusIcon,
  ReceiptPercentIcon,
  AcademicCapIcon,
  UsersIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
  EyeSlashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useGetDashboardSuperAdmin } from "../../hooks/dashboard";

const MAIN_COLOR = "#A60E07";
const STORAGE_KEYS = {
  monthlyOrder: "super_admin_monthly_order_v1",
  overallOrder: "super_admin_overall_order_v1",
  hiddenMonthly: "super_admin_hidden_monthly_v1",
  hiddenOverall: "super_admin_hidden_overall_v1",
};
const DEFAULT_MONTHLY_ORDER = [
  "current_month",
  "total_revenue",
  "total_teacher_salary",
  "total_expenses",
  "new_students_count",
  "total_discounts",
];
const DEFAULT_OVERALL_ORDER = [
  "total_students_count",
  "finished_students_count",
  "inactive_students_count",
  "total_teachers_count",
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) => new Intl.NumberFormat("uz-UZ").format(Number(value) || 0);

const reorderByIds = (ids = [], fromId, toId) => {
  if (!fromId || !toId || fromId === toId) return ids;
  const next = [...ids];
  const fromIndex = next.indexOf(fromId);
  const toIndex = next.indexOf(toId);
  if (fromIndex < 0 || toIndex < 0) return ids;
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

const sanitizeOrder = (raw, allowed, fallback) => {
  const arr = Array.isArray(raw) ? raw.map(String) : [];
  const allowedSet = new Set(allowed);
  const deduped = [...new Set(arr)].filter((id) => allowedSet.has(id));
  const missing = fallback.filter((id) => !deduped.includes(id));
  return [...deduped, ...missing];
};

const sanitizeHidden = (raw, allowed) => {
  const arr = Array.isArray(raw) ? raw.map(String) : [];
  const allowedSet = new Set(allowed);
  return [...new Set(arr)].filter((id) => allowedSet.has(id));
};

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
        <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="rounded-lg p-2" style={{ backgroundColor: `${MAIN_COLOR}15` }}>
        <Icon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
      </div>
    </div>
  </div>
);

const MonthlyKpiCard = ({ title, value, icon: Icon, accent = "rose" }) => {
  const accentMap = {
    rose: {
      box: "border-rose-200 bg-rose-50",
      icon: "bg-rose-100 text-rose-700",
      title: "text-rose-700",
    },
    emerald: {
      box: "border-emerald-200 bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-700",
      title: "text-emerald-700",
    },
    blue: {
      box: "border-blue-200 bg-blue-50",
      icon: "bg-blue-100 text-blue-700",
      title: "text-blue-700",
    },
    amber: {
      box: "border-amber-200 bg-amber-50",
      icon: "bg-amber-100 text-amber-700",
      title: "text-amber-700",
    },
    violet: {
      box: "border-violet-200 bg-violet-50",
      icon: "bg-violet-100 text-violet-700",
      title: "text-violet-700",
    },
  };

  const theme = accentMap[accent] || accentMap.rose;

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${theme.box}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${theme.title}`}>{title}</p>
          <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${theme.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

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
  const [draggingMonthlyId, setDraggingMonthlyId] = useState(null);
  const [draggingOverallId, setDraggingOverallId] = useState(null);
  const [hiddenMonthlyIds, setHiddenMonthlyIds] = useState([]);
  const [hiddenOverallIds, setHiddenOverallIds] = useState([]);
  const [monthlyOrder, setMonthlyOrder] = useState(DEFAULT_MONTHLY_ORDER);
  const [overallOrder, setOverallOrder] = useState(DEFAULT_OVERALL_ORDER);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  const query = useGetDashboardSuperAdmin(month, null, null);
  const data = query.data || {};

  const monthly = data?.monthly || {};
  const subjects = Array.isArray(data?.subjects) ? data.subjects : [];
  const overall = data?.overall || {};
  const monthlyCardsMap = {
    current_month: { id: "current_month", title: "Joriy oy", value: monthly?.current_month || month, icon: CurrencyDollarIcon, accent: "violet" },
    total_revenue: { id: "total_revenue", title: "Umumiy tushum", value: formatCurrency(monthly?.total_revenue), icon: CurrencyDollarIcon, accent: "emerald" },
    total_teacher_salary: {
      id: "total_teacher_salary",
      title: "Jami o'qituvchilarga berulgan oylik summasi",
      value: formatCurrency(monthly?.total_teacher_salary),
      icon: AcademicCapIcon,
      accent: "blue",
    },
    total_expenses: { id: "total_expenses", title: "Umumiy rasxod", value: formatCurrency(monthly?.total_expenses), icon: BanknotesIcon, accent: "rose" },
    new_students_count: { id: "new_students_count", title: "Yangi talabalar", value: formatNumber(monthly?.new_students_count), icon: UserPlusIcon, accent: "amber" },
    total_discounts: { id: "total_discounts", title: "Jami chegirma", value: formatCurrency(monthly?.total_discounts), icon: ReceiptPercentIcon, accent: "violet" },
  };
  const overallCardsMap = {
    total_students_count: { id: "total_students_count", title: "Jami talabalar", value: formatNumber(overall?.total_students_count), icon: UsersIcon },
    finished_students_count: { id: "finished_students_count", title: "Bitirgan talabalar", value: formatNumber(overall?.finished_students_count), icon: CheckBadgeIcon },
    inactive_students_count: { id: "inactive_students_count", title: "Noactive talabalar", value: formatNumber(overall?.inactive_students_count), icon: NoSymbolIcon },
    total_teachers_count: { id: "total_teachers_count", title: "Jami teacherlar", value: formatNumber(overall?.total_teachers_count), icon: UserGroupIcon },
  };
  const visibleMonthlyOrder = monthlyOrder.filter((id) => !hiddenMonthlyIds.includes(id));
  const visibleOverallOrder = overallOrder.filter((id) => !hiddenOverallIds.includes(id));

  useEffect(() => {
    try {
      const savedMonthlyOrder = JSON.parse(localStorage.getItem(STORAGE_KEYS.monthlyOrder) || "null");
      const savedOverallOrder = JSON.parse(localStorage.getItem(STORAGE_KEYS.overallOrder) || "null");
      const savedHiddenMonthly = JSON.parse(localStorage.getItem(STORAGE_KEYS.hiddenMonthly) || "null");
      const savedHiddenOverall = JSON.parse(localStorage.getItem(STORAGE_KEYS.hiddenOverall) || "null");

      setMonthlyOrder(sanitizeOrder(savedMonthlyOrder, DEFAULT_MONTHLY_ORDER, DEFAULT_MONTHLY_ORDER));
      setOverallOrder(sanitizeOrder(savedOverallOrder, DEFAULT_OVERALL_ORDER, DEFAULT_OVERALL_ORDER));
      setHiddenMonthlyIds(sanitizeHidden(savedHiddenMonthly, DEFAULT_MONTHLY_ORDER));
      setHiddenOverallIds(sanitizeHidden(savedHiddenOverall, DEFAULT_OVERALL_ORDER));
    } catch {
      setMonthlyOrder(DEFAULT_MONTHLY_ORDER);
      setOverallOrder(DEFAULT_OVERALL_ORDER);
      setHiddenMonthlyIds([]);
      setHiddenOverallIds([]);
    } finally {
      setPrefsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!prefsLoaded) return;
    localStorage.setItem(STORAGE_KEYS.monthlyOrder, JSON.stringify(monthlyOrder));
  }, [monthlyOrder, prefsLoaded]);

  useEffect(() => {
    if (!prefsLoaded) return;
    localStorage.setItem(STORAGE_KEYS.overallOrder, JSON.stringify(overallOrder));
  }, [overallOrder, prefsLoaded]);

  useEffect(() => {
    if (!prefsLoaded) return;
    localStorage.setItem(STORAGE_KEYS.hiddenMonthly, JSON.stringify(hiddenMonthlyIds));
  }, [hiddenMonthlyIds, prefsLoaded]);

  useEffect(() => {
    if (!prefsLoaded) return;
    localStorage.setItem(STORAGE_KEYS.hiddenOverall, JSON.stringify(hiddenOverallIds));
  }, [hiddenOverallIds, prefsLoaded]);

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
        <p className="mb-2 text-xs text-gray-500">Kartalarni sudrab joyini almashtirishingiz mumkin.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleMonthlyOrder.map((cardId) => {
            const card = monthlyCardsMap[cardId];
            if (!card) return null;
            return (
              <div
                key={card.id}
                draggable
                onDragStart={() => setDraggingMonthlyId(card.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => setMonthlyOrder((prev) => reorderByIds(prev, draggingMonthlyId, card.id))}
                onDragEnd={() => setDraggingMonthlyId(null)}
                className={`cursor-move rounded-2xl transition ${draggingMonthlyId === card.id ? "opacity-70 ring-2 ring-[#A60E07]/30" : ""}`}
                title="Sudrab tartiblash"
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setHiddenMonthlyIds((prev) => [...new Set([...prev, card.id])])}
                    className="absolute bottom-2 right-2 z-10 inline-flex items-center rounded-md border border-gray-300 bg-white p-1.5 text-gray-600 shadow-sm hover:bg-gray-50"
                    title="Kartani yashirish"
                  >
                    <EyeSlashIcon className="h-4 w-4" />
                  </button>
                  <MonthlyKpiCard title={card.title} value={card.value} icon={card.icon} accent={card.accent} />
                </div>
              </div>
            );
          })}
        </div>

        {hiddenMonthlyIds.length > 0 ? (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-xs font-semibold text-gray-600">Yashirilgan Oylik KPI kartalari:</p>
            <div className="flex flex-wrap gap-2">
              {hiddenMonthlyIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setHiddenMonthlyIds((prev) => prev.filter((x) => x !== id))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  <EyeIcon className="h-3.5 w-3.5" />
                  {monthlyCardsMap[id]?.title || id}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Sof foyda (alohida)</p>
          <p className="mt-1 text-3xl font-extrabold text-emerald-800">{formatCurrency(monthly?.net_profit)}</p>
          <p className="mt-1 text-xs text-emerald-700">
            Formula: tushum - teacher oyligi - rasxod - chegirma
          </p>
        </div>
      </Section>

      <Section title="Umumiy markaz statistikasi">
        <p className="mb-2 text-xs text-gray-500">Kartalarni sudrab tartibini o&apos;zgartiring.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleOverallOrder.map((cardId) => {
            const card = overallCardsMap[cardId];
            if (!card) return null;
            return (
              <div
                key={card.id}
                draggable
                onDragStart={() => setDraggingOverallId(card.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => setOverallOrder((prev) => reorderByIds(prev, draggingOverallId, card.id))}
                onDragEnd={() => setDraggingOverallId(null)}
                className={`cursor-move rounded-xl transition ${draggingOverallId === card.id ? "opacity-70 ring-2 ring-[#A60E07]/30" : ""}`}
                title="Sudrab tartiblash"
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setHiddenOverallIds((prev) => [...new Set([...prev, card.id])])}
                    className="absolute bottom-2 right-2 z-10 inline-flex items-center rounded-md border border-gray-300 bg-white p-1.5 text-gray-600 shadow-sm hover:bg-gray-50"
                    title="Kartani yashirish"
                  >
                    <EyeSlashIcon className="h-4 w-4" />
                  </button>
                  <StatCard title={card.title} value={card.value} icon={card.icon} />
                </div>
              </div>
            );
          })}
        </div>

        {hiddenOverallIds.length > 0 ? (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-xs font-semibold text-gray-600">Yashirilgan umumiy statistika kartalari:</p>
            <div className="flex flex-wrap gap-2">
              {hiddenOverallIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setHiddenOverallIds((prev) => prev.filter((x) => x !== id))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  <EyeIcon className="h-3.5 w-3.5" />
                  {overallCardsMap[id]?.title || id}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Section>

      <Section title="Fanlar bo&apos;yicha tahlil">
        <div className="mb-4 overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <th className="py-2 pr-2">Fan ID</th>
                <th className="py-2 pr-2">Fan nomi</th>
                <th className="py-2 pr-2">Jami talabalar</th>
                <th className="py-2 pr-2">Jami tushum</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-gray-500">Fanlar bo&apos;yicha ma&apos;lumot yo&apos;q</td>
                </tr>
              ) : (
                subjects.map((item) => (
                  <tr key={String(item.subject_id)} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-2 text-gray-600">{item.subject_id}</td>
                    <td className="py-2 pr-2 font-medium text-gray-900">{item.subject_name || "-"}</td>
                    <td className="py-2 pr-2">{formatNumber(item.total_students_count)}</td>
                    <td className="py-2 pr-2">{formatCurrency(item.total_revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </Section>
    </div>
  );
}

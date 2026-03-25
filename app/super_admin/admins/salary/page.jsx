"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useAdminSalaries } from "../../../../hooks/admins";

const MAIN_COLOR = "#A60E07";

const formatCurrency = (value) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

export default function SuperAdminSalaryPage() {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [monthFilter, setMonthFilter] = useState(thisMonth);
  const [adminIdFilter, setAdminIdFilter] = useState("");

  const salariesQuery = useAdminSalaries({
    admin_id: adminIdFilter || undefined,
    month_name: monthFilter || undefined,
  });

  const salaries = useMemo(() => {
    if (Array.isArray(salariesQuery.data)) return salariesQuery.data;
    if (Array.isArray(salariesQuery.data?.data)) return salariesQuery.data.data;
    return [];
  }, [salariesQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: MAIN_COLOR }}>Admin oyliklari</h1>
          <p className="text-sm text-gray-600">Adminlar bo'yicha oyliklar ro'yxati.</p>
        </div>
        <Link
          href="/super_admin/admins"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Adminlar boshqaruvi
        </Link>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">Oy</label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Admin ID</label>
            <input
              type="number"
              value={adminIdFilter}
              onChange={(e) => setAdminIdFilter(e.target.value)}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Masalan: 12"
            />
          </div>
        </div>

        {salariesQuery.isLoading ? (
          <div className="py-6 text-center text-sm text-gray-500">Yuklanmoqda...</div>
        ) : salariesQuery.isError ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {salariesQuery.error?.response?.data?.message || salariesQuery.error?.message || "Oyliklar yuklanmadi"}
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[1000px] w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Admin</th>
                  <th className="py-2 pr-2">Username</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2">Oy</th>
                  <th className="py-2 pr-2">Summa</th>
                  <th className="py-2 pr-2">Izoh</th>
                  <th className="py-2 pr-2">Yangilangan</th>
                </tr>
              </thead>
              <tbody>
                {salaries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-gray-500">Ma'lumot topilmadi</td>
                  </tr>
                ) : (
                  salaries.map((item) => (
                    <tr key={String(item.id)} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-2 text-gray-600">{item.id}</td>
                      <td className="py-2 pr-2 font-medium text-gray-900">
                        {item.name} {item.surname}
                      </td>
                      <td className="py-2 pr-2">{item.username || "-"}</td>
                      <td className="py-2 pr-2">{item.status || "-"}</td>
                      <td className="py-2 pr-2">{item.month_name}</td>
                      <td className="py-2 pr-2">{formatCurrency(item.amount)}</td>
                      <td className="py-2 pr-2">{item.description || "-"}</td>
                      <td className="py-2 pr-2">{formatDate(item.updated_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

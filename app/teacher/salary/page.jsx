"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { instance } from "../../../hooks/api";
import {
  useTeacherAdvances,
  useTeacherSalaryMonthSummary,
} from "../../../hooks/teacher-salary";

const MAIN_COLOR = "#A60E07";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const num = (obj, keys, fallback = 0) => {
  for (const key of keys) {
    const v = obj?.[key];
    if (v !== undefined && v !== null && v !== "") return Number(v) || 0;
  }
  return fallback;
};

const fmtMoney = (n) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  }).format(Number(n) || 0);

const getProfile = async () => {
  const res = await instance.get("/api/users/profile");
  return res?.data?.data || res?.data;
};

const TeacherSalaryPage = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const profileQuery = useQuery({
    queryKey: ["user-profile-salary"],
    queryFn: getProfile,
  });

  const teacherId = profileQuery.data?.id || profileQuery.data?.user_id;

  const summaryQuery = useTeacherSalaryMonthSummary({
    month_name: month,
    teacher_id: teacherId,
  });

  const advancesQuery = useTeacherAdvances({
    month_name: month,
    teacher_id: teacherId,
  });

  const summaryRaw = summaryQuery.data?.summary || summaryQuery.data || {};
  const advances = useMemo(() => asArray(advancesQuery.data), [advancesQuery.data]);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-0">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Mening Oyligim</h1>
          <p className="mt-1 text-sm text-gray-600">Soddalashtirilgan oylik hisobi</p>
          <div className="mt-3 max-w-xs">
            <label className="mb-1 block text-xs font-medium text-gray-700">Oy</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
              style={{ "--tw-ring-color": MAIN_COLOR }}
            />
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">Hisobot jadvali</h3>
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500">
                  <th className="py-2 pr-2">Ko'rsatkich</th>
                  <th className="py-2 pr-2">Qiymat</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="py-2 pr-2">Total students</td><td className="py-2 pr-2">{num(summaryRaw, ["total_students"])}</td></tr>
                <tr className="border-b"><td className="py-2 pr-2">Paid students</td><td className="py-2 pr-2">{num(summaryRaw, ["paid_students"])}</td></tr>
                <tr className="border-b"><td className="py-2 pr-2">Unpaid students</td><td className="py-2 pr-2">{num(summaryRaw, ["unpaid_students"])}</td></tr>
                <tr className="border-b"><td className="py-2 pr-2">Total collected</td><td className="py-2 pr-2 font-semibold text-gray-900">{fmtMoney(num(summaryRaw, ["total_collected", "close_revenue"]))}</td></tr>
                <tr className="border-b"><td className="py-2 pr-2">Salary percentage</td><td className="py-2 pr-2">{num(summaryRaw, ["salary_percentage"])}%</td></tr>
                <tr className="border-b"><td className="py-2 pr-2">Expected salary</td><td className="py-2 pr-2 font-semibold text-gray-900">{fmtMoney(num(summaryRaw, ["expected_salary", "close_expected_salary"]))}</td></tr>
                <tr className="border-b"><td className="py-2 pr-2">Total advances</td><td className="py-2 pr-2">{fmtMoney(num(summaryRaw, ["total_advances"]))}</td></tr>
                <tr className="border-b"><td className="py-2 pr-2">Final salary</td><td className="py-2 pr-2 font-semibold text-gray-900">{fmtMoney(num(summaryRaw, ["final_salary", "close_balance"]))}</td></tr>
                <tr><td className="py-2 pr-2">Oy yopilganmi</td><td className="py-2 pr-2">{summaryRaw?.is_closed ? "Ha" : "Yo'q"}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-gray-800">Avanslar ro'yxati ({advances.length})</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500">
                  <th className="py-2 pr-2">Sana</th>
                  <th className="py-2 pr-2">Miqdor</th>
                  <th className="py-2 pr-2">Izoh</th>
                </tr>
              </thead>
              <tbody>
                {advances.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-3 text-gray-500">Avans yo'q</td>
                  </tr>
                ) : (
                  advances.map((a, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 pr-2 text-xs text-gray-600">{(a.created_at || a.date || "").slice(0, 10) || "-"}</td>
                      <td className="py-2 pr-2 font-medium text-gray-900">{fmtMoney(num(a, ["amount"]))}</td>
                      <td className="py-2 pr-2 text-gray-600">{a.description || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSalaryPage;

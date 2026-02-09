"use client";
import React, { useMemo, useState } from "react";
import {
  UsersIcon,
  PlusIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { FiUserPlus } from 'react-icons/fi';
import {
  User, Phone, Calendar, AlertCircle
} from 'lucide-react';
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useGetAllStudents } from '../../hooks/students';
import { useGetDashboardDailyStats, useGetDashboardMonthlyStats, useGetDashboardOverview } from '../../hooks/dashboard';
import AddGroup from '../../components/admistrator/AddGroup';

const MAIN_COLOR = "#A60E07";
const PIE_COLORS = ['#A60E07', '#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'];
const PAYMENT_STATUS_LABELS = {
  paid: "To'langan",
  partial: "Qisman to'langan",
  unpaid: "To'lanmagan",
  inactive: "Faol emas",
};
const PAYMENT_STATUS_COLORS = {
  paid: "#16A34A",
  partial: "#F59E0B",
  unpaid: "#DC2626",
  inactive: "#64748B",
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(amount);
};

const toNumber = (value) => Number(value) || 0;

const getStatValue = (source, key, fallbackKey = null) => {
  if (!source) return 0;
  if (source[key] !== undefined && source[key] !== null) return toNumber(source[key]);
  if (fallbackKey && source[fallbackKey] !== undefined && source[fallbackKey] !== null) return toNumber(source[fallbackKey]);
  return 0;
};

const buildChartRows = (chart, keys = []) => {
  const labels = Array.isArray(chart?.labels) ? chart.labels : [];
  const series = chart?.series || {};
  return labels.map((label, index) => {
    const row = { label };
    keys.forEach((key) => {
      row[key] = toNumber(Array.isArray(series[key]) ? series[key][index] : 0);
    });
    return row;
  });
};

const filterRowsFromMonth = (rows = [], fromMonth = "2026-01") =>
  rows.filter((row) => {
    const label = String(row?.label || "");
    const match = label.match(/\d{4}-\d{2}/);
    if (!match) return true;
    return match[0] >= fromMonth;
  });

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = MAIN_COLOR, bgColor = "from-[#A60E07]/10 to-[#A60E07]/5" }) => (
  <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-200 flex items-center gap-3 hover:shadow-lg transition group">
    <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${bgColor} group-hover:scale-105 transition-transform`}>
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
    </div>
    <div className="flex flex-col flex-1 min-w-0">
      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase whitespace-normal break-words">{title}</span>
      <span className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900 whitespace-normal break-words leading-tight">{value}</span>
    </div>
  </div>
);

// Section Title Component
const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 rounded-lg" style={{ backgroundColor: `${MAIN_COLOR}15` }}>
      <Icon className="h-6 w-6" style={{ color: MAIN_COLOR }} />
    </div>
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
    <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
    {children}
  </div>
);

function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  // Guruhga qo'shilmagan talabalar uchun
  const filters = { unassigned: 'true' };
  const { data: backendData, isLoading: isLoadingUnassigned, refetch } = useGetAllStudents(filters);
  const unassignedStudents = backendData?.success ? (backendData.students || []) : [];

  // Yangi dashboard statistikasi
  const overviewQuery = useGetDashboardOverview();
  const dailyQuery = useGetDashboardDailyStats(selectedDate, selectedDate);
  const monthlyQuery = useGetDashboardMonthlyStats(selectedMonth, selectedMonth);

  const overview = overviewQuery.data;
  const daily = dailyQuery.data;
  const monthly = monthlyQuery.data;
  const dailySummary = daily?.summary || {};
  const monthlyCurrent = monthly?.current_month || {};

  const dailyStats = {
    payments_count: getStatValue(dailySummary, "payments_count"),
    new_students_count: getStatValue(dailySummary, "new_students_count"),
    expenses_count: getStatValue(dailySummary, "expenses_count"),
    expenses_amount:
      getStatValue(dailySummary, "expenses_amount") ||
      getStatValue(dailySummary, "total_expense_amount"),
  };

  const monthlyStats = {
    payments_count: getStatValue(monthlyCurrent, "payments_count"),
    new_students_count: getStatValue(monthlyCurrent, "new_students_count"),
    expenses_count: getStatValue(monthlyCurrent, "expenses_count"),
    expenses_amount:
      getStatValue(monthlyCurrent, "expenses_amount") ||
      getStatValue(monthlyCurrent, "total_expense_amount"),
    debtors_count: getStatValue(monthlyCurrent, "debtors_count"),
    debt_amount: getStatValue(monthlyCurrent, "debt_amount"),
  };

  const overviewOverall = overview?.overall || {};
  const overviewCharts = useMemo(() => overview?.charts || {}, [overview]);
  const admissionsRows = useMemo(
    () => filterRowsFromMonth(buildChartRows(overviewCharts?.admissions_monthly_last_12, ["admissions_count"]), "2026-01"),
    [overviewCharts]
  );
  const monthlyPaymentStatusDetails = useMemo(() => {
    const distribution = monthly?.payment_status_distribution || {};
    const labels = distribution?.chart?.labels || [];
    const counts = distribution?.chart?.series?.count || [];
    const itemsMap = new Map(
      (distribution?.items || []).map((item) => [String(item?.label || '').toLowerCase(), item])
    );

    const raw = labels.map((label, index) => {
      const key = String(label || '').toLowerCase();
      const item = itemsMap.get(key) || {};
      const value = toNumber(counts[index] ?? item.count ?? 0);
      return {
        name: key,
        label: PAYMENT_STATUS_LABELS[key] || label,
        value,
        percent: item?.percentage,
        color: PAYMENT_STATUS_COLORS[key] || PIE_COLORS[index % PIE_COLORS.length],
      };
    }).filter((item) => item.value > 0);

    const total = raw.reduce((sum, item) => sum + item.value, 0);
    return raw.map((item) => ({
      ...item,
      percent: item.percent !== undefined && item.percent !== null ? Number(item.percent) : (total ? Math.round((item.value / total) * 100) : 0),
    }));
  }, [monthly]);
  const monthlyPaymentStatusTotal = useMemo(
    () => monthlyPaymentStatusDetails.reduce((sum, item) => sum + item.value, 0),
    [monthlyPaymentStatusDetails]
  );

  const handleModalSuccess = () => {
    refetch();
  };

  if (isLoadingUnassigned || overviewQuery.isLoading || dailyQuery.isLoading || monthlyQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: MAIN_COLOR }}></div>
          <p className="text-gray-600 mt-4">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 mx-auto bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 tracking-tight drop-shadow-sm" style={{ color: MAIN_COLOR }}>
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-500">Markazning umumiy ko&apos;rsatkichlari</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
            style={{ outlineColor: MAIN_COLOR }}
            placeholder="Kun tanlash"
          />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
            style={{ outlineColor: MAIN_COLOR }}
            placeholder="Oy tanlash"
          />
          <Link 
            href="/admin/students/new" 
            className="flex items-center justify-center gap-2 px-4 py-2 text-white font-semibold rounded-lg shadow transition hover:opacity-90 text-sm"
            style={{ backgroundColor: MAIN_COLOR }}
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" /> 
            <span className="hidden sm:inline">Yangi talaba qo&apos;shish</span>
            <span className="sm:hidden">Talaba qo&apos;shish</span>
          </Link>
        </div>
      </div>

      {/* Kunlik Statistika */}
      {dailyQuery.isError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Kunlik statistika yuklanmadi</p>
          <p>{dailyQuery.error?.response?.data?.message || dailyQuery.error?.message || 'Nomaʼlum xatolik'}</p>
        </div>
      ) : null}
      {daily && (
        <div className="mb-6 sm:mb-8">
          <SectionTitle 
            icon={CalendarIcon} 
            title="Kunlik statistika"
            subtitle={`${daily?.period?.from || selectedDate} - ${daily?.period?.to || selectedDate}`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard 
              title="To'lovlar soni" 
              value={dailyStats.payments_count}
              icon={BanknotesIcon}
              color="#10B981"
              bgColor="from-green-100 to-green-50"
            />
            <StatCard 
              title="Yangi talabalar" 
              value={dailyStats.new_students_count}
              icon={UsersIcon}
              color="#3B82F6"
              bgColor="from-blue-100 to-blue-50"
            />
            <StatCard 
              title="Rasxodlar soni" 
              value={dailyStats.expenses_count}
              icon={CalendarIcon}
              color="#DC2626"
              bgColor="from-red-100 to-red-50"
            />
            <StatCard 
              title="Rasxod summasi" 
              value={formatCurrency(dailyStats.expenses_amount)}
              icon={CurrencyDollarIcon}
              color="#DC2626"
              bgColor="from-red-100 to-red-50"
            />
          </div>
        </div>
      )}

      {/* Oylik Statistika */}
      {monthlyQuery.isError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Oylik statistika yuklanmadi</p>
          <p>{monthlyQuery.error?.response?.data?.message || monthlyQuery.error?.message || 'Nomaʼlum xatolik'}</p>
        </div>
      ) : null}
      {monthly && (
        <div className="mb-6 sm:mb-8">
          <SectionTitle 
            icon={ChartBarIcon} 
            title="Oylik statistika"
            subtitle={`${monthly?.period?.from_month || selectedMonth} - ${monthly?.period?.to_month || selectedMonth}`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard 
              title="To'lovlar soni" 
              value={monthlyStats.payments_count}
              icon={BanknotesIcon}
              color="#059669"
              bgColor="from-emerald-100 to-emerald-50"
            />
            <StatCard 
              title="Yangi talabalar" 
              value={monthlyStats.new_students_count}
              icon={UsersIcon}
              color="#2563EB"
              bgColor="from-blue-100 to-blue-50"
            />
            <StatCard 
              title="Rasxodlar soni" 
              value={monthlyStats.expenses_count}
              icon={CalendarIcon}
              color="#DC2626"
              bgColor="from-red-100 to-red-50"
            />
            <StatCard 
              title="Rasxod summasi" 
              value={formatCurrency(monthlyStats.expenses_amount)}
              icon={CurrencyDollarIcon}
              color="#DC2626"
              bgColor="from-red-100 to-red-50"
            />
            <StatCard 
              title="Qarzdorlar soni" 
              value={monthlyStats.debtors_count}
              icon={AlertCircle}
              color="#B45309"
              bgColor="from-amber-100 to-amber-50"
            />
            <StatCard 
              title="Qarz summasi" 
              value={formatCurrency(monthlyStats.debt_amount)}
              icon={CurrencyDollarIcon}
              color="#B91C1C"
              bgColor="from-rose-100 to-rose-50"
            />
          </div>
          {monthlyPaymentStatusDetails.length > 0 ? (
            <div className="mt-4">
              <ChartCard title="Oylik to'lov status taqsimoti">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={monthlyPaymentStatusDetails} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={95}>
                        {monthlyPaymentStatusDetails.map((entry) => (
                          <Cell key={`mps-${entry.name}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, _name, ctx) => [`${value} ta`, ctx?.payload?.label || "Status"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Jami: <span className="font-semibold text-gray-800">{monthlyPaymentStatusTotal}</span></p>
                  {monthlyPaymentStatusDetails.map((item) => (
                    <div key={`monthly-legend-${item.name}`} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-700 truncate">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                        <div className="text-xs text-gray-500">{item.percent}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </ChartCard>
            </div>
          ) : null}
        </div>
      )}

      {!daily && !dailyQuery.isError && !dailyQuery.isLoading ? (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">Kunlik statistika maʼlumoti topilmadi.</div>
      ) : null}
      {!monthly && !monthlyQuery.isError && !monthlyQuery.isLoading ? (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">Oylik statistika maʼlumoti topilmadi.</div>
      ) : null}

      {overviewQuery.isError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Overview statistika yuklanmadi</p>
          <p>{overviewQuery.error?.response?.data?.message || overviewQuery.error?.message || 'Nomaʼlum xatolik'}</p>
        </div>
      ) : null}
      {overview?.overall ? (
        <div className="mb-6 sm:mb-8">
          <SectionTitle
            icon={ChartBarIcon}
            title="Umumiy operatsion statistika"
            subtitle="Overview endpoint ma'lumotlari"
          />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard title="Faol o'qituvchilar" value={toNumber(overviewOverall.active_teachers_count)} icon={UsersIcon} color="#059669" bgColor="from-emerald-100 to-emerald-50" />
            <StatCard title="Faol guruhlar" value={toNumber(overviewOverall.active_groups_count)} icon={CalendarIcon} color="#7C3AED" bgColor="from-violet-100 to-violet-50" />
            <StatCard title="Fanlar soni" value={toNumber(overviewOverall.subjects_count)} icon={ChartBarIcon} color="#0EA5E9" bgColor="from-sky-100 to-sky-50" />
          </div>
          {admissionsRows.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4">
              {admissionsRows.length > 0 ? (
                <ChartCard title="Qabul trendi (12 oy)">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={admissionsRows}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="admissions_count" name="Qabul soni" stroke={MAIN_COLOR} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Guruhga qo'shilmagan talabalar */}
      {unassignedStudents.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-orange-800">
                  Guruhga qo&apos;shilmagan talabalar
                </h2>
                <p className="text-xs sm:text-sm text-orange-600">
                  {unassignedStudents.length} ta talaba guruhga biriktirilmagan
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-x-auto border border-orange-200">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gradient-to-r from-orange-100 to-orange-200">
                <tr>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-800 uppercase tracking-wider">
                    Student ma&apos;lumotlari
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-800 uppercase tracking-wider hidden sm:table-cell">
                    Ro&apos;yxatdan sana
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-800 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unassignedStudents.map((student) => {
                  return (
                    <tr key={student.id} className="hover:bg-orange-50 transition">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base sm:text-lg font-bold text-red-500">#{student.id}</span>
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                          <span className="font-semibold text-gray-900 truncate">{student.name} {student.surname}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600">
                            <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                            <span>{student.phone}</span>
                          </div>
                          {student.phone2 && (
                            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600">
                              <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-400" />
                              <span>{student.phone2}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600">
                            <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-500" />
                            <span className="truncate"><strong>Ota-ona:</strong> {student.father_name} ({student.father_phone})</span>
                          </div>
                          <div className="sm:hidden flex items-center gap-1 text-[10px] text-gray-600">
                            <Calendar className="h-2.5 w-2.5 text-orange-500" />
                            <span>
                              {student.registration_date
                                ? new Date(student.registration_date).toLocaleDateString('uz-UZ')
                                : 'Belgilanmagan'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                          <span className="font-medium">
                            {student.registration_date
                              ? new Date(student.registration_date).toLocaleDateString('uz-UZ')
                              : 'Belgilanmagan'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <AddGroup student={student} onSuccess={handleModalSuccess}>
                            <button className="p-2 text-white rounded-lg hover:opacity-90 transition" style={{ backgroundColor: MAIN_COLOR }}>
                              <FiUserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                          </AddGroup>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {unassignedStudents.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
          <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Ajoyib!</h3>
          <p className="text-sm sm:text-base text-gray-600">Barcha talabalar guruhlarga biriktirilgan</p>
        </div>
      )}
    </div>
  );
}

export default function page() {
  return <AdminDashboard />;
}

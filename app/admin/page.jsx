"use client";
import React, { useState } from "react";
import {
  UsersIcon,
  BookOpenIcon,
  PlusIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CreditCardIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { FiUserPlus } from 'react-icons/fi';
import {
  User, Phone, Calendar, AlertCircle
} from 'lucide-react';
import Link from "next/link";
import { useGetAllStudents } from '../../hooks/students';
import { useGetDashboardStats } from '../../hooks/dashboard';
import { getStatusInfo } from '../../utils/studentStatus';
import AddGroup from '../../components/admistrator/AddGroup';

const MAIN_COLOR = "#A60E07";

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color = MAIN_COLOR, bgColor = "from-[#A60E07]/10 to-[#A60E07]/5" }) => (
  <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-200 flex items-center gap-3 hover:shadow-lg transition group">
    <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${bgColor} group-hover:scale-105 transition-transform`}>
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
    </div>
    <div className="flex flex-col flex-1 min-w-0">
      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 truncate uppercase">{title}</span>
      <span className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{value}</span>
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

function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  // Guruhga qo'shilmagan talabalar uchun
  const filters = { unassigned: 'true' };
  const { data: backendData, isLoading: isLoadingUnassigned, refetch } = useGetAllStudents(filters);
  const unassignedStudents = backendData?.success ? (backendData.students || []) : [];

  // Dashboard statistikasi
  const { data: statsData, isLoading: isLoadingStats } = useGetDashboardStats(selectedDate, selectedMonth);
  const daily = statsData?.data?.daily;
  const monthly = statsData?.data?.monthly;
  const overall = statsData?.data?.overall;

  const handleModalSuccess = () => {
    refetch();
  };

  if (isLoadingUnassigned || isLoadingStats) {
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
          <p className="text-sm sm:text-base text-gray-500">Markazning umumiy ko'rsatkichlari</p>
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
            <span className="hidden sm:inline">Yangi talaba qo'shish</span>
            <span className="sm:hidden">Talaba qo'shish</span>
          </Link>
        </div>
      </div>

      {/* Kunlik Statistika */}
      {daily && (
        <div className="mb-6 sm:mb-8">
          <SectionTitle 
            icon={CalendarIcon} 
            title={daily.is_today ? "Bugungi statistika" : `${daily.date} - Kunlik statistika`}
            subtitle={`Sana: ${daily.date}`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <StatCard 
              title="To'lovlar soni" 
              value={daily.payments.count}
              icon={BanknotesIcon}
              color="#10B981"
              bgColor="from-green-100 to-green-50"
            />
            <StatCard 
              title="To'lovlar summasi" 
              value={formatCurrency(daily.payments.amount)}
              icon={CurrencyDollarIcon}
              color="#10B981"
              bgColor="from-green-100 to-green-50"
            />
            <StatCard 
              title="Yangi talabalar" 
              value={daily.new_students.count}
              icon={UsersIcon}
              color="#3B82F6"
              bgColor="from-blue-100 to-blue-50"
            />
           
          </div>
        </div>
      )}

      {/* To'lov usullari */}
      {daily?.payment_methods && daily.payment_methods.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <SectionTitle 
            icon={CreditCardIcon} 
            title="To'lov usullari" 
            subtitle="Kunlik to'lovlar bo'yicha"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {daily.payment_methods.map((method, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{method.method}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {method.count} ta
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold" style={{ color: MAIN_COLOR }}>
                  {formatCurrency(method.total_amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yangi talabalar ro'yxati */}
      {daily?.new_students && daily.new_students.list && daily.new_students.list.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <SectionTitle 
            icon={UserGroupIcon} 
            title="Yangi talabalar" 
            subtitle={`${daily.new_students.count} ta yangi talaba`}
          />
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Talaba
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Guruh / Fan
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Qo'shilgan vaqti
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {daily.new_students.list.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {student.student_name}
                          </div>
                          <div className="flex items-center text-[10px] sm:text-xs text-gray-500 mt-1">
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            {student.phone}
                          </div>
                          <div className="sm:hidden text-[10px] text-gray-500 mt-1">
                            {student.group_name} - {student.subject_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 hidden sm:table-cell">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {student.group_name}
                        </div>
                        <div className="text-xs text-gray-500">{student.subject_name}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {student.join_date}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Oylik Statistika */}
      {monthly && (
        <div className="mb-6 sm:mb-8">
          <SectionTitle 
            icon={ChartBarIcon} 
            title={monthly.is_current_month ? "Joriy oy statistikasi" : `${monthly.month} - Oylik statistika`}
            subtitle={`Oy: ${monthly.month}`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard 
              title="To'lovlar soni" 
              value={monthly.payments.count}
              icon={BanknotesIcon}
              color="#059669"
              bgColor="from-emerald-100 to-emerald-50"
            />
            <StatCard 
              title="To'lovlar summasi" 
              value={formatCurrency(monthly.payments.amount)}
              icon={CurrencyDollarIcon}
              color="#059669"
              bgColor="from-emerald-100 to-emerald-50"
            />
            <StatCard 
              title="Yangi talabalar" 
              value={monthly.new_students}
              icon={UsersIcon}
              color="#2563EB"
              bgColor="from-blue-100 to-blue-50"
            />
            <StatCard 
              title="Qarzdor talabalar" 
              value={monthly.debtor_students}
              icon={AlertCircle}
              color="#DC2626"
              bgColor="from-red-100 to-red-50"
            />
          </div>
        </div>
      )}

      {/* Umumiy Statistika */}
      {overall && (
        <div className="mb-6 sm:mb-8">
          <SectionTitle 
            icon={ChartBarIcon} 
            title="Umumiy statistika" 
            subtitle="Barcha vaqt bo'yicha"
          />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* <StatCard 
              title="Jami to'lovlar" 
              value={overall.total_payments.count}
              icon={BanknotesIcon}
              color="#7C3AED"
              bgColor="from-violet-100 to-violet-50"
            />
            <StatCard 
              title="Jami summa" 
              value={formatCurrency(overall.total_payments.amount)}
              icon={CurrencyDollarIcon}
              color="#7C3AED"
              bgColor="from-violet-100 to-violet-50"
            />
            <StatCard 
              title="Jami talabalar" 
              value={overall.students.total}
              icon={UsersIcon}
              color="#0891B2"
              bgColor="from-cyan-100 to-cyan-50"
            />
            <StatCard 
              title="Faol talabalar" 
              value={overall.students.active}
              icon={UsersIcon}
              color="#10B981"
              bgColor="from-green-100 to-green-50"
            /> */}
            <StatCard 
              title="Faol guruhlar" 
              value={overall.groups.active}
              icon={BookOpenIcon}
              color="#F59E0B"
              bgColor="from-amber-100 to-amber-50"
            />
          </div>
        </div>
      )}

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
                  Guruhga qo'shilmagan talabalar
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
                    Student ma'lumotlari
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-800 uppercase tracking-wider hidden sm:table-cell">
                    Ro'yxatdan sana
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-800 uppercase tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unassignedStudents.map((student) => {
                  const statusInfo = getStatusInfo(student.student_status || 'active');
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
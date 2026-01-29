"use client";
import React from "react";
import {
  UsersIcon,
  BookOpenIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { FiEdit, FiUserPlus } from 'react-icons/fi';
import {
  User, Phone, Calendar, AlertCircle, Home
} from 'lucide-react';
import Link from "next/link";
import { useGetAllStudents } from '../../hooks/students';
import { useGetDashboardStats } from '../../hooks/dashboard';
import { getStatusInfo } from '../../utils/studentStatus';
import AddGroup from '../../components/admistrator/AddGroup';
import Image from "next/image";

const MAIN_COLOR = "#A60E07";

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-3 rounded-lg shadow border border-gray-200 flex items-center gap-3 hover:shadow-md transition group">
    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#A60E07]/10 to-[#A60E07]/5 group-hover:scale-105 transition-transform">
      <Icon className="h-5 w-5 text-[#A60E07]" />
    </div>
    <div className="flex flex-col flex-1 min-w-0">
      <span className="text-xs font-semibold text-gray-500 truncate">{title}</span>
      <span className="text-xl font-bold text-gray-900 truncate">{value}</span>
    </div>
  </div>
);


function AdminDashboard() {
  // Guruhga qo'shilmagan talabalar uchun eski hook
  const filters = { unassigned: 'true' };
  const { data: backendData, isLoading: isLoadingUnassigned, refetch } = useGetAllStudents(filters);
  const unassignedStudents = backendData?.success ? (backendData.students || []) : [];

  // Dashboard statistikasi uchun yangi hook
  const { data: statsData, isLoading: isLoadingStats } = useGetDashboardStats();
  const summary = statsData?.data?.summary;

  const handleModalSuccess = () => {
    refetch();
  };

  if (isLoadingUnassigned || isLoadingStats) return <div className="p-8 text-center">Yuklanmoqda...</div>;

  return (
    <div className="p-2 md:p-6 mx-auto font-sans bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#A60E07] mb-1 tracking-tight drop-shadow-sm">Dashboard</h1>
          <p className="text-base text-gray-500">Markazning umumiy ko'rsatkichlari</p>
        </div>
        <Link href={'/admin/students/new'} className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg shadow transition hover:opacity-90 bg-[#A60E07]">
          <PlusIcon className="h-5 w-5" /> Yangi talaba qo'shish
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 mb-10">
        <StatCard title="Bugungi to'lovlar soni" value={summary?.today_payments?.count ?? '-'} icon={UsersIcon} />
        <StatCard title="Bugungi to'lovlar summasi" value={summary?.today_payments?.amount ? summary.today_payments.amount.toLocaleString() + ' so\'m' : '-'} icon={BookOpenIcon} />
        <StatCard title="Bugun qo'shilgan talabalar" value={summary?.new_students?.today ?? '-'} icon={UsersIcon} />
        <StatCard title="Kecha qo'shilgan talabalar" value={summary?.new_students?.yesterday ?? '-'} icon={UsersIcon} />
        <StatCard title="Qarzdor talabalar" value={summary?.debtor_students ?? '-'} icon={UsersIcon} />
        <StatCard title="Faol guruhlar" value={summary?.active_groups ?? '-'} icon={BookOpenIcon} />
        <StatCard title="Faol o'qituvchilar" value={summary?.active_teachers ?? '-'} icon={UsersIcon} />
      </div>

      {/* Guruhga qo'shilmagan talabalar */}
      {unassignedStudents.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-orange-800">
                  Guruhga qo'shilmagan talabalar
                </h2>
                <p className="text-sm text-orange-600">
                  {unassignedStudents.length} ta talaba guruhga biriktirilmagan
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-x-auto border border-orange-200">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gradient-to-r from-orange-100 to-orange-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Student ma'lumotlari</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Ro'yxatdan sana</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-800 uppercase tracking-wider">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unassignedStudents.map((student) => {
                  // Guruhga qo'shilmagan talabalar uchun student_status ishlatiladi
                  const statusInfo = getStatusInfo(student.student_status || 'active');
                  return (
                    <tr key={student.id} className="hover:bg-orange-50 transition">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-red-500">#{student.id}</span>
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-gray-900">{student.name} {student.surname}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Phone className="h-3 w-3 text-green-500" />
                            <span>{student.phone}</span>
                          </div>
                          {student.phone2 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Phone className="h-3 w-3 text-green-400" />
                              <span>{student.phone2}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <User className="h-3 w-3 text-purple-500" />
                            <span><strong>Otasi / Onasi / yaqini:</strong> {student.father_name} ({student.father_phone})</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Calendar className="h-3 w-3 text-orange-500" />
                            <span><strong>Yoshi:</strong> {student.age}</span>
                          </div>
                          {student.address && (
                            <div className="flex items-start gap-1 text-xs text-gray-600">
                              <Home className="h-3 w-3 text-indigo-500 mt-0.5" />
                              <span><strong>Manzil:</strong> {student.address}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {student.registration_date
                              ? new Date(student.registration_date).toLocaleDateString('uz-UZ')
                              : 'Belgilanmagan'}
                          </span>
                        </div>
                      </td>
                     
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <AddGroup student={student} onSuccess={handleModalSuccess}>
                            <button className="p-2 bg-[#A60E07] text-white rounded-lg hover:opacity-90 transition">
                              <FiUserPlus size={18} />
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
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Ajoyib!</h3>
          <p className="text-gray-600">Barcha talabalar guruhlarga biriktirilgan</p>
          
        </div>
      )}
    </div>
  );
}

export default function page() {
  return <AdminDashboard />;
}
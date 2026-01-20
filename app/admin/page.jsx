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
import { getStatusInfo } from '../../utils/studentStatus';
import AddGroup from '../../components/admistrator/AddGroup';

const MAIN_COLOR = "#A60E07";

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border-b-4" style={{ borderColor: MAIN_COLOR }}>
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <Icon className="h-6 w-6 text-gray-400" />
    </div>
    <p className="text-4xl font-extrabold text-gray-900 mt-2">{value}</p>
  </div>
);

function AdminDashboard() {
  // Backend dan guruhga qo'shilmagan talabalarni olish
  const filters = { unassigned: 'true' };
  const { data: backendData, isLoading, refetch } = useGetAllStudents(filters);
  
  const unassignedStudents = backendData || [];
  
  const handleModalSuccess = () => {
    refetch();
  };

  if (isLoading) return <div className="p-8 text-center">Yuklanmoqda...</div>;

  return (
    <div className="p-4 md:p-8 mx-auto font-sans bg-gray-50 min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-lg text-gray-500">Markazning umumiy ko'rsatkichlari</p>
        </div>
        <Link href={'/admin/students/new'} className="flex items-center gap-2 px-5 py-3 text-white font-medium rounded-lg shadow-md transition hover:opacity-90" style={{ backgroundColor: MAIN_COLOR }}>
          <PlusIcon className="h-6 w-6" /> Yangi talaba qo'shish
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard title="Guruhga qo'shilmaganlar" value={unassignedStudents.length} icon={UsersIcon} />
        <StatCard title="Jami Guruhlar" value="-" icon={BookOpenIcon} />
        <StatCard title="Jami Talabalar" value="-" icon={UsersIcon} />
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Talaba holati</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-800 uppercase tracking-wider">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unassignedStudents.map((student) => {
                  const statusInfo = getStatusInfo(student.student_status);
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
                      <td className="px-4 py-3 text-sm">
                        <div 
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs ${statusInfo.bgClass} ${statusInfo.textClass}`}
                        >
                          {statusInfo.icon && <statusInfo.icon className="h-4 w-4" />}
                          <span>{statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <AddGroup student={student} onSuccess={handleModalSuccess}>
                            <button className="p-2 bg-[#A60E07] text-white rounded-lg hover:opacity-90 transition">
                              <FiUserPlus size={18} />
                            </button>
                          </AddGroup>
                          <Link href={`/admin/students/${student.id}`}>
                            <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                              <FiEdit size={18} />
                            </button>
                          </Link>
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
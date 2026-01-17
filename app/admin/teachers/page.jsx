"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserPlusIcon,
  AcademicCapIcon,
  PhoneIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CheckIcon,
  XMarkIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { usegetTeachers } from "../../../hooks/teacher";
import AddTeacherModal from "../../../components/admistrator/AddTeacher";
import SubjectsSelect from "../../../components/SubjectsSelect";

function TeacherCard({ teacher }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Faol":
        return "bg-green-100 text-green-800 border-green-200";
      case "Ishdan boshatilgan":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Belgilanmagan";
    return new Date(dateString).toLocaleDateString('uz-UZ');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {teacher.name} {teacher.surname}
            </h3>
            <p className="text-sm text-gray-600">ID: {teacher.id}</p>
          </div>
        </div>
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
            teacher.status
          )}`}
        >
          {teacher.status}
        </span>
      </div>

      <div className="space-y-3">
        {/* Fan */}
        <div className="flex items-center space-x-2">
          <AcademicCapIcon className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Fan:</span>
          <span className="text-sm text-gray-900 font-semibold">{teacher.subject}</span>
        </div>

        {/* Telefon */}
        <div className="flex items-center space-x-2">
          <PhoneIcon className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Telefon:</span>
          <span className="text-sm text-gray-900">{teacher.phone}</span>
        </div>

        {/* Yoshi */}
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">Yoshi:</span>
          <span className="text-sm text-gray-900">{teacher.age} yosh</span>
        </div>

        {/* Ish boshlanish sanasi */}
        <div className="flex items-center space-x-2">
          <CalendarDaysIcon className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-700">Ish boshlanish:</span>
          <span className="text-sm text-gray-900">{formatDate(teacher.startDate)}</span>
        </div>

        {/* Gruplar soni */}
        <div className="flex items-center space-x-2">
          <BriefcaseIcon className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-medium text-gray-700">Guruhlar soni:</span>
          <span className="text-sm text-gray-900 font-semibold">{teacher.groupCount || 0} ta</span>
        </div>

        {/* Mavjud vaqt */}
        {teacher.availableTimes && (
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">Mavjud vaqt:</span>
            <span className="text-sm text-gray-900">{teacher.availableTimes}</span>
          </div>
        )}

        {/* Tajriba */}
        {teacher.hasExperience && (
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Tajriba:</span>
            <span className="text-sm text-gray-900">
              {teacher.experienceYears} yil - {teacher.experiencePlace}
            </span>
          </div>
        )}

        {/* Sertifikat */}
        {teacher.certificate && (
          <div className="bg-gray-50 rounded-lg p-3 mt-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sertifikat</span>
            <p className="text-sm text-gray-700 mt-1">{teacher.certificate}</p>
          </div>
        )}

        {/* Ish vaqtlari */}
        {teacher.workDaysHours && (
          <div className="bg-blue-50 rounded-lg p-3 mt-3">
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Ish jadvali</span>
            <p className="text-sm text-gray-700 mt-1">{teacher.workDaysHours}</p>
          </div>
        )}
      </div>

      {/* Qo'shimcha ma'lumotlar */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-4 items-center text-xs text-gray-500">
          <span>Ro'yxatga olingan: {formatDate(teacher.registrationDate)}</span>
          {teacher.terminationDate && (
            <span className="text-red-500">Ishdan bo'shatilgan: {formatDate(teacher.terminationDate)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeachersPage() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const { data: teachersData, isLoading, error } = usegetTeachers(selectedSubject);

  const teachers = teachersData?.teachers || [];
  const activeTeachers = teachers.filter(teacher => teacher.isActive);
  const inactiveTeachers = teachers.filter(teacher => !teacher.isActive);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A60E07] mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-600">O'qituvchilar yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4 text-xl">❌ Xatolik yuz berdi</div>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }


  return (
    <div className="min-h-full p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header + Add Button */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">O'qituvchilar Boshqaruvi</h1>
          <AddTeacherModal>
            <button className="flex items-center px-4 py-2 bg-[#A60E07] text-white rounded-lg hover:opacity-90 transition font-semibold shadow-md text-sm">
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Yangi O'qituvchi Qo'shish
            </button>
          </AddTeacherModal>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-8">
          <FunnelIcon className="h-5 w-5 text-[#A60E07]" />
          <SubjectsSelect
            value={selectedSubject}
            onChange={setSelectedSubject}
            placeholder="Fan bo'yicha filterlash"
            className="w-[160px] px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A60E07] focus:border-transparent text-sm"
          />
        </div>

        {/* Teachers Grid */}
        {teachers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">O'qituvchilar topilmadi</h3>
            <p className="text-gray-500 mb-6">
              {selectedSubject === 'all' 
                ? "Hali hech qanday o'qituvchi ro'yxatdan o'tmagan." 
                : "Tanlangan fan bo'yicha o'qituvchilar topilmadi."}
            </p>
            <AddTeacherModal>
              <button className="inline-flex items-center px-4 py-2 bg-[#A60E07] text-white rounded-lg hover:opacity-90 transition duration-200">
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Birinchi O'qituvchini Qo'shish
              </button>
            </AddTeacherModal>
          </div>
        )}
      </div>
    </div>
  );
}
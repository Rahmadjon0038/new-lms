"use client";
import React, { useState, useMemo } from "react";
import {
  UsersIcon,
  BookOpenIcon,
  PlusIcon,
  PhoneIcon,
  CalendarDaysIcon,
  XCircleIcon,
  TrashIcon, 
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const MAIN_COLOR = "#A60E07"; // Siz ko'rsatgan rang

// --- Mock Data ---
const UNIFIED_STUDENTS_DATA = [
    { id: 1001, name: "Alijon", surname: "Murodov", group: null, subject: "Web Dasturlash", teacher: null, status: "Qo'shilmagan", paymentAmount: 0, requiredAmount: 1000, registrationDate: "2025-12-10", phone: "+998 90 123 45 67", phone2: "+998 93 111 22 33" },
    { id: 1003, name: "Rustam", surname: "Tursunov", group: null, subject: "Python AI", teacher: null, status: "Qo'shilmagan", paymentAmount: 0, requiredAmount: 1000, registrationDate: "2025-12-10", phone: "+998 99 555 11 22", phone2: null },
    { id: 1004, name: "Lola", surname: "Saidova", group: null, subject: "Ingliz Tili (B1)", teacher: null, status: "Qo'shilmagan", paymentAmount: 0, requiredAmount: 800, registrationDate: "2025-12-05", phone: "+998 90 111 22 33", phone2: "+998 97 444 55 66" },
    { id: 1002, name: "Feruza", surname: "Sobirova", group: "Grafika B1", subject: "Grafik Dizayn", teacher: "Shoxrux Tursunov", status: "O'qiyapti", paymentAmount: 1000, requiredAmount: 1000, registrationDate: "2025-12-10", phone: "+998 91 987 65 43", phone2: null },
];

const MOCK_GROUP_INFO = {
    "Web Dasturlash": { groupName: "Web Pro 201", teacherName: "Jasur Raximov" },
    "Python AI": { groupName: "Python 302", teacherName: "Shahnoza Qodirova" },
    "Ingliz Tili (B1)": { groupName: "English B1 N1", teacherName: "Raxmadjon Abdullaev" },
    default: { groupName: "Yangi Guruh", teacherName: "Noma'lum O'qituvchi" },
};

const getFilteredStudents = (students, period) => {
  const unEnrolledStudents = students.filter(student => student.status === "Qo'shilmagan");
  const today = new Date("2025-12-10"); 
  today.setHours(0, 0, 0, 0);

  return unEnrolledStudents.filter((student) => {
    if (!student.registrationDate) return false;
    const studentDate = new Date(student.registrationDate); 
    studentDate.setHours(0, 0, 0, 0);

    if (period === "today") return studentDate.getTime() === today.getTime();
    if (period === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return studentDate.getTime() === yesterday.getTime();
    }
    if (period === "last7days") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      return studentDate.getTime() >= sevenDaysAgo.getTime();
    }
    if (period === "last30days") {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return studentDate.getTime() >= thirtyDaysAgo.getTime();
    }
    return true; 
  });
};

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border-b-4" style={{ borderColor: MAIN_COLOR }}>
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <Icon className="h-6 w-6 text-gray-400" />
    </div>
    <p className="text-4xl font-extrabold text-gray-900 mt-2">{value}</p>
  </div>
);

const StudentEnrollmentTable = ({ students, onDelete, onEnroll }) => {
  if (students.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>Guruhga qo'shilmagan talabalar mavjud emas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ism / Telefon</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fan</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Guruh</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sana</th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Amallar</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {students.map((student, index) => (
            <tr key={student.id} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="font-bold text-gray-900">{student.name} {student.surname}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center"><PhoneIcon className="h-4 w-4 mr-1" />{student.phone}</span>
                </div>
              </td>
              <td className="px-3 py-3 whitespace-nowrap">
                <p className="text-sm font-medium" style={{ color: MAIN_COLOR }}>{student.subject}</p>
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-400 italic">Guruhlanmagan</td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600">{student.registrationDate}</td>
              <td className="px-3 py-3 whitespace-nowrap text-center">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  <XCircleIcon className="h-4 w-4" />Qo'shilmagan
                </span>
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-center">
                <div className="flex justify-center items-center gap-2">
                  <button onClick={() => onEnroll(student)} className="p-2 rounded-lg text-white transition hover:opacity-80" style={{ backgroundColor: '#10b981' }}>
                    <PlusIcon className="h-5 w-5" />
                  </button>
                  <Link href={`/admin/students/${student.id}`} className="p-2 rounded-lg text-white transition hover:opacity-80" style={{ backgroundColor: MAIN_COLOR }}>
                    <InformationCircleIcon className="h-5 w-5" />
                  </Link>
                  <button onClick={() => onDelete(student.id)} className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-red-600 hover:text-white transition">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function AdminDashboard() {
  const [students, setStudents] = useState(UNIFIED_STUDENTS_DATA);
  const [enrollmentPeriod, setEnrollmentPeriod] = useState("today");

  const handleEnrollStudent = (studentToEnroll) => {
    const mockGroup = MOCK_GROUP_INFO[studentToEnroll.subject] || MOCK_GROUP_INFO.default;
    if (window.confirm(`${studentToEnroll.name} ni guruhga qo'shish?`)) {
      setStudents(prev => prev.map(s => s.id === studentToEnroll.id ? { ...s, status: "O'qiyapti" } : s));
    }
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm(`O'chirishga ishonchingiz komilmi?`)) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const filteredStudents = useMemo(() => getFilteredStudents(students, enrollmentPeriod), [enrollmentPeriod, students]);
  
  const periodOptions = [
    { value: "today", name: `Bugun (${getFilteredStudents(students, "today").length})` },
    { value: "yesterday", name: `Kecha (${getFilteredStudents(students, "yesterday").length})` },
    { value: "last7days", name: `7 kun (${getFilteredStudents(students, "last7days").length})` },
    { value: "last30days", name: `30 kun (${getFilteredStudents(students, "last30days").length})` },
  ];

  return (
    <div className="min-h-full p-8 bg-gray-50">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Administrator Boshqaruv Paneli</h1>
          <p className="text-lg text-gray-500">Markazning umumiy ko'rsatkichlari</p>
        </div>
        <Link href={'/admin/students/new'} className="flex items-center gap-2 px-5 py-3 text-white font-medium rounded-lg shadow-md transition hover:opacity-90" style={{ backgroundColor: MAIN_COLOR }}>
          <PlusIcon className="h-6 w-6" /> Yangi talaba qo'shish
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard title="Jami Talabalar" value={students.length} icon={UsersIcon} />
        <StatCard title="Jami Guruhlar" value={15} icon={BookOpenIcon} />
        <StatCard title="Bugungi Arizalar" value={getFilteredStudents(students, "today").length} icon={PlusIcon} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <XCircleIcon className="h-6 w-6 mr-2" style={{ color: MAIN_COLOR }}/>
            Guruhga Qo'shilmaganlar
          </h2>
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
            <select
              value={enrollmentPeriod}
              onChange={(e) => setEnrollmentPeriod(e.target.value)}
              className="block border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-red-500 focus:border-red-500 bg-white"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.name}</option>
              ))}
            </select>
          </div>
        </div>
        <StudentEnrollmentTable students={filteredStudents} onDelete={handleDeleteStudent} onEnroll={handleEnrollStudent} />
      </div>
    </div>
  );
}

export default function page() {
  return <AdminDashboard />;
}
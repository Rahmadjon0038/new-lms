"use client";
import React, { useState, useMemo } from "react";
import {
  UsersIcon,
  BookOpenIcon,
  UserGroupIcon,
  PlusIcon,
  PhoneIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon, // Guruhdan chiqarish uchun
  InformationCircleIcon, // Batafsil (i) uchun
} from "@heroicons/react/24/outline";
import Link from "next/link";

// --- Mock Data (O'zgarishsiz, faqat StudentEnrollmentCard ga mos) ---

const studentsData = [
  // Bugun ro'yxatdan o'tganlar (10.12.2025)
  {
    id: 1001,
    name: "Alijon",
    surname: "Murodov",
    phone: "+998 90 123 45 67",
    subject: "Web Dasturlash",
    status: "Qo'shilmagan",
    teacher: null,
    date: "2025-12-10",
  },
  {
    id: 1002,
    name: "Feruza",
    surname: "Sobirova",
    phone: "+998 91 987 65 43",
    subject: "Grafik Dizayn",
    status: "O'qiyapti",
    teacher: "Shoxrux Tursunov",
    date: "2025-12-10",
  },
  {
    id: 1003,
    name: "Rustam",
    surname: "Tursunov",
    phone: "+998 99 555 11 22",
    subject: "Python AI",
    status: "Qo'shilmagan",
    teacher: null,
    date: "2025-12-10",
  },

  // Kecha ro'yxatdan o'tganlar (09.12.2025)
  {
    id: 1007,
    name: "Diyora",
    surname: "Valiyeva",
    phone: "+998 97 123 45 67",
    subject: "SMM",
    status: "O'qiyapti",
    teacher: "Shoxrux Tursunov",
    date: "2025-12-09",
  },

  // So'nggi 7 kun ichida (05.12.2025)
  {
    id: 1004,
    name: "Lola",
    surname: "Saidova",
    phone: "+998 90 111 22 33",
    subject: "Ingliz Tili (B1)",
    status: "Qo'shilmagan",
    teacher: null,
    date: "2025-12-05",
  },
  {
    id: 1005,
    name: "Sherzod",
    surname: "Nazarov",
    phone: "+998 94 444 55 66",
    subject: "Matematika",
    status: "O'qiyapti",
    teacher: "Umid Karimov",
    date: "2025-12-04",
  },

  // So'nggi 30 kun ichida (01.11.2025)
  {
    id: 1006,
    name: "Zuhra",
    surname: "Rustamova",
    phone: "+998 93 777 88 99",
    subject: "Web Dasturlash",
    status: "O'qiyapti",
    teacher: "Jasur Raximov",
    date: "2025-11-01",
  },
];

// Kunlik ma'lumotlarni hisoblash uchun yordamchi funksiya (o'zgarishsiz)
const getFilteredStudents = (students, period) => {
  const today = new Date("2025-12-10"); // Mock current date
  today.setHours(0, 0, 0, 0);

  return students.filter((student) => {
    const studentDate = new Date(student.date);
    studentDate.setHours(0, 0, 0, 0);

    if (period === "today") {
      return studentDate.getTime() === today.getTime();
    }
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

// Umumiy Markaz Statistikasi (o'zgarishsiz)
const generalStats = {
  totalStudents: 185,
  totalGroups: 15,
  totalTeachers: 8,
};

// --- Yordamchi Komponent: Statistik Kartochka (o'zgarishsiz) ---
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div
    className="bg-white p-6 rounded-xl shadow-lg border-b-4"
    style={{ borderColor: color }}
  >
    <div className="flex items-center justify-between">
      <span className={`text-sm font-medium text-gray-500`}>{title}</span>
      <Icon className={`h-6 w-6 text-gray-400`} />
    </div>
    <p className="text-4xl font-extrabold text-gray-900 mt-2">{value}</p>
  </div>
);

// --- Yordamchi Komponent: Talaba Qabul Kartochkasi (YANGILANDI) ---
const StudentEnrollmentCard = ({ student }) => {
  const isEnrolled = student.status === "O'qiyapti";

  // Status uslublari
  const statusColor = isEnrolled ? "text-green-600" : "text-red-600";
  const IconComponent = isEnrolled ? CheckCircleIcon : XCircleIcon;

  return (
    <div
      key={student.id}
      className="flex items-center p-4 bg-white rounded-xl shadow-md border-l-4 border-gray-100 hover:shadow-lg transition duration-200"
      style={{ borderColor: isEnrolled ? "#10b981" : "#ef4444" }} // Statusga qarab chap chiziq
    >
      {/* 1. STATUS (Chapda) */}
      <div className={`flex flex-col items-center justify-center w-24 mr-6`}>
        <IconComponent className={`h-6 w-6 ${statusColor}`} />
        <span className={`text-xs font-semibold mt-1 ${statusColor}`}>
          {student.status}
        </span>
      </div>

      {/* 2. ASOSIY MA'LUMOTLAR (Markazda) */}
      <div className="grid grid-cols-4 gap-4 flex-grow items-center">
        {/* Ism / Familiya */}
        <div className="col-span-1 min-w-[150px]">
          <p className="text-sm font-medium text-gray-500">Ism/Familiya</p>
          <p className="text-lg font-bold text-gray-900">
            {student.name} {student.surname}
          </p>
        </div>

        {/* Telefon */}
        <div className="col-span-1">
          <p className="text-sm font-medium text-gray-500">Telefon</p>
          <span className="flex items-center text-base text-gray-700 font-semibold">
            <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
            {student.phone}
          </span>
        </div>

        {/* Qiziqish Fani */}
        <div className="col-span-1">
          <p className="text-sm font-medium text-gray-500">Fan</p>
          <p className="text-base text-blue-600 font-medium">
            {student.subject}
          </p>
        </div>

        {/* O'qituvchi */}
        <div className="col-span-1">
          <p className="text-sm font-medium text-gray-500">O'qituvchi</p>
          {isEnrolled && student.teacher ? (
            <p className="text-base text-gray-800 font-medium">
              {student.teacher}
            </p>
          ) : (
            <p className="text-base text-gray-400 italic">---</p>
          )}
        </div>
      </div>

      {/* 3. HARAKATLAR (O'ngda) */}
      <div className="flex space-x-2 ml-4 min-w-[150px] justify-end">
        {/* Qo'shilmaganlar uchun */}
        {!isEnrolled && (
          <Link
            href={`/admin/students/add-to-group/${student.id}`}
            className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150 shadow-md flex items-center"
            title="Guruhga qo'shish"
          >
            <PlusIcon className="h-5 w-5" />
          </Link>
        )}

        {/* Qo'shilganlar uchun */}
        {isEnrolled && (
          <>
            {/* Guruhdan chiqarish */}
            <button
              onClick={() =>
                console.log(`Talaba ${student.id} guruhdan chiqarildi`)
              }
              className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 shadow-md"
              title="Guruhdan chiqarish"
            >
              <TrashIcon className="h-5 w-5" />
            </button>

            {/* Batafsil ma'lumot */}
            <Link
              href={`/admin/students/${student.id}`}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 shadow-md"
              title="Batafsil ma'lumot"
            >
              <InformationCircleIcon className="h-5 w-5" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

// --- Asosiy Komponent ---
function AdminDashboard() {
  const [enrollmentPeriod, setEnrollmentPeriod] = useState("today");

  const filteredStudents = useMemo(() => {
    return getFilteredStudents(studentsData, enrollmentPeriod);
  }, [enrollmentPeriod]);

  const todayEnrollmentCount = getFilteredStudents(
    studentsData,
    "today"
  ).length;

  const periodOptions = [
    {
      value: "today",
      name: `Bugun (${getFilteredStudents(studentsData, "today").length} ta)`,
    },
    {
      value: "yesterday",
      name: `Kecha (${
        getFilteredStudents(studentsData, "yesterday").length
      } ta)`,
    },
    {
      value: "last7days",
      name: `So'nggi 7 kun (${
        getFilteredStudents(studentsData, "last7days").length
      } ta)`,
    },
    {
      value: "last30days",
      name: `So'nggi 30 kun (${
        getFilteredStudents(studentsData, "last30days").length
      } ta)`,
    },
  ];

  return (
    <div className="min-h-full p-8">
      {/* 1. Sarlavha Qismi */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Administrator Boshqaruv Paneli
      </h1>
      <p className="text-lg text-gray-500 mb-8">
        Markazning umumiy ko'rsatkichlari
      </p>

      {/* 2. UMUMIY MARKAZ STATISTIKASI (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Jami Talabalar"
          value={generalStats.totalStudents}
          icon={UsersIcon}
          color="#10b981"
        />
        <StatCard
          title="Jami Guruhlar"
          value={generalStats.totalGroups}
          icon={BookOpenIcon}
          color="#3b82f6"
        />
        <StatCard
          title="Jami O'qituvchilar"
          value={generalStats.totalTeachers}
          icon={UserGroupIcon}
          color="#f59e0b"
        />
        <StatCard
          title="Bugun Qabul"
          value={todayEnrollmentCount}
          icon={UsersIcon}
          color="#ef4444"
        />
      </div>

      {/* 3. QABUL RO'YXATI VA SELECT FILTER */}
      <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
        {/* Sarlavha va Select Filter Bloki */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Ro'yxatdan O'tgan Talabalar
          </h2>

          {/* Filter Select Box */}
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
            <select
              value={enrollmentPeriod}
              onChange={(e) => setEnrollmentPeriod(e.target.value)}
              className="block border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm font-medium text-gray-800 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kontent: Filterlangan Talabalar Ro'yxati */}
        <div className="space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <StudentEnrollmentCard key={student.id} student={student} />
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>
                Tanlangan davr uchun ro'yxatdan o'tgan talabalar mavjud emas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sahifani eksport qilish
function page() {
  return <AdminDashboard />;
}

export default page;

import React from "react";
import {
  UsersIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// --- Mock Data (O'qituvchi uchun Statistik va Guruh ma'lumotlari) ---
const mockTeacherData = {
  teacherName: "Jasur Raximov",
  // 1. Statistikalar (KPIs)
  statistics: {
    activeGroups: 3,
    totalStudents: 45,
    avgAttendance: "95%",
    todayClasses: 1,
  },
  // 2. Aktiv Guruhlar Ro'yxati
  activeGroupsList: [
    {
      id: 1,
      name: "Web Dasturlash (Fullstack)",
      code: "WD-FS-101",
      schedule: "Dush, Chor, Jum",
      time: "18:00 - 20:00",
      students: 15,
    },
    {
      id: 2,
      name: "Python / Data Science",
      code: "PY-DS-202",
      schedule: "Seshanba, Payshanba",
      time: "14:00 - 16:00",
      students: 12,
    },
  ],
};

// --- Yordamchi Komponent: Statistik Kartochka ---
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

// --- Asosiy Komponent ---
function TeacherDashboard() {
  const { teacherName, statistics, activeGroupsList } = mockTeacherData;

  return (
    <div className="min-h-full">
      {/* 1. Sarlavha Qismi */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Xush kelibsiz, {teacherName}!
      </h1>
      <p className="text-lg text-gray-500 mb-8">
        Bugungi kun statistikasini ko'rib chiqing
      </p>

      {/* 2. Statistik Kartochkalar (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Aktiv Guruhlar"
          value={statistics.activeGroups}
          icon={BookOpenIcon}
          color="#3b82f6" // Blue
        />
        <StatCard
          title="Umumiy Talabalar"
          value={statistics.totalStudents}
          icon={UsersIcon}
          color="#10b981" // Green
        />
        <StatCard
          title="O'rtacha Davomat"
          value={statistics.avgAttendance}
          icon={ChartBarIcon}
          color="#f59e0b" // Yellow/Amber
        />
        <StatCard
          title="Bugun Darslar"
          value={`${statistics.todayClasses} ta`}
          icon={CalendarDaysIcon}
          color="#ef4444" // Red
        />
      </div>

      {/* 3. Aktiv Guruhlar Jadvali / Ro'yxati */}
      <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
          Aktiv Guruhlar Ro'yxati
        </h2>

        <div className="space-y-4">
          {activeGroupsList.length > 0 ? (
            activeGroupsList.map((group) => (
              <div
                key={group.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition duration-150 hover:bg-gray-100"
              >
                <div className="flex-1 min-w-0">
                  {/* Fan nomi */}
                  <p className="text-lg font-bold text-blue-600 truncate">
                    {group.name}
                  </p>

                  {/* Jadval */}
                  <div className="flex items-center text-sm text-gray-600 mt-1 space-x-4">
                    <span className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-500" />
                      {group.schedule}
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                      {group.time}
                    </span>
                  </div>
                </div>

                {/* Talabalar Soni */}
                <div className="text-center mx-4 flex-shrink-0">
                  <p className="text-xl font-extrabold text-gray-900">
                    {group.students}
                  </p>
                  <p className="text-xs text-gray-500">Talaba</p>
                </div>

                {/* Batafsil Tugmasi */}
                <Link
                  href={`/teacher/my-groups/${group.id}`}
                  className="flex items-center text-sm font-semibold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-150 flex-shrink-0"
                >
                  Batafsil
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>Hozirda faol guruhlaringiz mavjud emas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sizning fayl nomingizga mos keladigan eksport
function page() {
  return <TeacherDashboard />;
}

export default page;

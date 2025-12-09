"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// --- Mock Data ---
// Bu ma'lumotlar hozircha statik qoladi, chunki ularni o'zgartirish talab qilinmadi.

const activeGroupsList = [
  {
    id: 1,
    name: "Web Dasturlash (Fullstack) 1-guruh",
    teacher: "Jasur Raximov",
    schedule: "Dush, Chor, Jum",
    time: "18:00 - 20:00",
    studentsCount: 15,
    groupCode: "WD-FS-101",
  },
  {
    id: 2,
    name: "Python / Data Science 2-guruh",
    teacher: "Jasur Raximov",
    schedule: "Seshanba, Payshanba",
    time: "14:00 - 16:00",
    studentsCount: 12,
    groupCode: "PY-DS-202",
  },
  {
    id: 3,
    name: "Grafik Dizayn (GD-1A)",
    teacher: "Jasur Raximov",
    schedule: "Shanba, Yakshanba",
    time: "10:00 - 12:00",
    studentsCount: 18,
    groupCode: "GD-A1-007",
  },
];

// Turli oylar uchun statistik ma'lumotlar (Statik ma'lumot)
const monthlyStatistics = {
  "Dekabr 2025": {
    totalGroups: 3,
    totalStudents: 45,
    monthlyAvgAttendance: "92%",
  },
  "Noyabr 2025": {
    totalGroups: 2,
    totalStudents: 30,
    monthlyAvgAttendance: "85%",
  },
  "Oktabr 2025": {
    totalGroups: 1,
    totalStudents: 15,
    monthlyAvgAttendance: "95%",
  },
};

const monthOptions = Object.keys(monthlyStatistics).reverse();

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
  const [currentMonth, setCurrentMonth] = useState(monthOptions[0]); // Joriy oy
  const teacherName = "Jasur Raximov";

  // Tanlangan oy ma'lumotini konsolga chiqarish uchun useEffect
  useEffect(() => {
    // console.logga chiqarish funksiyasi
    console.log("Tanlangan oy ma'lumoti:", currentMonth);
    // Agarda siz Backendga so'rov yubormoqchi bo'lsangiz, shu yerga joylashtirasiz:
    // fetchStats(currentMonth);
  }, [currentMonth]); // currentMonth o'zgarganda ishlaydi

  // Statistikalar doimiy (Dekabr 2025) ma'lumotlarini ko'rsatadi (Backend ulanmaguncha)
  const staticStats = monthlyStatistics["Dekabr 2025"];

  return (
    <div className="min-h-full">
      {/* 1. Sarlavha Qismi */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Xush kelibsiz, {teacherName}!
      </h1>
      <p className="text-lg text-gray-500 mb-8">Tanlangan oy statistikasi</p>

      {/* 2. OY TANLASH BLOKI */}
      <div className="flex items-center space-x-4 mb-10 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm max-w-lg">
        <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
        <label
          htmlFor="month-selector"
          className="text-base whitespace-nowrap font-semibold text-gray-700"
        >
          Oy tanlash:
        </label>
        <select
          id="month-selector"
          value={currentMonth}
          // OnChange: currentMonth ni yangilaydi va useEffect konsolga chiqaradi
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
      {/* ------------------------------- */}

      {/* 3. Statistik Kartochkalar (Hozircha statik ma'lumot ishlatilmoqda) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="Guruhlar soni"
          value={staticStats.totalGroups}
          icon={BookOpenIcon}
          color="#3b82f6"
        />
        <StatCard
          title="Umumiy Talabalar"
          value={staticStats.totalStudents}
          icon={UsersIcon}
          color="#10b981"
        />
        <StatCard
          title="O'rtacha Davomat (Oylik)"
          value={staticStats.monthlyAvgAttendance}
          icon={ChartBarIcon}
          color="#f59e0b"
        />
      </div>

      {/* 4. Aktiv Guruhlar Ro'yxati */}
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
                <div className="text-center mx-4 ">
                  <p className="text-xl font-extrabold text-gray-900">
                    {group.studentsCount}
                  </p>
                  <p className="text-xs text-gray-500">Talaba</p>
                </div>

                {/* Batafsil Tugmasi */}
                <Link
                  href={`/teacher/my-groups/${group.id}`}
                  className="flex items-center text-sm font-semibold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-150 "
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

// Sahifani eksport qilish
function page() {
  return <TeacherDashboard />;
}

export default page;

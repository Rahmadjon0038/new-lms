"use client";
import React from "react";
import {
  ClockIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChevronLeftIcon,
  UserCircleIcon,
  PhoneIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

// --- Mock Data (Talaba Email va Telefonlari olib tashlandi) ---
const mockGroupDetails = {
  id: 1,
  name: "Web Dasturlash (Fullstack) 1-guruh",
  subject: "Fullstack Web Dasturlash",
  teacher: {
    name: "Jasur Raximov",
    phone: "+998 90 123 45 67",
  },
  schedule: "Dush / Chor / Jum - 18:00",
  time: "18:00 - 20:00",
  days: ["Dushanba", "Chorshanba", "Juma"],
  currentStudents: 15,
  uniqueCode: "WD-FS-101",
  // Guruhdoshlar ma'lumotidan faqat ism qoldi
  peers: [
    {
      id: 101,
      name: "Ali Karimov",
      // email olib tashlandi
    },
    {
      id: 102,
      name: "Olim Salimov",
      // email olib tashlandi
    },
    {
      id: 103,
      name: "Diyora Olimova",
      // email olib tashlandi
    },
    {
      id: 104,
      name: "Samandar Ergashev",
      // email olib tashlandi
    },
  ],
};

// --- Yordamchi Komponent: Guruhdoshlar Kartochkasi ---
const PeerCard = ({ peer }) => (
  <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 transition duration-150 hover:bg-gray-100 shadow-sm">
    <div className="flex items-center">
      <UserCircleIcon className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />
      <div>
        {/* Faqat Ism qoldi */}
        <p className="text-sm font-semibold text-gray-800">{peer.name}</p>
        {/* Email olib tashlandi */}
      </div>
    </div>
  </div>
);

// --- Asosiy Komponent ---
function GroupDetails() {
  const group = mockGroupDetails;

  return (
    <div className="min-h-full">
      {/* Orqaga Qaytish Tugmasi */}
      <a
        href="/students"
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium transition duration-150"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Orqaga qaytish
      </a>

      {/* Sarlavha */}
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
        {group.name}
      </h1>
      <p className="text-lg font-medium text-gray-500 mb-8">{group.subject}</p>

      {/* 1. Asosiy Ma'lumotlar Bloki */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* O'qituvchi Kartochkasi */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
            <AcademicCapIcon className="h-5 w-5 mr-1 text-blue-500" />{" "}
            O'qituvchi
          </h3>
          <p className="text-xl font-bold text-gray-800">
            {group.teacher.name}
          </p>
          {/* O'qituvchi telefoni qoldi */}
          <p className="mt-3 text-sm text-gray-600 flex items-center">
            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />{" "}
            <a
              href={`tel:${group.teacher.phone.replace(/\s/g, "")}`}
              className="hover:text-blue-600 font-medium"
            >
              {group.teacher.phone}
            </a>
          </p>
        </div>

        {/* Dars Jadvali Kartochkasi */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-600">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-1 text-green-500" /> Jadval
          </h3>
          <p className="text-xl font-bold text-gray-800">{group.schedule}</p>
          <p className="mt-3 text-sm text-gray-600 flex items-center">
            <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
            Vaqt: {group.time}
          </p>
        </div>

        {/* Guruh A'zolari Soni */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-600">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
            <UsersIcon className="h-5 w-5 mr-1 text-yellow-500" /> Talabalar
          </h3>
          <p className="text-3xl font-extrabold text-gray-900">
            {group.currentStudents} ta
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Guruh kodi:{" "}
            <span className="font-mono font-semibold text-gray-800">
              {group.uniqueCode}
            </span>
          </p>
        </div>
      </div>

      {/* 2. Guruhdoshlar Ro'yxati */}
      <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
          <UsersIcon className="h-6 w-6 mr-2 text-blue-600" /> Guruhdoshlaringiz
          ({group.peers.length} ta)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {group.peers.map((peer) => (
            <PeerCard key={peer.id} peer={peer} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default GroupDetails;

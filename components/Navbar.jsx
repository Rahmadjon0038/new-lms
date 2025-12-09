"use client";

import React from "react";
import Link from "next/link";
import {
  UserIcon,
  ArrowRightEndOnRectangleIcon,
  AcademicCapIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import ProfileModal from "./modals/Profile";

// --- Yordamchi Funksiya: Rol uchun rangni aniqlash ---
const getRoleColor = (role) => {
  const normalizedRole = role.toLowerCase();
  if (
    normalizedRole.includes("o'qituvchi") ||
    normalizedRole.includes("teacher")
  ) {
    return "bg-amber-400 text-amber-900";
  }
  if (normalizedRole.includes("talaba") || normalizedRole.includes("student")) {
    return "bg-green-400 text-green-900";
  }
  if (
    normalizedRole.includes("admin") ||
    normalizedRole.includes("administrator")
  ) {
    return "bg-red-400 text-red-900";
  }
  return "bg-gray-400 text-gray-900";
};

function Navbar({ userName = "Rahmadjon Abdullayev", role = "Administrator" }) {
  // Chiqish tugmasi bosilganda amalga oshiriladigan funksiya
  const handleLogout = () => {
    console.log(`${userName} (${role}) tizimdan chiqdi.`);
    // Haqiqiy ilovada bu yerda tizimdan chiqish (logout) logikasi bo'ladi
  };

  const roleColorClass = getRoleColor(role);

  return (
    <header className="w-full bg-blue-700 shadow-xl border-b border-blue-600 sticky top-0 z-10">
      <div className="flex justify-between items-center h-16 px-4 md:px-8">
        {/* 1. Chap tomon: Brend nomi/Logotip */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-white tracking-wider transition duration-200 hover:text-blue-200"
        >
          Taraqqiyot <span className="text-blue-300 font-medium"></span>
        </Link>

        {/* 2. O'ng tomon: Foydalanuvchi va Chiqish */}
        <div className="flex items-center space-x-6 text-white">
          {/* Foydalanuvchi ma'lumotlari (Modal trigger) */}
          <ProfileModal>
            <div
              className="flex items-center space-x-3 p-2 rounded-lg transition duration-200 cursor-pointer "
              title="Profil ma'lumotlarini ko'rish"
            >
              <UserIcon className="h-6 w-6 text-blue-300 " aria-hidden="true" />

              <div className="flex flex-col items-start leading-tight">
                {/* ISMNI TO'LIQ KO'RSATISH UCHUN O'ZGARTIRILDI */}
                {/* 'truncate max-w-[150px]' sinflari olib tashlandi. */}
                <span className="text-base font-semibold">{userName}</span>
                <div
                  className={`flex items-center px-2 py-0.5 mt-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${roleColorClass}`}
                >
                  <AcademicCapIcon className="h-3 w-3 mr-1" />
                  {role}
                </div>
              </div>

              {/* MODAL OCHILISHINI KO'RSATUVCHI IKONKA */}
              <ChevronDownIcon className="h-4 w-4 ml-1 text-blue-300 transition duration-200 group-hover:rotate-180" />
            </div>
          </ProfileModal>

          {/* Chiqish tugmasi (Qizil hover) */}
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium  hover:bg-red-600 transition duration-200 "
            title="Tizimdan chiqish"
          >
            <ArrowRightEndOnRectangleIcon
              className="h-5 w-5 mr-2"
              aria-hidden="true"
            />
            <span>Chiqish</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

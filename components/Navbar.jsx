"use client";

import React from "react";
import Link from "next/link";
// Heroicons kutubxonasidan ikonkalarni import qilish
import {
  UserIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";

function Navbar({ userName = "Ali Karimov" }) {
  // `userName` prop orqali foydalanuvchi ismini qabul qiladi

  // Chiqish tugmasi bosilganda amalga oshiriladigan funksiya
  const handleLogout = () => {
    console.log(`${userName} tizimdan chiqdi.`);
    // Haqiqiy ilovada bu yerda tizimdan chiqish (logout) logikasi bo'ladi
    // router.push('/login');
  };

  return (
    // Navbar asosiy konteyneri: To'liq kenglik, to'q ko'k fon, soya
    <header className="w-full bg-blue-700 shadow-md">
      <div className="flex justify-between items-center h-16 px-4 md:px-8">
        {/* 1. Chap tomon: Brend nomi/Logotip */}
        <Link
          href="/"
          className="text-xl font-bold text-white tracking-wide hover:opacity-90 transition duration-150"
        >
          O'quv Markazi
        </Link>

        {/* 2. O'ng tomon: Foydalanuvchi va Chiqish */}
        <div className="flex items-center space-x-4 text-white">
          {/* Foydalanuvchi ismi */}
          <div className="flex items-center text-sm font-medium">
            <UserIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            <span>{userName}</span>
          </div>

          {/* Chiqish tugmasi */}
          <button
            onClick={handleLogout}
            className="flex items-center text-sm font-medium opacity-80 hover:opacity-100 transition duration-150"
            title="Tizimdan chiqish"
          >
            <ArrowRightEndOnRectangleIcon
              className="h-5 w-5 mr-1"
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

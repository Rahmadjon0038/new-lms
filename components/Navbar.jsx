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
import { usegetProfile } from "../hooks/user";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Rol uchun rangni aniqlash
const getRoleColor = (role = "") => {
  const normalizedRole = role.toLowerCase();
  if (normalizedRole.includes("teacher") || normalizedRole.includes("o'qituvchi")) {
    return "bg-amber-400 text-amber-900";
  }
  if (normalizedRole.includes("student") || normalizedRole.includes("talaba")) {
    return "bg-green-400 text-green-900";
  }
  if (normalizedRole.includes("admin")) {
    return "bg-white text-red-700";
  }
  return "bg-gray-200 text-gray-800";
};

function Navbar() {
  const { data: user, isLoading } = usegetProfile();
  const navigate = useRouter()

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('role');
    navigate.push('/')
  };

  const fullName = user ? `${user.name} ${user.surname}` : "";
  const userRole = user?.role || "Foydalanuvchi";
  const roleColorClass = getRoleColor(userRole);

  return (
    <header 
      className="w-full shadow-xl border-b sticky top-0 z-10" 
      style={{ backgroundColor: '#A60E07', borderColor: 'rgba(255,255,255,0.1)' }}>
      <div className="flex justify-between items-center h-16 px-4 md:px-8">
        {/* 1. Logotip har doim ko'rinadi */}
        <Link
          href="/"
          className="text-2xl font-black text-white tracking-tighter transition duration-200 hover:opacity-90"
        >
          TARAQQIYOT
        </Link>

        {/* 2. O'ng tomon */}
        <div className="flex items-center space-x-4 md:space-x-6 text-white">
          
          {isLoading ? (
            /* Kichik aylana Loader */
            <div className="flex items-center space-x-2 p-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-sm text-white/70 hidden md:inline">Yuklanmoqda...</span>
            </div>
          ) : (
            <ProfileModal>
              <div
                className="group flex items-center space-x-3 p-2 rounded-xl transition duration-200 cursor-pointer hover:bg-white/10"
                title="Profil ma'lumotlarini ko'rish"
              >
                <div className="bg-white/20 p-1.5 rounded-full border border-white/30">
                   <UserIcon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>

                <div className="flex flex-col items-start leading-tight">
                  <span className="text-sm md:text-base font-bold text-white">{fullName}</span>
                  <div
                    className={`flex items-center px-2 py-0.5 mt-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${roleColorClass}`}
                  >
                    <AcademicCapIcon className="h-3 w-3 mr-1" />
                    {userRole}
                  </div>
                </div>

                <ChevronDownIcon className="h-4 w-4 text-white/70 transition duration-300 group-hover:rotate-180" />
              </div>
            </ProfileModal>
          )}

          <div className="h-8 w-[1px] bg-white/20 mx-1" />

          {/* Chiqish tugmasi har doim ko'rinadi */}
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 rounded-lg text-sm font-bold transition duration-200 text-white hover:bg-black/20"
            title="Tizimdan chiqish"
          >
            <ArrowRightEndOnRectangleIcon
              className="h-5 w-5 md:mr-2"
              aria-hidden="true"
            />
            <span className="hidden md:inline">Chiqish</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
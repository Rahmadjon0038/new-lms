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

  const handleLogout = () => {
    const cookieKeys = ["accessToken", "refreshToken", "role"];
    const host = window.location.hostname;
    const domainCandidates = [undefined, host];

    if (host.includes(".")) {
      domainCandidates.push(`.${host}`);
      const parts = host.split(".");
      if (parts.length > 2) {
        domainCandidates.push(`.${parts.slice(-2).join(".")}`);
      }
    }

    cookieKeys.forEach((key) => {
      Cookies.remove(key);
      Cookies.remove(key, { path: "/" });
      domainCandidates.forEach((domain) => {
        if (domain) {
          Cookies.remove(key, { path: "/", domain });
        }
      });
    });

    window.location.replace("/login");
  };

  // Faqat ismni olish (mobil uchun qisqaroq ko'rinish)
  const firstName = user?.name || "";
  const fullName = user ? `${user.name} ${user.surname}` : "";
  const userRole = user?.role || "Foydalanuvchi";
  const roleColorClass = getRoleColor(userRole);

  return (
    <header 
      className="w-full shadow-lg border-b z-[100]" 
      style={{ backgroundColor: '#A60E07', borderColor: 'rgba(255,255,255,0.1)' }}>
      
      <div className="flex justify-between items-center h-16 px-4 md:px-8 max-w-[1600px] mx-auto">
        
        {/* 1. Logotip - mobil ekranlarda shrifti biroz kichrayadi */}
        <Link
          href="/"
          className="text-xl md:text-2xl font-black text-white tracking-tighter transition duration-200 hover:opacity-90 shrink-0"
        >
          TARAQQIYOT
        </Link>

        {/* 2. O'ng tomon */}
        <div className="flex items-center space-x-2 md:space-x-6 text-white min-w-0">
          
          {isLoading ? (
            <div className="flex items-center p-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : (
            <ProfileModal>
              <div
                className="group flex items-center space-x-2 md:space-x-3 p-1.5 md:p-2 rounded-xl transition duration-200 cursor-pointer hover:bg-white/10 min-w-0"
                title="Profil ma'lumotlarini ko'rish"
              >
                {/* Profil ikonkasi - mobilda doim ko'rinadi */}
                <div className="bg-white/20 p-1.5 rounded-full border border-white/30 shrink-0">
                   <UserIcon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>

                {/* Foydalanuvchi ma'lumotlari */}
                <div className="flex flex-col items-start leading-tight min-w-0">
                  {/* Mobilda faqat ism, kattaroq ekranda to'liq ism-sharif */}
                  <span className="text-sm md:text-base font-bold text-white truncate w-full max-w-[80px] md:max-w-[200px]">
                    <span className="md:hidden">{firstName}</span>
                    <span className="hidden md:inline">{fullName}</span>
                  </span>
                  
                  {/* Rol belgisi - mobilda juda kichik va ixcham */}
                  <div
                    className={`flex items-center px-1.5 py-0.5 mt-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-tighter shrink-0 ${roleColorClass}`}
                  >
                    <AcademicCapIcon className="h-2.5 w-2.5 mr-1" />
                    {userRole}
                  </div>
                </div>

                <ChevronDownIcon className="h-3 w-3 md:h-4 md:w-4 text-white/70 transition duration-300 group-hover:rotate-180 shrink-0" />
              </div>
            </ProfileModal>
          )}

          {/* Ajratuvchi chiziq */}
          <div className="h-6 md:h-8 w-[1px] bg-white/20 mx-1 shrink-0" />

          {/* Chiqish tugmasi */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 md:px-3 md:py-2 rounded-lg text-sm font-bold transition duration-200 text-white hover:bg-black/20 shrink-0"
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

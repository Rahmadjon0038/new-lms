"use client";
import React, { useState, useEffect } from "react";
// Next.js App Router uchun muhim hook
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { instance } from "../../hooks/api";
import {
  BookOpenIcon,
  ClipboardDocumentListIcon, // Davomat uchun
  BriefcaseIcon,
  BookmarkIcon, // Qo'llanma uchun
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// API function for checking English teacher status
const checkEnglishTeacher = async () => {
  const response = await instance.get('/api/users/teachers/english');
  return response.data;
};

// --- O'qituvchi Menyu elementlari ma'lumotlari ---
const getTeacherSidebarItems = (isEnglishTeacher) => {
  const baseItems = [
    // {
    //   name: "Dashboard",
    //   icon: Squares2X2Icon,
    //   href: "/teacher", // O'qituvchining asosiy yo'li (Dashboard)
    // },
    {
      name: "Mening Guruhlarim",
      icon: BookOpenIcon,
      href: "/teacher",
    },
    {
      name: "Davomat",
      icon: ClipboardDocumentListIcon,
      href: "/teacher/attendance",
    },
    {
      name: "Talabalar To'lovlari", // To'lovlar statusini ko'rish uchun
      icon: BriefcaseIcon,
      href: "/teacher/payments-info",
    },
    {
      name: "Sozlamalar",
      icon: Cog6ToothIcon,
      href: "/teacher/settings",
    },
  ];

  // Agar ingliz tili o'qituvchisi bo'lsa, Qo'llanma qo'shish
  if (isEnglishTeacher) {
    baseItems.push({
      name: "Qo'llanma",
      icon: BookmarkIcon,
      href: "/teacher/guide",
    });
  }

  return baseItems;
};

function TeacherSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // English teacher status ni tekshirish - TanStack Query bilan
  const { data: teacherData, isLoading } = useQuery({
    queryKey: ['english-teacher-status'],
    queryFn: checkEnglishTeacher,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 daqiqa
  });

  // Loading holatida default false, aks holda backend javobini ishlatish
  const isEnglishTeacher = isLoading ? false : teacherData?.isEnglishTeacher === true;
  const TeacherSidebarItems = getTeacherSidebarItems(isEnglishTeacher);

  // Sahifa o'zgarganda mobil menuni yopish
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Body scroll ni bloklash
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const SidebarContent = () => {
    if (isLoading) {
      return (
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </nav>
      );
    }

    return (
      <nav className="flex-1 px-4 py-6 space-y-2">
        {TeacherSidebarItems.map((item) => {
          let isActive = pathname === item.href;
          if (item.href !== "/teacher") {
            isActive = pathname.startsWith(item.href);
          } else {
            isActive = pathname === item.href;
          }
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center px-3 py-3 rounded-lg text-sm font-medium transition duration-150 ease-in-out
                ${
                    isActive
                      ? "bg-[#A70E07] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
    );
  };

  return (
    <>
      {/* Mobil uchun Hamburger tugmasi */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 p-3 bg-[#A70E07] text-white rounded-full shadow-lg hover:bg-[#8a0c06] transition-colors"
        aria-label="Menuni ochish"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Mobil Sidebar (Overlay) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Qora overlay */}
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar content */}
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Menyu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menuni yopish"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            {/* Menu items */}
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-48 lg:w-60 min-h-screen bg-white shadow-xl">
        <SidebarContent />
      </div>
    </>
  );
}

export default TeacherSidebar;

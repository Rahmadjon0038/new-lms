"use client";
import React from "react";
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

  const { data: teacherData, isLoading } = useQuery({
    queryKey: ['english-teacher-status'],
    queryFn: checkEnglishTeacher,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const isEnglishTeacher = isLoading ? false : teacherData?.isEnglishTeacher === true;
  const TeacherSidebarItems = getTeacherSidebarItems(isEnglishTeacher);

  const renderSidebarContent = () => {
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
    <div className="hidden lg:flex flex-col w-48 xl:w-60 min-h-screen bg-white shadow-xl">
      {renderSidebarContent()}
    </div>
  );
}

export default TeacherSidebar;

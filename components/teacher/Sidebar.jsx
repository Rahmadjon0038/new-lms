"use client";
import React from "react";
// Next.js App Router uchun muhim hook
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpenIcon,
  ClipboardDocumentListIcon, // Davomat uchun
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

// --- O'qituvchi Menyu elementlari ma'lumotlari ---
const TeacherSidebarItems = [
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
];

function TeacherSidebar() {
  // 1. Joriy URL yo'lini olish uchun usePathname dan foydalanamiz
  const pathname = usePathname();

  return (
    // Dizayn va umumiy funksionallik o'zgarishsiz qoladi
    <div className="flex flex-col w-60 min-h-screen bg-white shadow-xl">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {TeacherSidebarItems.map((item) => {
          let isActive = pathname === item.href;
          if (item.href !== "/teacher") {
            isActive = pathname.startsWith(item.href);
          } else {
            // Dashboard (faqat /teacher bo'lsa aktiv)
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
                    ? "bg-[#A70E07] text-white shadow-md" // Aktiv uslub (Shadow qo'shildi)
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900" // Noaktiv uslub
                }
              `}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive ? "text-white" : "text-gray-500"
                }`}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default TeacherSidebar;

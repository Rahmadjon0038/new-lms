"use client";
import React from "react";
// Next.js App Router uchun muhim hook
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Squares2X2Icon,
  BookOpenIcon,
  ChartBarIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

// Menyu elementlari ma'lumotlari
const sidebarItems = [
  // {
  //   name: "Dashboard",
  //   icon: Squares2X2Icon,
  //   href: "/students", // Studentlarning asosiy yo'li
  // },
  {
    name: "Mening Guruhlarim",
    icon: BookOpenIcon,
    href: "/students",
  },
  {
    name: "Davomat",
    icon: ChartBarIcon,
    href: "/students/my-attendance",
  },
  {
    name: "To'lovlari",
    icon: BriefcaseIcon,
    href: "/students/my-payments",
  },
];

function Sidebar() {
  // 1. Joriy URL yo'lini olish uchun usePathname dan foydalanamiz
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-60 min-h-screen bg-white shadow-xl">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          // 2. Aktivlikni tekshirish logikasi:
          // Joriy pathname menyu elementining href qiymatiga teng bo'lsa, u aktivdir.
          // "/students" yo'li uchun ham ishlashi uchun maxsus tekshiruv qo'shildi.
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href} // Endi href to'liq yo'lni o'z ichiga oladi
              className={`
                flex items-center px-3 py-3 rounded-lg text-sm font-medium transition duration-150 ease-in-out
                ${
                  isActive
                    ? "bg-blue-600 text-white" // Aktiv uslub
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900" // Noaktiv uslub
                }
              `}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive
                    ? "text-white"
                    : "text-gray-500 group-hover:text-gray-600"
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

export default Sidebar;

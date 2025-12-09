"use client";
import React from "react";
// Next.js App Router uchun muhim hook
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Squares2X2Icon, // Dashboard
  UserGroupIcon, // O'qituvchilar / Talabalar
  BookOpenIcon, // Guruhlar
  ChartBarIcon, // Davomat
  BriefcaseIcon, // To'lovlar (yoki WalletIcon, BriefcaseIcon mos keladi)
  // Guruhlar va O'qituvchilar uchun alohida ikonka kerak bo'lsa, uni quyida aniqlaymiz
  UsersIcon, // Talabalar uchun alohida
  ClipboardDocumentListIcon, // Davomat uchun
  WalletIcon, // To'lovlar uchun
} from "@heroicons/react/24/outline";

// Menyu elementlari ma'lumotlari (Administrator uchun yangilandi)
const sidebarItems = [
  {
    name: "Dashboard",
    icon: Squares2X2Icon,
    href: "/admin", // Administratorlarning asosiy yo'li
  },
  {
    name: "O'qituvchilar",
    icon: UserGroupIcon, // O'qituvchilarni ifodalovchi ikonka
    href: "/admin/teachers",
  },
  {
    name: "Talabalar",
    icon: UsersIcon, // Talabalarni ifodalovchi ikonka
    href: "/admin/students",
  },
  {
    name: "Guruhlar",
    icon: BookOpenIcon,
    href: "/admin/groups",
  },
  {
    name: "Davomat",
    icon: ClipboardDocumentListIcon, // Davomat sahifasiga mosroq ikonka
    href: "/admin/attendance",
  },
  {
    name: "To'lovlar",
    icon: WalletIcon, // To'lovlarni ifodalovchi ikonka
    href: "/admin/payments",
  },
];

function AdministratorSidebar() {
  // 1. Joriy URL yo'lini olish uchun usePathname dan foydalanamiz
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-60 min-h-screen bg-white shadow-xl">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          // 2. Aktivlikni tekshirish logikasi:
          // Joriy pathname menyu elementining href qiymatiga teng bo'lsa, u aktivdir.
          const isActive = pathname === item.href;

          // Dashboard uchun alohida tekshiruv (agar u /admin bo'lsa, /admin/xyz emas)
          const isDashboardActive =
            item.href === "/admin" && pathname === "/admin";

          return (
            <Link
              key={item.name}
              href={item.href} // Endi href to'liq yo'lni o'z ichiga oladi
              className={`
                flex items-center px-3 py-3 rounded-lg text-sm font-medium transition duration-150 ease-in-out
                ${
                  isActive || isDashboardActive
                    ? "bg-blue-600 text-white" // Aktiv uslub
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900" // Noaktiv uslub
                }
              `}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive || isDashboardActive
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

// Fayl nomingizga mos keladigan eksportni ta'minlash uchun
export default AdministratorSidebar;

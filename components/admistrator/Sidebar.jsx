"use client";
import React from "react";
// Next.js App Router uchun muhim hook
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Squares2X2Icon, // Dashboard
  UserGroupIcon, // O'qituvchilar / Talabalar
  BookOpenIcon, // Guruhlar
  UsersIcon, // Talabalar uchun alohida
  AcademicCapIcon, // Fanlar uchun
  ClipboardDocumentListIcon, // Davomat uchun
  WalletIcon, // To'lovlar uchun
  BuildingLibraryIcon, // Xonalar
} from "@heroicons/react/24/outline";

// Asosiy rang konstantasi
const MAIN_COLOR = "#A60E07";

// Menyu elementlari ma'lumotlari
const sidebarItems = [
  {
    name: "Dashboard",
    icon: Squares2X2Icon,
    href: "/admin",
  },
  {
    name: "O'qituvchilar",
    icon: UserGroupIcon,
    href: "/admin/teachers",
  },
  {
    name: "Talabalar",
    icon: UsersIcon,
    href: "/admin/students",
  },
  {
    name: "Fanlar",
    icon: AcademicCapIcon,
    href: "/admin/subjects",
  },
  {
    name: "Guruhlar",
    icon: BookOpenIcon,
    href: "/admin/groups",
  },
  {
    name: "Xonalar",
    icon: BuildingLibraryIcon,
    href: "/admin/rooms",
  },
  {
    name: "Davomat",
    icon: ClipboardDocumentListIcon,
    href: "/admin/attendance",
  },
  {
    name: "Student payment",
    icon: WalletIcon,
    href: "/admin/students-payments",
  },
  // {
  //   name: "Teacher payment",
  //   icon: WalletIcon,
  //   href: "/admin/teachers-payments",
  // },
];

function AdministratorSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-60 min-h-screen bg-white shadow-xl">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          // Aktivlikni tekshirish logikasi
          const isActive = pathname === item.href;
          const isDashboardActive = item.href === "/admin" && pathname === "/admin";
          const currentActive = isActive || isDashboardActive;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-3 rounded-lg text-sm font-medium transition duration-150 ease-in-out
                ${
                  currentActive
                    ? "text-white shadow-md" // Aktiv holatda text oq
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900" 
                }
              `}
              style={currentActive ? { backgroundColor: MAIN_COLOR } : {}}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  currentActive
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

export default AdministratorSidebar;
"use client";
import React, { useState } from "react";
// Next.js App Router uchun muhim hook
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Squares2X2Icon, // Dashboard
  UserGroupIcon, // O'qituvchilar / Talabalar
  BookOpenIcon, // Guruhlar
  UsersIcon, // Talabalar uchun alohida
  AcademicCapIcon, // Fanlar uchun
  BookmarkIcon, // Qollanma
  ClipboardDocumentListIcon, // Davomat uchun
  WalletIcon, // To'lovlar uchun
  BuildingLibraryIcon, // Xonalar
  ReceiptPercentIcon, // Rasxodlar
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Asosiy rang konstantasi
const MAIN_COLOR = "#A60E07";

// Asosiy bo'limlar
const primarySidebarItems = [
  {
    name: "Bosh sahifa",
    icon: Squares2X2Icon,
    href: "/admin",
  },
 
  {
    name: "Davomat",
    icon: ClipboardDocumentListIcon,
    href: "/admin/attendance",
  },
  {
    name: "Oylik to'lovlar",
    icon: WalletIcon,
    href: "/admin/students-payments",
  },
  {
    name: "O'qituvchilar oyligi",
    icon: WalletIcon,
    href: "/admin/teachers-payments",
  },
  {
    name: "Talabalar",
    icon: UsersIcon,
    href: "/admin/students",
  },
  {
    name: "Guruhlar",
    icon: BookOpenIcon,
    href: "/admin/groups",
  },
];

// Qo'shimcha bo'limlar
const secondarySidebarItems = [
  {
    name: "Fanlar",
    icon: AcademicCapIcon,
    href: "/admin/subjects",
  },
  {
    name: "Qollanma",
    icon: BookmarkIcon,
    href: "/admin/guide",
  },
  {
    name: "Rasxodlar",
    icon: ReceiptPercentIcon,
    href: "/admin/expenses",
  },
  
   {
    name: "O'qituvchilar",
    icon: UserGroupIcon,
    href: "/admin/teachers",
  },
  {
    name: "Xonalar",
    icon: BuildingLibraryIcon,
    href: "/admin/rooms",
  },
];

function AdministratorSidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const [isExtraOpen, setIsExtraOpen] = useState(false);

  const isItemActive = (itemHref) => {
    if (!pathname) return false;
    if (itemHref === "/admin") return pathname === "/admin";
    return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
  };

  const hasActiveExtra = secondarySidebarItems.some((item) => isItemActive(item.href));
  const shouldShowExtra = isExtraOpen || hasActiveExtra;

  const renderMenuItems = (items) =>
    items.map((item) => {
      const currentActive = isItemActive(item.href);

      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={onClose}
          className={`
            flex items-center px-3 py-3 rounded-lg text-sm font-medium transition duration-150 ease-in-out
            ${
              currentActive
                ? "text-white shadow-md"
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
    });

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-200 lg:static lg:min-h-screen lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 lg:hidden">
        <p className="text-sm font-semibold text-gray-800">Admin Menu</p>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {renderMenuItems(primarySidebarItems)}
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => setIsExtraOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            <span>Qo&apos;shimcha bo&apos;limlar</span>
            <ChevronRightIcon
              className={`h-4 w-4 text-gray-500 transition-transform ${shouldShowExtra ? "rotate-90" : ""}`}
            />
          </button>

          {shouldShowExtra && (
            <div className="mt-2 space-y-2">
              {renderMenuItems(secondarySidebarItems)}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

export default AdministratorSidebar;

"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  Squares2X2Icon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const MAIN_COLOR = "#A60E07";

const sidebarItems = [
  {
    name: "Dashboard",
    icon: Squares2X2Icon,
    href: "/super_admin",
  },
  {
    name: "Davomat",
    icon: ChartBarIcon,
    href: "/super_admin/attendance",
  },
  {
    name: "Kunlik to'lovlar",
    icon: CreditCardIcon,
    href: "/super_admin/payments/daily",
  },
  {
    name: "Adminlar",
    icon: UserGroupIcon,
    href: "/super_admin/admins",
  },
  {
    name: "Admin oyliklari",
    icon: BanknotesIcon,
    href: "/super_admin/admins/salary",
  },
  {
    name: "Sozlamalar",
    icon: Cog6ToothIcon,
    href: "/super_admin/settings",
  },
];

function SuperAdminSidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeHref = sidebarItems.reduce((best, item) => {
    const isMatch =
      item.href === "/super_admin"
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (!isMatch) return best;
    return item.href.length > best.length ? item.href : best;
  }, "");

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-56 shrink-0 transform flex-col overflow-hidden bg-white shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-full lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 lg:hidden">
        <p className="text-sm font-semibold text-gray-800">Super Admin Menu</p>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6 overscroll-contain">
        {sidebarItems.map((item) => {
          const isActive = item.href === activeHref;
          return (
            <button
              type="button"
              key={item.name}
              onClick={() => {
                onClose();
                if (pathname !== item.href) router.push(item.href);
              }}
              className={`flex w-full items-center rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
                isActive ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
              }`}
              style={isActive ? { backgroundColor: MAIN_COLOR } : {}}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`} />
              {item.name}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default SuperAdminSidebar;

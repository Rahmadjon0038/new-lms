"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Squares2X2Icon, XMarkIcon } from "@heroicons/react/24/outline";

const MAIN_COLOR = "#A60E07";

const sidebarItems = [
  {
    name: "Dashboard",
    icon: Squares2X2Icon,
    href: "/super_admin",
  },
];

function SuperAdminSidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-56 transform bg-white shadow-xl transition-transform duration-200 lg:static lg:min-h-screen lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 lg:hidden">
        <p className="text-sm font-semibold text-gray-800">Super Admin Menu</p>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition ${
                isActive ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
              }`}
              style={isActive ? { backgroundColor: MAIN_COLOR } : {}}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default SuperAdminSidebar;

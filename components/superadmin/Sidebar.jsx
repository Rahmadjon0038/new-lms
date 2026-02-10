"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Squares2X2Icon } from "@heroicons/react/24/outline";

const MAIN_COLOR = "#A60E07";

const sidebarItems = [
  {
    name: "Dashboard",
    icon: Squares2X2Icon,
    href: "/super_admin",
  },
];

function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-56 min-h-screen bg-white shadow-xl">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
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
    </div>
  );
}

export default SuperAdminSidebar;


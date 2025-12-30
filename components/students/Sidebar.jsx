"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Squares2X2Icon,
  BookOpenIcon,
  ChartBarIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

const sidebarItems = [
  {
    name: "Mening Guruhlarim",
    icon: BookOpenIcon,
    href: "/student",
  },
  {
    name: "Davomat",
    icon: ChartBarIcon,
    href: "/student/my-attendance",
  },
  {
    name: "To'lovlarim",
    icon: BriefcaseIcon,
    href: "/student/my-payments",
  },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-60 min-h-screen bg-white shadow-2xl border-r border-gray-100">
      <nav className="flex-1 px-4 py-8 space-y-2">
        {sidebarItems.map((item) => {
          // Aktivlikni tekshirish
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200
                ${
                  isActive
                    ? "text-white shadow-lg shadow-red-100" // Aktiv uslub
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900" // Noaktiv uslub
                }
              `}
              style={isActive ? { backgroundColor: '#A60E07' } : {}}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar ostida kichik brend belgi (ixtiyoriy) */}
      <div className="p-4 border-t border-gray-50">
        <div 
          className="rounded-lg p-3 text-[10px] font-bold text-center opacity-40 uppercase tracking-widest"
          style={{ color: '#A60E07' }}
        >
          LMS v2.0
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Squares2X2Icon,
  BookOpenIcon,
  ChartBarIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
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
  {
    name: "Sozlamalar",
    icon: Cog6ToothIcon,
    href: "/student/settings",
  },
];

function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sahifa o'zgarganda mobil menuni yopish
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Body scroll ni bloklash
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const SidebarContent = () => (
    <nav className="flex-1 px-4 py-6 sm:py-8 space-y-2">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`
              flex items-center px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-sm font-bold transition-all duration-200
              ${
                isActive
                  ? "text-white shadow-lg shadow-red-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
  );

  return (
    <>
      {/* Mobil uchun Hamburger tugmasi */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 p-3 bg-[#A60E07] text-white rounded-full shadow-lg hover:bg-[#8a0c06] transition-colors"
        aria-label="Menuni ochish"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Mobil Sidebar (Overlay) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Qora overlay */}
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar content */}
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Menyu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menuni yopish"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            {/* Menu items */}
            <SidebarContent />
            
            {/* Footer
            <div className="p-4 border-t border-gray-50">
              <div 
                className="rounded-lg p-3 text-[10px] font-bold text-center opacity-40 uppercase tracking-widest"
                style={{ color: '#A60E07' }}
              >
                LMS v2.0
              </div>
            </div> */}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-48 xl:w-60 min-h-screen bg-white shadow-2xl border-r border-gray-100">
        <SidebarContent />
        
        {/* Sidebar ostida kichik brend belgi */}
        <div className="p-4 border-t border-gray-50">
          <div 
            className="rounded-lg p-3 text-[10px] font-bold text-center opacity-40 uppercase tracking-widest"
            style={{ color: '#A60E07' }}
          >
            LMS v2.0
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;

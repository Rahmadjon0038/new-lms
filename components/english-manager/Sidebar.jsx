"use client";
/* eslint-disable react/no-unescaped-entities */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Squares2X2Icon,
  BookOpenIcon,
  UsersIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  XMarkIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const MAIN_COLOR = "#A60E07";

const items = [
  { name: "Bosh sahifa", icon: Squares2X2Icon, href: "/english-manager" },
  { name: "Guruhlar", icon: BookOpenIcon, href: "/english-manager/groups" },
  { name: "Talabalar", icon: UsersIcon, href: "/english-manager/students" },
  { name: "To'lovlar", icon: BanknotesIcon, href: "/english-manager/payments" },
  { name: "Statistika", icon: ChartBarIcon, href: "/english-manager/statistics" },
  { name: "Sozlamalar", icon: Cog6ToothIcon, href: "/english-manager/settings" },
];

export default function EnglishManagerSidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (!pathname) return false;
    return href === "/english-manager"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 transform flex-col overflow-hidden bg-white shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-full lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 lg:hidden">
        <div>
          <div className="text-sm font-black tracking-[0.25em] text-[#A60E07] uppercase">
            English Manager
          </div>
          <p className="text-xs text-gray-500">Only English data</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="hidden border-b border-gray-100 px-5 py-5 lg:block">
        <div className="inline-flex rounded-full bg-[#A60E07]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[#A60E07]">
          English Manager
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A60E07] to-[#f97316] text-white shadow-lg">
            <AcademicCapIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">English dashboard</div>
            <div className="text-xs text-gray-500">Faqat ingliz tili bo'limi</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-2">
          {items.map((item) => {
            const current = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  current ? "text-white shadow-lg" : "text-gray-700 hover:bg-gray-100"
                }`}
                style={current ? { backgroundColor: MAIN_COLOR } : {}}
              >
                <item.icon className={`mr-3 h-5 w-5 ${current ? "text-white" : "text-gray-500"}`} />
                <span className="flex-1">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">Scope</div>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Bu bo'lim faqat English subject bilan bog'langan ma'lumotlarni ko'rsatadi.
          </p>
        </div>
      </nav>
    </aside>
  );
}

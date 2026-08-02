"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Squares2X2Icon,
  BookOpenIcon,
  UsersIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { instance } from "../../hooks/api";

const MAIN_COLOR = "#A60E07";
const SEEN_REPORTS_STORAGE_KEY = "english-manager-seen-report-ids";

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
  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [seenReportIds, setSeenReportIds] = useState(() => {
    if (typeof window === "undefined") {
      return new Set();
    }

    try {
      const raw = window.localStorage.getItem(SEEN_REPORTS_STORAGE_KEY);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((value) => String(value)));
      }
    } catch {
      // ignore localStorage errors
    }

    return new Set();
  });

  const loadSeenReportIds = () => {
    try {
      const raw = window.localStorage.getItem(SEEN_REPORTS_STORAGE_KEY);
      if (!raw) {
        setSeenReportIds(new Set());
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSeenReportIds(new Set(parsed.map((value) => String(value))));
        return;
      }
    } catch {
      // ignore localStorage errors
    }
    setSeenReportIds(new Set());
  };

  useEffect(() => {
    const handleSync = () => loadSeenReportIds();
    window.addEventListener("storage", handleSync);
    window.addEventListener("english-manager-seen-report-ids-changed", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("english-manager-seen-report-ids-changed", handleSync);
    };
  }, []);

  const reportsQuery = useQuery({
    queryKey: ["english-manager-sidebar-reports", currentMonth],
    queryFn: async () => {
      const response = await instance.get("/api/teacher-statistics/manager/reports", {
        params: { month: currentMonth },
      });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  const englishReports = useMemo(() => {
    const reports = Array.isArray(reportsQuery.data) ? reportsQuery.data : [];
    return reports.filter((report) => {
      const subject = String(report?.subject_name || "").trim().toLowerCase();
      return subject.includes("english") || subject.includes("ingliz");
    });
  }, [reportsQuery.data]);

  const unseenReportsCount = useMemo(() => {
    return englishReports.filter((report) => !seenReportIds.has(String(report.lesson_id))).length;
  }, [englishReports, seenReportIds]);

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
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-2">
          {items.map((item) => {
            const current = isActive(item.href);
            const showBadge = item.href === "/english-manager/statistics" && unseenReportsCount > 0;
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
                  {showBadge ? (
                    <span
                      className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-[#A60E07] px-2 py-0.5 text-[11px] font-black text-white"
                      aria-label={`${unseenReportsCount} ta yangi report`}
                    >
                      {unseenReportsCount > 99 ? "99+" : unseenReportsCount}
                    </span>
                  ) : null}
                </Link>
              );
          })}
        </div>
      </nav>
    </aside>
  );
}

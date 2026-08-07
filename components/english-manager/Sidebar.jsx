"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Squares2X2Icon,
  BookOpenIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  AcademicCapIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { instance } from "../../hooks/api";

const MAIN_COLOR = "#A60E07";
const SEEN_REPORTS_STORAGE_KEY = "english-manager-seen-report-ids";

const items = [
  { name: "Dashboard", icon: Squares2X2Icon, href: "/english-manager" },
  { name: "Attendance", icon: ClipboardDocumentListIcon, href: "/english-manager/attendance" },
  { name: "Groups", icon: BookOpenIcon, href: "/english-manager/groups" },
  { name: "Teachers", icon: AcademicCapIcon, href: "/english-manager/teachers" },
  { name: "Payments", icon: BanknotesIcon, href: "/english-manager/payments" },
  { name: "Statistics", icon: ChartBarIcon, href: "/english-manager/statistics" },
  { name: "Lateness", icon: ClockIcon, href: "/english-manager/teachers-lateness" },
  { name: "Settings", icon: Cog6ToothIcon, href: "/english-manager/settings" },
];

export default function EnglishManagerSidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  // Sidebar odatda doim ochiq (foydalanuvchi xohlasa tugma bilan qo'lda yig'ib qo'yadi
  // va bu tanlov boshqa bo'limlarga o'tishda saqlanib qoladi — o'zgarmaydi).
  // Yagona avtomatik holat: Statistika bo'limiga OCHIQ holda kirilsa — joy ochish
  // uchun avtomatik yig'iladi; bo'limdan chiqilganda kirishdan oldingi holatga qaytadi.
  const isStatsRoute = Boolean(pathname?.startsWith("/english-manager/statistics"));
  const [collapsed, setCollapsed] = useState(() => isStatsRoute);
  const [lastPathname, setLastPathname] = useState(pathname);
  const [savedBeforeStats, setSavedBeforeStats] = useState(() => (isStatsRoute ? false : null));

  if (pathname !== lastPathname) {
    const wasStatsRoute = Boolean(lastPathname?.startsWith("/english-manager/statistics"));
    if (isStatsRoute && !wasStatsRoute) {
      setSavedBeforeStats(collapsed);
      if (!collapsed) setCollapsed(true);
    } else if (!isStatsRoute && wasStatsRoute) {
      if (savedBeforeStats !== null) setCollapsed(savedBeforeStats);
      setSavedBeforeStats(null);
    }
    setLastPathname(pathname);
  }
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
      className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 transform flex-col overflow-hidden bg-white shadow-xl transition-all duration-200 lg:sticky lg:top-0 lg:h-full lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${collapsed ? "lg:w-20" : "lg:w-72"}`}
    >
      <div className="flex items-center justify-end border-b border-gray-100 px-4 py-4 lg:hidden">
        <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="hidden items-center justify-end border-b border-gray-100 px-4 py-4 lg:flex">
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#A60E07] hover:text-[#A60E07]"
          aria-label={collapsed ? "Sidebarni ochish" : "Sidebarni yig'ish"}
          title={collapsed ? "Sidebarni ochish" : "Sidebarni yig'ish"}
        >
          {collapsed ? (
            <ChevronDoubleRightIcon className="h-4 w-4" />
          ) : (
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          )}
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
                title={collapsed ? item.name : undefined}
                // Yig'ilgan holat faqat lg+ ekranlarda amal qiladi — mobil overlay'da
                // (hamburger orqali ochiladigan sidebar) har doim to'liq (label bilan) ko'rinadi.
                className={`relative flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  collapsed ? "lg:justify-center lg:px-0" : ""
                } ${current ? "text-white shadow-lg" : "text-gray-700 hover:bg-gray-100"}`}
                style={current ? { backgroundColor: MAIN_COLOR } : {}}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 shrink-0 ${collapsed ? "lg:mr-0" : ""} ${
                      current ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span className={`flex-1 ${collapsed ? "lg:hidden" : ""}`}>{item.name}</span>
                  {showBadge ? (
                    <span
                      className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-[#A60E07] px-2 py-0.5 text-[11px] font-black text-white ${
                        collapsed ? "lg:absolute lg:-right-1 lg:-top-1 lg:ml-0" : ""
                      }`}
                      aria-label={`${unseenReportsCount} new reports`}
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

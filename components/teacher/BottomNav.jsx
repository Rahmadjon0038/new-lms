"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpenIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { instance } from "../../hooks/api";

const checkEnglishTeacher = async () => {
  const response = await instance.get("/api/users/teachers/english");
  return response.data;
};

const getTeacherNavItems = (isEnglishTeacher) => {
  const items = [
    { label: "Guruhlar", href: "/teacher", icon: BookOpenIcon },
    { label: "Davomat", href: "/teacher/attendance", icon: CalendarDaysIcon },
    { label: "To'lovlar", href: "/teacher/payments-info", icon: BriefcaseIcon },
    { label: "Sozlamalar", href: "/teacher/settings", icon: Cog6ToothIcon },
  ];

  if (isEnglishTeacher) {
    items.splice(3, 0, { label: "Qo'llanma", href: "/teacher/guide", icon: BookmarkIcon });
  }

  return items;
};

export default function TeacherBottomNav() {
  const pathname = usePathname();
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-english-status"],
    queryFn: checkEnglishTeacher,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const isEnglishTeacher = isLoading ? false : data?.isEnglishTeacher === true;
  const items = getTeacherNavItems(isEnglishTeacher);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/98 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
      <div
        className="mx-auto grid max-w-7xl gap-0.5"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const isActive =
            item.href === "/teacher"
              ? pathname === "/teacher"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1.5 text-[10px] font-semibold transition sm:text-[11px] ${
                isActive ? "text-[#b10e08]" : "text-slate-500"
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "text-[#b10e08]" : "text-slate-400"}`} />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

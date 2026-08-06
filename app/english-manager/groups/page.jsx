"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  UsersIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  CheckIcon,
  ArchiveBoxXMarkIcon,
  CalendarIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Clock, Building2 } from "lucide-react";
import { useGetAllSubjects } from "../../../hooks/subjects";
import { useGetAllgroups } from "../../../hooks/groups";
import { findEnglishSubject, formatCount } from "../../../utils/englishManager";
import { formatDateYMD } from "../../../utils/date";

const ALLOWED_TABS = ["active", "draft", "closed"];

// Faqat ko'rish uchun guruh kartasi — admin/groups bilan bir xil ko'rinish,
// lekin tahrirlash/o'chirish/blokirovka каби amallar YO'Q.
const GroupViewCard = ({ group }) => {
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStudentDetails && !event.target.closest(".student-dropdown")) {
        setShowStudentDetails(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStudentDetails]);

  const scheduleDays = group.schedule?.days?.join(", ") || "Belgilanmagan";
  const timeInfo = group.schedule?.time ? ` (${group.schedule.time})` : "";
  const startDate = group.class_start_date ? formatDateYMD(group.class_start_date) : "Belgilanmagan";

  const getStatusInfo = () => {
    if (group.status === "draft" || group.class_status === "not_started") {
      return {
        borderColor: "border-yellow-400",
        statusTextColor: "text-yellow-700",
        statusIcon: <CalendarIcon className="h-5 w-5 text-yellow-500 sm:h-6 sm:w-6" />,
        statusText: "Darsi boshlanmagan",
      };
    }
    if (group.status === "active" && group.class_status === "started") {
      return {
        borderColor: "border-[#A60E07]",
        statusTextColor: "text-gray-800",
        statusIcon: <BookOpenIcon className="h-5 w-5 text-[#A60E07] sm:h-6 sm:w-6" />,
        statusText: "Aktiv",
      };
    }
    if (group.status === "blocked") {
      return {
        borderColor: "border-gray-400",
        statusTextColor: "text-gray-500",
        statusIcon: <ArchiveBoxXMarkIcon className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6" />,
        statusText: "Yopilgan",
      };
    }
    return {
      borderColor: "border-blue-400",
      statusTextColor: "text-blue-700",
      statusIcon: <CheckIcon className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />,
      statusText: "Faol",
    };
  };

  const { borderColor, statusTextColor, statusIcon, statusText } = getStatusInfo();
  const isDraft = group.status === "draft" || group.class_status === "not_started";

  return (
    <div className={`rounded-xl border-t-4 bg-white p-4 shadow-sm sm:p-6 ${borderColor}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className={`flex flex-wrap items-center gap-2 text-base font-bold sm:text-xl ${statusTextColor}`}>
            {statusIcon}
            <span className="min-w-0 break-words">{group.name}</span>
          </h3>
          {isDraft && <span className="mt-1 inline-block text-xs font-medium text-yellow-600 sm:text-sm">(Darsi boshlanmagan)</span>}
          {group.status === "blocked" && <span className="mt-1 inline-block text-xs font-medium text-gray-400 sm:text-sm">(Yopilgan)</span>}
        </div>
        <div className="relative student-dropdown shrink-0">
          <div
            onClick={() => setShowStudentDetails(!showStudentDetails)}
            className="flex cursor-pointer items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
          >
            <UsersIcon className="h-3 w-3" />
            <span>{group.total_students_count || 0}</span>
            <svg className={`h-3 w-3 transition-transform ${showStudentDetails ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {showStudentDetails && (
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-md border border-gray-200 bg-white py-1.5 shadow-lg">
              <div className="mb-1 border-b border-gray-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">Holat</div>
              <div className="space-y-0.5 px-1">
                <div className="flex items-center justify-between rounded px-2 py-1 hover:bg-green-50">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-green-700">Faol</span>
                  </div>
                  <span className="text-xs font-bold text-green-800">{group.active_students_count || 0}</span>
                </div>
                <div className="flex items-center justify-between rounded px-2 py-1 hover:bg-orange-50">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    <span className="text-xs font-medium text-orange-700">To'xtatilgan</span>
                  </div>
                  <span className="text-xs font-bold text-orange-800">{group.stopped_students_count || 0}</span>
                </div>
                <div className="flex items-center justify-between rounded px-2 py-1 hover:bg-purple-50">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span className="text-xs font-medium text-purple-700">Bitirgan</span>
                  </div>
                  <span className="text-xs font-bold text-purple-800">{group.finished_students_count || 0}</span>
                </div>
              </div>
              <div className="mt-1.5 border-t border-gray-100 px-2 pt-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Jami:</span>
                  <span className="text-xs font-bold text-blue-700">{group.total_students_count || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className="break-words text-xl font-extrabold text-[#A60E07] sm:text-2xl">
          {group.price ? `${parseFloat(group.price).toLocaleString()} so'm` : "Narxi belgilanmagan"}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <p className="flex items-start">
          <UsersIcon className="mr-2 h-4 w-4 text-gray-400" />
          <span>Holati: <span className="ml-1 font-semibold text-[#A60E07]">{statusText}</span></span>
        </p>
        <p className="flex items-start">
          <CalendarDaysIcon className="mr-2 h-4 w-4 text-gray-400" />
          <span>Jadval: <span className="ml-1 font-semibold break-words">{scheduleDays}</span></span>
        </p>
        <p className="flex items-start">
          <Clock className="mr-2 h-4 w-4 text-gray-400" />
          <span>Vaqti: <span className="ml-1 font-medium text-gray-600">{timeInfo}</span></span>
        </p>
        <p className="flex items-start">
          <PencilSquareIcon className="mr-2 h-4 w-4 text-gray-400" />
          <span>O'qituvchi: <span className="ml-1 font-bold text-gray-800 break-words">{group.teacher_name || "Tayinlanmagan"}</span></span>
        </p>
        {group.subject_name && (
          <p className="flex items-start">
            <BookOpenIcon className="mr-2 h-4 w-4 text-gray-400" />
            <span>Fan: <span className="ml-1 font-bold text-gray-800 break-words">{group.subject_name}</span></span>
          </p>
        )}
        <p className="flex items-start">
          <Building2 className="mr-2 h-4 w-4 text-gray-400" />
          <span>
            Xona:{" "}
            <span className="ml-1 font-bold text-gray-800">
              {group.room_number ? (
                <>
                  {group.room_number}
                  {group.room_capacity && ` (${group.room_capacity} o'rinlik)`}
                  {group.has_projector && <span className="ml-1 text-xs text-green-600">• Proyektor ✓</span>}
                </>
              ) : (
                <span className="text-gray-500">Xona belgilanmagan</span>
              )}
            </span>
          </span>
        </p>
        <p className="flex items-start">
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
          <span>Dars boshlanish sanasi: <span className="ml-1 font-semibold text-gray-600">{startDate}</span></span>
        </p>
      </div>

      <div className="mt-4">
        <Link
          href={`/english-manager/groups/${group.id}`}
          className="flex items-center justify-center rounded-lg bg-[#A60E07] py-2.5 font-semibold text-white shadow-md transition duration-150 hover:opacity-90"
        >
          <ArrowRightIcon className="mr-2 h-5 w-5" />
          Guruhga kirish
        </Link>
      </div>
    </div>
  );
};

export default function EnglishManagerGroupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("active");

  const subjectsQuery = useGetAllSubjects();
  const subjects = useMemo(() => subjectsQuery.data?.subjects || [], [subjectsQuery.data]);
  const englishSubject = useMemo(() => findEnglishSubject(subjects), [subjects]);
  const subjectId = englishSubject?.id;

  const getIsActiveFilter = () => {
    if (currentTab === "active") return "active";
    if (currentTab === "closed") return "blocked";
    if (currentTab === "draft") return "draft";
    return undefined;
  };

  const { data: backendData, isLoading, error } = useGetAllgroups(getIsActiveFilter(), "all", subjectId, {
    enabled: !!subjectId,
  });

  const groups = useMemo(() => {
    if (!backendData?.success || !Array.isArray(backendData.groups)) return [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return backendData.groups;
    return backendData.groups.filter((group) => {
      const groupName = String(group.name || group.group_name || "").toLowerCase();
      const teacherName = String(group.teacher_name || "").toLowerCase();
      return groupName.includes(query) || teacherName.includes(query);
    });
  }, [backendData, searchTerm]);

  const totalStudents = useMemo(
    () => groups.reduce((sum, group) => sum + Number(group.total_students_count || 0), 0),
    [groups]
  );

  const tabClass = (tabName) =>
    `px-3 py-2 text-center text-xs font-bold border-b-4 transition duration-200 cursor-pointer whitespace-nowrap sm:px-6 sm:text-sm
     ${currentTab === tabName ? "border-[#A60E07] text-[#A60E07] bg-red-50" : "border-transparent text-gray-500 hover:text-[#A60E07] hover:border-gray-300"}`;

  if (subjectsQuery.isLoading) {
    return <div className="rounded-lg bg-white p-4 text-sm text-gray-500">Yuklanmoqda...</div>;
  }

  if (!subjectId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        English subject topilmadi.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">English guruhlar</h1>
            <p className="text-xs text-gray-500">Faqat English subject bilan bog'langan guruhlar — ko'rish uchun</p>
          </div>
          <Link href="/english-manager" className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
            <BookOpenIcon className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto border-b border-gray-200">
          <div className="flex min-w-max">
            <button onClick={() => setCurrentTab("active")} className={tabClass("active")}>
              <UsersIcon className="mr-1 inline h-4 w-4" />
              Faol Guruhlar
            </button>
            <button onClick={() => setCurrentTab("draft")} className={tabClass("draft")}>
              <CalendarIcon className="mr-1 inline h-4 w-4" />
              Darsi Boshlanmagan
            </button>
            <button onClick={() => setCurrentTab("closed")} className={tabClass("closed")}>
              <LockClosedIcon className="mr-1 inline h-4 w-4" />
              Yopilgan Guruhlar
            </button>
          </div>
        </div>

        <div className="p-3">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Guruh nomi yoki teacher nomi bilan qidirish"
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#A60E07]"
            />
          </div>

          <p className="mb-1 mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex items-center rounded-full border border-[#A60E07]/15 bg-[#A60E07]/5 px-3 py-1 text-sm font-semibold text-[#A60E07]">
              Jami {formatCount(totalStudents)} ta talaba
            </span>
            <span>Jami {formatCount(groups.length)} ta guruh mavjud</span>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg bg-white p-4 text-center text-sm text-gray-500">Guruhlar yuklanmoqda...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Guruhlar yuklanmadi: {error?.response?.data?.message || error?.message || "Xatolik yuz berdi"}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
          {searchTerm.trim() ? "Qidiruv bo'yicha guruh topilmadi." : "Bu bo'limda guruhlar mavjud emas."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupViewCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

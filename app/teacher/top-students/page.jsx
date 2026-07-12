"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { useGetTeacherGroups, useGetGroupsDetails } from "../../../hooks/groups";
import {
  buildGroupTop,
  buildMonthOptions,
  formatMonthLabel,
  monthKey,
} from "../../../utils/topStudents";
import { GroupTopBlock } from "../../../components/teacher/TopStudentsSection";

/**
 * Barcha guruhlar bo'yicha oyning eng yaxshi o'quvchilari.
 * Oy bo'yicha filter bilan — o'tgan oylar natijalarini ham ko'rish mumkin.
 * Mobil ilovadagi TeacherTopStudentsPage bilan bir xil mantiq.
 */
function TeacherTopStudentsPage() {
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const { data: groupsData, isLoading: groupsLoading } = useGetTeacherGroups();

  const groups = groupsData?.data?.groups || [];
  const months = buildMonthOptions(groups);
  const groupIds = groups.map((g) => g.group_info.id);
  const { details, isLoading: detailsLoading } = useGetGroupsDetails(
    groupIds,
    month
  );

  const isLoading = groupsLoading || detailsLoading;
  const groupTops = details.map(buildGroupTop);

  return (
    <div className="min-h-full p-1 sm:p-4 md:p-0">
      {/* Sarlavha */}
      <div className="mb-4 flex items-center gap-2 sm:gap-3">
        <Link
          href="/teacher"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4A017] to-[#F0C24B]">
          <TrophyIcon className="h-5 w-5 text-white" />
        </span>
        <h1 className="text-base sm:text-xl font-black text-gray-900">
          Eng yaxshi o&apos;quvchilar
        </h1>
      </div>

      {/* Oy tanlash chiplari */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {months.map((option) => {
          const selected = option === month;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setMonth(option)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] sm:text-xs font-bold transition ${
                selected
                  ? "border-[#A60E07] bg-[#A60E07]/10 text-[#A60E07]"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {formatMonthLabel(option)}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="animate-pulse text-lg font-medium text-gray-400">
            Yuklanmoqda...
          </div>
        </div>
      ) : groupTops.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <p className="text-lg font-bold text-gray-400">
            Guruhlar topilmadi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {groupTops.map((groupTop) => (
            <Link
              key={groupTop.groupId}
              href={`/teacher/my-groups/${groupTop.groupId}`}
              className="rounded-[8px] border border-gray-100 bg-white p-3 sm:p-4 shadow-md transition hover:shadow-xl"
            >
              <GroupTopBlock groupTop={groupTop} showEmpty />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherTopStudentsPage;

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { TrophyIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useGetGroupsDetails } from "../../hooks/groups";
import { buildGroupTop } from "../../utils/topStudents";

// Medal ranglari: oltin, kumush, bronza
export const MEDAL_COLORS = ["#D4A017", "#8E9AAB", "#B4691E"];

// Avatar: rasm yuklanmasa (yoki yo'q bo'lsa) bosh harflar doirasi ko'rsatiladi
export const StudentAvatar = ({ url, initials, className = "h-8 w-8 sm:h-9 sm:w-9" }) => {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <span
        className={`${className} flex shrink-0 items-center justify-center rounded-full bg-[#A60E07] text-[11px] font-bold text-white`}
      >
        {initials}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      className={`${className} shrink-0 rounded-full object-cover`}
    />
  );
};

// Bitta o'quvchi qatori: medal + avatar + ism + ball
export const TopStudentRow = ({ student, rank }) => {
  const color = MEDAL_COLORS[Math.min(rank, MEDAL_COLORS.length - 1)];
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span
        className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: color }}
      >
        <TrophyIcon className="h-3.5 w-3.5 text-white" />
      </span>
      <StudentAvatar url={student.avatarUrl} initials={student.initials} />
      <span
        className="min-w-0 flex-1 truncate text-xs sm:text-sm font-bold"
        style={{ color }}
      >
        {student.name}
      </span>
      <span
        className="shrink-0 rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold"
        style={{ color, backgroundColor: `${color}1A` }}
      >
        {student.points} ball
      </span>
    </div>
  );
};

// Guruh bo'limi: guruh nomi + eng yaxshi o'quvchilari
export const GroupTopBlock = ({ groupTop, showEmpty = false }) => {
  if (!groupTop.students.length && !showEmpty) return null;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
          {groupTop.groupName}
        </span>
        <span className="shrink-0 text-[10px] sm:text-xs text-gray-400">
          {groupTop.activeStudentsCount} o&apos;quvchi
        </span>
      </div>
      {groupTop.students.length ? (
        <div className="space-y-2">
          {groupTop.students.map((student, index) => (
            <TopStudentRow key={student.id} student={student} rank={index} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">Bu oyda ball qo&apos;yilmagan</p>
      )}
    </div>
  );
};

/**
 * Teacher bosh sahifasidagi "Oyning eng yaxshi o'quvchilari" kartasi.
 * Har bir guruhdan guruh kattaligiga qarab 1-3 tadan o'quvchi ko'rsatiladi,
 * bosilganda oy filtri bilan alohida sahifa ochiladi.
 */
const TopStudentsSection = ({ groups }) => {
  const groupIds = (groups || []).map((g) => g.group_info.id);
  const { details, isLoading } = useGetGroupsDetails(groupIds);

  if (isLoading || !details.length) return null;

  const groupTops = details
    .map(buildGroupTop)
    .filter((groupTop) => groupTop.students.length > 0);

  if (!groupTops.length) return null;

  return (
    <Link
      href="/teacher/top-students"
      className="mb-4 sm:mb-6 block rounded-[8px] border border-gray-100 bg-white p-3 sm:p-5 shadow-md transition hover:shadow-xl"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4A017] to-[#F0C24B]">
          <TrophyIcon className="h-4 w-4 text-white" />
        </span>
        <h2 className="flex-1 text-sm sm:text-base font-black text-gray-800">
          Oyning eng yaxshi o&apos;quvchilari
        </h2>
        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groupTops.map((groupTop) => (
          <GroupTopBlock key={groupTop.groupId} groupTop={groupTop} />
        ))}
      </div>
    </Link>
  );
};

export default TopStudentsSection;

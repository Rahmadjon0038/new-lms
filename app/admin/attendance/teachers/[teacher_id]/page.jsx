"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAttendanceTeacherGroups,
  useGetGroupLessons,
  useGetLessonStudents,
  useMarkLessonAttendance,
} from "../../../../../hooks/attendance";
import { useGetNotify } from "../../../../../hooks/notify";
import MonthlyAttendanceInline from "../../../../../components/MonthlyAttendanceInline";

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const WEEKDAYS_UZ = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];

export default function AdminTeacherGroupsPage() {
  const { teacher_id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const notify = useGetNotify();
  const queryClient = useQueryClient();

  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [shift, setShift] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [selectedGroupId, setSelectedGroupId] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`attendance-selected-group-${teacher_id}`) || "";
  });
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [attendanceOverrides, setAttendanceOverrides] = useState({});
  const hasActiveFilters = Boolean(date || day || shift);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (date) params.set("date", date); else params.delete("date");
    if (day) params.set("day", day); else params.delete("day");
    if (shift) params.set("shift", shift); else params.delete("shift");
    router.replace(`${pathname}?${params.toString()}`);
  }, [date, day, shift, pathname, router, searchString]);

  const query = useGetAttendanceTeacherGroups(teacher_id, {
    date: date || undefined,
    day: day || undefined,
    shift: shift || undefined,
  });

  const teacher = useMemo(() => {
    const payload = query.data?.data;
    return payload?.teacher || null;
  }, [query.data]);

  const groups = useMemo(() => {
    const payload = query.data?.data;
    return Array.isArray(payload?.groups) ? payload.groups : [];
  }, [query.data]);

  const activeGroupId = useMemo(() => {
    const selectedExists = groups.some((group) => String(group.group_id) === String(selectedGroupId));
    if (selectedExists) return String(selectedGroupId);
    return groups[0] ? String(groups[0].group_id) : "";
  }, [groups, selectedGroupId]);

  const handleSelectGroup = (groupId) => {
    const value = String(groupId);
    setSelectedGroupId(value);
    setSelectedLessonId("");
    setAttendanceOverrides({});
    localStorage.setItem(`attendance-selected-group-${teacher_id}`, value);
    console.log("selected_group_id:", Number(groupId));
  };

  const getDayShort = (day) => {
    const map = {
      dushanba: "Du",
      seshanba: "Se",
      chorshanba: "Ch",
      payshanba: "Pa",
      juma: "Ju",
      shanba: "Sha",
      yakshanba: "Ya",
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    };
    return map[String(day || "").toLowerCase()] || String(day || "").slice(0, 2);
  };
  const activeGroups = groups;
  const isLoadingGroups = query.isLoading;
  const isErrorGroups = query.isError;
  const lessonsQuery = useGetGroupLessons(activeGroupId || undefined, selectedMonth);
  const lessons = useMemo(() => {
    const payload = lessonsQuery.data;
    const raw = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.lessons)
          ? payload.lessons
          : Array.isArray(payload?.data?.lessons)
            ? payload.data.lessons
            : [];

    const sorted = [...raw].sort((a, b) => {
      const aDate = String(a?.date || a?.lesson_date || "").slice(0, 10);
      const bDate = String(b?.date || b?.lesson_date || "").slice(0, 10);
      return aDate.localeCompare(bDate);
    });

    const hasValidTime = (lesson) => {
      const start = String(lesson?.start_time || "").trim();
      const end = String(lesson?.end_time || "").trim();
      if (start && end && start !== "00:00" && end !== "00:00") return true;
      const time = String(lesson?.time || "").trim();
      return /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/.test(time);
    };

    // Backenddan bir sanaga bir nechta record (vaqtli + 00:00) kelganda vaqtlisi ustuvor bo'lsin.
    const byDate = new Map();
    sorted.forEach((lesson) => {
      const key = String(lesson?.date || lesson?.lesson_date || "");
      if (!key) return;
      const existing = byDate.get(key);
      if (!existing) {
        byDate.set(key, lesson);
        return;
      }
      if (!hasValidTime(existing) && hasValidTime(lesson)) {
        byDate.set(key, lesson);
      }
    });

    return Array.from(byDate.values()).sort((a, b) => {
      const aDate = String(a?.date || a?.lesson_date || "").slice(0, 10);
      const bDate = String(b?.date || b?.lesson_date || "").slice(0, 10);
      return aDate.localeCompare(bDate);
    });
  }, [lessonsQuery.data]);
  const activeLessonId = useMemo(() => {
    const exists = lessons.some((lesson) => String(lesson.id || lesson.lesson_id) === String(selectedLessonId));
    return exists ? String(selectedLessonId) : "";
  }, [lessons, selectedLessonId]);
  const lessonStudentsQuery = useGetLessonStudents(activeLessonId || undefined);
  const markMutation = useMarkLessonAttendance();

  const students = useMemo(() => {
    const payload = lessonStudentsQuery.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }, [lessonStudentsQuery.data]);

  const normalizeStatus = (status) => {
    if (status === "keldi") return "keldi";
    return "kelmadi";
  };

  const getCurrentStudentStatus = (student) =>
    attendanceOverrides[student.attendance_id] ?? normalizeStatus(student.status);

  const canStudentMark = (student) => Boolean(student.can_mark) && student.monthly_status === "active";

  const hasAttendanceChanges = useMemo(
    () => Object.keys(attendanceOverrides).length > 0,
    [attendanceOverrides]
  );

  const getWeekdayFromDate = (value) => {
    if (!value) return "";
    const dateOnly = String(value).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return "";
    const [y, m, d] = dateOnly.split("-").map(Number);
    const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return WEEKDAYS_UZ[day] || "";
  };

  const getDisplayTime = (lesson) => {
    const start = String(lesson?.start_time || "").trim();
    const end = String(lesson?.end_time || "").trim();
    if (start && end && start !== "00:00" && end !== "00:00") {
      return `${start} - ${end}`;
    }

    const time = String(lesson?.time || "").trim();
    const match = time.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
    if (match) return `${match[1]} - ${match[2]}`;

    return "Vaqt belgilanmagan";
  };

  const renderLessonStudentsDropdown = () => (
    <div className="mt-2 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">Dars studentlari</h3>
        <span className="text-xs text-gray-500">Lesson ID: {activeLessonId}</span>
      </div>

      {lessonStudentsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : null}

      {lessonStudentsQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {lessonStudentsQuery.error?.response?.data?.message || lessonStudentsQuery.error?.message || "Studentlar yuklanmadi"}
        </div>
      ) : null}

      {!lessonStudentsQuery.isLoading && !lessonStudentsQuery.isError ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-white">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Talaba</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Talaba holati</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Davomat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {students.map((student) => (
                <tr key={student.attendance_id}>
                  <td className="px-3 py-2">
                    {student.student_name || `${student.name || ""} ${student.surname || ""}`.trim()}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      student.monthly_status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {student.monthly_status || "active"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
                      {["keldi", "kelmadi"].map((option) => {
                        const isActive = getCurrentStudentStatus(student) === option;
                        const disabled = !canStudentMark(student) || markMutation.isPending;
                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              const initial = normalizeStatus(student.status);
                              setAttendanceOverrides((prev) => {
                                const next = { ...prev };
                                if (option === initial) delete next[student.attendance_id];
                                else next[student.attendance_id] = option;
                                return next;
                              });
                            }}
                            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                              isActive
                                ? option === "keldi"
                                  ? "bg-green-600 text-white"
                                  : "bg-red-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!lessonStudentsQuery.isLoading && !lessonStudentsQuery.isError ? (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={!hasAttendanceChanges || markMutation.isPending}
            onClick={() => {
              const attendance_records = students
                .filter((student) => canStudentMark(student))
                .map((student) => ({
                  attendance_id: Number(student.attendance_id),
                  status: getCurrentStudentStatus(student),
                }));

              markMutation.mutate(
                {
                  lesson_id: Number(activeLessonId),
                  attendance_records,
                },
                {
                  onSuccess: (res) => {
                    notify("ok", res?.message || "Davomat saqlandi");
                    setAttendanceOverrides({});
                    setSelectedLessonId("");
                    lessonStudentsQuery.refetch();
                    lessonsQuery.refetch();
                    queryClient.invalidateQueries({
                      queryKey: ["monthly-attendance", activeGroupId, selectedMonth],
                    });
                  },
                  onError: (err) => {
                    notify("err", err?.response?.data?.message || "Davomat saqlanmadi");
                  },
                }
              );
            }}
            className="rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {markMutation.isPending ? "Saqlanmoqda..." : "Davomatni saqlash"}
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-4 p-3 sm:p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/attendance" className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{teacher?.full_name || "Teacher Groups"}</h1>
          <p className="text-sm text-gray-600">Teacher guruhlari ro&apos;yxati</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-4">
        <label className="text-sm text-gray-700">
          <span className="mb-1 block font-medium">Day (ixtiyoriy)</span>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 ${day ? "border-[#A60E07] bg-red-50" : "border-gray-300"}`}
          >
            <option value="">Barchasi</option>
            <option value="dushanba">dushanba</option>
            <option value="seshanba">seshanba</option>
          </select>
        </label>

        <label className="text-sm text-gray-700">
          <span className="mb-1 block font-medium">Shift (ixtiyoriy)</span>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 ${shift ? "border-[#A60E07] bg-red-50" : "border-gray-300"}`}
          >
            <option value="">Barchasi</option>
            <option value="morning">kunduzgi</option>
            <option value="evening">kechki</option>
          </select>
        </label>

        <label className="text-sm text-gray-700">
          <span className="mb-1 block font-medium">Date (ixtiyoriy)</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 ${date ? "border-[#A60E07] bg-red-50" : "border-gray-300"}`}
          />
        </label>

        <div className="flex items-end">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setDate("");
                setDay("");
                setShift("");
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Filterlarni tozalash
            </button>
          ) : null}
        </div>
      </div>

      {isLoadingGroups ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 h-5 w-40 rounded bg-gray-200" />
              <div className="mb-2 h-4 w-28 rounded bg-gray-100" />
              <div className="h-4 w-20 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : null}

      {isErrorGroups ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {query.error?.response?.data?.message || query.error?.message || "Guruhlar yuklanmadi"}
        </div>
      ) : null}

      {!isLoadingGroups && !isErrorGroups ? (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {activeGroups.map((group) => {
              const isActive = String(group.group_id) === activeGroupId;
              return (
                <button
                  type="button"
                  key={group.group_id}
                  onClick={() => handleSelectGroup(group.group_id)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-[#A60E07] bg-[#A60E07] text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-[#A60E07]"
                  }`}
                >
                  <div className="text-left leading-tight">
                    <div>{group.group_name}</div>
                    <div className={`text-[11px] font-medium ${isActive ? "text-red-100" : "text-gray-500"}`}>
                      {Array.isArray(group.schedule?.days) && group.schedule.days.length
                        ? group.schedule.days.map(getDayShort).join(", ")
                        : "-"}{" "}
                      {group.schedule?.time ? `• ${group.schedule.time}` : ""}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {!isLoadingGroups && !isErrorGroups && activeGroups.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Guruh topilmadi.
        </div>
      ) : null}

      {activeGroupId ? (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Darslar ro&apos;yxati</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Oy:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
              />
            </div>
          </div>

          {lessonsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-14 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : null}

          {lessonsQuery.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {lessonsQuery.error?.response?.data?.message || lessonsQuery.error?.message || "Darslar yuklanmadi"}
            </div>
          ) : null}

          {!lessonsQuery.isLoading && !lessonsQuery.isError ? (
            <div className="space-y-2">
              {lessons.map((lesson) => {
                const lessonId = String(lesson.id || lesson.lesson_id);
                const isActiveLesson = lessonId === String(activeLessonId);
                const isCompleted = lesson.attendance_completed === true;
                return (
                  <div key={lessonId}>
                    <div
                      className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                        isCompleted
                          ? "border border-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-sm"
                          : "border border-gray-200 bg-white"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {lesson.formatted_date || lesson.date || lesson.lesson_date || "-"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {getWeekdayFromDate(lesson.date || lesson.lesson_date)}{" "}
                          {getWeekdayFromDate(lesson.date || lesson.lesson_date) ? "• " : ""}
                          {getDisplayTime(lesson)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                            isCompleted
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isCompleted ? "davomat qilingan" : "hali qilinmagan"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (isActiveLesson) {
                              setSelectedLessonId("");
                              setAttendanceOverrides({});
                            } else {
                              setSelectedLessonId(lessonId);
                              setAttendanceOverrides({});
                            }
                          }}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                            isActiveLesson ? "bg-gray-700" : "bg-[#A60E07]"
                          }`}
                        >
                          Davom qilish
                        </button>
                      </div>
                    </div>
                    {isActiveLesson ? renderLessonStudentsDropdown() : null}
                  </div>
                );
              })}
            </div>
          ) : null}

          {!lessonsQuery.isLoading && !lessonsQuery.isError && lessons.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center text-sm text-gray-500">
              Tanlangan guruh uchun dars topilmadi.
            </div>
          ) : null}

          <MonthlyAttendanceInline groupId={activeGroupId} selectedMonth={selectedMonth} />
        </div>
      ) : null}

    </div>
  );
}

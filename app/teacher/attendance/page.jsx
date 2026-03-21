"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FunnelIcon } from "@heroicons/react/24/outline";
import {
  useGetMyAttendanceGroups,
  useGetGroupLessons,
  useGetLessonStudents,
  useMarkLessonAttendance,
} from "../../../hooks/attendance";
import { useGetNotify } from "../../../hooks/notify";
import MonthlyAttendanceInline from "../../../components/MonthlyAttendanceInline";
import { useQueryClient } from "@tanstack/react-query";
import { normalizeMonth } from "../../../utils/date";

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const TODAY_DATE = new Date().toISOString().slice(0, 10);
const WEEKDAYS_UZ = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
const STATUS_OPTIONS = ["keldi", "kelmadi"];
const isHolidayFlag = (value) =>
  value === true || value === 1 || value === "1" || value === "true";

function TeacherAttendancePageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const notify = useGetNotify();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(searchParams.get("date") || "");
  const [shift, setShift] = useState(searchParams.get("shift") || "");
  const [selectedMonth, setSelectedMonth] = useState(searchParams.get("month") || CURRENT_MONTH);
  const [selectedGroupId, setSelectedGroupId] = useState(() => {
    if (typeof window === "undefined") return searchParams.get("group_id") || "";
    return searchParams.get("group_id") || localStorage.getItem("attendance-selected-group-teacher") || "";
  });
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [attendanceOverrides, setAttendanceOverrides] = useState({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const hasActiveFilters = Boolean(date || shift);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (date) params.set("date", date); else params.delete("date");
    params.delete("day");
    if (shift) params.set("shift", shift); else params.delete("shift");
    if (selectedMonth) params.set("month", selectedMonth); else params.delete("month");
    if (selectedGroupId) params.set("group_id", String(selectedGroupId)); else params.delete("group_id");
    router.replace(`${pathname}?${params.toString()}`);
  }, [date, shift, selectedMonth, selectedGroupId, pathname, router, searchString]);

  const groupsQuery = useGetMyAttendanceGroups({
    date: date || undefined,
    shift: shift || undefined,
  });

  const groups = useMemo(() => {
    const payload = groupsQuery.data?.data ?? groupsQuery.data;
    const normalizeItem = (item) => {
      if (item?.group) {
        return { ...item.group, students: item.students ?? item.group?.students };
      }
      return item;
    };
    if (Array.isArray(payload)) return payload.map(normalizeItem);
    if (Array.isArray(payload?.groups)) return payload.groups.map(normalizeItem);
    if (Array.isArray(payload?.data)) return payload.data.map(normalizeItem);
    if (payload?.group) return [normalizeItem(payload)];
    return [];
  }, [groupsQuery.data]);

  const activeGroupId = useMemo(() => {
    const selectedExists = groups.some((group) => String(group.group_id || group.id) === String(selectedGroupId));
    if (selectedExists) return String(selectedGroupId);
    const first = groups[0];
    return first ? String(first.group_id || first.id) : "";
  }, [groups, selectedGroupId]);

  const handleSelectGroup = (groupId) => {
    const value = String(groupId);
    setSelectedGroupId(value);
    setSelectedLessonId("");
    setAttendanceOverrides({});
    if (typeof window !== "undefined") {
      localStorage.setItem("attendance-selected-group-teacher", value);
    }
  };

  const getDayShort = (value) => {
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
    return map[String(value || "").toLowerCase()] || String(value || "").slice(0, 2);
  };

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

    const byDate = new Map();
    sorted.forEach((lesson) => {
      const key = String(lesson?.date || lesson?.lesson_date || "");
      if (!key) return;
      const existing = byDate.get(key);
      if (!existing || (!hasValidTime(existing) && hasValidTime(lesson))) {
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

  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null;
    return lessons.find((lesson) => String(lesson.id || lesson.lesson_id) === String(activeLessonId)) || null;
  }, [lessons, activeLessonId]);

  const activeLessonDate = useMemo(() => {
    const raw = activeLesson?.date || activeLesson?.lesson_date || "";
    return String(raw).slice(0, 10);
  }, [activeLesson]);

  const monthlyMonth = useMemo(() => {
    const normalizedSelected = normalizeMonth(selectedMonth);
    if (activeLessonDate && activeLessonDate === TODAY_DATE) {
      return normalizeMonth(activeLessonDate);
    }
    return normalizedSelected;
  }, [activeLessonDate, selectedMonth]);

  useEffect(() => {
    if (activeLessonDate) {
      console.log("[Lesson] date:", activeLessonDate);
    }
  }, [activeLessonDate]);

  const lessonStudentsQuery = useGetLessonStudents(activeLessonId || undefined);
  const markMutation = useMarkLessonAttendance();

  const students = useMemo(() => {
    const payload = lessonStudentsQuery.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.students)) return payload.data.students;
    return [];
  }, [lessonStudentsQuery.data]);

  const normalizeStatus = (status) => {
    if (status === "keldi") return "keldi";
    return "kelmadi";
  };

  const getCurrentStudentStatus = (student) =>
    attendanceOverrides[student.attendance_id] ?? normalizeStatus(student.status);

  const canStudentMark = (student) => Boolean(student.can_mark);

  const hasAttendanceChanges = useMemo(
    () => Object.keys(attendanceOverrides).length > 0,
    [attendanceOverrides]
  );

  const getWeekdayFromDate = (value) => {
    if (!value) return "";
    const dateOnly = String(value).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return "";
    const [y, m, d] = dateOnly.split("-").map(Number);
    const dayIndex = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return WEEKDAYS_UZ[dayIndex] || "";
  };

  const getDisplayTime = (lesson) => {
    const start = String(lesson?.start_time || "").trim();
    const end = String(lesson?.end_time || "").trim();
    if (start && end && start !== "00:00" && end !== "00:00") return `${start} - ${end}`;

    const time = String(lesson?.time || "").trim();
    const match = time.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
    if (match) return `${match[1]} - ${match[2]}`;

    return "Vaqt belgilanmagan";
  };

  const formatMoney = (value) => {
    if (!Number.isFinite(value)) return "-";
    return `${value.toLocaleString("uz-UZ")} so'm`;
  };

  const getPaymentBadge = (student) => {
    const paid = Number(student?.paid_amount);
    const debt = Number(student?.debt_amount);
    if (Number.isFinite(debt) && debt > 0) {
      return { label: `Qarz: ${formatMoney(debt)}`, className: "bg-red-100 text-red-700" };
    }
    if (Number.isFinite(paid) && paid > 0) {
      return { label: `To'langan: ${formatMoney(paid)}`, className: "bg-green-100 text-green-700" };
    }
    if (Number.isFinite(debt) && debt === 0) {
      return { label: `To'langan: ${formatMoney(paid)}`, className: "bg-green-100 text-green-700" };
    }
    return { label: "Ma'lumot yo'q", className: "bg-gray-100 text-gray-700" };
  };

  const isGroupAttendanceDone = (group, targetDate) => {
    const dateOnly = String(targetDate || "").slice(0, 10);
    if (!dateOnly) return false;
    const students = Array.isArray(group?.students)
      ? group.students
      : Array.isArray(group?.group?.students)
        ? group.group.students
        : [];
    return students.some((student) => {
      const records = Array.isArray(student?.attendance_records) ? student.attendance_records : [];
      return records.some(
        (record) => String(record?.date || "").slice(0, 10) === dateOnly && record?.is_marked === true
      );
    });
  };

  const renderLessonStudentsDropdown = () => (
    <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 sm:p-3">
      <div className="flex items-center justify-end">
        <span className="hidden text-[11px] text-gray-500 sm:inline">Lesson ID: {activeLessonId}</span>
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
        <div className="space-y-2">
          <div className="space-y-2 sm:hidden">
            {students.map((student) => {
              const badge = getPaymentBadge(student);
              return (
                <div key={student.attendance_id} className="rounded-lg border border-gray-200 bg-white p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {student.student_name || `${student.surname || ""} ${student.name || ""}`.trim()}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
                        <span className={`rounded-full px-2 py-0.5 font-semibold ${
                          student.monthly_status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {student.monthly_status || "active"}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500">ID: {student.attendance_id}</div>
                  </div>
                  <div className="mt-2">
                    <div className="inline-flex w-full justify-between rounded-xl border border-gray-200 bg-white p-1">
                      {STATUS_OPTIONS.map((option) => {
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
                            className={`flex-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
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
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-2 py-1.5 text-left font-semibold text-gray-600 sm:px-3 sm:py-2">Talaba</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-gray-600 sm:px-3 sm:py-2">Monthly</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-gray-600 sm:px-3 sm:py-2">To'lov</th>
                  <th className="px-2 py-1.5 text-left font-semibold text-gray-600 sm:px-3 sm:py-2">Davomat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {students.map((student) => (
                  <tr key={student.attendance_id}>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                      {student.student_name || `${student.surname || ""} ${student.name || ""}`.trim()}
                    </td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:px-2 sm:py-1 sm:text-xs ${
                        student.monthly_status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {student.monthly_status || "active"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                      {(() => {
                        const badge = getPaymentBadge(student);
                        return (
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:px-2 sm:py-1 sm:text-xs ${badge.className}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                      <div className="inline-flex rounded-xl border border-gray-200 bg-white p-0.5 sm:p-1">
                        {STATUS_OPTIONS.map((option) => {
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
                              className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
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
                    if (activeGroupId && monthlyMonth) {
                      queryClient.invalidateQueries({
                        queryKey: ["monthly-attendance", activeGroupId, monthlyMonth],
                      });
                      queryClient.refetchQueries({
                        queryKey: ["monthly-attendance", activeGroupId, monthlyMonth],
                      });
                    }
                  },
                  onError: (err) => {
                    notify("err", err?.response?.data?.message || "Davomat saqlanmadi");
                  },
                }
              );
            }}
            className="rounded-lg bg-[#A60E07] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-2 sm:text-sm"
          >
            {markMutation.isPending ? "Saqlanmoqda..." : "Davomatni saqlash"}
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-4 p-2 sm:p-4 md:p-6">
      {/* <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Attendance</h1>
        <p className="text-sm text-gray-600">Mening guruhlarim va darslarim</p>
      </div> */}

      <div className="hidden gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid md:grid-cols-4">
        <label className="text-xs text-gray-700 sm:text-sm">
          <span className="mb-1 block font-medium">Sana (ixtiyoriy)</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full rounded-lg border px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm ${date ? "border-[#A60E07] bg-red-50" : "border-gray-300"}`}
          />
        </label>

        <label className="text-xs text-gray-700 sm:text-sm">
          <span className="mb-1 block font-medium">Smena (ixtiyoriy)</span>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className={`w-full rounded-lg border px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm ${shift ? "border-[#A60E07] bg-red-50" : "border-gray-300"}`}
          >
            <option value="">Barchasi</option>
            <option value="morning">kunduzgi</option>
            <option value="evening">kechki</option>
          </select>
        </label>

        <div className="col-span-2 flex items-end md:col-span-1">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setDate("");
                setShift("");
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 sm:w-auto sm:px-4 sm:py-2 sm:text-sm"
            >
              Filterlarni tozalash
            </button>
          ) : null}
        </div>
      </div>

      {groupsQuery.isLoading ? (
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

      {groupsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {groupsQuery.error?.response?.data?.message || groupsQuery.error?.message || "Guruhlar yuklanmadi"}
        </div>
      ) : null}

      {!groupsQuery.isLoading && !groupsQuery.isError ? (
        <div className="sm:rounded-xl sm:border sm:border-gray-200 sm:bg-white sm:p-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {groups.map((group) => {
              const groupId = group.group_id || group.id;
              const isActive = String(groupId) === activeGroupId;
              const markedCount = Number(group.today_marked_students_count ?? 0);
              const activeCount = Number(group.today_active_students_count ?? 0);
              const hasTodayAttendance =
                group.today_attendance_completed === true ||
                group.today_attendance_fully_completed === true ||
                (activeCount > 0 && markedCount >= activeCount);
              return (
                <button
                  type="button"
                  key={groupId}
                  onClick={() => handleSelectGroup(groupId)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                    hasTodayAttendance
                      ? isActive
                        ? "border-emerald-500 bg-emerald-600 text-white"
                        : "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : isActive
                        ? "border-[#A60E07] bg-[#A60E07] text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-[#A60E07]"
                  }`}
                >
                  <div className="text-left leading-tight">
                    <div>{group.group_name || group.name}</div>
                    <div
                      className={`text-[10px] font-medium sm:text-[11px] ${
                        hasTodayAttendance
                          ? isActive
                            ? "text-emerald-100"
                            : "text-emerald-700"
                          : isActive
                            ? "text-red-100"
                            : "text-gray-500"
                      }`}
                    >
                      {Array.isArray(group.schedule?.days) && group.schedule.days.length
                        ? group.schedule.days.map(getDayShort).join(", ")
                        : "-"}{" "}
                      {group.schedule?.time ? `• ${group.schedule.time}` : ""}
                    </div>
                    <div
                      className={`mt-1 text-[10px] ${
                        hasTodayAttendance
                          ? isActive
                            ? "text-emerald-100"
                            : "text-emerald-700"
                          : isActive
                            ? "text-red-100"
                            : "text-gray-500"
                      }`}
                    >
                      {group.subject_name ? `${group.subject_name}` : ""}
                      {group.subject_name ? " • " : ""}
                      {group.room_number ? `Xona ${group.room_number}` : "Xona -"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {!groupsQuery.isLoading && !groupsQuery.isError && groups.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Guruh topilmadi.
        </div>
      ) : null}

      {activeGroupId ? (
        <>
          <div className="space-y-2 sm:space-y-3 sm:rounded-xl sm:border sm:border-gray-200 sm:bg-white sm:p-4">
            <div className="flex items-center justify-between">
              <h2 className="hidden text-base font-bold text-gray-900 sm:block sm:text-lg">Darslar ro&apos;yxati</h2>
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-[11px] sm:text-xs"
                />
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                  className={`rounded-lg border p-1.5 md:hidden ${
                    hasActiveFilters ? "border-[#A60E07] bg-red-50 text-[#A60E07]" : "border-gray-300 text-gray-600"
                  }`}
                  aria-label="Filterni ochish"
                >
                  <FunnelIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            {isMobileFiltersOpen ? (
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 md:hidden">
                <label className="text-xs text-gray-700">
                  <span className="mb-1 block font-medium">Sana</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full rounded-lg border px-2.5 py-1.5 text-xs ${date ? "border-[#A60E07] bg-red-50" : "border-gray-300"}`}
                  />
                </label>
                <label className="text-xs text-gray-700">
                  <span className="mb-1 block font-medium">Smena</span>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className={`w-full rounded-lg border px-2.5 py-1.5 text-xs ${shift ? "border-[#A60E07] bg-red-50" : "border-gray-300"}`}
                  >
                    <option value="">Barchasi</option>
                    <option value="morning">kunduzgi</option>
                    <option value="evening">kechki</option>
                  </select>
                </label>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDate("");
                      setShift("");
                    }}
                    className="col-span-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700"
                  >
                    Filterlarni tozalash
                  </button>
                ) : null}
              </div>
            ) : null}

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
                  const isHoliday = isHolidayFlag(lesson.is_holiday);
                  return (
                    <div key={lessonId}>
                      <div
                        onClick={() => {
                          if (isHoliday) return;
                          if (isActiveLesson) {
                            setSelectedLessonId("");
                            setAttendanceOverrides({});
                          } else {
                            setSelectedLessonId(lessonId);
                            setAttendanceOverrides({});
                          }
                        }}
                        className={`flex items-start justify-between gap-2 rounded-lg px-2.5 py-1.5 sm:items-center sm:px-3 sm:py-2 ${
                          isHoliday
                            ? "border border-orange-400 bg-orange-200 shadow-sm"
                            : isCompleted
                              ? "border border-emerald-300 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-sm"
                              : "border border-gray-200 bg-white hover:bg-gray-50"
                        } ${isHoliday ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                            {lesson.formatted_date || lesson.date || lesson.lesson_date || "-"}
                          </p>
                          <p className="truncate text-[11px] text-gray-600 sm:text-xs">
                            {getWeekdayFromDate(lesson.date || lesson.lesson_date)}{" "}
                            {getWeekdayFromDate(lesson.date || lesson.lesson_date) ? "• " : ""}
                            {getDisplayTime(lesson)}
                          </p>
                          {isHoliday ? (
                            <span className="mt-1 inline-flex items-center rounded-full border border-orange-300 bg-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-900">
                              Dam olish kuni
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isHoliday) return;
                              if (isActiveLesson) {
                                setSelectedLessonId("");
                                setAttendanceOverrides({});
                              } else {
                                setSelectedLessonId(lessonId);
                                setAttendanceOverrides({});
                              }
                            }}
                            disabled={isHoliday}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1.5 sm:text-xs ${
                              isHoliday
                                ? "bg-orange-600"
                                : isActiveLesson
                                  ? "bg-gray-700"
                                  : "bg-[#A60E07]"
                            }`}
                          >
                            {isHoliday ? "Dam" : "Davom qilish"}
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
          </div>

          <MonthlyAttendanceInline groupId={activeGroupId} selectedMonth={monthlyMonth} />
        </>
      ) : null}
    </div>
  );
}

export default function TeacherAttendancePage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-gray-500">Yuklanmoqda...</div>}>
      <TeacherAttendancePageContent />
    </Suspense>
  );
}

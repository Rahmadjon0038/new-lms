"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { instance } from "../../../hooks/api";

const monthLabel = (value) => {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return value || "-";
  const [year, month] = value.split("-").map(Number);
  const months = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ];
  return `${months[month - 1] || month} ${year}`;
};

const dayLabel = (value) => {
  if (!value) return "-";
  const raw = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return String(value);
  const date = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(date.getTime())) return raw;
  const months = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ];
  const weekdays = [
    "Yakshanba",
    "Dushanba",
    "Seshanba",
    "Chorshanba",
    "Payshanba",
    "Juma",
    "Shanba",
  ];
  return `${raw.slice(8, 10)} ${months[date.getMonth()]} ${raw.slice(0, 4)} • ${weekdays[date.getDay()]}`;
};

const formatTimeRange = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "-";

  const normalizeClock = (part) => {
    const match = String(part || "")
      .trim()
      .match(/(\d{2}:\d{2})/);
    return match ? match[1] : String(part || "").trim();
  };

  const cleaned = raw.replace(/[–—]/g, "-");
  const parts = cleaned.split("-").map((part) => part.trim());
  if (parts.length === 2) {
    return `${normalizeClock(parts[0])}-${normalizeClock(parts[1])}`;
  }

  return cleaned;
};

const statusTone = (feedback) => {
  const status = String(feedback || "").toUpperCase();
  if (status === "PERFECT") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "GOOD") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-red-100 text-red-700 border-red-200";
};

const cardTone = (feedback) => {
  const status = String(feedback || "").toUpperCase();
  if (status === "PERFECT") {
    return "border-blue-500 bg-blue-50/60 shadow-blue-100/40";
  }
  if (status === "GOOD") {
    return "border-emerald-500 bg-emerald-50/60 shadow-emerald-100/40";
  }
  return "border-red-500 bg-red-50/60 shadow-red-100/40";
};

const SEEN_REPORTS_STORAGE_KEY = "english-manager-seen-report-ids";

const formatCreatedAt = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const formatScheduleDays = (schedule) => {
  const rawDays = Array.isArray(schedule?.days)
    ? schedule.days
    : Array.isArray(schedule)
      ? schedule
      : [];

  if (!rawDays.length) return "-";

  const dayMap = {
    dushanba: "Du",
    seshanba: "Se",
    chorshanba: "Ch",
    payshanba: "Pa",
    juma: "Ju",
    shanba: "Sh",
    yakshanba: "Ya",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  return rawDays
    .map((day) => dayMap[String(day || "").trim().toLowerCase()] || String(day || "").trim())
    .filter(Boolean)
    .join(", ");
};

const compareLessonDateTime = (left, right) => {
  const leftDate = String(left?.date || "");
  const rightDate = String(right?.date || "");
  if (leftDate !== rightDate) return leftDate.localeCompare(rightDate);
  return String(left?.start_time || "").localeCompare(String(right?.start_time || ""));
};

const DEFAULT_REPORT_COLUMNS = [
  { key: "homework", label: "Homework" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "attendance", label: "Attendance" },
  { key: "participation", label: "Participation" },
];

const normalizeReportColumns = (detail) => {
  const source = Array.isArray(detail?.columns)
    ? detail.columns
    : Array.isArray(detail?.report_data?.columns)
      ? detail.report_data.columns
      : [];
  const columns = source
    .map((column, index) => ({
      key: String(column?.key || `column_${index + 1}`),
      label: String(column?.label || column?.title || column?.name || column?.key || `Column ${index + 1}`),
      enabled: column?.enabled !== false,
    }))
    .filter((column) => column.key);

  const enabledColumns = columns.filter((column) => column.enabled !== false);
  return enabledColumns.length > 0 ? enabledColumns : DEFAULT_REPORT_COLUMNS;
};

const getReportRowValue = (row, key) => {
  const values = row?.values && typeof row.values === "object" ? row.values : {};
  const direct = values[key];
  if (direct !== undefined && direct !== null && direct !== "") return direct;
  const fallback = row?.[key];
  if (fallback !== undefined && fallback !== null && fallback !== "") return fallback;
  return 0;
};

const ReportDetailTable = ({ detail }) => {
  const columns = normalizeReportColumns(detail);

  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-max text-left text-xs">
        <thead className="bg-[#0B4A7A] text-white">
          <tr>
            <th className="whitespace-nowrap px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em]">Students</th>
            {columns.map((column) => (
              <th key={column.key} className="whitespace-nowrap px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em]">
                {column.label}
              </th>
            ))}
            <th className="whitespace-nowrap px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em]">Total</th>
            <th className="whitespace-nowrap px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em]">Percent</th>
            <th className="whitespace-nowrap px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em]">Feedback</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {(detail?.rows || []).map((row) => (
            <tr key={row.student_id}>
              <td className="whitespace-nowrap px-2.5 py-2">
                <div className="font-semibold text-gray-900">{row.student_name || "-"}</div>
              </td>
              {columns.map((column) => (
                <td key={column.key} className="whitespace-nowrap px-2.5 py-2 font-bold text-gray-900">
                  {getReportRowValue(row, column.key)}
                </td>
              ))}
              <td className="whitespace-nowrap px-2.5 py-2 font-bold text-gray-900">{row.total}</td>
              <td className="whitespace-nowrap px-2.5 py-2 font-bold text-gray-900">{row.percent}%</td>
              <td className="whitespace-nowrap px-2.5 py-2">
                <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-black ${statusTone(row.feedback)}`}>
                  {row.feedback}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StatisticsPageLoader = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col items-center gap-3 px-6 py-10">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#A60E07]" />
        <div className="text-sm font-semibold text-gray-500">Yuklanmoqda...</div>
      </div>
    </div>
  );
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const isEnglishReport = (report) => {
  const subject = normalizeText(report?.subject_name);
  return subject.includes("english") || subject.includes("ingliz");
};

// Ixcham, doim ochiq teacher ro'yxati (sidebar ko'rinishida) — qidiruv bilan.
// Avvalgi dropdown-select o'rniga: teacherni ko'rish uchun ochish/yopish shart emas.
const TeacherSidebarPanel = ({ teachers, value, onChange }) => {
  const [search, setSearch] = useState("");

  const filteredTeachers = useMemo(() => {
    const text = normalizeText(search);
    if (!text) return teachers;
    return teachers.filter((teacher) => {
      const teacherName = normalizeText(teacher.teacher_name);
      return teacherName.includes(text) || String(teacher.teacher_id).includes(text);
    });
  }, [teachers, search]);

  return (
    <aside className="mb-4 flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:mb-0 lg:h-full lg:w-72 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:shadow-none">
      <div className="flex items-center gap-2 border-b border-gray-100 p-3">
        <Link
          href="/english-manager"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-[#A60E07] hover:text-[#A60E07]"
          aria-label="Ortga qaytish"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-400">
          Teacher
        </div>
      </div>
      <div className="border-b border-gray-100 p-3">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
          <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Teacher qidirish..."
            className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto p-2 lg:max-h-none lg:flex-1">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
            value === "all"
              ? "bg-[#A60E07]/10 text-[#A60E07]"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span>Barchasi</span>
          {value === "all" ? <span className="text-xs font-black">✓</span> : null}
        </button>

        {filteredTeachers.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm font-medium text-gray-400">
            Natija topilmadi
          </div>
        ) : (
          filteredTeachers.map((teacher) => {
            const active = String(teacher.teacher_id) === String(value);
            return (
              <button
                key={teacher.teacher_id}
                type="button"
                onClick={() => onChange(String(teacher.teacher_id))}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  active
                    ? "bg-[#A60E07]/10 text-[#A60E07]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="truncate">{teacher.teacher_name}</span>
                {active ? <span className="text-xs font-black">✓</span> : null}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default function EnglishManagerStatisticsPage() {
  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [month, setMonth] = useState(currentMonth);
  const [teacherId, setTeacherId] = useState("all");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [detailsByLessonId, setDetailsByLessonId] = useState({});
  const [loadingLessonId, setLoadingLessonId] = useState(null);
  const [error, setError] = useState("");
  const [seenReportIds, setSeenReportIds] = useState(() => new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SEEN_REPORTS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSeenReportIds(new Set(parsed.map((value) => String(value))));
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const persistSeenReportIds = (nextSet) => {
    try {
      window.localStorage.setItem(
        SEEN_REPORTS_STORAGE_KEY,
        JSON.stringify(Array.from(nextSet))
      );
      window.dispatchEvent(new Event("english-manager-seen-report-ids-changed"));
    } catch {
      // ignore localStorage errors
    }
  };

  const markReportSeen = (reportId) => {
    const key = String(reportId);
    setSeenReportIds((current) => {
      if (current.has(key)) return current;
      const next = new Set(current);
      next.add(key);
      persistSeenReportIds(next);
      return next;
    });
  };

  const isAllTeachersMode = teacherId === "all";

  const monthsQuery = useQuery({
    queryKey: ["english-manager-months"],
    queryFn: async () => {
      const response = await instance.get("/api/teacher-statistics/manager/months");
      const months = Array.isArray(response.data?.data) ? response.data.data : [];
      return Array.from(
        new Set(
          [
            ...months.filter((value) => /^\d{4}-\d{2}$/.test(String(value || "").trim())),
            currentMonth,
          ]
        )
      ).sort();
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const availableMonths = useMemo(() => {
    const months = Array.isArray(monthsQuery.data) ? monthsQuery.data : [];
    return months.length ? months : [currentMonth];
  }, [monthsQuery.data, currentMonth]);

  const teachersQuery = useQuery({
    queryKey: ["english-manager-teachers", month],
    queryFn: async () => {
      const response = await instance.get("/api/teacher-statistics/manager/teachers", {
        params: { month },
      });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: !!month,
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const teacherGroupsQuery = useQuery({
    queryKey: ["english-manager-teacher-groups", month, teacherId],
    queryFn: async () => {
      if (teacherId === "all") return [];
      const response = await instance.get(`/api/attendance/teachers/${teacherId}/groups`, {
        params: { month },
      });
      return Array.isArray(response.data?.data?.groups) ? response.data.data.groups : [];
    },
    enabled: !!month && teacherId !== "all",
    staleTime: 2 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  const groupLessonsQuery = useQuery({
    queryKey: ["english-manager-group-lessons", month, selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return null;
      const response = await instance.get(`/api/attendance/groups/${selectedGroupId}/monthly`, {
        params: { month },
      });
      return response.data?.data || null;
    },
    enabled: !!month && !!selectedGroupId,
    staleTime: 2 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  const groupReportsQuery = useQuery({
    queryKey: ["english-manager-group-reports", month, teacherId, selectedGroupId],
    queryFn: async () => {
      const params = { month };
      if (!isAllTeachersMode) {
        if (!selectedGroupId) return [];
        params.group_id = selectedGroupId;
        params.teacher_id = teacherId;
      }
      const response = await instance.get("/api/teacher-statistics/manager/reports", {
        params,
      });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: !!month,
    staleTime: 2 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  const teachers = useMemo(() => teachersQuery.data ?? [], [teachersQuery.data]);
  const teacherGroups = useMemo(
    () => (Array.isArray(teacherGroupsQuery.data) ? teacherGroupsQuery.data : []),
    [teacherGroupsQuery.data]
  );
  const selectedGroup = useMemo(
    () => teacherGroups.find((group) => String(group.group_id) === String(selectedGroupId)) || null,
    [teacherGroups, selectedGroupId]
  );
  const selectedGroupData = useMemo(() => {
    return groupLessonsQuery.data?.group || selectedGroup || null;
  }, [groupLessonsQuery.data, selectedGroup]);
  const selectedGroupTime = useMemo(() => {
    return selectedGroupData?.schedule?.time || selectedGroup?.schedule?.time || "-";
  }, [selectedGroupData, selectedGroup]);
  const selectedLessons = useMemo(
    () => (Array.isArray(groupLessonsQuery.data?.lessons) ? groupLessonsQuery.data.lessons : []),
    [groupLessonsQuery.data]
  );
  const reports = useMemo(
    () => (Array.isArray(groupReportsQuery.data) ? groupReportsQuery.data.filter(isEnglishReport) : []),
    [groupReportsQuery.data]
  );
  const feedbackCounts = useMemo(() => {
    const counts = { PERFECT: 0, GOOD: 0, BAD: 0 };
    for (const report of reports) {
      const key = String(report.feedback || "").toUpperCase();
      if (counts[key] !== undefined) counts[key] += 1;
    }
    return counts;
  }, [reports]);
  const mixedReportsByDay = useMemo(() => {
    if (!isAllTeachersMode) return [];

    const items = [...reports].sort((a, b) => {
      const dateCompare = String(b.lesson_date || "").localeCompare(String(a.lesson_date || ""));
      if (dateCompare !== 0) return dateCompare;
      return String(b.lesson_time || "").localeCompare(String(a.lesson_time || ""));
    });

    const map = new Map();
    for (const report of items) {
      const key = report.lesson_date || "-";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(report);
    }
    return Array.from(map.entries());
  }, [reports, isAllTeachersMode]);
  const loading = monthsQuery.isLoading || teachersQuery.isLoading || teacherGroupsQuery.isLoading || groupReportsQuery.isLoading;
  const monthsLoading = monthsQuery.isLoading;
  const reportError =
    teacherGroupsQuery.error?.response?.data?.message ||
    teacherGroupsQuery.error?.message ||
    groupLessonsQuery.error?.response?.data?.message ||
    groupLessonsQuery.error?.message ||
    groupReportsQuery.error?.response?.data?.message ||
    groupReportsQuery.error?.message ||
    "";

  const toggleDetail = async (lessonId) => {
    const willOpen = expandedLessonId !== lessonId;
    setExpandedLessonId((current) => (current === lessonId ? null : lessonId));
    if (willOpen) markReportSeen(lessonId);
    if (detailsByLessonId[lessonId]) return;
    setLoadingLessonId(lessonId);
    try {
      const response = await instance.get(`/api/teacher-statistics/lessons/${lessonId}`);
      setDetailsByLessonId((current) => ({
        ...current,
        [lessonId]: response.data?.data || null,
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Hisobot yuklanmadi");
    } finally {
      setLoadingLessonId(null);
    }
  };

  const reportMap = useMemo(() => {
    const map = new Map();
    for (const report of reports) {
      map.set(String(report.lesson_id), report);
    }
    return map;
  }, [reports]);

  const mergedLessons = useMemo(() => {
    const items = selectedLessons
      .map((lesson) => ({
        ...lesson,
        report: reportMap.get(String(lesson.lesson_id ?? lesson.id)) || null,
      }))
      .sort(compareLessonDateTime);

    const map = new Map();
    for (const lesson of items) {
      const key = lesson.date || "-";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(lesson);
    }
    return Array.from(map.entries()).sort(([a], [b]) => String(a).localeCompare(String(b)));
  }, [selectedLessons, reportMap]);

  const monthChips = useMemo(() => {
    return availableMonths.length ? availableMonths : [currentMonth];
  }, [availableMonths, currentMonth]);

  useEffect(() => {
    if (isAllTeachersMode) {
      setSelectedGroupId(null);
      setExpandedLessonId(null);
      return;
    }

    if (!teacherGroups.length) {
      setSelectedGroupId(null);
      setExpandedLessonId(null);
      return;
    }

    setSelectedGroupId((current) => {
      const currentExists = current
        ? teacherGroups.some((group) => String(group.group_id) === String(current))
        : false;
      if (currentExists) return current;
      return String(teacherGroups[0].group_id);
    });
    setExpandedLessonId(null);
  }, [teacherGroups, teacherId, month, isAllTeachersMode]);

  return (
    <div className="lg:-m-6 lg:flex lg:h-[calc(100dvh-4rem)]">
      <TeacherSidebarPanel
        teachers={teachers}
        value={teacherId}
        onChange={setTeacherId}
      />

      <div className="min-w-0 space-y-4 sm:space-y-6 lg:flex-1 lg:overflow-y-auto lg:p-6">
        {loading ? <StatisticsPageLoader /> : null}

        {!loading ? (
          <>
            <section className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                Statistika
              </h1>

              <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-[70%] lg:justify-end">
                {monthsLoading && availableMonths.length === 0 ? (
                  <div className="flex h-10 w-24 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#A60E07]" />
                  </div>
                ) : null}
                {monthChips.map((value) => {
                  const isActive = String(value) === String(month);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMonth(value)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "border-[#A60E07] bg-[#A60E07] text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-[#A60E07] hover:text-[#A60E07]"
                      }`}
                    >
                      {monthLabel(value)}
                    </button>
                  );
                })}
              </div>
            </div>

            </section>

            <section className="space-y-4">
        {reportError || error ? (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {reportError || error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.28em] text-gray-400">
                Tanlangan guruh
              </div>
              <div className="mt-1 text-lg font-black text-gray-900">
                {isAllTeachersMode ? "Barcha teacherlar" : selectedGroupData?.group_name || "Guruh tanlang"}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {isAllTeachersMode
                  ? "Filtr tanlanmagan reportlar aralash ko‘rinishda."
                  : `${selectedGroupData?.subject_name || "-"} ${
                      selectedGroupData?.teacher_name ? `• ${selectedGroupData.teacher_name}` : ""
                    }`}
              </div>
            </div>

            {selectedGroupData || isAllTeachersMode ? (
              <div className="flex shrink-0 flex-wrap gap-2 text-xs font-semibold text-gray-600">
                {isAllTeachersMode ? (
                  <>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                      {reports.length} ta report
                    </span>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                      Barchasi
                    </span>
                  </>
                ) : (
                  <>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                      {formatScheduleDays(selectedGroupData.schedule || selectedGroup?.schedule)}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                      {selectedGroupTime}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                      {selectedLessons.length} ta dars
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1.5 font-black ${
                        selectedLessons.length > 0 && reports.length >= selectedLessons.length
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                      title="Yuborilgan report / jami dars"
                    >
                      {reports.length}/{selectedLessons.length} report
                    </span>
                  </>
                )}
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 font-black text-blue-700">
                  {feedbackCounts.PERFECT} PERFECT
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-black text-emerald-700">
                  {feedbackCounts.GOOD} GOOD
                </span>
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 font-black text-red-700">
                  {feedbackCounts.BAD} BAD
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {isAllTeachersMode ? (
          groupReportsQuery.isLoading ? (
            <div className="rounded border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              Reportlar yuklanmoqda...
            </div>
          ) : mixedReportsByDay.length === 0 ? (
            <div className="rounded border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              Bu oy uchun report topilmadi.
            </div>
          ) : (
            <div className="space-y-6">
              {mixedReportsByDay.map(([date, reportsByDay]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center justify-between text-sm font-black text-gray-900">
                    <span>{dayLabel(date)}</span>
                    <span className="text-xs font-bold text-gray-500">{reportsByDay.length} ta</span>
                  </div>

                  <div className="space-y-3">
                    {reportsByDay.map((report) => {
                      const lessonId = report.lessonId ?? report.lesson_id ?? report.id;
                      const detail = detailsByLessonId[lessonId] || null;
                      const reportCreatedTime =
                        report.created_at_label ||
                        report.updated_at_label ||
                        formatCreatedAt(report.created_at || report.updated_at);
                      const isNewReport = !seenReportIds.has(String(report.lesson_id ?? lessonId));
                      const groupName = report.group_name || "-";
                      const subjectName = report.subject_name || "-";
                      const teacherName = report.teacher_name || "-";
                      const scheduleDays = formatScheduleDays(report.group_schedule);
                      const lessonTimeLabel = report.lesson_time || "-";

                      return (
                        <article
                          key={lessonId}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleDetail(lessonId)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleDetail(lessonId);
                            }
                          }}
                          className={`cursor-pointer overflow-hidden rounded border shadow-sm transition hover:shadow-md ${
                            isNewReport
                              ? "border-emerald-500 bg-emerald-50/70 shadow-emerald-100/40"
                              : cardTone(report.feedback)
                          }`}
                        >
                          <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2 text-sm font-black text-gray-900">
                                <span className="truncate">Guruh: {groupName}</span>
                                <span className="text-gray-300">•</span>
                                <span className="truncate">Fan: {subjectName}</span>
                                {isNewReport ? (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="inline-flex items-center rounded-full border border-emerald-500 bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                                      Yangi
                                    </span>
                                  </>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700">
                                <span className="truncate">O&apos;qituvchi: {teacherName}</span>
                                <span className="text-gray-300">•</span>
                                <span className="truncate">Vaqt: {lessonTimeLabel}</span>
                                <span className="text-gray-300">•</span>
                                <span className="truncate">Dars kunlari: {scheduleDays}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                                  Report yuborildi
                                </span>
                                <span className="text-[11px] font-semibold text-gray-400">
                                  {reportCreatedTime}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <span className={`inline-flex rounded border px-3 py-1 text-xs font-black ${statusTone(report.feedback)}`}>
                                {report.feedback}
                              </span>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleDetail(lessonId);
                                }}
                                className="inline-flex items-center gap-2 rounded border border-[#A60E07]/20 bg-[#A60E07]/5 px-3 py-2 text-xs font-bold text-[#A60E07] transition hover:bg-[#A60E07]/10"
                              >
                                <EyeIcon className="h-4 w-4" />
                                {expandedLessonId === lessonId ? "Yopish" : "Ko'rish"}
                              </button>
                            </div>
                          </div>

                          {expandedLessonId === lessonId ? (
                            <div className="bg-slate-50 p-3">
                              {loadingLessonId === lessonId ? (
                                <div className="rounded border border-dashed border-gray-200 bg-white px-4 py-5 text-sm font-semibold text-gray-500">
                                  Hisobot yuklanmoqda...
                                </div>
                              ) : detail ? (
                                <div className="space-y-4">
                                          <ReportDetailTable detail={detail} />
                                </div>
                              ) : (
                                <div className="rounded border border-dashed border-gray-200 bg-white px-4 py-5 text-sm font-semibold text-gray-500">
                                  Hisobot topilmadi.
                                </div>
                              )}
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : teacherGroupsQuery.isLoading ? (
          <div className="rounded border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Guruhlar yuklanmoqda...
          </div>
        ) : teacherGroups.length === 0 ? (
          <div className="rounded border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Bu teacher uchun guruh topilmadi.
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {teacherGroups.map((group) => {
                const active = String(group.group_id) === String(selectedGroupId);
                return (
                  <button
                    key={group.group_id}
                    type="button"
                    onClick={() => setSelectedGroupId(String(group.group_id))}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-[#A60E07] bg-[#A60E07] text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-[#A60E07] hover:text-[#A60E07]"
                    }`}
                  >
                    <span className="max-w-[220px] truncate">
                      {group.group_name || "-"}
                    </span>
                  </button>
                );
              })}
            </div>

            {groupLessonsQuery.isLoading ? (
              <div className="rounded border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                Guruh darslari yuklanmoqda...
              </div>
            ) : !selectedGroupId ? (
              <div className="rounded border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                Guruh tanlang.
              </div>
            ) : mergedLessons.length === 0 ? (
              <div className="rounded border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                Bu guruh uchun bu oy lesson topilmadi.
              </div>
            ) : (
              <div className="space-y-6">
                {mergedLessons.map(([date, lessons]) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center justify-between text-sm font-black text-gray-900">
                      <span>{dayLabel(date)}</span>
                      <span className="text-xs font-bold text-gray-500">{lessons.length} ta</span>
                    </div>

                    <div className="space-y-3">
                      {lessons.map((lesson) => {
                        const lessonId = lesson.lesson_id ?? lesson.id;
                        const report = lesson.report;
                        const lessonHasReport = Boolean(report || lesson.report_sent);
                        const detail = report ? detailsByLessonId[lessonId] : null;
                        const reportCreatedTime =
                          report?.created_at_label ||
                          report?.updated_at_label ||
                          formatCreatedAt(report?.created_at || report?.updated_at);
                        const isNewReport = report ? !seenReportIds.has(String(report.lesson_id)) : false;
                        const groupName = selectedGroupData?.group_name || lesson.group_name || "-";
                        const subjectName = selectedGroupData?.subject_name || lesson.subject_name || "-";
                        const teacherName = selectedGroupData?.teacher_name || lesson.teacher_name || "-";
                        const scheduleDays = formatScheduleDays(selectedGroupData?.schedule || selectedGroup?.schedule);
                        const lessonTimeLabel = report?.lesson_time || selectedGroupTime || "-";

                        if (!lessonHasReport) {
                          return (
                            <article
                              key={lessonId}
                              className="overflow-hidden rounded border border-dashed border-amber-200 bg-amber-50/60 p-4 shadow-sm"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2 text-sm font-black text-gray-900">
                                    <span className="truncate">Guruh: {groupName}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="truncate">Fan: {subjectName}</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700">
                                    <span className="truncate">O&apos;qituvchi: {teacherName}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="truncate">Vaqt: {lessonTimeLabel}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="truncate">Dars kunlari: {scheduleDays}</span>
                                  </div>
                                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-black text-amber-700">
                                    <ClockIcon className="h-4 w-4" />
                                    Report kutilmoqda
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                  <span className="inline-flex rounded border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                                    Kutilmoqda
                                  </span>
                                </div>
                              </div>
                            </article>
                          );
                        }

                        if (!report && lesson.report_sent) {
                          return (
                            <article
                              key={lessonId}
                              role="button"
                              tabIndex={0}
                              onClick={() => toggleDetail(lessonId)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  toggleDetail(lessonId);
                                }
                              }}
                              className="cursor-pointer overflow-hidden rounded border border-sky-200 bg-sky-50/60 shadow-sm transition hover:shadow-md"
                            >
                              <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2 text-sm font-black text-gray-900">
                                    <span className="truncate">Guruh: {selectedGroupData?.group_name || lesson.group_name || "-"}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="truncate">Fan: {selectedGroupData?.subject_name || lesson.subject_name || "-"}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">
                                      Yuborildi
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700">
                                    <span className="truncate">O&apos;qituvchi: {selectedGroupData?.teacher_name || lesson.teacher_name || "-"}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="truncate">Vaqt: {selectedGroupTime}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="truncate">Dars kunlari: {formatScheduleDays(selectedGroupData?.schedule || selectedGroup?.schedule)}</span>
                                  </div>
                                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-black text-sky-700">
                                    <ClockIcon className="h-4 w-4" />
                                    Report yuborilgan
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                  <span className="inline-flex rounded border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">
                                    Ko&apos;rish mumkin
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      toggleDetail(lessonId);
                                    }}
                                    className="inline-flex items-center gap-2 rounded border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                    {expandedLessonId === lessonId ? "Yopish" : "Ko'rish"}
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        }

                        return (
                          <article
                            key={lessonId}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleDetail(lessonId)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                toggleDetail(lessonId);
                              }
                            }}
                            className={`cursor-pointer overflow-hidden rounded border shadow-sm transition hover:shadow-md ${
                              isNewReport
                                ? "border-emerald-500 bg-emerald-50/70 shadow-emerald-100/40"
                                : cardTone(report.feedback)
                            }`}
                          >
                            <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center gap-2 text-sm font-black text-gray-900">
                                  <span className="truncate">Guruh: {groupName}</span>
                                  <span className="text-gray-300">•</span>
                                  <span className="truncate">Fan: {subjectName}</span>
                                  {isNewReport ? (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="inline-flex items-center rounded-full border border-emerald-500 bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                                        Yangi
                                      </span>
                                    </>
                                  ) : null}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700">
                                  <span className="truncate">O&apos;qituvchi: {teacherName}</span>
                                  <span className="text-gray-300">•</span>
                                  <span className="truncate">Vaqt: {lessonTimeLabel}</span>
                                  <span className="text-gray-300">•</span>
                                  <span className="truncate">Dars kunlari: {scheduleDays}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                                    Report yuborildi
                                  </span>
                                  <span className="text-[11px] font-semibold text-gray-400">
                                    {reportCreatedTime}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className={`inline-flex rounded border px-3 py-1 text-xs font-black ${statusTone(report.feedback)}`}>
                                  {report.feedback}
                                </span>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      toggleDetail(lessonId);
                                    }}
                                  className="inline-flex items-center gap-2 rounded border border-[#A60E07]/20 bg-[#A60E07]/5 px-3 py-2 text-xs font-bold text-[#A60E07] transition hover:bg-[#A60E07]/10"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  {expandedLessonId === lessonId ? "Yopish" : "Ko'rish"}
                                </button>
                              </div>
                            </div>

                            {expandedLessonId === lessonId ? (
                              <div className="bg-slate-50 p-3">
                                {loadingLessonId === lessonId ? (
                                  <div className="rounded border border-dashed border-gray-200 bg-white px-4 py-5 text-sm font-semibold text-gray-500">
                                    Hisobot yuklanmoqda...
                                  </div>
                                ) : detail ? (
                                  <div className="space-y-4">
                                    <ReportDetailTable detail={detail} />
                                  </div>
                                ) : (
                                  <div className="rounded border border-dashed border-gray-200 bg-white px-4 py-5 text-sm font-semibold text-gray-500">
                                    Hisobot topilmadi.
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="pt-1 text-xs text-gray-400">
          {isAllTeachersMode
            ? "Barcha teacherlarning reportlari shu yerda aralash ko‘rinishda chiqadi."
            : "Guruhga yuborilgan report va report kutilayotgan lessonlar shu yerda alohida ko‘rinadi."}
        </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDownIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
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

const TeacherFilterSelect = ({ teachers, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = React.useRef(null);

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => String(teacher.teacher_id) === String(value)) || null,
    [teachers, value]
  );

  const filteredTeachers = useMemo(() => {
    const text = normalizeText(search);
    if (!text) return teachers;
    return teachers.filter((teacher) => {
      const teacherName = normalizeText(teacher.teacher_name);
      return teacherName.includes(text) || String(teacher.teacher_id).includes(text);
    });
  }, [teachers, search]);

  const selectTeacher = (teacherId) => {
    onChange(teacherId);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-full sm:min-w-[300px] sm:max-w-[420px]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#A60E07]/40 hover:shadow-md"
      >
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-400">
            Teacher
          </div>
          <div className="truncate text-sm font-bold text-gray-900">
            {value === "all" ? "Barchasi" : selectedTeacher?.teacher_name || "Tanlang"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {value !== "all" ? (
            <span
              role="button"
              tabIndex={0}
              aria-label="Tozalash"
              onClick={(event) => {
                event.stopPropagation();
                onChange("all");
                setOpen(false);
                setSearch("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onChange("all");
                  setOpen(false);
                  setSearch("");
                }
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-[#A60E07] hover:text-[#A60E07]"
            >
              <XMarkIcon className="h-4 w-4" />
            </span>
          ) : null}
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transition ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-40 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="border-b border-gray-100 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Teacher qidirish..."
                className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => selectTeacher("all")}
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
                    onClick={() => selectTeacher(String(teacher.teacher_id))}
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
        </div>
      ) : null}
    </div>
  );
};

export default function EnglishManagerStatisticsPage() {
  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [month, setMonth] = useState(currentMonth);
  const [teacherId, setTeacherId] = useState("all");
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

  const reportsQuery = useQuery({
    queryKey: ["english-manager-reports", month, teacherId],
    queryFn: async () => {
      const params = { month };
      if (teacherId !== "all") params.teacher_id = teacherId;
      const response = await instance.get("/api/teacher-statistics/manager/reports", {
        params,
      });
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: !!month,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const teachers = useMemo(() => teachersQuery.data ?? [], [teachersQuery.data]);
  const reports = useMemo(
    () => (Array.isArray(reportsQuery.data) ? reportsQuery.data.filter(isEnglishReport) : []),
    [reportsQuery.data]
  );
  const loading = monthsQuery.isLoading || teachersQuery.isLoading || reportsQuery.isLoading;
  const monthsLoading = monthsQuery.isLoading;
  const reportError = reportsQuery.error?.response?.data?.message || reportsQuery.error?.message || "";

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

  const groupedByDate = useMemo(() => {
    const map = new Map();
    for (const report of reports) {
      const key = report.lesson_date || "-";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(report);
    }
    return Array.from(map.entries()).sort(([a], [b]) => String(a).localeCompare(String(b)));
  }, [reports]);

  const monthChips = useMemo(() => {
    return availableMonths.length ? availableMonths : [currentMonth];
  }, [availableMonths, currentMonth]);

  return (
    <div className="space-y-4 sm:space-y-6">
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

            <div className="flex flex-col gap-3 sm:max-w-[420px]">
              <div className="text-[11px] font-black uppercase tracking-[0.28em] text-gray-400">
                Teacher
              </div>
              <TeacherFilterSelect
                teachers={teachers}
                value={teacherId}
                onChange={setTeacherId}
              />
            </div>
          </section>

      <section className="space-y-4">
        {loading ? (
          null
        ) : reportError || error ? (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {reportError || error}
          </div>
        ) : groupedByDate.length === 0 ? (
          <div className="rounded border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Bu oy uchun statistika topilmadi.
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByDate.map(([date, items]) => (
              <div key={date} className="space-y-3">
                <div className="text-sm font-black text-gray-900">{dayLabel(date)}</div>
                <div className="space-y-3">
                  {items.map((report) => {
                    const detail = detailsByLessonId[report.lesson_id];
                    const reportCreatedTime =
                      report.created_at_label ||
                      report.updated_at_label ||
                      formatCreatedAt(report.created_at || report.updated_at);
                    const isNewReport = !seenReportIds.has(String(report.lesson_id));
                    const scheduleDays = formatScheduleDays(report.group_schedule);
                    return (
                      <article
                        key={report.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleDetail(report.lesson_id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleDetail(report.lesson_id);
                          }
                        }}
                        className={`cursor-pointer overflow-hidden rounded border shadow-sm transition hover:shadow-md ${
                          isNewReport ? "ring-2 ring-[#A60E07]/20 ring-offset-0" : ""
                        } ${cardTone(report.feedback)}`}
                      >
                        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-sm font-black text-gray-900">
                              <span className="truncate">Teacher: {report.teacher_name || "-"}</span>
                              <span className="text-gray-300">•</span>
                              <span className="truncate">Guruh: {report.group_name || "-"}</span>
                              {isNewReport ? (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="inline-flex items-center rounded-full border border-[#A60E07] bg-[#A60E07]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#A60E07]">
                                    Yangi
                                  </span>
                                </>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700">
                              <span className="truncate">Fan: {report.subject_name || "-"}</span>
                              <span className="text-gray-300">•</span>
                              <span className="truncate">Vaqt: {formatTimeRange(report.lesson_time)}</span>
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
                                toggleDetail(report.lesson_id);
                              }}
                              className="inline-flex items-center gap-2 rounded border border-[#A60E07]/20 bg-[#A60E07]/5 px-3 py-2 text-xs font-bold text-[#A60E07] transition hover:bg-[#A60E07]/10"
                            >
                              <EyeIcon className="h-4 w-4" />
                              {expandedLessonId === report.lesson_id ? "Yopish" : "Ko'rish"}
                            </button>
                          </div>
                        </div>

                        {expandedLessonId === report.lesson_id ? (
                          <div className="bg-slate-50 p-4">
                            {loadingLessonId === report.lesson_id ? (
                              <div className="rounded border border-dashed border-gray-200 bg-white px-4 py-5 text-sm font-semibold text-gray-500">
                                Hisobot yuklanmoqda...
                              </div>
                            ) : detail ? (
                              <div className="space-y-4">
                                <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
                                  <table className="min-w-full text-left text-sm">
                                    <thead className="bg-[#0B4A7A] text-white">
                                      <tr>
                                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.18em]">Students</th>
                                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.18em]">Homework</th>
                                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.18em]">Vocabulary</th>
                                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.18em]">Attendance</th>
                                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.18em]">Participation</th>
                                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.18em]">Total</th>
                                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.18em]">Percent</th>
                                        <th className="px-3 py-3 text-xs font-bold uppercase tracking-[0.18em]">Feedback</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                      {(detail.rows || []).map((row) => (
                                        <tr key={row.student_id}>
                                          <td className="px-3 py-3">
                                            <div className="font-semibold text-gray-900">{row.student_name || "-"}</div>
                                          </td>
                                          <td className="px-3 py-3 font-bold text-gray-900">{row.homework}</td>
                                          <td className="px-3 py-3 font-bold text-gray-900">{row.vocabulary}</td>
                                          <td className="px-3 py-3 font-bold text-gray-900">{row.attendance}</td>
                                          <td className="px-3 py-3 font-bold text-gray-900">{row.participation}</td>
                                          <td className="px-3 py-3 font-bold text-gray-900">{row.total}</td>
                                          <td className="px-3 py-3 font-bold text-gray-900">{row.percent}%</td>
                                          <td className="px-3 py-3">
                                            <span className={`inline-flex rounded border px-3 py-1 text-xs font-black ${statusTone(row.feedback)}`}>
                                              {row.feedback}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
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

        <div className="pt-1 text-xs text-gray-400">
          Yangi hisobot yuborilganda shu sahifa avtomatik yangilanadi.
        </div>
      </section>
        </>
      ) : null}
    </div>
  );
}

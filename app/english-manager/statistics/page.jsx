"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  EyeIcon,
  FunnelIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
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

export default function EnglishManagerStatisticsPage() {
  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [month, setMonth] = useState(currentMonth);
  const [teacherId, setTeacherId] = useState("all");
  const [teachers, setTeachers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [detailsByLessonId, setDetailsByLessonId] = useState({});
  const [loadingLessonId, setLoadingLessonId] = useState(null);

  useEffect(() => {
    let alive = true;

    const loadTeachers = async () => {
      try {
        const response = await instance.get("/api/teacher-statistics/manager/teachers", {
          params: { month },
        });
        if (!alive) return;
        setTeachers(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (_) {
        if (!alive) return;
        setTeachers([]);
      }
    };

    loadTeachers();

    return () => {
      alive = false;
    };
  }, [month]);

  useEffect(() => {
    let alive = true;
    const loadReports = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { month };
        if (teacherId !== "all") params.teacher_id = teacherId;
        const response = await instance.get("/api/teacher-statistics/manager/reports", {
          params,
        });
        if (!alive) return;
        setReports(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || "Statistikalar yuklanmadi");
        setReports([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadReports();

    return () => {
      alive = false;
    };
  }, [month, teacherId]);

  const selectedTeacher = useMemo(
    () => teachers.find((item) => String(item.teacher_id) === String(teacherId)),
    [teachers, teacherId]
  );

  const toggleDetail = async (lessonId) => {
    setExpandedLessonId((current) => (current === lessonId ? null : lessonId));
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
    return Array.from(map.entries());
  }, [reports]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-[2rem] border border-white bg-gradient-to-br from-white via-amber-50 to-orange-50 p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/english-manager" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900">
              <ArrowLeftIcon className="h-4 w-4" />
              Orqaga
            </Link>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900">Statistika jadvali</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600">
              Faqat English teacherlar yuborgan statistika va English guruhlar uchun kunlik yozuvlar.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">Oy</span>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">Teacher</span>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
              >
                <option value="all">Barchasi</option>
                {teachers.map((teacher) => (
                  <option key={teacher.teacher_id} value={teacher.teacher_id}>
                    {teacher.teacher_name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A60E07]/10 text-[#A60E07]">
                <UserGroupIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Teacherlar</div>
                <div className="text-xl font-black text-gray-900">{teachers.length}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CalendarDaysIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Yozuvlar</div>
                <div className="text-xl font-black text-gray-900">{reports.length}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ClockIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Filtr</div>
                <div className="text-sm font-black text-gray-900">
                  {selectedTeacher ? selectedTeacher.teacher_name : monthLabel(month)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-gray-900">Kunlik jadval</h2>
            <p className="text-sm text-gray-500">Sana, vaqt, guruh va teacher bo‘yicha</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#A60E07]/10 px-3 py-1.5 text-xs font-bold text-[#A60E07]">
            <FunnelIcon className="h-4 w-4" />
            {monthLabel(month)}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm font-semibold text-gray-500">Statistikalar yuklanmoqda...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : groupedByDate.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Bu oy uchun statistika topilmadi.
          </div>
        ) : (
          <div className="space-y-5">
            {groupedByDate.map(([date, items]) => (
              <div key={date}>
                <div className="mb-3 text-sm font-black text-gray-900">{dayLabel(date)}</div>
                <div className="overflow-hidden rounded-[1.5rem] border border-gray-100">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[#0B4A7A] text-white">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.2em]">Vaqt</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.2em]">Guruh</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.2em]">Teacher</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.2em]">Holat</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.2em]">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {items.map((report) => (
                        <React.Fragment key={report.id}>
                          <tr>
                            <td className="px-4 py-4 font-semibold text-gray-900">{formatTimeRange(report.lesson_time)}</td>
                            <td className="px-4 py-4">
                              <div className="font-semibold text-gray-900">{report.group_name}</div>
                              <div className="text-xs text-gray-500">{report.subject_name || "English"}</div>
                            </td>
                            <td className="px-4 py-4 text-gray-700">{report.teacher_name || "-"}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusTone(report.feedback)}`}>
                                {report.feedback}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() => toggleDetail(report.lesson_id)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#A60E07]/20 bg-[#A60E07]/5 px-3 py-2 text-xs font-bold text-[#A60E07] transition hover:bg-[#A60E07]/10"
                              >
                                <EyeIcon className="h-4 w-4" />
                                {expandedLessonId === report.lesson_id ? "Yopish" : "Ko'rish"}
                              </button>
                            </td>
                          </tr>
                          {expandedLessonId === report.lesson_id ? (
                            <tr>
                              <td colSpan={5} className="bg-[#F8FAFC] px-4 pb-4">
                                {loadingLessonId === report.lesson_id ? (
                                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-5 text-sm font-semibold text-gray-500">
                                    Hisobot yuklanmoqda...
                                  </div>
                                ) : detailsByLessonId[report.lesson_id] ? (
                                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                      <div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                          Hisobot tafsiloti
                                        </div>
                                        <div className="mt-1 text-sm font-black text-gray-900">
                                          {detailsByLessonId[report.lesson_id].group_name || report.group_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {dayLabel(report.lesson_date)} • {formatTimeRange(report.lesson_time)} • {report.teacher_name || "-"}
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <div className="rounded-2xl bg-gray-50 px-4 py-2">
                                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Total</div>
                                          <div className="text-lg font-black text-gray-900">{detailsByLessonId[report.lesson_id].total}</div>
                                        </div>
                                        <div className="rounded-2xl bg-gray-50 px-4 py-2">
                                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Pct</div>
                                          <div className="text-lg font-black text-gray-900">{detailsByLessonId[report.lesson_id].percent}%</div>
                                        </div>
                                        <div className="rounded-2xl bg-gray-50 px-4 py-2">
                                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">FB</div>
                                          <div className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusTone(detailsByLessonId[report.lesson_id].feedback)}`}>
                                            {detailsByLessonId[report.lesson_id].feedback}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="overflow-hidden rounded-[1.25rem] border border-gray-100">
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
                                          {(detailsByLessonId[report.lesson_id].rows || []).map((row) => (
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
                                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusTone(row.feedback)}`}>
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
                                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-5 text-sm font-semibold text-gray-500">
                                    Hisobot topilmadi.
                                  </div>
                                )}
                              </td>
                            </tr>
                          ) : null}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-400">
          Yangi hisobot yuborilganda shu sahifa avtomatik yangilanadi.
        </div>
      </section>

    </div>
  );
}

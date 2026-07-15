"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ChevronDownIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  useTeacherLateMonth,
  useCreateTeacherLate,
  useDeleteTeacherLate,
} from "../../../hooks/teacher-late";

const asArray = (v) => (Array.isArray(v) ? v : []);
const normalizeText = (v) => String(v || "").toLowerCase().trim();

// Tez qo'shish chiplari (daqiqa)
const MINUTE_CHIPS = [5, 10, 15, 30, 60];
const STEP = 1;

const fmtMinutes = (m) => {
  const n = Number(m) || 0;
  if (n < 60) return `${n} daq`;
  const h = Math.floor(n / 60);
  const r = n % 60;
  return r ? `${h} soat ${r} daq` : `${h} soat`;
};

// "YYYY-MM-DD" -> "DD.MM.YYYY"
const fmtDate = (s) => {
  const m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(s || "");
};

// Mahalliy (local) bugungi sana — YYYY-MM-DD
const localToday = () => {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

// Ism-familiyadan bosh harflar
const initialsOf = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

// Avatar rangi — ism bo'yicha barqaror (hash)
const AVATAR_COLORS = [
  "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500", "bg-violet-500",
  "bg-fuchsia-500", "bg-teal-500", "bg-orange-500", "bg-indigo-500", "bg-lime-600",
];
const avatarColor = (key) => {
  const s = String(key || "");
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

// Kechikish darajasiga qarab rang
const severityOf = (mins) => {
  const n = Number(mins) || 0;
  if (n <= 0) return { pill: "bg-emerald-500 text-white", bar: "bg-emerald-500" };
  if (n <= 30) return { pill: "bg-amber-500 text-white", bar: "bg-amber-500" };
  if (n <= 90) return { pill: "bg-orange-500 text-white", bar: "bg-orange-500" };
  return { pill: "bg-red-600 text-white", bar: "bg-red-600" };
};

const TeacherLateness = () => {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingByTeacher, setPendingByTeacher] = useState({});
  const [noteByTeacher, setNoteByTeacher] = useState({});
  const [dateByTeacher, setDateByTeacher] = useState({});
  const [openByTeacher, setOpenByTeacher] = useState({});

  const lateQuery = useTeacherLateMonth({ month_name: month });
  const createMutation = useCreateTeacherLate();
  const deleteMutation = useDeleteTeacherLate();

  // Oy o'zgarganda tez-qo'shish kiritmalarini tozalaymiz
  React.useEffect(() => {
    setPendingByTeacher({});
    setNoteByTeacher({});
    setDateByTeacher({});
  }, [month]);

  const teachers = useMemo(() => asArray(lateQuery.data?.teachers), [lateQuery.data]);

  const filteredTeachers = useMemo(() => {
    const q = normalizeText(searchTerm);
    if (!q) return teachers;
    return teachers.filter((t) => {
      const name = normalizeText(t?.teacher_name || `#${t?.teacher_id}`);
      return name.includes(q) || normalizeText(t?.teacher_id).includes(q) || normalizeText(t?.phone).includes(q);
    });
  }, [teachers, searchTerm]);

  const monthlyTotalMinutes = useMemo(
    () => teachers.reduce((acc, t) => acc + (Number(t?.total_minutes) || 0), 0),
    [teachers]
  );
  const lateTeacherCount = useMemo(
    () => teachers.filter((t) => (Number(t?.total_minutes) || 0) > 0).length,
    [teachers]
  );

  // Oy chegaralari (date input uchun) va standart sana
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const monthMin = `${month}-01`;
  const monthMax = `${month}-${String(lastDay).padStart(2, "0")}`;
  const defaultDate = month === currentMonth ? localToday() : monthMin;

  const bumpPending = (teacherId, delta) => {
    setPendingByTeacher((prev) => {
      const cur = Number(prev[teacherId]) || 0;
      return { ...prev, [teacherId]: Math.max(0, cur + delta) };
    });
  };

  const toggleOpen = (teacherId) => {
    setOpenByTeacher((prev) => ({ ...prev, [teacherId]: !prev[teacherId] }));
  };

  const handleAdd = async (teacherId) => {
    const minutes = Number(pendingByTeacher[teacherId]) || 0;
    if (minutes <= 0) {
      toast.error("Avval daqiqa qo'shing");
      return;
    }
    const late_date = dateByTeacher[teacherId] || defaultDate;
    try {
      await createMutation.mutateAsync({
        teacher_id: Number(teacherId),
        late_date,
        minutes,
        description: (noteByTeacher[teacherId] || "").trim(),
      });
      setPendingByTeacher((prev) => ({ ...prev, [teacherId]: 0 }));
      setNoteByTeacher((prev) => ({ ...prev, [teacherId]: "" }));
      setOpenByTeacher((prev) => ({ ...prev, [teacherId]: true }));
      toast.success("Kechikish qo'shildi");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Kechikishni saqlashda xatolik");
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Bu yozuv o'chirilsinmi?")) return;
    try {
      await deleteMutation.mutateAsync(recordId);
      toast.success("O'chirildi");
    } catch (err) {
      toast.error(err?.response?.data?.message || "O'chirishda xatolik");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-3 md:p-5">
      <div className="w-full">
        {/* Filtr paneli */}
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-4 sm:p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative w-full flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="O'qituvchi qidirish..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 outline-none transition focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20"
              />
            </div>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20 md:w-44"
            />
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                Kechikkanlar: {lateTeacherCount}
              </span>
              <span className="whitespace-nowrap rounded-lg bg-rose-500 px-2.5 py-1.5 text-xs font-semibold text-white">
                Jami: {fmtMinutes(monthlyTotalMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* Ro'yxat sarlavhasi */}
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-gray-700">
            O'qituvchilar <span className="text-gray-400">({filteredTeachers.length})</span>
          </h3>
        </div>

        {/* Ro'yxat */}
        <div className="space-y-2.5">
          {lateQuery.isLoading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-gray-200 bg-white" />
            ))
          ) : filteredTeachers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
              O'qituvchi topilmadi
            </div>
          ) : (
            filteredTeachers.map((t) => {
              const teacherId = String(t.teacher_id);
              const teacherName = t.teacher_name || `#${teacherId}`;
              const records = asArray(t.records);
              const isOpen = !!openByTeacher[teacherId];
              const pending = Number(pendingByTeacher[teacherId]) || 0;
              const dateVal = dateByTeacher[teacherId] || defaultDate;
              const totalMinutes = Number(t.total_minutes) || 0;
              const totalCount = Number(t.total_count) || 0;
              const sev = severityOf(totalMinutes);

              return (
                <div
                  key={teacherId}
                  className="flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Daraja aksent chizig'i */}
                  <span className={`w-1.5 shrink-0 ${sev.bar}`} />

                  <div className="min-w-0 flex-1">
                    {/* Header — bosilsa tarix ochiladi */}
                    <button
                      type="button"
                      onClick={() => toggleOpen(teacherId)}
                      className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left sm:px-3"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${avatarColor(teacherName)}`}
                      >
                        {initialsOf(teacherName)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{teacherName}</p>
                        {t.phone ? <p className="truncate text-[11px] text-gray-400">{t.phone}</p> : null}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${sev.pill}`}
                      >
                        <ClockIcon className="h-3 w-3" />
                        {totalMinutes > 0 ? fmtMinutes(totalMinutes) : "Yo'q"}
                        {totalCount > 0 ? <span className="opacity-70">· {totalCount} kun</span> : null}
                      </span>
                      <ChevronDownIcon
                        className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Tez qo'shish — ixcham strip */}
                    <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 bg-slate-50/70 px-2.5 py-1.5 sm:px-3">
                      {/* +/- stepper */}
                      <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 bg-white">
                        <button
                          type="button"
                          onClick={() => bumpPending(teacherId, -STEP)}
                          className="flex h-7 w-7 items-center justify-center text-gray-500 transition hover:bg-rose-50 hover:text-rose-600"
                          title={`-${STEP} daqiqa`}
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span
                          className={`min-w-[54px] px-1 text-center text-sm font-bold tabular-nums ${
                            pending > 0 ? "text-[#A60E07]" : "text-gray-300"
                          }`}
                        >
                          {pending}
                          <span className="text-[10px] font-medium"> daq</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => bumpPending(teacherId, STEP)}
                          className="flex h-7 w-7 items-center justify-center text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                          title={`+${STEP} daqiqa`}
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Vaqt chiplari */}
                      {MINUTE_CHIPS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => bumpPending(teacherId, c)}
                          className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 transition hover:border-amber-400 hover:bg-amber-200 active:scale-95"
                        >
                          +{c}
                        </button>
                      ))}

                      {/* Commit qismi — faqat daqiqa qo'shilganda chiqadi */}
                      {pending > 0 ? (
                        <div className="mt-2 w-full space-y-2 border-t border-dashed border-gray-200 pt-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <input
                              type="date"
                              value={dateVal}
                              min={monthMin}
                              max={monthMax}
                              onChange={(e) => setDateByTeacher((prev) => ({ ...prev, [teacherId]: e.target.value }))}
                              className="w-36 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#A60E07]/20"
                            />
                            <button
                              type="button"
                              onClick={() => setPendingByTeacher((prev) => ({ ...prev, [teacherId]: 0 }))}
                              className="ml-auto rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
                            >
                              Tozalash
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdd(teacherId)}
                              disabled={createMutation.isPending}
                              className="rounded-lg bg-[#A60E07] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8a0c06] disabled:opacity-50"
                            >
                              Qo'shish
                            </button>
                          </div>
                          <input
                            type="text"
                            value={noteByTeacher[teacherId] || ""}
                            onChange={(e) => setNoteByTeacher((prev) => ({ ...prev, [teacherId]: e.target.value }))}
                            placeholder="Izoh (ixtiyoriy)"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20"
                          />
                        </div>
                      ) : null}
                    </div>

                    {/* Tarix (dropdown) */}
                    {isOpen ? (
                      <div className="border-t border-gray-100 px-2.5 py-2 sm:px-3">
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          Kechikkan kunlar
                        </p>
                        {records.length === 0 ? (
                          <p className="py-1.5 text-xs text-gray-400">Bu oyda kechikish yo'q.</p>
                        ) : (
                          <div className="space-y-1">
                            {records.map((r) => (
                              <div
                                key={r.id}
                                className="group flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5 transition hover:bg-slate-100"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-[11px] font-bold text-gray-500 ring-1 ring-gray-200">
                                  {String(r.late_date || "").slice(8, 10)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-gray-800">{fmtDate(r.late_date)}</span>
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                      <ClockIcon className="h-2.5 w-2.5" />
                                      {fmtMinutes(r.minutes)}
                                    </span>
                                  </div>
                                  {r.description ? (
                                    <p className="truncate text-[11px] text-gray-500">{r.description}</p>
                                  ) : (
                                    <p className="text-[11px] italic text-gray-300">Izohsiz</p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(r.id)}
                                  disabled={deleteMutation.isPending}
                                  className="shrink-0 rounded-md p-1 text-gray-300 transition hover:bg-rose-100 hover:text-rose-600 disabled:opacity-50"
                                  title="O'chirish"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherLateness;

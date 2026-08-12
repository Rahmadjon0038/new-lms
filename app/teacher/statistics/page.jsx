"use client";

import React, { Suspense, useMemo, useState } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  CheckBadgeIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import { useGetMyAttendanceGroups, useGetGroupLessons, useGetLessonStudents } from "../../../hooks/attendance";
import {
  useColumnCatalog,
  useGroupLessonReports,
  useSaveLessonStatistics,
  useDeleteLessonStatistics,
} from "../../../hooks/teacherStatistics";
import { useGetNotify } from "../../../hooks/notify";
import { formatDateYMD } from "../../../utils/date";

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const TODAY_DATE = new Date().toISOString().slice(0, 10);
const WEEKDAYS_UZ = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
const LAST_COLUMNS_KEY = "teacher-last-report-columns-v1";
const BRAND = "#A60E07";

const DEFAULT_COLUMNS = [
  { key: "homework", label: "Uy vazifasi", max_value: 10, enabled: true, order: 0 },
  { key: "vocabulary", label: "So'z boyligi", max_value: 10, enabled: true, order: 1 },
  { key: "attendance", label: "Davomat", max_value: 5, enabled: true, order: 2 },
  { key: "participation", label: "Faollik", max_value: 10, enabled: true, order: 3 },
];

const getStudentDisplayName = (student) => {
  if (!student) return "-";
  const surname = String(student.surname || "").trim();
  const name = String(student.name || "").trim();
  if (surname && name) return `${surname} ${name}`;
  if (student.student_name) return student.student_name;
  return surname || name || "-";
};

const getWeekdayFromDate = (value) => {
  const dateOnly = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return "";
  const [y, m, d] = dateOnly.split("-").map(Number);
  return WEEKDAYS_UZ[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] || "";
};

const canMutateLesson = (dateStr) => {
  const d = String(dateStr || "").slice(0, 10);
  if (!d) return false;
  return d <= TODAY_DATE;
};

const clampScore = (value, max) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > max) return max;
  return n;
};

const computeRowStats = (columns, values) => {
  const enabled = (columns || []).filter((c) => c.enabled !== false);
  const maxTotal = enabled.reduce((s, c) => s + c.max_value, 0);
  const total = enabled.reduce((s, c) => s + clampScore(values?.[c.key], c.max_value), 0);
  const percent = maxTotal === 0 ? 0 : Math.round((total / maxTotal) * 100);
  const feedback = percent >= 80 ? "PERFECT" : percent >= 60 ? "GOOD" : "BAD";
  return { total, percent, feedback };
};

const feedbackStyles = {
  PERFECT: "bg-blue-100 text-blue-700",
  GOOD: "bg-green-100 text-green-700",
  BAD: "bg-red-100 text-red-700",
};

const attendanceDefaultScore = (status, max) => {
  if (status === "keldi") return max;
  if (status === "kechikdi") return Math.ceil(max / 2);
  return 0;
};

const loadLastColumns = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_COLUMNS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // ignore
  }
  return null;
};

const saveLastColumns = (columns) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_COLUMNS_KEY, JSON.stringify(columns));
  } catch {
    // ignore
  }
};

// ---------- Ustunlarni sozlash modali ----------
function ColumnConfigModal({ columns, catalog, onCancel, onSave }) {
  const [draft, setDraft] = useState(() => columns.map((c) => ({ ...c })));

  const usedKeys = new Set(draft.map((c) => c.key));
  const catalogByKey = useMemo(() => {
    const map = new Map();
    (catalog || []).forEach((entry) => map.set(entry.key, entry));
    return map;
  }, [catalog]);

  const handleAdd = () => {
    const nextEntry = (catalog || []).find((entry) => !usedKeys.has(entry.key));
    if (!nextEntry) return;
    setDraft((prev) => [
      ...prev,
      {
        key: nextEntry.key,
        label: nextEntry.label_uz,
        max_value: nextEntry.default_max_value,
        enabled: true,
        order: prev.length,
      },
    ]);
  };

  const handleRemove = (index) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyChange = (index, newKey) => {
    const entry = catalogByKey.get(newKey);
    setDraft((prev) =>
      prev.map((c, i) =>
        i === index
          ? {
              ...c,
              key: newKey,
              label: entry ? entry.label_uz : c.label,
              max_value: entry ? entry.default_max_value : c.max_value,
            }
          : c
      )
    );
  };

  const handleMaxChange = (index, value) => {
    const n = Math.max(1, Math.min(1000, Number.parseInt(value, 10) || 0));
    setDraft((prev) => prev.map((c, i) => (i === index ? { ...c, max_value: n } : c)));
  };

  const handleToggle = (index) => {
    setDraft((prev) => prev.map((c, i) => (i === index ? { ...c, enabled: !c.enabled } : c)));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 sm:text-base">Ustunlarni sozlash</h3>
            <p className="text-[11px] text-gray-500">Davomat doim ko&apos;rsatiladi</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          <button
            type="button"
            onClick={handleAdd}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs font-semibold"
            style={{ borderColor: BRAND, color: BRAND }}
          >
            <PlusIcon className="h-4 w-4" /> Qo&apos;shish
          </button>

          {draft.map((column, index) => {
            const locked = column.key === "attendance";
            const knownInCatalog = catalogByKey.has(column.key);
            return (
              <div key={`${column.key}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-2.5">
                <div className="flex items-center gap-2">
                  {locked ? (
                    <input
                      value={column.label}
                      disabled
                      className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs text-gray-500"
                    />
                  ) : (
                    <select
                      value={column.key}
                      onChange={(e) => handleKeyChange(index, e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs"
                    >
                      {!knownInCatalog ? (
                        <option value={column.key}>{`${column.label} (eski)`}</option>
                      ) : null}
                      {(catalog || [])
                        .filter((entry) => entry.key === column.key || !usedKeys.has(entry.key))
                        .map((entry) => (
                          <option key={entry.key} value={entry.key}>
                            {entry.label_uz}
                          </option>
                        ))}
                    </select>
                  )}

                  <input
                    type="text"
                    inputMode="numeric"
                    value={column.max_value}
                    onChange={(e) => handleMaxChange(index, e.target.value.replace(/\D/g, ""))}
                    className="w-14 shrink-0 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-xs"
                  />

                  {locked ? (
                    <span className="shrink-0 rounded-full bg-gray-200 px-2 py-1 text-[10px] font-semibold text-gray-600">
                      Majburiy
                    </span>
                  ) : (
                    <>
                      <label className="inline-flex shrink-0 cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={column.enabled !== false}
                          onChange={() => handleToggle(index)}
                          className="h-4 w-4 rounded"
                          style={{ accentColor: BRAND }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="shrink-0 rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={() => onSave(draft.map((c, i) => ({ ...c, order: i })))}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
            style={{ backgroundColor: BRAND }}
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Dars uchun hisobot tahrirlagichi ----------
function LessonReportEditor({ lesson, existingReport, catalog, readOnly, onClose, notify }) {
  const studentsQuery = useGetLessonStudents(lesson.id);
  const saveMutation = useSaveLessonStatistics();

  // existingReport bo'lsa qiymatlar to'liq undan keladi. Yangi hisobotda esa
  // `values` faqat foydalanuvchi qo'lda o'zgartirgan (override) qiymatlarni
  // saqlaydi — davomatga asoslangan default ballar effect orqali emas, balki
  // pastdagi getRowValues() yordamida render paytida hisoblanadi (sinxronizatsiya
  // effektiga umuman ehtiyoj qolmaydi).
  const [gradingEnabled, setGradingEnabled] = useState(() => existingReport?.grading_enabled !== false);
  const [columns, setColumns] = useState(() => existingReport?.columns || loadLastColumns() || DEFAULT_COLUMNS);
  const [values, setValues] = useState(() => {
    if (!existingReport) return {};
    const initial = {};
    (existingReport.rows || []).forEach((row) => {
      initial[row.student_id] = { ...(row.values || {}) };
    });
    return initial;
  });
  const [configOpen, setConfigOpen] = useState(false);

  const students = useMemo(() => {
    const payload = studentsQuery.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }, [studentsQuery.data]);

  const enabledColumns = columns.filter((c) => c.enabled !== false);

  const getRowValues = (student) => {
    const overrides = values[student.student_id];
    const result = {};
    columns.forEach((column) => {
      if (overrides && overrides[column.key] !== undefined) {
        result[column.key] = overrides[column.key];
        return;
      }
      result[column.key] =
        !existingReport && column.key === "attendance"
          ? attendanceDefaultScore(student.status, column.max_value)
          : 0;
    });
    return result;
  };

  const handleScoreChange = (studentId, columnKey, rawValue) => {
    const column = columns.find((c) => c.key === columnKey);
    const max = column?.max_value ?? 10;
    const digits = String(rawValue).replace(/\D/g, "");
    const clamped = digits === "" ? 0 : clampScore(digits, max);
    setValues((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [columnKey]: clamped },
    }));
  };

  const handleSubmit = () => {
    const weekday = getWeekdayFromDate(lesson.date);
    const rows = students.map((student) => ({
      student_id: student.student_id,
      student_name: getStudentDisplayName(student),
      values: getRowValues(student),
    }));

    saveMutation.mutate(
      {
        lesson_id: lesson.id,
        columns,
        rows,
        grading_enabled: gradingEnabled,
        group_name: lesson.group_name || "",
        lesson_label: `${formatDateYMD(lesson.date)}${weekday ? ` • ${weekday}` : ""}`,
      },
      {
        onSuccess: (res) => {
          notify("ok", res?.message || "Statistika saqlandi");
          saveLastColumns(columns);
          onClose();
        },
        onError: (err) => {
          notify("err", err?.response?.data?.message || "Statistika saqlanmadi");
        },
      }
    );
  };

  return (
    <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {!readOnly ? (
          <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setGradingEnabled(true)}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 transition ${
                gradingEnabled ? "bg-white shadow text-[#A60E07]" : "text-gray-500"
              }`}
            >
              <CheckBadgeIcon className="h-4 w-4" /> Baholash
            </button>
            <button
              type="button"
              onClick={() => setGradingEnabled(false)}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 transition ${
                !gradingEnabled ? "bg-white shadow text-[#A60E07]" : "text-gray-500"
              }`}
            >
              <HashtagIcon className="h-4 w-4" /> Ball
            </button>
          </div>
        ) : (
          <span className="text-xs font-semibold text-gray-500">
            {existingReport?.grading_enabled !== false ? "Baholash rejimi" : "Ball rejimi"}
          </span>
        )}

        {!readOnly ? (
          <button
            type="button"
            onClick={() => setConfigOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 hover:border-[#A60E07] hover:text-[#A60E07]"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" /> Ustunlarni sozlash
          </button>
        ) : null}
      </div>

      {studentsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="rounded-lg text-white" style={{ backgroundColor: "#0B4A7A" }}>
                <th className="rounded-l-lg px-2 py-2 text-left font-semibold">Talaba</th>
                {enabledColumns.map((column) => (
                  <th key={column.key} className="w-16 px-1.5 py-2 text-center font-semibold sm:w-20">
                    <div className="whitespace-normal break-words leading-tight">{column.label}</div>
                    <div className="text-[10px] font-normal leading-tight opacity-80">{column.max_value}</div>
                  </th>
                ))}
                <th className="px-2 py-2 text-center font-semibold">Jami</th>
                {gradingEnabled ? (
                  <>
                    <th className="px-2 py-2 text-center font-semibold">%</th>
                    <th className="rounded-r-lg px-2 py-2 text-center font-semibold">Fikr</th>
                  </>
                ) : (
                  <th className="rounded-r-lg px-2 py-2" />
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => {
                const rowValues = getRowValues(student);
                const { total, percent, feedback } = computeRowStats(columns, rowValues);
                return (
                  <tr key={student.student_id}>
                    <td className="px-2 py-1.5 font-medium text-gray-800">{getStudentDisplayName(student)}</td>
                    {enabledColumns.map((column) => (
                      <td key={column.key} className="px-2 py-1.5">
                        <input
                          type="text"
                          inputMode="numeric"
                          disabled={readOnly}
                          value={rowValues[column.key] || ""}
                          onChange={(e) => handleScoreChange(student.student_id, column.key, e.target.value)}
                          placeholder={`0-${column.max_value}`}
                          className="w-14 rounded-lg border border-gray-300 px-1.5 py-1 text-center disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-center font-bold text-gray-900">{total}</td>
                    {gradingEnabled ? (
                      <>
                        <td className="px-2 py-1.5 text-center text-gray-700">{percent}%</td>
                        <td className="px-2 py-1.5 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${feedbackStyles[feedback]}`}>
                            {feedback}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td className="px-2 py-1.5" />
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700"
        >
          {readOnly ? "Yopish" : "Bekor qilish"}
        </button>
        {!readOnly ? (
          <button
            type="button"
            disabled={saveMutation.isPending || studentsQuery.isLoading}
            onClick={handleSubmit}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: BRAND }}
          >
            {saveMutation.isPending ? "Saqlanmoqda..." : existingReport ? "Yangilash" : "Yuborish"}
          </button>
        ) : null}
      </div>

      {configOpen ? (
        <ColumnConfigModal
          columns={columns}
          catalog={catalog}
          onCancel={() => setConfigOpen(false)}
          onSave={(nextColumns) => {
            setColumns(nextColumns);
            setValues((prev) => {
              const next = {};
              Object.keys(prev).forEach((studentId) => {
                const rowValues = {};
                nextColumns.forEach((column) => {
                  rowValues[column.key] = prev[studentId]?.[column.key] ?? 0;
                });
                next[studentId] = rowValues;
              });
              return next;
            });
            setConfigOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function TeacherStatisticsPageContent() {
  const notify = useGetNotify();
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [selectedGroupId, setSelectedGroupId] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("statistics-selected-group-teacher") || "";
  });
  const [expandedLessonId, setExpandedLessonId] = useState("");
  const [expandedMode, setExpandedMode] = useState("edit"); // 'edit' | 'view'
  const [deleteTarget, setDeleteTarget] = useState(null);

  const groupsQuery = useGetMyAttendanceGroups({ month: selectedMonth || undefined });
  const catalogQuery = useColumnCatalog();

  const groups = useMemo(() => {
    const payload = groupsQuery.data?.data ?? groupsQuery.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.groups)) return payload.groups;
    return [];
  }, [groupsQuery.data]);

  const activeGroupId = useMemo(() => {
    const exists = groups.some((g) => String(g.group_id || g.id) === String(selectedGroupId));
    if (exists) return String(selectedGroupId);
    return groups[0] ? String(groups[0].group_id || groups[0].id) : "";
  }, [groups, selectedGroupId]);

  const handleSelectGroup = (groupId) => {
    const value = String(groupId);
    setSelectedGroupId(value);
    setExpandedLessonId("");
    if (typeof window !== "undefined") {
      localStorage.setItem("statistics-selected-group-teacher", value);
    }
  };

  const lessonsQuery = useGetGroupLessons(activeGroupId || undefined, selectedMonth);
  const reportsQuery = useGroupLessonReports(activeGroupId || undefined, selectedMonth);

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
    return [...raw].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [lessonsQuery.data]);

  const reportsByLessonId = useMemo(() => {
    const map = {};
    const payload = reportsQuery.data;
    const raw = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
    raw.forEach((report) => {
      map[report.lesson_id] = report;
    });
    return map;
  }, [reportsQuery.data]);

  const catalog = useMemo(() => {
    const payload = catalogQuery.data?.data ?? catalogQuery.data;
    return Array.isArray(payload) ? payload : [];
  }, [catalogQuery.data]);

  const deleteMutation = useDeleteLessonStatistics();

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: (res) => {
        notify("ok", res?.message || "Statistika o'chirildi");
        setDeleteTarget(null);
        if (expandedLessonId === String(deleteTarget.id)) setExpandedLessonId("");
      },
      onError: (err) => {
        notify("err", err?.response?.data?.message || "Statistika o'chirilmadi");
      },
    });
  };

  return (
    <div className="space-y-4">
      {groupsQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-gray-200 bg-white" />
          ))}
        </div>
      ) : null}

      {!groupsQuery.isLoading ? (
        <div className="sm:rounded-xl sm:border sm:border-gray-200 sm:bg-white sm:p-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {groups.map((group) => {
              const groupId = group.group_id || group.id;
              const isActive = String(groupId) === activeGroupId;
              return (
                <button
                  type="button"
                  key={groupId}
                  onClick={() => handleSelectGroup(groupId)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                    isActive ? "border-[#A60E07] bg-[#A60E07] text-white" : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  {group.group_name || group.name}
                </button>
              );
            })}
            {groups.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                Guruh topilmadi.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeGroupId ? (
        <div className="space-y-2 sm:space-y-3 sm:rounded-xl sm:border sm:border-gray-200 sm:bg-white sm:p-4">
          <div className="flex items-center justify-between">
            <h2 className="hidden text-base font-bold text-gray-900 sm:block sm:text-lg">Darslar ro&apos;yxati</h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setExpandedLessonId("");
              }}
              className="rounded-lg border border-gray-300 px-2 py-1 text-[11px] sm:text-xs"
            />
          </div>

          {lessonsQuery.isLoading || reportsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : lessonsQuery.isError || reportsQuery.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {lessonsQuery.error?.response?.data?.message ||
                reportsQuery.error?.response?.data?.message ||
                lessonsQuery.error?.message ||
                reportsQuery.error?.message ||
                "Darslar yuklanmadi"}
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => {
                const lessonId = String(lesson.id || lesson.lesson_id);
                const report = reportsByLessonId[lesson.id];
                const canMutate = canMutateLesson(lesson.date);
                const isExpanded = expandedLessonId === lessonId;
                const weekday = getWeekdayFromDate(lesson.date);

                let statusBadge = null;
                if (report) {
                  statusBadge = (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Yuborildi
                    </span>
                  );
                } else if (canMutate) {
                  statusBadge = (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      Yuborish mumkin
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                      Yopilgan
                    </span>
                  );
                }

                const canOpen = Boolean(report) || canMutate;
                const openCard = () => {
                  if (!canOpen) return;
                  setExpandedMode(canMutate ? "edit" : "view");
                  setExpandedLessonId((prev) => (prev === lessonId ? "" : lessonId));
                };

                return (
                  <div key={lessonId}>
                    <div
                      onClick={openCard}
                      className={`flex flex-col items-start justify-between gap-2 rounded-lg border px-2.5 py-2 sm:flex-row sm:items-center sm:px-3 ${
                        report ? "border-emerald-300 bg-emerald-50/60" : "border-gray-200 bg-white"
                      } ${canOpen ? "cursor-pointer" : ""}`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                          {formatDateYMD(lesson.date)}
                        </p>
                        <p className="truncate text-[11px] text-gray-600 sm:text-xs">
                          {weekday}
                          {weekday ? " • " : ""}
                          {lesson.start_time || ""}
                          {lesson.end_time ? ` - ${lesson.end_time}` : ""}
                        </p>
                        <div className="mt-1">{statusBadge}</div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {!report && canMutate ? (
                          <span
                            className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white sm:px-3 sm:text-xs"
                            style={{ backgroundColor: BRAND }}
                          >
                            Statistika yuborish
                          </span>
                        ) : null}

                        {report && canMutate ? (
                          <>
                            <PencilSquareIcon className="h-4 w-4 text-gray-400" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget({ id: lesson.id, label: formatDateYMD(lesson.date) });
                              }}
                              className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        ) : null}

                        {report && !canMutate ? (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 sm:text-xs">
                            <EyeIcon className="h-4 w-4" /> Ko&apos;rish
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {isExpanded ? (
                      <LessonReportEditor
                        lesson={{ ...lesson, group_name: groups.find((g) => String(g.group_id || g.id) === activeGroupId)?.group_name }}
                        existingReport={report || null}
                        catalog={catalog}
                        readOnly={expandedMode === "view"}
                        notify={notify}
                        onClose={() => setExpandedLessonId("")}
                      />
                    ) : null}
                  </div>
                );
              })}

              {lessons.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center text-sm text-gray-500">
                  Tanlangan guruh uchun dars topilmadi.
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900">Hisobotni o&apos;chirish</h3>
            <p className="mt-1 text-xs text-gray-600">
              {deleteTarget.label} sanasidagi statistika o&apos;chirilsinmi?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {deleteMutation.isPending ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function TeacherStatisticsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-gray-500">Yuklanmoqda...</div>}>
      <TeacherStatisticsPageContent />
    </Suspense>
  );
}

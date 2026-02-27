"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetNotify } from "../../hooks/notify";
import { useGetLessonStudents, useMarkLessonAttendance } from "../../hooks/attendance";
import { ArrowLeftIcon, CheckCircleIcon, UserIcon } from "@heroicons/react/24/outline";

const MAIN_COLOR = "#A60E07";

const STATUS_OPTIONS = [
  { value: "__unmarked__", label: "Belgilanmagan" },
  { value: "keldi", label: "Keldi" },
  { value: "kelmadi", label: "Kelmadi" },
];

const prettyMonthlyStatus = (value) => {
  if (value === "active") return "Faol";
  if (value === "stopped") return "To'xtatilgan";
  if (value === "frozen") return "Muzlatilgan";
  if (!value) return "Noma'lum";
  return value;
};

function LessonMarkPage({ role = "teacher" }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const notify = useGetNotify();

  const lessonId = Number(params.lesson_id);
  const lessonStatus = searchParams.get("lesson_status");
  const backQuery = searchParams.get("back");
  const backHref = backQuery || `/${role}/attendance`;

  const { data, isLoading, isError, error } = useGetLessonStudents(lessonId);
  const markMutation = useMarkLessonAttendance();

  const students = useMemo(() => {
    if (Array.isArray(data?.data?.students)) return data.data.students;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const [attendanceMap, setAttendanceMap] = useState({});

  const initialStatusMap = useMemo(() => {
    const next = {};
    students.forEach((student) => {
      const current = student?.status;
      next[student.attendance_id] = current === null || current === undefined ? "__unmarked__" : current;
    });
    return next;
  }, [students]);

  const isTeacherClosedLesson = role === "teacher" && lessonStatus === "closed";

  const canEditMap = useMemo(() => {
    const next = {};
    students.forEach((student) => {
      if (role === "admin") {
        next[student.attendance_id] = true;
      } else {
        next[student.attendance_id] = Boolean(student.can_mark) && !isTeacherClosedLesson;
      }
    });
    return next;
  }, [students, role, isTeacherClosedLesson]);

  const hasAnyEditable = useMemo(
    () => students.some((student) => canEditMap[student.attendance_id]),
    [students, canEditMap]
  );

  const hasChanges = useMemo(() => {
    return Object.entries(attendanceMap).some(([attendanceId, value]) => {
      const initial = initialStatusMap[attendanceId] ?? "__unmarked__";
      return initial !== value;
    });
  }, [attendanceMap, initialStatusMap]);

  const handleStatusChange = (attendanceId, value) => {
    const initial = initialStatusMap[attendanceId] ?? "__unmarked__";
    setAttendanceMap((prev) => {
      const next = { ...prev };
      if (value === initial) {
        delete next[attendanceId];
      } else {
        next[attendanceId] = value;
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!hasChanges) {
      notify("multi", "Saqlash uchun o'zgarish topilmadi");
      return;
    }

    const attendance_records = students
      .filter((student) => canEditMap[student.attendance_id])
      .map((student) => ({
        attendance_id: Number(student.attendance_id),
        status: attendanceMap[student.attendance_id] ?? initialStatusMap[student.attendance_id] ?? "__unmarked__",
      }))
      .filter((item) => item.status !== "__unmarked__");

    markMutation.mutate(
      {
        lesson_id: lessonId,
        attendance_records,
      },
      {
        onSuccess: (response) => {
          notify("ok", response?.message || "Davomat saqlandi");
        },
        onError: (err) => {
          notify("err", err?.response?.data?.message || "Davomatni saqlab bo'lmadi");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-52 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-100" />
          <div className="h-10 w-full rounded bg-gray-100" />
          <div className="h-10 w-full rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error?.response?.data?.message || error?.message || "Talabalar ro'yxatini yuklab bo'lmadi"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-700"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dars davomatini belgilash</h1>
          <p className="text-sm text-gray-600">Lesson ID: {lessonId}</p>
        </div>
      </div>

      {isTeacherClosedLesson ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          Bu dars yopilgan (`closed`). O&apos;qituvchi uchun tahrirlash bloklangan.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Talaba</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Telefon</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Monthly status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {students.map((student) => {
                const attendanceId = student.attendance_id;
                const currentValue = attendanceMap[attendanceId] ?? initialStatusMap[attendanceId] ?? "__unmarked__";
                const canEdit = Boolean(canEditMap[attendanceId]);

                return (
                  <tr key={attendanceId}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 p-1.5 text-gray-500">
                          <UserIcon className="h-4 w-4" />
                        </span>
                        <span className="font-medium text-gray-900">{student.student_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{student.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        student.monthly_status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {student.monthly_status_description || prettyMonthlyStatus(student.monthly_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={currentValue}
                        disabled={markMutation.isPending || !canEdit}
                        onChange={(e) => handleStatusChange(attendanceId, e.target.value)}
                        className={`w-44 rounded-lg border px-3 py-2 text-sm ${
                          currentValue === "keldi"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : currentValue === "kelmadi"
                              ? "border-rose-300 bg-rose-50 text-rose-700"
                              : "border-amber-300 bg-amber-50 text-amber-700"
                        } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {!canEdit ? (
                        <p className="mt-1 text-xs text-gray-500">Readonly (`can_mark=false`)</p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={markMutation.isPending || !hasChanges || !hasAnyEditable}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: MAIN_COLOR }}
        >
          {markMutation.isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <CheckCircleIcon className="h-5 w-5" />
          )}
          Saqlash
        </button>
      </div>
    </div>
  );
}

export default LessonMarkPage;

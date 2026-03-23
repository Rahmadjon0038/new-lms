"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ChevronDownIcon, ChevronUpIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { instance } from "../../../hooks/api";
import {
  useCloseTeacherSalaryMonth,
  useCreateTeacherAdvance,
  useCreateTeacherGiven,
  useTeacherSalaryMonthTeachers,
  useUpdateTeacherSalarySetting,
} from "../../../hooks/teacher-salary";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.teachers)) return value.teachers;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const num = (obj, keys, fallback = 0) => {
  for (const key of keys) {
    const v = obj?.[key];
    if (v !== undefined && v !== null && v !== "") return Number(v) || 0;
  }
  return fallback;
};

const fmtMoney = (n) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  }).format(Number(n) || 0);

const normalizeText = (v) => String(v || "").toLowerCase().trim();
const getTeacherId = (t) => String(t?.teacher_id || t?.id || t?.teacher?.id || t?.teacher?.teacher_id || "");
const getTeacherName = (t, teacherId = "") =>
  t?.teacher_name ||
  t?.full_name ||
  t?.teacher?.full_name ||
  `${t?.surname || t?.teacher?.surname || ""} ${t?.name || t?.teacher?.name || ""}`.trim() ||
  `#${teacherId || "-"}`;

const digitsOnly = (v) => String(v || "").replace(/\D/g, "");

const fmtNumberInput = (raw) => {
  const clean = digitsOnly(raw);
  if (!clean) return "";
  return Number(clean).toLocaleString("uz-UZ");
};

const paymentStateLabel = (state) => {
  if (state === "paid") return "To'liq to'lagan";
  if (state === "partial") return "Qisman to'lagan";
  return "To'lamagan";
};

const paymentStateStyle = (state) => {
  if (state === "paid") return "bg-emerald-100 text-emerald-700";
  if (state === "partial") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
};

const salaryStatusLabel = (isClosed) => (isClosed ? "Yopilgan" : "Ochiq");

const salaryStatusStyle = (isClosed) =>
  isClosed
    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
    : "bg-amber-100 text-amber-700 ring-1 ring-amber-200";

const getRowToneClass = (teacher) => {
  const isClosed = Boolean(teacher?.is_closed);
  const payableNow = num(teacher, ["available_balance", "final_salary", "close_balance"]);
  if (!isClosed) return "bg-white";
  if (payableNow <= 0) return "bg-emerald-50";
  return "bg-amber-50";
};

const resolveCanGive = (teacher, payableNow) => {
  const hasPayableNow = payableNow > 0;
  if (typeof teacher?.can_give === "boolean") return teacher.can_give || hasPayableNow;
  if (typeof teacher?.can_give_after_close === "boolean") return teacher.can_give_after_close || hasPayableNow;
  return hasPayableNow;
};

const TeacherPayments = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState("");
  const [salaryPercentByTeacher, setSalaryPercentByTeacher] = useState({});
  const [advanceByTeacher, setAdvanceByTeacher] = useState({});
  const [givenDoneByTeacher, setGivenDoneByTeacher] = useState({});
  const [openDetailsByTeacher, setOpenDetailsByTeacher] = useState({});
  const [openPercentByTeacher, setOpenPercentByTeacher] = useState({});
  const [openAdvanceByTeacher, setOpenAdvanceByTeacher] = useState({});
  const [resetByTeacher, setResetByTeacher] = useState({});
  const [openStudentsByTeacher, setOpenStudentsByTeacher] = useState({});

  const teachersMonthlyQuery = useTeacherSalaryMonthTeachers({ month_name: month });

  const updateSettingMutation = useUpdateTeacherSalarySetting();
  const createAdvanceMutation = useCreateTeacherAdvance();
  const createGivenMutation = useCreateTeacherGiven();
  const closeMutation = useCloseTeacherSalaryMonth();

  const monthlyTeachers = useMemo(() => asArray(teachersMonthlyQuery.data), [teachersMonthlyQuery.data]);
  const filteredTeachers = useMemo(() => {
    const q = normalizeText(searchTerm);
    if (!q) return monthlyTeachers;
    return monthlyTeachers.filter((t) => {
      const teacherId = getTeacherId(t);
      const teacherName = getTeacherName(t, teacherId);
      return normalizeText(teacherId).includes(q) || normalizeText(teacherName).includes(q);
    });
  }, [monthlyTeachers, searchTerm]);

  React.useEffect(() => {
    if (!monthlyTeachers.length) return;
    setSalaryPercentByTeacher((prev) => {
      const next = { ...prev };
      monthlyTeachers.forEach((t) => {
        const teacherId = getTeacherId(t);
        if (!teacherId) return;
        if (next[teacherId] === undefined) {
          next[teacherId] = String(num(t, ["salary_percentage"], 0));
        }
      });
      return next;
    });

    setAdvanceByTeacher((prev) => {
      const next = { ...prev };
      monthlyTeachers.forEach((t) => {
        const teacherId = getTeacherId(t);
        if (!teacherId) return;
        if (!next[teacherId]) {
          next[teacherId] = { amount: "", description: "" };
        }
      });
      return next;
    });

    setGivenDoneByTeacher((prev) => {
      const next = { ...prev };
      monthlyTeachers.forEach((t) => {
        const teacherId = getTeacherId(t);
        if (!teacherId) return;
        const payableNow = num(t, ["available_balance", "final_salary", "close_balance"]);
        if (payableNow > 0) next[teacherId] = false;
        else if (next[teacherId] === undefined) next[teacherId] = false;
      });
      return next;
    });
  }, [monthlyTeachers]);

  const handleUpdatePercent = async (teacherId) => {
    const parsed = Number(salaryPercentByTeacher[String(teacherId)]);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      toast.error("Foiz 0-100 oralig'ida bo'lishi kerak");
      return;
    }

    try {
      await updateSettingMutation.mutateAsync({
        teacherId,
        salary_percentage: parsed,
      });
      setOpenPercentByTeacher((prev) => ({ ...prev, [String(teacherId)]: false }));
      toast.success("Foiz yangilandi");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Foizni yangilashda xatolik");
    }
  };

  const handleCreateAdvance = async (teacherId, canGiveAdvance) => {
    if (canGiveAdvance === false) {
      toast.error("Bu o'qituvchiga avans berib bo'lmaydi");
      return;
    }

    const rowAdvance = advanceByTeacher[String(teacherId)] || { amount: "", description: "" };
    if (!rowAdvance.amount) {
      toast.error("Avans summasini kiriting");
      return;
    }

    try {
      await createAdvanceMutation.mutateAsync({
        teacher_id: Number(teacherId),
        month_name: month,
        amount: Number(rowAdvance.amount),
        description: rowAdvance.description || "",
      });
      setAdvanceByTeacher((prev) => ({
        ...prev,
        [String(teacherId)]: { amount: "", description: "" },
      }));
      setOpenAdvanceByTeacher((prev) => ({ ...prev, [String(teacherId)]: false }));
      toast.success("Avans qo'shildi");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Avans qo'shishda xatolik");
    }
  };

  const handleCloseMonth = async (teacherId, isClosed) => {
    if (isClosed) {
      toast.error("Bu oy allaqachon yopilgan");
      return;
    }

    try {
      await closeMutation.mutateAsync({
        month_name: month,
        teacher_id: Number(teacherId),
      });
      toast.success("Oy muvaffaqiyatli yopildi");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Oyni yopishda xatolik");
    }
  };

  const handleCreateGiven = async (teacherId, teacherRow) => {
    const payableNow = num(teacherRow, ["available_balance", "final_salary", "close_balance"]);
    const canGive = resolveCanGive(teacherRow, payableNow);

    if (!canGive) {
      toast.error("Hozir berib bo'lmaydi");
      return;
    }

    try {
      const payload = {
        teacher_id: Number(teacherId),
        month_name: month,
      };

      await createGivenMutation.mutateAsync({
        ...payload,
      });
      setGivenDoneByTeacher((prev) => ({
        ...prev,
        [String(teacherId)]: true,
      }));
      toast.success("Berildi muvaffaqiyatli saqlandi");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Berilgan summani saqlashda xatolik");
    }
  };

  const handleResetPayouts = async (teacherId) => {
    if (!teacherId) return;
    try {
      const result = await instance.post(
        `/api/teacher-salary/months/${encodeURIComponent(month)}/teachers/${teacherId}/reset-payouts`
      );
      toast.success(result?.data?.message || "Oylik ma'lumotlari tozalandi");
      setResetByTeacher((prev) => ({ ...prev, [String(teacherId)]: true }));
      teachersMonthlyQuery.refetch();
    } catch (err) {
      toast.error(err?.message || "Oylik ma'lumotlarini tozalashda xatolik");
    }
  };

  const toggleStudents = (teacherId) => {
    setOpenStudentsByTeacher((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  const toggleDetails = (teacherId) => {
    setOpenDetailsByTeacher((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  const togglePercentEdit = (teacherId) => {
    setOpenPercentByTeacher((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  const toggleAdvanceEdit = (teacherId) => {
    setOpenAdvanceByTeacher((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  const handleResetAdvances = async (teacherId) => {
    try {
      const res = await instance.post(
        `/api/teacher-salary/months/${month}/teachers/${teacherId}/reset-advances`
      );
      const message = res?.data?.message || "Teacher avanslari 0 ga qaytarildi";
      toast.success(message);
      setAdvanceByTeacher((prev) => ({
        ...prev,
        [teacherId]: { amount: "", description: "" },
      }));
      teachersMonthlyQuery.refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Avanslarni tozalashda xatolik");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-3 md:p-5">
      <div className="w-full">
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-4 sm:p-4">
          <div className="mb-3 flex flex-col items-start gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">O'qituvchilar oyligi</h2>
              <p className="text-xs text-slate-600 sm:text-sm">Qidiruv va oy bo'yicha filtr</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700 sm:px-3 sm:text-xs">
              {month}
            </span>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
             <div className="w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="O'qituvchi"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20 sm:px-3.5 sm:py-2.5 sm:text-base"
              />
            </div>
            <div className="w-full md:w-56">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20 sm:px-3.5 sm:py-2.5 sm:text-base"
              />
            </div>
          </div>
        </div>

        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-800 sm:mb-3 sm:text-base">Oylik jadvali ({month})</h3>
          <div className="space-y-3">
            {teachersMonthlyQuery.isLoading ? (
              <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-500">Yuklanmoqda...</div>
            ) : filteredTeachers.length === 0 ? (
              <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-500">Ma'lumot topilmadi</div>
            ) : (
              filteredTeachers.map((t, i) => {
                const teacherId = getTeacherId(t);
                const teacherName = getTeacherName(t, teacherId);
                const rowAdvance = advanceByTeacher[teacherId] || { amount: "", description: "" };
                const students = asArray(t.students);
                const isStudentsOpen = !!openStudentsByTeacher[teacherId];
                const isDetailsOpen = !!openDetailsByTeacher[teacherId];
                const payableNow = num(t, ["available_balance", "final_salary", "close_balance"]);
                const canGive = resolveCanGive(t, payableNow);
                const isGivenDone = Boolean(givenDoneByTeacher[teacherId]);
                const isReset = Boolean(resetByTeacher[String(teacherId)]);
                const computedGiven =
                  num(t, ["total_given", "given_total", "total_payout"]) ||
                  (num(t, ["expected_salary", "close_expected_salary"]) +
                    num(t, ["post_close_collected_salary"]));
                const totalGivenDisplay = isReset ? 0 : computedGiven;
                return (
                  <div key={`${teacherId}-${i}`} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleDetails(teacherId)}
                      className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left sm:gap-3 sm:py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 sm:text-base">{teacherName}</p>
                        {/* <p className="text-[12px] text-gray-500">ID: {teacherId || "-"}</p> */}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${salaryStatusStyle(t?.is_closed)}`}>
                          {salaryStatusLabel(t?.is_closed)}
                        </span>
                        {isDetailsOpen ? (
                          <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </button>

                    {isDetailsOpen && (
                      <div className="border-t border-gray-200 px-3 pb-3 pt-3">
                        <p className="mb-2 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base">Qisqa ma'lumot</p>
                        <div className="flex flex-col gap-2 text-xs sm:text-sm">
                          <div className="rounded-md bg-emerald-50 px-3 py-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <span className="text-gray-600">Oylik foizi:</span>{" "}
                                <span className="font-semibold text-gray-900">{num(t, ["salary_percentage"])}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => togglePercentEdit(teacherId)}
                                  className="rounded-md p-1 text-gray-500 hover:bg-emerald-100 hover:text-gray-700"
                                  title="Foizni o'zgartirish"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            {openPercentByTeacher[teacherId] && (
                              <div className="mt-2 flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={salaryPercentByTeacher[teacherId] ?? ""}
                                  onChange={(e) =>
                                    setSalaryPercentByTeacher((prev) => ({
                                      ...prev,
                                      [teacherId]: e.target.value,
                                    }))
                                  }
                                  placeholder="Foiz"
                                  className="w-20 rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[#A60E07]/20 sm:w-24 sm:text-sm"
                                />
                                <button
                                  onClick={() => handleUpdatePercent(teacherId)}
                                  disabled={updateSettingMutation.isPending}
                                  className="rounded-md bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-50 sm:text-xs"
                                >
                                  Saqlash
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="rounded-md bg-slate-50 px-3 py-2.5">
                            <span className="text-gray-600">Jami tushum:</span>{" "}
                            <span className="font-semibold text-gray-900">{fmtMoney(num(t, ["total_collected", "close_revenue"]))}</span>
                          </div>
                          <div className="rounded-md bg-slate-50 px-3 py-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <span className="text-gray-600">Jami avans:</span>{" "}
                                <span className="font-semibold text-gray-900">{fmtMoney(num(t, ["total_advances"]))}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleAdvanceEdit(teacherId)}
                                className="rounded-md p-1 text-gray-500 hover:bg-slate-100 hover:text-gray-700"
                                title="Avansni o'zgartirish"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResetAdvances(teacherId)}
                                className="rounded-md p-1 text-gray-500 hover:bg-rose-100 hover:text-rose-600"
                                title="Avanslarni tozalash"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                            {openAdvanceByTeacher[teacherId] && (
                              <div className="mt-2 flex items-center gap-2">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={fmtNumberInput(rowAdvance.amount)}
                                  onChange={(e) =>
                                    setAdvanceByTeacher((prev) => ({
                                      ...prev,
                                      [teacherId]: { ...rowAdvance, amount: digitsOnly(e.target.value) },
                                    }))
                                  }
                                  placeholder="Avans summasi"
                                  className="w-28 rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[#A60E07]/20 sm:w-32 sm:text-sm"
                                />
                                <button
                                  onClick={() => handleCreateAdvance(teacherId, t?.can_give_advance)}
                                  disabled={createAdvanceMutation.isPending || t?.can_give_advance === false}
                                  className="rounded-md bg-orange-600 px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-50 sm:text-xs"
                                >
                                  Saqlash
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="rounded-md bg-slate-50 px-3 py-2.5">
                            <span className="text-gray-600">O'quvchilar holati:</span>{" "}
                            <span className="text-gray-700">
                              To'langan: {num(t, ["paid_students_count", "paid_students"])} • Qisman: {num(t, ["partial_students_count"])} • To'lanmagan: {num(t, ["unpaid_students_count", "unpaid_students"])}
                            </span>
                          </div>
                          <div className="rounded-md bg-slate-50 px-3 py-2.5">
                            <span className="text-gray-600">Kutilgan oylik:</span>{" "}
                            <span className="font-semibold text-gray-900">{fmtMoney(num(t, ["expected_salary", "close_expected_salary"]))}</span>
                          </div>
                        </div>

                        <p className="mt-4 mb-2 text-sm font-semibold text-gray-900 sm:mt-6 sm:mb-3 sm:text-base">Amallar</p>
                        <div className="flex flex-col gap-2.5">
                          <div className="rounded-xl border border-gray-200 p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Oyni yakunlash</p>
                                <p className="text-base text-gray-500 sm:text-lg">
                                  
                                  <span className="font-semibold text-gray-700">{fmtMoney(num(t, ["expected_salary", "close_expected_salary"]))}</span>
                                </p>
                              </div>
                              <button
                                onClick={() => handleCloseMonth(teacherId, t?.is_closed)}
                                disabled={closeMutation.isPending || t?.is_closed}
                                className="w-full rounded-md bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50 sm:w-auto sm:text-sm"
                              >
                                Oylikni yopish
                              </button>
                            </div>
                          </div>

                          <div className="rounded-xl border border-gray-200 p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">Oylik berilgandan keyin yig'ilgan summa</p>
                                <div className="text-base font-semibold text-gray-900 sm:text-lg">
                                  {fmtMoney(num(t, ["post_close_collected_salary"]))}
                                </div>
                              </div>
                              <button
                                onClick={() => handleCreateGiven(teacherId, t)}
                                disabled={createGivenMutation.isPending || !canGive || isGivenDone}
                                className={`w-full rounded-md px-3 py-2 text-xs font-semibold text-white sm:w-auto sm:text-sm ${
                                  isGivenDone ? "bg-emerald-600" : "bg-blue-600"
                                } disabled:opacity-50`}
                              >
                                {isGivenDone ? "Belgilangan" : "Summa berish"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {t?.is_closed && (
                          <div className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs sm:text-sm">
                            <span className="text-gray-600">Jami berilgan (oylik + Oylik berilgandan keyin yig'ilgan summa):</span>{" "}
                            <span className="font-semibold text-gray-900">
                              {fmtMoney(totalGivenDisplay)}
                            </span>
                          </div>
                        )}

                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => handleResetPayouts(teacherId)}
                            className="w-full rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 sm:text-sm"
                          >
                            Oylik ma'lumotlarini tozalash
                          </button>
                        </div>

                        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-2.5">
                          <button
                            onClick={() => toggleStudents(teacherId)}
                            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 sm:text-sm"
                          >
                            {isStudentsOpen ? "O'quvchilarni yopish" : "O'quvchilarni ko'rish"}
                          </button>
                        </div>

                        {isStudentsOpen && (
                          <div className="mt-2 overflow-x-auto rounded-md border border-gray-200">
                            <table className="min-w-[560px] w-full text-[11px] sm:min-w-[640px] sm:text-xs">
                              <thead>
                                <tr className="border-b text-left text-gray-500">
                                  <th className="py-1.5 pr-2 pl-2 sm:py-2">ID</th>
                                  <th className="py-1.5 pr-2 sm:py-2">F.I.Sh</th>
                                  <th className="py-1.5 pr-2 sm:py-2">Holat</th>
                                  <th className="py-1.5 pr-2 sm:py-2">Kerakli summa</th>
                                  <th className="py-1.5 pr-2 sm:py-2">To'lagan summa</th>
                                </tr>
                              </thead>
                              <tbody>
                                {students.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="py-2 pl-2 text-gray-500">O'quvchi topilmadi</td>
                                  </tr>
                                ) : (
                                  students.map((s) => (
                                    <tr key={String(s.student_id)} className="border-b border-gray-100">
                                      <td className="py-1.5 pr-2 pl-2 sm:py-2">{s.student_id}</td>
                                      <td className="py-1.5 pr-2 sm:py-2">{s.full_name || `${s.surname || ""} ${s.name || ""}`.trim()}</td>
                                      <td className="py-1.5 pr-2 sm:py-2">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px] ${paymentStateStyle(s.payment_state)}`}>
                                          {paymentStateLabel(s.payment_state)}
                                        </span>
                                      </td>
                                      <td className="py-1.5 pr-2 sm:py-2">{fmtMoney(num(s, ["required_amount"]))}</td>
                                      <td className="py-1.5 pr-2 sm:py-2">{fmtMoney(num(s, ["paid_amount"]))}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPayments;

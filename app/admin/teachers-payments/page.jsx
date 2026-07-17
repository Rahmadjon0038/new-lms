"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ChevronDownIcon, ChevronUpIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { instance } from "../../../hooks/api";
import { useMonthlyPayments } from "../../../hooks/payments";
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

// O'quvchilar snapshot'i (to'lov jadvali) asosida to'lov statistikasini hisoblaydi.
// Manba: teacher.students — bu monthly_snapshots'dan keladi, ya'ni to'lov jadvalidagi
// studentlar bilan aynan bir xil.
const computeStudentStats = (students) => {
  const list = Array.isArray(students) ? students : [];
  let paid = 0;
  let partial = 0;
  let unpaid = 0;
  let collected = 0;
  for (const s of list) {
    const state = s?.payment_state;
    if (state === "paid") paid += 1;
    else if (state === "partial") partial += 1;
    else unpaid += 1;
    collected += Number(s?.paid_amount) || 0;
  }
  const total = list.length;
  const paidAny = paid + partial; // to'lov qilganlar (paid_amount > 0)
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  return {
    total,
    paid,
    partial,
    unpaid,
    paidAny,
    collected,
    paidPct: pct(paid),
    partialPct: pct(partial),
    unpaidPct: pct(unpaid),
    paidAnyPct: pct(paidAny),
  };
};

// Teacher ism-familiyasi tagidagi to'lov progress bari.
const StudentPaymentProgress = ({ stats }) => {
  if (!stats.total) {
    return (
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100" />
        <span className="shrink-0 text-[10px] font-medium text-gray-400">O'quvchi yo'q</span>
      </div>
    );
  }
  return (
    <div className="mt-1.5">
      <div className="flex items-center gap-2">
        <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          {stats.paidPct > 0 && (
            <div className="h-full bg-emerald-500" style={{ width: `${stats.paidPct}%` }} title={`To'lagan: ${stats.paid}`} />
          )}
          {stats.partialPct > 0 && (
            <div className="h-full bg-amber-400" style={{ width: `${stats.partialPct}%` }} title={`Qisman: ${stats.partial}`} />
          )}
          {stats.unpaidPct > 0 && (
            <div className="h-full bg-rose-400" style={{ width: `${stats.unpaidPct}%` }} title={`To'lamagan: ${stats.unpaid}`} />
          )}
        </div>
        <span className="shrink-0 text-[11px] font-bold text-emerald-600">{stats.paidAnyPct}%</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-gray-500 sm:text-[11px]">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          To'lagan: <b className="text-gray-700">{stats.paid}</b>
        </span>
        {stats.partial > 0 && (
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Qisman: <b className="text-gray-700">{stats.partial}</b>
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          To'lamagan: <b className="text-gray-700">{stats.unpaid}</b>
        </span>
        <span className="text-gray-400">/ {stats.total} ta</span>
      </div>
    </div>
  );
};

const salaryStatusLabel = (isClosed) => (isClosed ? "Yopilgan" : "Ochiq");

const salaryStatusStyle = (isClosed) =>
  isClosed
    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
    : "bg-amber-100 text-amber-700 ring-1 ring-amber-200";

const getRowToneClass = (teacher) => {
  const isClosed = Boolean(teacher?.is_closed);
  const regularPayable = num(teacher, ["final_salary", "available_balance", "close_balance"]);
  const postCloseAvailable = num(teacher, ["post_close_available"]);
  const payableNow = isClosed ? postCloseAvailable : regularPayable;
  if (!isClosed) return "bg-white";
  if (payableNow <= 0) return "bg-emerald-50";
  return "bg-amber-50";
};

const resolveCanGive = (teacher, { isClosed, regularPayable, postCloseAvailable }) => {
  if (isClosed) {
    if (typeof teacher?.post_close_can_give === "boolean") return teacher.post_close_can_give;
    if (typeof teacher?.can_give_after_close === "boolean") return teacher.can_give_after_close || postCloseAvailable > 0;
    return postCloseAvailable > 0;
  }

  if (typeof teacher?.can_give === "boolean") return teacher.can_give || regularPayable > 0;
  return regularPayable > 0;
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
  const [closeAmountByTeacher, setCloseAmountByTeacher] = useState({});
  const [givenDescByTeacher, setGivenDescByTeacher] = useState({});

  const teachersMonthlyQuery = useTeacherSalaryMonthTeachers({ month_name: month });

  const updateSettingMutation = useUpdateTeacherSalarySetting();
  const createAdvanceMutation = useCreateTeacherAdvance();
  const createGivenMutation = useCreateTeacherGiven();
  const closeMutation = useCloseTeacherSalaryMonth();

  const monthlyTeachers = useMemo(() => asArray(teachersMonthlyQuery.data), [teachersMonthlyQuery.data]);

  // To'lov holati donuti — students-payments sahifasi bilan bir xil manba:
  // /api/snapshots summary (backend hisoblaydi, dublikatsiz aniq sonlar).
  const paymentsSummaryQuery = useMonthlyPayments({ month }, { keepPreviousData: true });
  const paymentStats = useMemo(() => {
    const s = paymentsSummaryQuery.data?.data?.summary || {};
    const paid = parseInt(s.paid_students || 0, 10);
    const partial = parseInt(s.partial_students || 0, 10);
    const unpaid = parseInt(s.unpaid_students || 0, 10);
    const total = paid + partial + unpaid;
    const paidAny = paid + partial;
    const percent = total ? Math.round((paidAny / total) * 100) : 0;
    return { paid, partial, unpaid, total, paidAny, percent };
  }, [paymentsSummaryQuery.data]);

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
        const regularPayable = num(t, ["final_salary", "available_balance", "close_balance"]);
        const postCloseAvailable = num(t, ["post_close_available"]);
        const payableNow = t?.is_closed ? postCloseAvailable : regularPayable;
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
      // Admin summani tahrirlagan bo'lsa — o'shani yuboramiz; aks holda backend o'zi hisoblaydi.
      const rawAmount = closeAmountByTeacher[String(teacherId)];
      const edited = rawAmount !== undefined && rawAmount !== "";
      await closeMutation.mutateAsync({
        month_name: month,
        teacher_id: Number(teacherId),
        expected_salary: edited ? Number(digitsOnly(rawAmount)) : undefined,
      });
      toast.success("Oy muvaffaqiyatli yopildi");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Oyni yopishda xatolik");
    }
  };

  const handleCreateGiven = async (teacherId, teacherRow) => {
    const regularPayable = num(teacherRow, ["final_salary", "available_balance", "close_balance"]);
    const postCloseAvailable = num(teacherRow, ["post_close_available"]);
    const isClosed = Boolean(teacherRow?.is_closed);
    const canGive = resolveCanGive(teacherRow, {
      isClosed,
      regularPayable,
      postCloseAvailable,
    });

    if (!canGive) {
      toast.error("Hozir berib bo'lmaydi");
      return;
    }

    try {
      const payload = {
        teacher_id: Number(teacherId),
        month_name: month,
        payout_type: isClosed ? "post_close" : "regular",
        // Izoh ixtiyoriy — kiritilmasa bo'sh yuboriladi.
        description: (givenDescByTeacher[String(teacherId)] || "").trim(),
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

        {/* To'lov holati donut charti (barcha o'quvchilar bo'yicha) */}
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-4 sm:p-4">
          <div className="mb-2 flex items-center justify-between sm:mb-3">
            <h3 className="text-sm font-semibold text-gray-800 sm:text-base">To'lov holati ({month})</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700 sm:text-xs">
              Jami: {paymentStats.total} o'quvchi
            </span>
          </div>
          {paymentStats.total === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">Bu oyda o'quvchi ma'lumoti yo'q.</p>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
              <div className="relative h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { label: "To'lagan", value: paymentStats.paid },
                        { label: "Qisman", value: paymentStats.partial },
                        { label: "To'lamagan", value: paymentStats.unpaid },
                      ].filter((item) => item.value > 0)}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {paymentStats.paid > 0 ? <Cell key="paid" fill="#10B981" /> : null}
                      {paymentStats.partial > 0 ? <Cell key="partial" fill="#F59E0B" /> : null}
                      {paymentStats.unpaid > 0 ? <Cell key="unpaid" fill="#EF4444" /> : null}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} o'quvchi`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-900">{paymentStats.percent}%</span>
                  <span className="text-[10px] font-medium text-gray-500">to'lov qilgan</span>
                </div>
              </div>
              <div className="w-full space-y-3 sm:w-auto sm:min-w-64">
                <div className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    To'lagan
                  </span>
                  <span className="text-sm font-bold text-emerald-600">{paymentStats.paid} o'quvchi</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    Qisman
                  </span>
                  <span className="text-sm font-bold text-amber-600">{paymentStats.partial} o'quvchi</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                    To'lamagan
                  </span>
                  <span className="text-sm font-bold text-rose-600">{paymentStats.unpaid} o'quvchi</span>
                </div>
              </div>
            </div>
          )}
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
                const studentStats = computeStudentStats(students);
                const isDetailsOpen = !!openDetailsByTeacher[teacherId];
                const regularPayable = num(t, ["final_salary", "available_balance", "close_balance"]);
                const postCloseAvailable = num(t, ["post_close_available"]);
                const hasPostCloseDebt = Boolean(t?.is_closed) && postCloseAvailable > 0;
                const canGive = resolveCanGive(t, {
                  isClosed: Boolean(t?.is_closed),
                  regularPayable,
                  postCloseAvailable,
                });
                const isGivenDone = Boolean(givenDoneByTeacher[teacherId]);
                const isReset = Boolean(resetByTeacher[String(teacherId)]);
                const computedGiven =
                  num(t, ["total_given", "given_total", "total_payout"]) ||
                  (num(t, ["final_salary", "close_balance"]) + num(t, ["post_close_given"]));
                const totalGivenDisplay = isReset ? 0 : computedGiven;
                return (
                  <div key={`${teacherId}-${i}`} className={`rounded-xl border border-gray-200 shadow-sm ${getRowToneClass(t)}`}>
                    <button
                      type="button"
                      onClick={() => toggleDetails(teacherId)}
                      className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left sm:gap-3 sm:py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 sm:text-base">{teacherName}</p>
                        <StudentPaymentProgress stats={studentStats} />
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5 sm:flex-row sm:items-center sm:gap-2">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {hasPostCloseDebt && (
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200 sm:px-3 sm:text-xs">
                              Yana berish kerak: {fmtMoney(postCloseAvailable)}
                            </span>
                          )}
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${salaryStatusStyle(t?.is_closed)}`}>
                            {salaryStatusLabel(t?.is_closed)}
                          </span>
                        </div>
                        {isDetailsOpen ? (
                          <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </button>

                    {isDetailsOpen && (
                      <div className="border-t border-gray-200 px-3 pb-3 pt-3">
                        {/* 1) O'quvchilar ro'yxati — birinchi o'rinda (to'lov jadvali snapshot'i) */}
                        <div className="mb-1.5 flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 sm:text-base">O'quvchilar ro'yxati</p>
                          <span className="text-[11px] text-gray-500 sm:text-xs">{studentStats.total} ta o'quvchi</span>
                        </div>
                        <div className="overflow-x-auto rounded-md border border-gray-200">
                          <table className="min-w-[900px] w-full text-[11px] sm:min-w-[1100px] sm:text-xs">
                            <thead>
                              <tr className="border-b bg-slate-50 text-left text-gray-500">
                                <th className="py-1.5 pr-2 pl-2 sm:py-2">ID</th>
                                <th className="py-1.5 pr-2 sm:py-2">F.I.Sh</th>
                                <th className="py-1.5 pr-2 sm:py-2">Telefon</th>
                                <th className="py-1.5 pr-2 sm:py-2">Qo'shimcha telefon</th>
                                <th className="py-1.5 pr-2 sm:py-2">Ota ismi</th>
                                <th className="py-1.5 pr-2 sm:py-2">Ota telefoni</th>
                                <th className="py-1.5 pr-2 sm:py-2">Manzil</th>
                                <th className="py-1.5 pr-2 sm:py-2">Yosh</th>
                                <th className="py-1.5 pr-2 sm:py-2">Holat</th>
                                <th className="py-1.5 pr-2 sm:py-2">Kerakli summa</th>
                                <th className="py-1.5 pr-2 sm:py-2">Chegirma</th>
                                <th className="py-1.5 pr-2 sm:py-2">To'lagan summa</th>
                              </tr>
                            </thead>
                            <tbody>
                              {students.length === 0 ? (
                                <tr>
                                  <td colSpan={12} className="py-2 pl-2 text-gray-500">O'quvchi topilmadi</td>
                                </tr>
                              ) : (
                                students.map((s) => (
                                  <tr key={String(s.student_id)} className="border-b border-gray-100">
                                    <td className="py-1.5 pr-2 pl-2 sm:py-2">{s.student_id}</td>
                                    <td className="py-1.5 pr-2 sm:py-2">{s.full_name || `${s.surname || ""} ${s.name || ""}`.trim()}</td>
                                    <td className="py-1.5 pr-2 sm:py-2">{s.phone || "-"}</td>
                                    <td className="py-1.5 pr-2 sm:py-2">{s.phone2 || "-"}</td>
                                    <td className="py-1.5 pr-2 sm:py-2">{s.father_name || "-"}</td>
                                    <td className="py-1.5 pr-2 sm:py-2">{s.father_phone || "-"}</td>
                                    <td className="py-1.5 pr-2 sm:py-2">{s.address || "-"}</td>
                                    <td className="py-1.5 pr-2 sm:py-2">{s.age ?? "-"}</td>
                                    <td className="py-1.5 pr-2 sm:py-2">
                                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px] ${paymentStateStyle(s.payment_state)}`}>
                                        {paymentStateLabel(s.payment_state)}
                                      </span>
                                    </td>
                                    <td className="py-1.5 pr-2 sm:py-2">{fmtMoney(num(s, ["required_amount"]))}</td>
                                    <td className="py-1.5 pr-2 sm:py-2">{fmtMoney(num(s, ["discount_amount"]))}</td>
                                    <td className="py-1.5 pr-2 sm:py-2">{fmtMoney(num(s, ["paid_amount"]))}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                            {students.length > 0 && (
                              <tfoot>
                                <tr className="border-t-2 border-gray-200 bg-slate-50 font-semibold text-gray-800">
                                  <td colSpan={11} className="py-2 pr-2 pl-2 text-right">Joriy oyda yig'ilgan summa:</td>
                                  <td className="py-2 pr-2 text-emerald-700">{fmtMoney(studentStats.collected)}</td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>

                        {/* 2) Table pastida — joriy oyda yig'ilgan summa */}
                        <div className="mt-2 mb-4 flex flex-col gap-0.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-xs font-medium text-emerald-800 sm:text-sm">
                            Joriy oyda ({month}) yig'ilgan summa
                          </span>
                          <span className="text-base font-bold text-emerald-700 sm:text-lg">
                            {fmtMoney(studentStats.collected)}
                          </span>
                        </div>

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
                              <div className="ml-auto flex items-center gap-1">
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
                              <div className="w-full sm:max-w-xs">
                                <p className="text-sm font-semibold text-gray-900">Oyni yakunlash</p>
                                {t?.is_closed ? (
                                  <p className="text-base text-gray-500 sm:text-lg">
                                    <span className="font-semibold text-gray-700">{fmtMoney(num(t, ["expected_salary", "close_expected_salary"]))}</span>
                                  </p>
                                ) : (
                                  <div className="mt-1">
                                    <label className="mb-1 block text-[11px] text-gray-500">Beriladigan summa (tahrirlash mumkin)</label>
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        value={fmtNumberInput(
                                          closeAmountByTeacher[teacherId] !== undefined
                                            ? closeAmountByTeacher[teacherId]
                                            : String(Math.max(0, Math.round(num(t, ["expected_salary", "close_expected_salary"]))))
                                        )}
                                        onChange={(e) =>
                                          setCloseAmountByTeacher((prev) => ({
                                            ...prev,
                                            [teacherId]: digitsOnly(e.target.value),
                                          }))
                                        }
                                        placeholder="Summa"
                                        className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#A60E07]/20 sm:text-base"
                                      />
                                      <span className="shrink-0 text-xs font-medium text-gray-500">so'm</span>
                                    </div>
                                  </div>
                                )}
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

                          <div className="rounded-md bg-slate-50 px-3 py-2.5">
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-700">Oylikdan keyin yig'ilgan summa</div>
                            <div className="mt-1 flex flex-col gap-1 text-xs sm:text-sm">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-gray-600">Yangi tushum:</span>
                                <span className="font-semibold text-gray-900">{fmtMoney(num(t, ["post_close_collected_revenue"]))}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-gray-600">Berilishi kerak summa:</span>
                                <span className="font-semibold text-gray-900">{fmtMoney(num(t, ["post_close_expected_salary"]))}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-gray-600">Berilgan:</span>
                                <span className="font-semibold text-gray-900">{fmtMoney(num(t, ["post_close_given"]))}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <label className="mb-1 block text-[11px] text-gray-500">Izoh (ixtiyoriy)</label>
                              <input
                                type="text"
                                value={givenDescByTeacher[teacherId] || ""}
                                onChange={(e) =>
                                  setGivenDescByTeacher((prev) => ({
                                    ...prev,
                                    [teacherId]: e.target.value,
                                  }))
                                }
                                placeholder="Masalan: naqd berildi"
                                className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#A60E07]/20"
                              />
                            </div>
                            <div className="mt-2 flex justify-end">
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
                            <span className="text-gray-600">Jami berilgan (oylik + post-close):</span>{" "}
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

"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  useCloseTeacherSalaryMonth,
  useCreateTeacherAdvance,
  useTeacherSalaryMonthSimpleList,
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

const digitsOnly = (v) => String(v || "").replace(/\D/g, "");

const fmtSumInput = (raw) => {
  const clean = digitsOnly(raw);
  if (!clean) return "";
  return `${Number(clean).toLocaleString("uz-UZ")} so'm`;
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

const TeacherPayments = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState("");
  const [salaryPercentByTeacher, setSalaryPercentByTeacher] = useState({});
  const [advanceByTeacher, setAdvanceByTeacher] = useState({});
  const [openStudentsByTeacher, setOpenStudentsByTeacher] = useState({});

  const teachersMonthlyQuery = useTeacherSalaryMonthSimpleList({ month_name: month });

  const updateSettingMutation = useUpdateTeacherSalarySetting();
  const createAdvanceMutation = useCreateTeacherAdvance();
  const closeMutation = useCloseTeacherSalaryMonth();

  const monthlyTeachers = useMemo(() => asArray(teachersMonthlyQuery.data), [teachersMonthlyQuery.data]);
  const filteredTeachers = useMemo(() => {
    const q = normalizeText(searchTerm);
    if (!q) return monthlyTeachers;
    return monthlyTeachers.filter((t) => {
      const teacherId = String(t.teacher_id || t.id || "");
      const teacherName =
        t.teacher_name || t.full_name || `${t.name || ""} ${t.surname || ""}`.trim() || "";
      return normalizeText(teacherId).includes(q) || normalizeText(teacherName).includes(q);
    });
  }, [monthlyTeachers, searchTerm]);

  React.useEffect(() => {
    if (!monthlyTeachers.length) return;
    setSalaryPercentByTeacher((prev) => {
      const next = { ...prev };
      monthlyTeachers.forEach((t) => {
        const teacherId = String(t.teacher_id || t.id || "");
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
        const teacherId = String(t.teacher_id || t.id || "");
        if (!teacherId) return;
        if (!next[teacherId]) {
          next[teacherId] = { amount: "", description: "" };
        }
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

  const toggleStudents = (teacherId) => {
    setOpenStudentsByTeacher((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6">
      <div className="w-full">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">O'qituvchilar Oyligi</h1>
          <p className="mt-1 text-base text-gray-600">Barcha o'qituvchilar bir jadvalda, har qatorida amallar mavjud</p>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="w-full sm:w-80">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20"
              />
            </div>
            <div className="w-full sm:max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ID yoki o'qituvchi nomi"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20"
              />
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-gray-800">Oylik jadvali ({month})</h3>
          <div className="space-y-3 lg:hidden">
            {teachersMonthlyQuery.isLoading ? (
              <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-500">Yuklanmoqda...</div>
            ) : filteredTeachers.length === 0 ? (
              <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-500">Ma'lumot topilmadi</div>
            ) : (
              filteredTeachers.map((t, i) => {
                const teacherId = String(t.teacher_id || t.id || "");
                const teacherName = t.teacher_name || t.full_name || `${t.name || ""} ${t.surname || ""}`.trim() || `#${teacherId}`;
                const rowAdvance = advanceByTeacher[teacherId] || { amount: "", description: "" };
                const students = asArray(t.students);
                const isStudentsOpen = !!openStudentsByTeacher[teacherId];

                return (
                  <div key={`${teacherId}-${i}`} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{teacherName}</p>
                        <p className="text-xs text-gray-500">ID: {teacherId || "-"}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${salaryStatusStyle(t?.is_closed)}`}>
                        {salaryStatusLabel(t?.is_closed)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-gray-50 p-2"><span className="text-gray-500">To'lagan:</span> <span className="font-semibold">{num(t, ["paid_students_count", "paid_students"])}</span></div>
                      <div className="rounded-lg bg-gray-50 p-2"><span className="text-gray-500">Qisman:</span> <span className="font-semibold">{num(t, ["partial_students_count"])}</span></div>
                      <div className="rounded-lg bg-gray-50 p-2"><span className="text-gray-500">To'lamagan:</span> <span className="font-semibold">{num(t, ["unpaid_students_count", "unpaid_students"])}</span></div>
                      <div className="rounded-lg bg-gray-50 p-2"><span className="text-gray-500">Foiz:</span> <span className="font-semibold">{num(t, ["salary_percentage"])}%</span></div>
                      <div className="col-span-2 rounded-lg bg-gray-50 p-2"><span className="text-gray-500">Jami tushum:</span> <span className="font-semibold">{fmtMoney(num(t, ["total_collected", "close_revenue"]))}</span></div>
                      <div className="col-span-2 rounded-lg bg-gray-50 p-2"><span className="text-gray-500">Kutilgan oylik:</span> <span className="font-semibold">{fmtMoney(num(t, ["expected_salary", "close_expected_salary"]))}</span></div>
                      <div className="col-span-2 rounded-lg bg-gray-50 p-2"><span className="text-gray-500">Yakuniy oylik:</span> <span className="font-semibold text-gray-900">{fmtMoney(num(t, ["final_salary", "close_balance"]))}</span></div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex gap-2">
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
                          placeholder="%"
                          className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A60E07]/20"
                        />
                        <button
                          onClick={() => handleUpdatePercent(teacherId)}
                          disabled={updateSettingMutation.isPending}
                          className="rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Foizni saqlash
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={fmtSumInput(rowAdvance.amount)}
                          onChange={(e) =>
                            setAdvanceByTeacher((prev) => ({
                              ...prev,
                              [teacherId]: { ...rowAdvance, amount: digitsOnly(e.target.value) },
                            }))
                          }
                          placeholder="0 so'm"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A60E07]/20"
                        />
                        <input
                          type="text"
                          value={rowAdvance.description}
                          onChange={(e) =>
                            setAdvanceByTeacher((prev) => ({
                              ...prev,
                              [teacherId]: { ...rowAdvance, description: e.target.value },
                            }))
                          }
                          placeholder="Izoh"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A60E07]/20"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCreateAdvance(teacherId, t?.can_give_advance)}
                            disabled={createAdvanceMutation.isPending || t?.can_give_advance === false}
                            className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            Avans
                          </button>
                          <button
                            onClick={() => handleCloseMonth(teacherId, t?.is_closed)}
                            disabled={closeMutation.isPending || t?.is_closed}
                            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            Oylikni yopish
                          </button>
                        </div>
                        <button
                          onClick={() => toggleStudents(teacherId)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700"
                        >
                          {isStudentsOpen ? "O'quvchilarni yopish" : "O'quvchilarni ko'rish"}
                        </button>
                      </div>
                    </div>

                    {isStudentsOpen && (
                      <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-[640px] w-full text-xs">
                          <thead>
                            <tr className="border-b text-left text-gray-500">
                              <th className="py-2 pr-2 pl-2">ID</th>
                              <th className="py-2 pr-2">F.I.Sh</th>
                              <th className="py-2 pr-2">Holat</th>
                              <th className="py-2 pr-2">Kerakli summa</th>
                              <th className="py-2 pr-2">To'lagan summa</th>
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
                                  <td className="py-2 pr-2 pl-2">{s.student_id}</td>
                                  <td className="py-2 pr-2">{s.full_name || `${s.name || ""} ${s.surname || ""}`.trim()}</td>
                                  <td className="py-2 pr-2">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${paymentStateStyle(s.payment_state)}`}>
                                      {paymentStateLabel(s.payment_state)}
                                    </span>
                                  </td>
                                  <td className="py-2 pr-2">{fmtMoney(num(s, ["required_amount"]))}</td>
                                  <td className="py-2 pr-2">{fmtMoney(num(s, ["paid_amount"]))}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-[1850px] w-full text-base">
              <thead>
                <tr className="border-b bg-gray-50/80 text-left text-sm font-semibold tracking-wide text-gray-600">
                  <th className="whitespace-nowrap py-2 pr-2">ID</th>
                  <th className="whitespace-nowrap py-2 pr-2">O'qituvchi</th>
                  <th className="whitespace-nowrap py-2 pr-2">To'lagan</th>
                  <th className="whitespace-nowrap py-2 pr-2">Qisman</th>
                  <th className="whitespace-nowrap py-2 pr-2">To'lamagan</th>
                  <th className="whitespace-nowrap py-2 pr-2">Jami tushum</th>
                  <th className="whitespace-nowrap py-2 pr-2">Foiz</th>
                  <th className="whitespace-nowrap py-2 pr-2">Kutilgan oylik</th>
                  <th className="whitespace-nowrap py-2 pr-2">Jami avans</th>
                  <th className="whitespace-nowrap py-2 pr-2">Yakuniy oylik</th>
                  <th className="whitespace-nowrap py-2 pr-2">Holat</th>
                  <th className="whitespace-nowrap py-2 pr-2">O'quvchilar</th>
                  <th className="whitespace-nowrap py-2 pr-2">Foizni sozlash</th>
                  <th className="whitespace-nowrap py-2 pr-2">Avans berish</th>
                  <th className="whitespace-nowrap py-2 pr-2">Oylikni yopish</th>
                </tr>
              </thead>
              <tbody>
                {teachersMonthlyQuery.isLoading ? (
                  <tr>
                    <td className="py-4 text-gray-500" colSpan={15}>Yuklanmoqda...</td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td className="py-4 text-gray-500" colSpan={15}>Ma'lumot topilmadi</td>
                  </tr>
                ) : (
                  filteredTeachers.map((t, i) => {
                    const teacherId = String(t.teacher_id || t.id || "");
                    const teacherName = t.teacher_name || t.full_name || `${t.name || ""} ${t.surname || ""}`.trim() || `#${teacherId}`;
                    const rowAdvance = advanceByTeacher[teacherId] || { amount: "", description: "" };
                    const students = asArray(t.students);
                    const isStudentsOpen = !!openStudentsByTeacher[teacherId];

                    return (
                      <React.Fragment key={`${teacherId}-${i}`}>
                        <tr className="border-b border-gray-100 hover:bg-slate-50">
                          <td className="whitespace-nowrap py-3 pr-3 text-gray-600">{teacherId || "-"}</td>
                          <td className="whitespace-nowrap py-3 pr-3 font-medium text-gray-900">{teacherName}</td>
                          <td className="whitespace-nowrap py-3 pr-3">{num(t, ["paid_students_count", "paid_students"])}</td>
                          <td className="whitespace-nowrap py-3 pr-3">{num(t, ["partial_students_count"])}</td>
                          <td className="whitespace-nowrap py-3 pr-3">{num(t, ["unpaid_students_count", "unpaid_students"])}</td>
                          <td className="whitespace-nowrap py-3 pr-3">{fmtMoney(num(t, ["total_collected", "close_revenue"]))}</td>
                          <td className="whitespace-nowrap py-3 pr-3">{num(t, ["salary_percentage"])}%</td>
                          <td className="whitespace-nowrap py-3 pr-3">{fmtMoney(num(t, ["expected_salary", "close_expected_salary"]))}</td>
                          <td className="whitespace-nowrap py-3 pr-3">{fmtMoney(num(t, ["total_advances"]))}</td>
                          <td className="whitespace-nowrap py-3 pr-3 font-semibold text-gray-900">{fmtMoney(num(t, ["final_salary", "close_balance"]))}</td>
                          <td className="whitespace-nowrap py-3 pr-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${salaryStatusStyle(
                                t?.is_closed
                              )}`}
                            >
                              {salaryStatusLabel(t?.is_closed)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap py-3 pr-3">
                            <button
                              onClick={() => toggleStudents(teacherId)}
                              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              {isStudentsOpen ? "Yopish" : "Ko'rish"}
                            </button>
                          </td>
                          <td className="whitespace-nowrap py-3 pr-3">
                            <div className="flex items-center gap-2 whitespace-nowrap">
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
                                placeholder="%"
                                className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A60E07]/20"
                              />
                              <button
                                onClick={() => handleUpdatePercent(teacherId)}
                                disabled={updateSettingMutation.isPending}
                                className="rounded-xl bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                              >
                                Saqlash
                              </button>
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-3 pr-3">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={fmtSumInput(rowAdvance.amount)}
                                onChange={(e) =>
                                  setAdvanceByTeacher((prev) => ({
                                    ...prev,
                                    [teacherId]: { ...rowAdvance, amount: digitsOnly(e.target.value) },
                                  }))
                                }
                                placeholder="0 so'm"
                                className="w-44 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20"
                              />
                              <input
                                type="text"
                                value={rowAdvance.description}
                                onChange={(e) =>
                                  setAdvanceByTeacher((prev) => ({
                                    ...prev,
                                    [teacherId]: { ...rowAdvance, description: e.target.value },
                                  }))
                                }
                                placeholder="Izoh"
                                className="w-36 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A60E07]/20"
                              />
                              <button
                                onClick={() => handleCreateAdvance(teacherId, t?.can_give_advance)}
                                disabled={createAdvanceMutation.isPending || t?.can_give_advance === false}
                                className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                              >
                                Avans
                              </button>
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-3 pr-3">
                            <button
                              onClick={() => handleCloseMonth(teacherId, t?.is_closed)}
                              disabled={closeMutation.isPending || t?.is_closed}
                              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              Yopish
                            </button>
                          </td>
                        </tr>
                        {isStudentsOpen && (
                          <tr className="border-b bg-gray-50/70">
                            <td colSpan={15} className="px-3 py-3">
                              <div className="overflow-x-auto">
                                <table className="min-w-[900px] w-full text-sm">
                                  <thead>
                                    <tr className="border-b text-left text-gray-500">
                                      <th className="py-1.5 pr-2">ID</th>
                                      <th className="py-1.5 pr-2">F.I.Sh</th>
                                      <th className="py-1.5 pr-2">Holat</th>
                                      <th className="py-1.5 pr-2">Kerakli summa</th>
                                      <th className="py-1.5 pr-2">To'lagan summa</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {students.length === 0 ? (
                                      <tr>
                                        <td colSpan={5} className="py-2 text-gray-500">O'quvchi topilmadi</td>
                                      </tr>
                                    ) : (
                                      students.map((s) => (
                                        <tr key={String(s.student_id)} className="border-b border-gray-100">
                                          <td className="py-1.5 pr-2">{s.student_id}</td>
                                          <td className="py-1.5 pr-2">{s.full_name || `${s.name || ""} ${s.surname || ""}`.trim()}</td>
                                          <td className="py-1.5 pr-2">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${paymentStateStyle(s.payment_state)}`}>
                                              {paymentStateLabel(s.payment_state)}
                                            </span>
                                          </td>
                                          <td className="py-1.5 pr-2">{fmtMoney(num(s, ["required_amount"]))}</td>
                                          <td className="py-1.5 pr-2">{fmtMoney(num(s, ["paid_amount"]))}</td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPayments;

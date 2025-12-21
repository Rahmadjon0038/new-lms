"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  CheckIcon,
  XMarkIcon, 
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import ViewStudentPay from "../../../components/admistrator/ViewStudentPay";

// ====================================================================
// --- MOCK DATA: O'qituvchilar Ro'yxati ---
// QO'SHIMCHA: latePaidStudentsCount maydoni qo'shildi
// ====================================================================

const initialMockTeachers = [
  {
    id: 1,
    name: "Jasur Raximov",
    subjects: ["Web Dasturlash", "Backend"],
    startDate: "2023-09-01",
    salaryPercentage: 50,
    paidStudents: 45,
    unpaidStudents: 5,
    avans: 400000,
    isMonthlySalaryPaid: false,
    latePaymentsReceived: 150000, // Kechikkan to'lov summasi
    isLatePaymentPaid: false,
    pricePerStudent: 300000,
    latePaidStudentsCount: 3, // Kechikib to'lagan o'quvchilar soni
  },
  {
    id: 2,
    name: "Shoxrux Tursunov",
    subjects: ["Grafik Dizayn", "UX/UI"],
    startDate: "2024-01-15",
    salaryPercentage: 45,
    paidStudents: 38,
    unpaidStudents: 2,
    avans: 0,
    isMonthlySalaryPaid: true, // Oylik yopilgan
    latePaymentsReceived: 0,
    isLatePaymentPaid: true,
    pricePerStudent: 250000,
    latePaidStudentsCount: 0,
  },
  {
    id: 3,
    name: "Shahnoza Qodirova",
    subjects: ["Python", "Data Science"],
    startDate: "2023-11-20",
    salaryPercentage: 60,
    paidStudents: 28,
    unpaidStudents: 7,
    avans: 1000000,
    isMonthlySalaryPaid: false,
    latePaymentsReceived: 300000, // Kechikkan to'lov summasi
    isLatePaymentPaid: false,
    pricePerStudent: 350000,
    latePaidStudentsCount: 5, // Kechikib to'lagan o'quvchilar soni
  },
  {
    id: 4,
    name: "Raxmadjon Abdullaev",
    subjects: ["Inglis Tili", "IELTS"],
    startDate: "2024-02-01",
    salaryPercentage: 65,
    paidStudents: 40,
    unpaidStudents: 0,
    avans: 500000,
    isMonthlySalaryPaid: true, // Oylik yopilgan
    latePaymentsReceived: 450000, // Kechikkan to'lov summasi
    isLatePaymentPaid: false, // Lekin hali to'lanmagan
    pricePerStudent: 225000,
    latePaidStudentsCount: 4, // Kechikib to'lagan o'quvchilar soni
  },
  {
    id: 5,
    name: "Malika Yusupova",
    subjects: ["Matematika", "Fizika"],
    startDate: "2023-08-10",
    salaryPercentage: 55,
    paidStudents: 30,
    unpaidStudents: 4,
    avans: 0,
    isMonthlySalaryPaid: false,
    latePaymentsReceived: 100000,
    isLatePaymentPaid: false,
    pricePerStudent: 300000,
    latePaidStudentsCount: 2, // Kechikib to'lagan o'quvchilar soni
  },
  {
    id: 6,
    name: "Farrux Olimov",
    subjects: ["Ona Tili", "Adabiyot"],
    startDate: "2024-04-05",
    salaryPercentage: 50,
    paidStudents: 18,
    unpaidStudents: 0,
    avans: 200000,
    isMonthlySalaryPaid: true,
    latePaymentsReceived: 0,
    isLatePaymentPaid: true,
    pricePerStudent: 150000,
    latePaidStudentsCount: 0,
  },
];

// Sanani DD/MM/YYYY formatiga o'tkazish
const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Oylikni hisoblash funksiyasi
const calculateSalary = (teacher) => {
  const percentage = teacher.salaryPercentage;
  const price = teacher.pricePerStudent;

  const monthlyRevenue = teacher.paidStudents * price;
  const monthlyTeacherShare = (monthlyRevenue * percentage) / 100;
  const finalMonthlySalary = monthlyTeacherShare - teacher.avans;

  let latePaymentShare = 0;

  // Kechikgan to'lov ulushi faqat asosiy oylik yopilgan bo'lsa hisoblanadi
  if (
    teacher.isMonthlySalaryPaid &&
    teacher.latePaymentsReceived > 0 &&
    !teacher.isLatePaymentPaid
  ) {
    latePaymentShare = (teacher.latePaymentsReceived * percentage) / 100;
  }

  return {
    monthlyRevenue: monthlyRevenue,
    finalMonthlySalary: finalMonthlySalary,
    latePaymentShare: latePaymentShare,
  };
};

// =================================
// --- Yordamchi Komponent: TableInput ---
// =================================
const TableInput = ({
  name,
  value,
  onChange,
  type = "text",
  min = 0,
  max,
  disabled = false,
}) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    min={min}
    max={max}
    disabled={disabled}
    className={`w-full px-2 py-1 border rounded-md text-sm focus:ring-blue-500 ${
      disabled ? "bg-gray-100 text-gray-500" : "border-blue-300"
    }`}
  />
);

// ====================================================================
// --- ASOSIY KOMPONENT (TEACHERSPAGE) ---
// ====================================================================

function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState(initialMockTeachers);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(
    currentMonth.toString().padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const filteredTeachers = useMemo(() => {
    if (!searchTerm) {
      return teachers;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return teachers.filter((teacher) =>
      teacher.name.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, teachers]);

  // =================================
  // --- TAHRIRLASH FUNKSIYALARI ---
  // =================================

  const handleEdit = (teacher) => {
    if (teacher.isMonthlySalaryPaid) {
      alert(
        "Oyligi yopilgan o'qituvchi ma'lumotlarini tahrirlash uchun yopilishni bekor qiling."
      );
      return;
    }
    setEditingId(teacher.id);
    setEditData({
      name: teacher.name,
      subjects: teacher.subjects.join(", "),
      salaryPercentage: teacher.salaryPercentage.toString(),
      avans: teacher.avans.toString(),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (id) => {
    const updatedSubjects = editData.subjects
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newSalaryPercentage = parseFloat(editData.salaryPercentage) || 0;
    const newAvans = parseFloat(editData.avans) || 0;

    if (newSalaryPercentage < 0 || newSalaryPercentage > 100) {
      alert("Ulush foizi 0% dan 100% gacha bo'lishi kerak.");
      return;
    }

    let updatedTeacherData = {};

    setTeachers((prevTeachers) =>
      prevTeachers.map((t) => {
        if (t.id === id) {
          const updated = {
            ...t,
            name: editData.name,
            subjects: updatedSubjects,
            salaryPercentage: newSalaryPercentage,
            avans: newAvans,
          };
          updatedTeacherData = updated;
          return updated;
        }
        return t;
      })
    );

    // Konsolga yangilangan o'qituvchi ma'lumotlarini chiqarish
    console.log(`Saqlandi (ID: ${id}):`, updatedTeacherData);

    setEditingId(null);
    setEditData({});
  };

  // Oylikni Yopish mantiqlari (o'zgarishsiz)
  const handleFinalizePayout = (teacherId, type) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return;

    let confirmationText = "";

    if (type === "monthly") {
      const { finalMonthlySalary } = calculateSalary(teacher);
      confirmationText = `${
        teacher.name
      } (Yakuniy Oylik: ${finalMonthlySalary.toLocaleString(
        "uz-UZ"
      )} UZS) uchun asosiy to'lovni yopishga ishonchingiz komilmi?`;
    } else if (type === "late") {
      const { latePaymentShare } = calculateSalary(teacher);
      confirmationText = `${
        teacher.name
      } (Kechikkan Ulush: ${latePaymentShare.toLocaleString(
        "uz-UZ"
      )} UZS) uchun kechikkan to'lovni yopishga ishonchingiz komilmi?`;
    }

    if (window.confirm(confirmationText)) {
      setTeachers((prevTeachers) =>
        prevTeachers.map((t) => {
          if (t.id === teacherId) {
            if (type === "monthly") {
              return { ...t, isMonthlySalaryPaid: true };
            } else if (type === "late") {
              return { ...t, isLatePaymentPaid: true };
            }
          }
          return t;
        })
      );
    }
  };

  // ================================= //
  // --- Yil va Oylar uchun opsiyalar --- //
  // ================================= //
  const years = ["2025", "2024", "2023"];
  const months = [
    { num: "01", name: "Yanvar" },
    { num: "02", name: "Fevral" },
    { num: "03", name: "Mart" },
    { num: "04", name: "Aprel" },
    { num: "05", name: "May" },
    { num: "06", name: "Iyun" },
    { num: "07", name: "Iyul" },
    { num: "08", name: "Avgust" },
    { num: "09", name: "Sentabr" },
    { num: "10", name: "Oktabr" },
    { num: "11", name: "Noyabr" },
    { num: "12", name: "Dekabr" },
  ];

  return (
    <div className="min-h-full p-8">
      {/* 1. Sarlavha Qismi */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        O'qituvchilar Oylik Hisoboti
      </h1>
      <p className="text-lg text-gray-500 mb-8">
        Tanlangan davr bo'yicha ma'lumotlar:
        {months.find((m) => m.num === selectedMonth)?.name} {selectedYear}-yil
      </p>

      {/* 2. Boshqaruv Bloki (Search, Filter, Add) */}
      <div className="flex justify-between items-center mb-6">
        {/* Filtrlar va Qidiruv */}
        <div className="flex space-x-4 items-center">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
          >
            {months.map((m) => (
              <option key={m.num} value={m.num}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}-yil
              </option>
            ))}
          </select>
          <div className="relative w-full max-w-sm ml-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="O'qituvchi ismiga ko'ra qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <Link
          href="/admin/teachers/add"
          className="flex items-center text-sm font-semibold text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition duration-150 shadow-md"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Yangi O'qituvchi Qo'shish
        </Link>
      </div>

      {/* 3. O'qituvchilar Ro'yxati (Jadval Ko'rinishida) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                # / Ism, Familiya
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                Fan / Ulush (%)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                O'quvchilar (To'lagan/Jami)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Umumiy Tushum
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                Avans (UZS)
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                1. Beriladigan Oylik
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                2. Oyni Yopish
              </th>
              {/* === O'ZGARTIRILGAN SARLAVHA === */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                3. Kechikkan To'lov Ma'lumoti
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                4. Kechikgan Yopish
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                5. Umumiy Olingan (UZS)
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                Tahrir
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => {
                const isEditing = teacher.id === editingId;

                const currentAvans = isEditing
                  ? parseFloat(editData.avans) || 0
                  : teacher.avans;
                const currentSalaryPercentage = isEditing
                  ? parseFloat(editData.salaryPercentage) || 0
                  : teacher.salaryPercentage;

                const dataForCalculation = {
                  ...teacher,
                  avans: currentAvans,
                  salaryPercentage: currentSalaryPercentage,
                };

                const { finalMonthlySalary, monthlyRevenue, latePaymentShare } =
                  calculateSalary(dataForCalculation);

                const avansDisplay = isEditing
                  ? currentAvans.toLocaleString("uz-UZ")
                  : teacher.avans.toLocaleString("uz-UZ");

                const canPayLate =
                  latePaymentShare > 0 &&
                  teacher.isMonthlySalaryPaid &&
                  !teacher.isLatePaymentPaid;

                // Umumiy Olingan Oylikni hisoblash
                let totalReceived = 0;
                if (teacher.isMonthlySalaryPaid) {
                  const monthlyTeacherShare =
                    (teacher.paidStudents *
                      teacher.pricePerStudent *
                      teacher.salaryPercentage) /
                    100;
                  totalReceived += monthlyTeacherShare - teacher.avans;
                }
                if (teacher.isLatePaymentPaid) {
                  totalReceived +=
                    (teacher.latePaymentsReceived * teacher.salaryPercentage) /
                    100;
                }

                return (
                  <tr
                    key={teacher.id}
                    className={`${
                      isEditing ? "bg-blue-50/50" : "hover:bg-gray-50"
                    } transition duration-150`}
                  >
                    {/* Ism, Familiya */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {isEditing ? (
                        <TableInput
                          name="name"
                          value={editData.name}
                          onChange={handleChange}
                          type="text"
                        />
                      ) : (
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-400">
                            {teacher.id}.
                          </span>
                          {teacher.name}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        Ish Faoliyati: {formatDisplayDate(teacher.startDate)}
                      </p>
                    </td>

                    {/* Fan / Ulush */}
                    <td className="px-4 py-2 whitespace-normal text-sm text-gray-600">
                      {isEditing ? (
                        <>
                          <TableInput
                            name="subjects"
                            value={editData.subjects}
                            onChange={handleChange}
                            type="text"
                          />
                          <div className="flex items-center text-xs font-semibold mt-1 text-blue-600">
                            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                            <TableInput
                              name="salaryPercentage"
                              value={editData.salaryPercentage}
                              onChange={handleChange}
                              type="number"
                              min={0}
                              max={100}
                            />
                            %
                          </div>
                        </>
                      ) : (
                        <>
                          {teacher.subjects.join(", ")}
                          <p className="flex items-center text-xs font-semibold mt-0.5 text-blue-600">
                            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                            Ulush: {teacher.salaryPercentage}%
                          </p>
                        </>
                      )}
                    </td>

                    {/* O'quvchilar (To'lagan/Qarz) */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span className="text-green-600 font-semibold">
                          {teacher.paidStudents}
                        </span>{" "}
                        /{" "}
                        <span className="text-red-600">
                          {teacher.unpaidStudents}
                        </span>
                        <ViewStudentPay teacher={teacher}>
                          <EyeIcon className="h-5 w-5 text-gray-500 hover:text-blue-600 transition cursor-pointer" />
                        </ViewStudentPay>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Jami: {teacher.paidStudents + teacher.unpaidStudents}
                      </p>
                    </td>

                    {/* Umumiy Tushum */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-800">
                      {monthlyRevenue.toLocaleString("uz-UZ")} UZS
                    </td>

                    {/* Avans */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      {isEditing ? (
                        <TableInput
                          name="avans"
                          value={editData.avans}
                          onChange={handleChange}
                          type="number"
                        />
                      ) : (
                        <span className="text-red-600 font-bold">
                          -{avansDisplay} UZS
                        </span>
                      )}
                    </td>

                    {/* 1. Beriladigan Oylik */}
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-base font-bold ${
                        teacher.isMonthlySalaryPaid
                          ? "text-gray-600"
                          : "text-green-700"
                      }`}
                    >
                      {finalMonthlySalary.toLocaleString("uz-UZ")} UZS
                    </td>

                    {/* 2. Oyni Yopish (Tugma/Status) */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      {teacher.isMonthlySalaryPaid ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                          Yopildi
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            handleFinalizePayout(teacher.id, "monthly")
                          }
                          className="flex items-center text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg transition text-xs font-medium"
                          title="Oylikni to'lash va yopish"
                          disabled={editingId !== null}
                        >
                          <LockClosedIcon className="h-4 w-4 mr-1" /> Oyni
                          Yopish
                        </button>
                      )}
                    </td>

                    {/* 3. Kechikkan To'lov Ma'lumoti (YANGILANGAN QISM) */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      {/* Kechikkan to'lov bor va asosiy oylik yopilgan bo'lsa */}
                      {teacher.isMonthlySalaryPaid &&
                      teacher.latePaymentsReceived > 0 ? (
                        <>
                          <span className="font-bold text-yellow-600 block">
                            {/* O'qituvchining ulushini ko'rsatish */}
                            {latePaymentShare.toLocaleString("uz-UZ")} UZS
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {/* Kechikib to'lagan o'quvchilar sonini ko'rsatish */}
                            ({teacher.latePaidStudentsCount} nafar o'quvchi
                            to'ladi)
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400">0 UZS</span>
                      )}
                    </td>

                    {/* 4. Kechikgan Yopish (Tugma/Status) */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      {canPayLate ? (
                        <button
                          onClick={() =>
                            handleFinalizePayout(teacher.id, "late")
                          }
                          className="flex items-center text-white bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-lg transition text-xs font-medium"
                          title="Kechikgan to'lov ulushini to'lash"
                          disabled={editingId !== null}
                        >
                          <LockClosedIcon className="h-4 w-4 mr-1" /> Yopish
                        </button>
                      ) : teacher.isLatePaymentPaid ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                          Yopildi
                        </span>
                      ) : (
                        <button
                          className="flex items-center text-white bg-gray-400 px-3 py-1 rounded-lg text-xs font-medium"
                          disabled
                        >
                          <LockClosedIcon className="h-4 w-4 mr-1" /> Yopish
                        </button>
                      )}
                    </td>

                    {/* 5. Umumiy Olingan Oylik */}
                    <td className="px-4 py-2 whitespace-nowrap text-base font-bold text-blue-700">
                      {totalReceived.toLocaleString("uz-UZ")} UZS
                    </td>

                    {/* Harakatlar (Tahrir) */}
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-space-x-2 items-center">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSave(teacher.id)}
                              className="text-white bg-green-600 hover:bg-green-700 p-2 rounded-lg transition"
                              title="Saqlash"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-white bg-gray-400 hover:bg-gray-500 p-2 rounded-lg transition"
                              title="Bekor qilish"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          !teacher.isMonthlySalaryPaid && (
                            <button
                              onClick={() => handleEdit(teacher)}
                              className="text-gray-500 hover:text-yellow-600 p-1 rounded-full transition disabled:opacity-50"
                              title="Ma'lumotlarni tahrirlash"
                              disabled={editingId !== null}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="11"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  "{searchTerm}" so'rovi bo'yicha o'qituvchilar topilmadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Sahifani eksport qilish
function page() {
  return <TeachersPage />;
}

export default page;
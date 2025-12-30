"use client";
import React, { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"; // ClockIcon olib tashlandi

// --- Mock Data (Talabaning Davomat Ma'lumotlari - Statuslar yangilandi) ---
const mockAttendanceData = {
  // Oylar va ularning ma'lumotlari
  "December 2024": [
    {
      subject: "Matematika Asosiy",
      dates: [
        { date: "2024-12-02", status: "Bor" },
        { date: "2024-12-04", status: "Bor" },
        { date: "2024-12-09", status: "Yo'q" },
        { date: "2024-12-11", status: "Bor" },
        { date: "2024-12-16", status: "Bor" },
        { date: "2024-12-18", status: "Bor" }, // Kechikdi Borga almashtirildi
        { date: "2024-12-23", status: "Bor" },
        { date: "2024-12-25", status: "Bor" },
      ],
    },
    {
      subject: "Ingliz Tili (Boshlang'ich)",
      dates: [
        { date: "2024-12-03", status: "Bor" },
        { date: "2024-12-05", status: "Yo'q" },
        { date: "2024-12-10", status: "Bor" },
        { date: "2024-12-12", status: "Bor" },
        { date: "2024-12-17", status: "Bor" },
      ],
    },
  ],
  "November 2024": [
    {
      subject: "Matematika Asosiy",
      dates: [
        { date: "2024-11-04", status: "Bor" },
        { date: "2024-11-06", status: "Bor" },
        { date: "2024-11-11", status: "Bor" },
        { date: "2024-11-13", status: "Bor" },
        { date: "2024-11-18", status: "Yo'q" },
        { date: "2024-11-20", status: "Bor" },
      ],
    },
  ],
  "November 2024": [
    {
      subject: "Matematika Asosiy",
      dates: [
        { date: "2024-11-04", status: "Bor" },
        { date: "2024-11-06", status: "Bor" },
        { date: "2024-11-11", status: "Bor" },
        { date: "2024-11-13", status: "Bor" },
        { date: "2024-11-18", status: "Yo'q" },
        { date: "2024-11-20", status: "Bor" },
      ],
    },
  ],
};

// --- Yordamchi Funksiya: Davomat Statusiga Qarab Rang Berish (Yangilandi) ---
const getStatusColor = (status) => {
  switch (status) {
    case "Bor":
      return "bg-green-100 text-green-700 border-green-400";
    case "Yo'q":
      return "bg-red-100 text-red-700 border-red-400";
    default:
      return "bg-gray-100 text-gray-700 border-gray-400";
  }
};

// --- Yordamchi Funksiya: Fan statistikasini hisoblash (Yangilandi) ---
const calculateStats = (dates) => {
  const total = dates.length;
  // Faqat "Bor" holati hisoblanadi
  const attended = dates.filter((item) => item.status === "Bor").length;
  // Faqat "Yo'q" holati hisoblanadi
  const missed = dates.filter((item) => item.status === "Yo'q").length;

  const percent = total > 0 ? Math.round((attended / total) * 100) : 0;

  // Foizga qarab rang berish
  let percentColor = "text-gray-900";
  if (percent >= 90) percentColor = "text-green-600";
  else if (percent >= 70) percentColor = "text-yellow-600";
  else percentColor = "text-red-600";

  // Kechikish (late) olib tashlandi
  return { total, attended, missed, percent, percentColor };
};

function MyAttendance() {
  const availableMonths = Object.keys(mockAttendanceData);
  const [selectedMonth, setSelectedMonth] = useState(
    availableMonths[0] || "December 2024"
  );
  const attendanceRecords = mockAttendanceData[selectedMonth] || [];

  return (
    <div className="min-h-full">
      {/* 1. Sarlavha Qismi */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Mening Davomatim
      </h1>
      <p className="text-gray-500 mb-6">Oylik davomatingizni kuzatib boring</p>

      {/* 2. Oyni Tanlash Tugmalari */}
      <div className="flex space-x-3 mb-10 p-2 bg-white rounded-xl shadow-sm border border-gray-100 w-fit">
        {availableMonths.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`
              px-5 py-2 rounded-lg font-medium transition duration-150 ease-in-out text-sm
              ${
                selectedMonth === month
                  ? "bg-blue-600 text-white shadow-md" // Aktiv holat
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200" // Noaktiv holat
              }
            `}
          >
            {month}
          </button>
        ))}
      </div>

      {/* 3. Davomat Ro'yxati */}
      <div className="space-y-8">
        {attendanceRecords.length > 0 ? (
          attendanceRecords.map((record, index) => {
            const stats = calculateStats(record.dates); // Statistikani hisoblash

            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              >
                {/* Fan nomi va umumiy statistika */}
                <div className="flex justify-between items-center mb-5 border-b pb-3">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {record.subject}
                  </h2>
                  <div className="flex items-center space-x-4">
                    {/* Umumiy Foiz */}
                    <span
                      className={`text-2xl font-extrabold ${stats.percentColor}`}
                    >
                      {stats.percent}%
                    </span>
                    {/* Bor */}
                    <span className="flex items-center text-sm text-green-600 font-medium bg-green-50 p-2 rounded-md">
                      <CheckCircleIcon className="h-5 w-5 mr-1" /> Bor:{" "}
                      {stats.attended}
                    </span>
                    {/* Yo'q */}
                    <span className="flex items-center text-sm text-red-600 font-medium bg-red-50 p-2 rounded-md">
                      <XCircleIcon className="h-5 w-5 mr-1" /> Yo'q:{" "}
                      {stats.missed}
                    </span>
                    {/* Kechikish (late) butunlay olib tashlandi */}
                  </div>
                </div>

                {/* Davomat sanalari */}
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  {record.dates.map((item, dateIndex) => (
                    <div key={dateIndex} className="flex flex-col items-center">
                      {/* Sana */}
                      <span className="text-xs font-medium text-gray-500 mb-1">
                        {item.date}
                      </span>

                      {/* Holat kartochkasi */}
                      <div
                        className={`
                          w-24 text-center py-2 rounded-lg font-semibold text-sm shadow-sm border
                          ${getStatusColor(item.status)}
                        `}
                      >
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-600">
              Bu oy uchun davomat ma'lumotlari mavjud emas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAttendance;

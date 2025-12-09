"use client";
import React, { useState } from "react";

// --- Mock Data (Talabaning Davomat Ma'lumotlari) ---
const mockAttendanceData = {
  // Oylar va ularning ma'lumotlari
  "December 2024": [
    {
      subject: "Matematika Asosiy",
      dates: [
        { date: "2024-12-02", status: "Keldi" },
        { date: "2024-12-04", status: "Keldi" },
        { date: "2024-12-09", status: "KelMadi" },
        { date: "2024-12-11", status: "Keldi" },
        { date: "2024-12-16", status: "Keldi" },
      ],
    },
    {
      subject: "Ingliz Tili (Boshlang'ich)",
      dates: [
        { date: "2024-12-03", status: "Keldi" },
        { date: "2024-12-05", status: "KelMadi" },
        { date: "2024-12-10", status: "Keldi" },
      ],
    },
  ],
  "November 2024": [
    {
      subject: "Matematika Asosiy",
      dates: [
        { date: "2024-11-04", status: "Keldi" },
        { date: "2024-11-06", status: "Keldi" },
        { date: "2024-11-11", status: "Keldi" },
      ],
    },
  ],
};

// --- Yordamchi Funksiya: Davomat Statusiga Qarab Rang Berish ---
const getStatusColor = (status) => {
  switch (status) {
    case "Keldi":
      // Yashil rang (Rasmga mos)
      return "bg-green-100 text-green-700 border-green-400";
    case "KelMadi":
      // Qizil rang (Rasmga mos)
      return "bg-red-100 text-red-700 border-red-400";
    case "Kechikdi":
      // Sariq rang (qo'shimcha holat)
      return "bg-yellow-100 text-yellow-700 border-yellow-400";
    default:
      return "bg-gray-100 text-gray-700 border-gray-400";
  }
};

function MyAttendance() {
  // Davomat ma'lumotlari mavjud bo'lgan oylar ro'yxati
  const availableMonths = Object.keys(mockAttendanceData);

  // Hozirda tanlangan oyni saqlash. Standart bo'yicha oxirgi oyni tanlaymiz.
  const [selectedMonth, setSelectedMonth] = useState(
    availableMonths[0] || "December 2024"
  );

  // Tanlangan oy uchun davomat ma'lumotlarini olish
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
          attendanceRecords.map((record, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              {/* Fan nomi */}
              <h2 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-3">
                {record.subject}
              </h2>

              {/* Davomat sanalari */}
              <div className="flex flex-wrap gap-x-4 gap-y-6">
                {record.dates.map((item, dateIndex) => (
                  <div key={dateIndex} className="flex flex-col items-center">
                    {/* Sana */}
                    <span className="text-xs font-medium text-gray-500 mb-1">
                      {item.date}
                    </span>

                    {/* Holat kartochkasi (Rasmga mos) */}
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
          ))
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

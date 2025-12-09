"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeftIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  WalletIcon,
  CheckIcon,
  XMarkIcon,
  PhoneIcon, // Telefon ikonkasini qo'shamiz
} from "@heroicons/react/24/outline";

// --- Mock Data ---
const mockGroup = {
  id: 1,
  name: "Web Dasturlash (Fullstack) 1-guruh",
  schedule: ["Dush", "Chor", "Jum"],
};

// **15 ta dars kuni** bilan sinaymiz
const mockDates = [
  "01/12",
  "04/12",
  "08/12",
  "11/12",
  "15/12",
  "18/12",
  "22/12",
  "25/12",
  "29/12",
  "01/01",
  "05/01",
  "08/01",
  "12/01",
  "15/01",
  "19/01",
];
const MAX_ATTENDANCE = mockDates.length;

// Talabalar Davomat, To'lov va YANGI: Telefon Ma'lumotlari (Har oy uchun)
const allStudentsData = {
  "Fevral 2026": [
    {
      id: 101,
      name: "Ali Karimov",
      phone: "+998 90 123 45 67",
      paid: true,
      dailyRecords: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      id: 102,
      name: "Olim Salimov",
      phone: "+998 99 234 56 78",
      paid: false,
      dailyRecords: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    },
    {
      id: 103,
      name: "Diyora Olimova",
      phone: "+998 91 345 67 89",
      paid: true,
      dailyRecords: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    },
    {
      id: 104,
      name: "Samandar Ergashev",
      phone: "+998 97 456 78 90",
      paid: false,
      dailyRecords: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      id: 105,
      name: "Lola Abduqayumova",
      phone: "+998 93 567 89 01",
      paid: true,
      dailyRecords: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    },
    {
      id: 106,
      name: "Ziyodulla O'ktamov",
      phone: "+998 94 678 90 12",
      paid: true,
      dailyRecords: [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
    },
    {
      id: 107,
      name: "Nigina Saidova",
      phone: "+998 95 789 01 23",
      paid: false,
      dailyRecords: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      id: 108,
      name: "Akbar Xolmatov",
      phone: "+998 98 890 12 34",
      paid: true,
      dailyRecords: [1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      id: 109,
      name: "Shaxzoda Alimova",
      phone: "+998 90 901 23 45",
      paid: true,
      dailyRecords: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    },
    {
      id: 110,
      name: "Dilshod Kamolov",
      phone: "+998 99 012 34 56",
      paid: false,
      dailyRecords: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
  ],
  // Boshqa oylar ma'lumotlari (qisqartirilgan)
  "Yanvar 2026": [
    {
      id: 101,
      name: "Ali Karimov",
      phone: "+998 90 123 45 67",
      paid: true,
      dailyRecords: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      id: 102,
      name: "Olim Salimov",
      phone: "+998 99 234 56 78",
      paid: true,
      dailyRecords: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    },
    {
      id: 103,
      name: "Diyora Olimova",
      phone: "+998 91 345 67 89",
      paid: true,
      dailyRecords: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    {
      id: 104,
      name: "Samandar Ergashev",
      phone: "+998 97 456 78 90",
      paid: true,
      dailyRecords: [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    },
    // ... boshqa talabalar ...
  ],
};

const monthOptions = Object.keys(allStudentsData).reverse();

// --- Asosiy Komponent ---
function GroupAttendance() {
  const [currentMonth, setCurrentMonth] = useState(monthOptions[0]);

  // ... useMemo, useState va useEffect logikasi o'zgarishsiz qoldi ...
  const initialStudents = useMemo(() => {
    return allStudentsData[currentMonth] || [];
  }, [currentMonth]);

  const [students, setStudents] = useState(initialStudents);

  useEffect(() => {
    setStudents(allStudentsData[currentMonth] || []);
  }, [currentMonth]);

  const handleAttendanceToggle = (studentId, dateIndex) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === studentId) {
          const newRecords = [...student.dailyRecords];
          if (dateIndex < newRecords.length) {
            newRecords[dateIndex] = newRecords[dateIndex] === 1 ? 0 : 1;
          } else {
            newRecords[dateIndex] = 1;
          }
          return { ...student, dailyRecords: newRecords };
        }
        return student;
      })
    );
  };

  const calculateTotalAttendance = (dailyRecords) => {
    return dailyRecords.reduce((sum, record) => sum + record, 0);
  };

  return (
    <div className="min-h-full">
      {/* ... Sarlavha va Oy Tanlash ... */}
      <a
        href="/teacher/my-groups"
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium transition duration-150"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Guruhlarga qaytish
      </a>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {mockGroup.name}
      </h1>

      {/* OY TANLASH BLOKI */}
      <div className="flex items-center space-x-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm max-w-lg">
        <CalendarDaysIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
        <label
          htmlFor="month-selector"
          className="text-base font-semibold text-gray-700 flex-shrink-0"
        >
          Oy Tanlash:
        </label>
        <select
          id="month-selector"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-800 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Talabalar Jadvali */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50 sticky top-0">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider min-w-[200px]"
              >
                Talaba
              </th>
              {/* YANGI USTUN: Telefon Raqami */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider min-w-[150px]"
              >
                Telefon
              </th>
              {/* Mavjud Ustunlar */}
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider"
              >
                To'lov
              </th>
              {mockDates.slice(0, MAX_ATTENDANCE).map((date, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-3 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider min-w-[60px]"
                >
                  {date}
                </th>
              ))}
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider min-w-[100px] border-l border-gray-200"
              >
                Jami Davomat
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {students.length > 0 ? (
              students.map((student) => {
                const totalAttendance = calculateTotalAttendance(
                  student.dailyRecords
                );
                const attendancePercent =
                  (totalAttendance / MAX_ATTENDANCE) * 100;
                const totalColor =
                  attendancePercent <= 30
                    ? "text-red-600"
                    : attendancePercent < 70
                    ? "text-yellow-600"
                    : "text-green-600";
                const rowClass = student.paid
                  ? "hover:bg-gray-50"
                  : "bg-red-50/50 hover:bg-red-100";

                return (
                  <tr
                    key={student.id}
                    className={`transition duration-100 ${rowClass}`}
                  >
                    {/* Talaba nomi */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-6 w-6 mr-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {student.name}
                        </span>
                      </div>
                    </td>

                    {/* YANGI QISM: Telefon Raqami */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={`tel:${student.phone.replace(/\s/g, "")}`}
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        {student.phone}
                      </a>
                    </td>

                    {/* To'lov Statusi */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div
                        className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center justify-center
                                                ${
                                                  student.paid
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700 border border-red-400"
                                                }`}
                      >
                        <WalletIcon className="h-4 w-4 mr-1" />
                        {student.paid ? "To'landi" : "Yo'q (Qarz)"}
                      </div>
                    </td>

                    {/* Kunlik Davomat Belgilari va Tugmalar */}
                    {student.dailyRecords
                      .slice(0, MAX_ATTENDANCE)
                      .map((record, dateIndex) => (
                        <td
                          key={dateIndex}
                          className="px-3 py-4 whitespace-nowrap text-center"
                        >
                          <button
                            onClick={() =>
                              handleAttendanceToggle(student.id, dateIndex)
                            }
                            className={`p-1 rounded-md transition duration-100 ${
                              record === 1
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-red-100 text-red-600 hover:bg-red-200"
                            }`}
                            title={record === 1 ? "Qatnashgan" : "Qoldirgan"}
                          >
                            {record === 1 ? (
                              <CheckIcon className="h-5 w-5" />
                            ) : (
                              <XMarkIcon className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                      ))}

                    {/* Jami Davomat */}
                    <td className="px-6 py-4 whitespace-nowrap text-center border-l border-gray-200">
                      <span className={`text-xl font-extrabold ${totalColor}`}>
                        {totalAttendance}
                      </span>
                      <span className="text-sm text-gray-500">
                        {" "}
                        / {MAX_ATTENDANCE}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4 + MAX_ATTENDANCE}
                  className="text-center py-10 text-gray-500"
                >
                  Bu oy uchun talabalar ma'lumoti topilmadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg shadow-sm">
        <p className="text-sm font-medium">Eslatma:</p>
        <ul className="list-disc list-inside ml-4 text-xs">
          <li>
            **Telefon Raqami:** Har bir talabaning telefon raqami jadvalga
            qo'shildi va to'g'ridan-to'g'ri qo'ng'iroq qilish imkoniyati
            yaratildi.
          </li>
          <li>
            **Kunlik Belgilash:** Har bir sana ostidagi belgiga bosish orqali
            **Davomatni `1` (✅) yoki `0` (❌) ga o'zgartirishingiz** mumkin.
          </li>
          <li>
            **To'lov Qarz:** Agar talabaning to'lovi **To'lanmagan** bo'lsa,
            qator **och pushti rangda** ajratiladi.
          </li>
        </ul>
      </div> */}
    </div>
  );
}

function page() {
  return <GroupAttendance />;
}

export default page;

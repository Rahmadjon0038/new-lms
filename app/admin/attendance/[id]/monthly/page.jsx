"use client";
import React, { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMonthlyAttendance } from "../../../.././../hooks/attendance-monthly";



const MonthlyAttendancePage = () => {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id;
  // Default to current month
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const { data, isLoading, error } = useMonthlyAttendance(groupId, selectedMonth);

  const group = data?.data?.group;
  const lessons = data?.data?.lessons || [];
  const attendanceGrid = data?.data?.attendance_grid || [];
  const stats = data?.data?.stats;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white shadow hover:shadow-md"
          >
            Orqaga
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Oylik Davomat Hisoboti
            </h1>
            {group && (
              <div className="mt-1 text-gray-700 text-sm">
                <span className="font-semibold">Guruh:</span> {group.name}
                {group.schedule && (
                  <span className="ml-4">
                    <span className="font-semibold">Dars vaqti:</span> {group.schedule.days?.join(', ')} {group.schedule.time}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Oy:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <button
            className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition-colors"
            disabled
          >
            Excelga export qilish
          </button>
        </div>
        {isLoading ? (
          <div className="text-center py-8">Yuklanmoqda...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold mb-2">Xatolik yuz berdi:</p>
            <p className="text-sm">{error.message || "API bilan bog'lanishda xatolik"}</p>
          </div>
        ) : lessons.length > 0 && attendanceGrid.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <div className="mb-4">
              <div className="text-lg font-bold text-gray-800">{group?.name}</div>
              <div className="text-sm text-gray-600">Oy: {stats?.month}</div>
              <div className="text-sm text-gray-600">Jami darslar: {lessons.length}</div>
              <div className="text-sm text-gray-600">Jami talabalar: {attendanceGrid.length}</div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="min-w-full border border-gray-400">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-left border border-gray-400">#</th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-left border border-gray-400">Talaba</th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-700 text-center border border-gray-400">Holati</th>
                    {lessons.map(lesson => (
                      <th key={lesson.id} className="px-4 py-2 text-xs font-semibold text-gray-700 text-center bg-gray-50 sticky top-0 z-10 border border-gray-400">{lesson.date.replace(/-/g, ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {attendanceGrid.map((student, idx) => (
                    <tr key={student.student_id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-xs text-gray-600 border border-gray-400">{idx + 1}</td>
                      <td className="px-4 py-2 text-xs font-medium text-gray-900 whitespace-nowrap border border-gray-400">
                        {student.name} {student.surname}
                      </td>
                      <td className="px-4 py-2 text-xs text-center border border-gray-400">{student.group_status_description}</td>
                      {lessons.map(lesson => {
                        const status = student.attendance[lesson.date];
                        return (
                          <td key={lesson.date} className="px-4 py-2 text-center border border-gray-400">
                            {status === "keldi" ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 inline" title="Keldi" />
                            ) : status === "kelmadi" ? (
                              <XCircleIcon className="h-5 w-5 text-red-500 inline" title="Kelmadi" />
                            ) : status === "bitirgan" ? (
                              <span className="text-purple-600 font-semibold">🎓</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Ma'lumot topilmadi</div>
        )}
      </div>
    </div>
  );
};

export default MonthlyAttendancePage;

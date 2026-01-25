import React from "react";
import { useMonthlyAttendance } from "../hooks/attendance-monthly";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

const MonthlyAttendanceInline = ({ groupId, selectedMonth }) => {
  const { data, isLoading, error } = useMonthlyAttendance(groupId, selectedMonth);
  const group = data?.data?.group;
  const lessons = data?.data?.lessons || [];
  const attendanceGrid = data?.data?.attendance_grid || [];
  const stats = data?.data?.stats;

  if (isLoading) return <div className="text-center py-8">Oylik hisobot yuklanmoqda...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">Oylik hisobotda xatolik: {error.message}</div>;
  if (!lessons.length || !attendanceGrid.length) return null;

  return (
    <div className="bg-white rounded-lg  overflow-x-auto mt-12 p-4 ">
        
      {/* <div className="mb-4">
        <div className="text-lg font-bold text-gray-800">{group?.name}</div>
        <div className="text-sm text-gray-600">Oy: {stats?.month}</div>
        <div className="text-sm text-gray-600">Jami darslar: {lessons.length}</div>
        <div className="text-sm text-gray-600">Jami talabalar: {attendanceGrid.length}</div>
        <div className="text-sm text-gray-600">O'qituvchi: {group?.teacher_name} ({group?.teacher_phone})</div>
        <div className="text-sm text-gray-600">Fan: {group?.subject_name}</div>
        {group?.schedule && (
          <div className="text-sm text-gray-600">Dars vaqti: {group.schedule.days?.join(', ')} {group.schedule.time}</div>
        )}
      </div> */}
    <div className="flex  justify-between items-center">
      <h1 className="text-xl" >To'liq oylik davomat Xisoboti</h1>
      <button className="bg-green-500 active:scale-90 px-3 py-2 rounded-sm text-white">Exelga export qilish</button>
    </div>
      <div className="overflow-x-auto mt-3 ">
        <table className="min-w-full ">
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
                        <span className="text-purple-600 font-semibold">Bitirgan</span>
                      ) : status === "toxtatgan" ? (
                        <span className="text-orange-600 font-semibold">to'xtagan</span>
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
  );
};

export default MonthlyAttendanceInline;

import React from "react";
import { useMonthlyAttendance } from "../hooks/attendance-monthly";
import { instance } from "../hooks/api";

const MonthlyAttendanceInline = ({ groupId, selectedMonth }) => {
  const { data, isLoading, error } = useMonthlyAttendance(groupId, selectedMonth);
  
  const monthData = data?.data;
  const lessons = (monthData?.lessons || []).reverse(); // Yangi darslar pastda
  const students = monthData?.students || [];

  // Excel export handler
  const handleExport = async () => {
    if (!groupId || !selectedMonth) {
      alert('Guruh yoki oy tanlanmagan');
      return;
    }
    
    try {
      console.log(`Exporting for Group ID: ${groupId}, Month: ${selectedMonth}`);
      
      // Instance orqali to'g'ri API chaqirish
      const response = await instance.get(`/api/attendance/groups/${groupId}/monthly/export?month=${selectedMonth}`, {
        responseType: 'blob'
      });
      
      // Excel faylni yuklab olish
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `davomat_guruh_${groupId}_${selectedMonth}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export xatosi:', error);
      
      if (error.response?.status === 404) {
        alert('Export API topilmadi. Backend developer bilan bog\'laning.');
      } else if (error.response?.status === 500) {
        alert('Serverda xatolik yuz berdi.');
      } else {
        alert(`Export da xatolik: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  if (isLoading) return <div className="text-center py-6 sm:py-8 text-sm sm:text-base">Oylik hisobot yuklanmoqda...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">Oylik hisobotda xatolik: {error.message}</div>;
  if (!lessons.length || !students.length) return null;

  // Format date from YYYY-MM-DD to DD.MM.YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="bg-white rounded-lg overflow-x-auto mt-6 sm:mt-8 md:mt-12 p-3 sm:p-4 md:p-6">
        
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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">To'liq oylik davomat Xisoboti</h1>
      <button 
        onClick={handleExport}
        className="bg-green-500 active:scale-90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-white hover:bg-green-600 transition-colors shadow-md whitespace-nowrap w-full sm:w-auto"
      >
        <span className="hidden sm:inline">Exelga export qilish</span>
        <span className="sm:hidden">Export</span>
      </button>
    </div>
      <div className="overflow-x-auto mt-3 sm:mt-4 -mx-3 sm:mx-0">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-gray-700 text-left border border-gray-400">#</th>
              <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-gray-700 text-left border border-gray-400 whitespace-nowrap">Talaba</th>
              <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-gray-700 text-center border border-gray-400 whitespace-nowrap">Holati</th>
              {lessons.map(lesson => (
                <th key={lesson.id} className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-700 text-center bg-gray-50 sticky top-0 z-10 border border-gray-400 whitespace-nowrap min-w-[80px] sm:min-w-[100px]">
                  {formatDate(lesson.date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {students.map((student, idx) => {
              // Create a map of attendance records by lesson_id for quick lookup
              const attendanceMap = {};
              student.attendance_records?.forEach(record => {
                attendanceMap[record.lesson_id] = record.status;
              });

              return (
                <tr key={`${student.student_id}-${idx}`} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-600 border border-gray-400">{idx + 1}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-gray-900 whitespace-nowrap border border-gray-400">
                    {student.student_name}
                  </td>
                  <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] md:text-xs text-center border border-gray-400">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.monthly_status === "active" ? "bg-green-100 text-green-800" :
                      student.monthly_status === "stopped" ? "bg-orange-100 text-orange-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {student.monthly_status === "active" ? "Faol" : student.monthly_status === "stopped" ? "To'xtagan" : student.monthly_status}
                    </span>
                  </td>
                  {lessons.map(lesson => {
                    const status = attendanceMap[lesson.id];
                    return (
                      <td key={lesson.id} className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-center border border-gray-400">
                        {status === "keldi" ? (
                          <p className="text-green-600 text-sm sm:text-base font-bold">✓</p>
                        ) : status === "kelmadi" ? (
                          <p className="text-red-600 text-sm sm:text-base font-bold">✗</p>
                        ) : student.monthly_status === "stopped" ? (
                          <span className="text-orange-600 font-semibold text-[9px] sm:text-[10px] md:text-xs">-</span>
                        ) : (
                          <span className="text-gray-400 text-xs sm:text-sm">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyAttendanceInline;

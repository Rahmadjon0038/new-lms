import React, { useState } from "react";
import { useMonthlyAttendance } from "../hooks/attendance-monthly";
import { instance } from "../hooks/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

// API function for getting user profile
const getUserProfile = async () => {
  const response = await instance.get('/api/users/profile');
  return response.data;
};

// API function for updating monthly status
const updateMonthlyStatus = async (data) => {
  const response = await instance.put('/api/attendance/student/monthly-status', data);
  return response.data;
};

// Monthly Status Update Modal
const MonthlyStatusModal = ({ isOpen, onClose, student, groupId, currentMonth, updateStatusMutation }) => {
  const [newStatus, setNewStatus] = useState('');
  const [updateType, setUpdateType] = useState('single'); // single, multiple, fromMonth
  const [selectedMonths, setSelectedMonths] = useState([]);

  // Initialize modal state when opened
  React.useEffect(() => {
    if (isOpen && student) {
      setNewStatus(student.monthly_status === 'active' ? 'stopped' : 'active');
      setUpdateType('single');
      setSelectedMonths([]); // Bo'sh array bilan boshlash
    }
  }, [isOpen, student, currentMonth]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!student) return;

    let requestData = {
      student_id: student.student_id,
      group_id: parseInt(groupId),
      monthly_status: newStatus
    };

    if (updateType === 'single') {
      requestData.month = currentMonth;
    } else if (updateType === 'multiple') {
      requestData.months = selectedMonths;
    } else if (updateType === 'fromMonth') {
      // Keyingi oydan boshlash uchun currentMonth + 1
      const [year, month] = currentMonth.split('-').map(Number);
      const nextMonth = month + 1;
      const nextYear = year + Math.floor((nextMonth - 1) / 12);
      const finalMonth = ((nextMonth - 1) % 12) + 1;
      const nextMonthStr = `${nextYear}-${String(finalMonth).padStart(2, '0')}`;
      requestData.from_month = nextMonthStr;
    }

    updateStatusMutation.mutate(requestData);
  };

  const handleMonthToggle = (month) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  // Generate month options (2025-01 dan 2030-12 gacha)
  const generateMonthOptions = () => {
    const options = [];
    
    // 2025 yildan 2030 yilgacha barcha oylar
    for (let year = 2025; year <= 2030; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        options.push(monthStr);
      }
    }
    
    return options;
  };

  if (!isOpen || !student) return null;

  const monthOptions = generateMonthOptions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Oylik Statusni O'zgartirish
        </h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Talaba: <strong>{student.student_name}</strong></p>
          <p className="text-sm text-gray-600">
            Joriy status: <span className={`font-semibold ${
              student.monthly_status === 'active' ? 'text-green-600' : 'text-orange-600'
            }`}>
              {student.monthly_status === 'active' ? 'Faol' : 'To\\xtagan'}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* New Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yangi Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="active">Faol (Active)</option>
              <option value="stopped">To'xtatilgan (Stopped)</option>
            </select>
          </div>

          {/* Update Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qaysi oylarni o'zgartirish
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="single"
                  checked={updateType === 'single'}
                  onChange={(e) => setUpdateType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Faqat joriy oy ({currentMonth})</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  value="fromMonth"
                  checked={updateType === 'fromMonth'}
                  onChange={(e) => setUpdateType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Keyingi oydan boshlab barcha oylar</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  value="multiple"
                  checked={updateType === 'multiple'}
                  onChange={(e) => setUpdateType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Bir necha oylarni tanlash</span>
              </label>
            </div>
          </div>

          {/* Multiple Months Selection */}
          {updateType === 'multiple' && (
            <div className="mb-4 p-3 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              <p className="text-xs font-medium text-gray-700 mb-2">Oylarni tanlang:</p>
              <div className="space-y-1">
                {monthOptions.map(month => (
                  <label key={month} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedMonths.includes(month)}
                      onChange={() => handleMonthToggle(month)}
                      className="mr-2"
                    />
                    <span className="text-sm">{month}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={updateStatusMutation.isLoading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={updateStatusMutation.isLoading || (updateType === 'multiple' && selectedMonths.length === 0)}
            >
              {updateStatusMutation.isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MonthlyAttendanceInline = ({ groupId, selectedMonth }) => {
  const { data, isLoading, error } = useMonthlyAttendance(groupId, selectedMonth);
  const queryClient = useQueryClient();
  const [statusModal, setStatusModal] = useState({ isOpen: false, student: null });
  
  // Get user profile to check role
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile
  });
  
  const isAdmin = userProfile?.data?.role === 'admin';
  
  const monthData = data?.data;
  const lessons = (monthData?.lessons || []).reverse(); // Yangi darslar pastda
  const students = monthData?.students || [];

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: updateMonthlyStatus,
    onSuccess: () => {
      toast.success('Status muvaffaqiyatli o\'zgartirildi!');
      queryClient.invalidateQueries(['monthly-attendance', groupId, selectedMonth]);
      setStatusModal({ isOpen: false, student: null });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Status o\'zgartirishda xatolik';
      toast.error(message);
    }
  });

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
              <th className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-gray-700 text-center border border-gray-400 whitespace-nowrap">Statistika</th>
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
                    <div>
                      <div className="font-medium">{student.student_name}</div>
                      <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">{student.phone}</div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] md:text-xs text-center border border-gray-400">
                    <div className="flex justify-center  items-center gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.monthly_status === "active" ? "bg-green-100 text-green-800" :
                        student.monthly_status === "stopped" ? "bg-orange-100 text-orange-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {student.monthly_status === "active" ? "Faol" : student.monthly_status === "stopped" ? "To'xtagan" : student.monthly_status}
                      </span>
                      <button
                        onClick={() => setStatusModal({ isOpen: true, student })}
                        className="text-xs px-2 py-0.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors "
                        title="Statusni o'zgartirish"
                      >
                        O'zgartirish
                      </button>
                    </div>
                  </td>
                  {lessons.map(lesson => {
                    const status = attendanceMap[lesson.id];
                    return (
                      <td key={lesson.id} className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-center border border-gray-400">
                        {status === "keldi" ? (
                          <p className="text-green-600 text-sm sm:text-base font-bold">✓</p>
                        ) : status === "kelmadi" ? (
                          <p className="text-red-600 text-sm sm:text-base font-bold">✗</p>
                        ) : (
                          <span className="text-gray-400 text-xs sm:text-sm">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] md:text-xs text-center border border-gray-400">
                    <div className="text-center">
                      <div className="text-green-600 font-semibold">{student.statistics?.total_attended || student.total_present || 0}</div>
                      <div className="text-red-600 font-semibold">{student.statistics?.total_missed || student.total_absent || 0}</div>
                      <div className={`text-xs font-medium ${
                        (student.statistics?.attendance_percentage || 0) >= 80 ? 'text-green-600' :
                        (student.statistics?.attendance_percentage || 0) >= 60 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {student.statistics?.attendance_percentage || 0}%
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Monthly Status Modal */}
      <MonthlyStatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, student: null })}
        student={statusModal.student}
        groupId={groupId}
        currentMonth={selectedMonth}
        updateStatusMutation={updateStatusMutation}
      />
    </div>
  );
};

export default MonthlyAttendanceInline;

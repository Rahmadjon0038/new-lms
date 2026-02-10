"use client";
import React, { useState } from "react";
import {
  ArrowLeftIcon,
  CalendarIcon,
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  ChevronDownIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import {
  Calendar as CalendarLucide,
  Clock as ClockLucide,
  Users as UsersLucide,
  User
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "../../../../hooks/api";
import MonthlyAttendanceInline from "../../../../components/MonthlyAttendanceInline";
import { toast } from "react-hot-toast";

const MAIN_COLOR = "#A60E07";

// API functions
const getGroupLessons = async (groupId, month) => {
  const params = new URLSearchParams();
  if (month) {
    params.append('month', month);
  }
  
  const queryString = params.toString();
  const url = `/api/attendance/groups/${groupId}/lessons${queryString ? `?${queryString}` : ''}`;
  
  const response = await instance.get(url);
  return response.data.data;
};

// Create lesson API
const createLesson = async ({ group_id, date }) => {
  const response = await instance.post('/api/attendance/lessons', {
    group_id,
    date
  });
  return response.data;
};

const updateLessonDate = async ({ lesson_id, date }) => {
  const response = await instance.put(`/api/attendance/lessons/${lesson_id}/date`, {
    date,
  });
  return response.data;
};

const getLessonStudents = async (lesson_id) => {
  const response = await instance.get(`/api/attendance/lessons/${lesson_id}/students`);
  return response.data?.data ?? [];
};

const saveLessonAttendance = async ({ lesson_id, attendance_records }) => {
  const response = await instance.put(`/api/attendance/lessons/${lesson_id}/mark`, {
    attendance_records,
  });
  return response.data;
};

const regenerateLessons = async ({ group_id, month, from_date }) => {
  const payload = { month };
  if (from_date) payload.from_date = from_date;
  const response = await instance.post(`/api/attendance/groups/${group_id}/lessons/regenerate`, payload);
  return response.data;
};

// Create Lesson Modal Component
const CreateLessonModal = ({ isOpen, onClose, groupId }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  );
  const queryClient = useQueryClient();
  
  const createLessonMutation = useMutation({
    mutationFn: createLesson,
    onSuccess: (data) => {
      toast.success('Dars muvaffaqiyatli yaratildi!');
      queryClient.invalidateQueries(['group-lessons', groupId]);
      onClose();
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Dars yaratishda xatolik yuz berdi';
      toast.error(message);
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error('Iltimos, sana tanlang');
      return;
    }
    
    createLessonMutation.mutate({
      group_id: parseInt(groupId),
      date: selectedDate
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-30 p-3 sm:p-4">
      <div className="mx-0 w-full max-w-md rounded-lg bg-white p-4 shadow-lg sm:mx-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Yangi Dars Yaratish</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dars sanasi
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
              required
            />
          </div>
          
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={createLessonMutation.isLoading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              style={{ backgroundColor: MAIN_COLOR }}
              disabled={createLessonMutation.isLoading}
            >
              {createLessonMutation.isLoading ? 'Yaratilmoqda...' : 'Dars yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditLessonDateModal = ({ isOpen, onClose, lesson, selectedDate, setSelectedDate, onSubmit, isLoading }) => {
  if (!isOpen || !lesson) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);
    if (!isValidDate) {
      toast.error("Sana formati noto'g'ri (YYYY-MM-DD)");
      return;
    }
    onSubmit({
      lesson_id: lesson.id,
      date: selectedDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="mx-0 w-full max-w-md rounded-lg bg-white p-4 shadow-lg sm:mx-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dars sanasini o&apos;zgartirish</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yangi sana
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
              required
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              style={{ backgroundColor: MAIN_COLOR }}
              disabled={isLoading}
            >
              {isLoading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RegenerateLessonsModal = ({ isOpen, onClose, month, fromDate, setFromDate, onSubmit, isLoading }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
      toast.error("from_date formati noto'g'ri (YYYY-MM-DD)");
      return;
    }
    if (fromDate && !fromDate.startsWith(`${month}-`)) {
      toast.error("from_date tanlangan oy ichida bo'lishi kerak");
      return;
    }
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="mx-0 w-full max-w-md rounded-lg bg-white p-4 shadow-lg sm:mx-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Darslarni qayta yaratish</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Oy</label>
              <input
                type="month"
                value={month}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Boshlanish sanasi (ixtiyoriy)</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A60E07]"
              />
              <p className="mt-1 text-xs text-gray-500">Bo&apos;sh qoldirilsa, shu oy ichidagi barcha lesson/davomat qayta yaratiladi.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isLoading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Qayta yaratilmoqda..." : "Qayta yaratish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ title, value, icon: Icon, color = "text-blue-600" }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: MAIN_COLOR }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
      </div>
      <Icon className="h-8 w-8 text-gray-400" />
    </div>
  </div>
);

// Main Component
const GroupLessonsPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const groupId = params.id;
  
  // URL dan month parametrini o'qish yoki joriy oyni olish
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const monthFromURL = searchParams.get('month');
    if (monthFromURL) {
      return monthFromURL;
    }
    
    // Agar URL da yo'q bo'lsa, localStorage dan o'qish
    if (typeof window !== 'undefined') {
      const savedMonth = localStorage.getItem('selectedMonth');
      if (savedMonth) {
        return savedMonth;
      }
    }
    
    // Default joriy oy
    return new Date().toISOString().slice(0, 7); // YYYY-MM format
  });

  // URL ni yangilash selectedMonth o'zgarganda
  const updateURLWithMonth = (month) => {
    if (typeof window !== 'undefined') {
      // localStorage ga saqlash
      localStorage.setItem('selectedMonth', month);
      
      const newURL = new URL(window.location.href);
      newURL.searchParams.set('month', month);
      router.replace(newURL.pathname + '?' + newURL.searchParams.toString(), { scroll: false });
    }
  };
  
  // Create lesson modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, lesson: null });
  const [editLessonDateValue, setEditLessonDateValue] = useState("");
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [regenerateFromDate, setRegenerateFromDate] = useState("");
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [lessonPanels, setLessonPanels] = useState({});

  const { data: lessonsData, isLoading, error } = useQuery({
    queryKey: ['group-lessons', groupId, selectedMonth],
    queryFn: () => getGroupLessons(groupId, selectedMonth),
    enabled: !!groupId,
  });

  const updateLessonDateMutation = useMutation({
    mutationFn: updateLessonDate,
    onSuccess: () => {
      toast.success("Dars sanasi yangilandi!");
      queryClient.invalidateQueries({ queryKey: ['group-lessons', groupId, selectedMonth] });
      setEditModal({ isOpen: false, lesson: null });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Dars sanasini yangilashda xatolik yuz berdi";
      toast.error(message);
    },
  });

  const regenerateLessonsMutation = useMutation({
    mutationFn: () => regenerateLessons({
      group_id: groupId,
      month: selectedMonth,
      from_date: regenerateFromDate || undefined,
    }),
    onSuccess: () => {
      toast.success("Lessonlar qayta yaratildi!");
      setIsRegenerateModalOpen(false);
      setRegenerateFromDate("");
      setExpandedLessonId(null);
      setLessonPanels({});
      queryClient.invalidateQueries({ queryKey: ['group-lessons', groupId, selectedMonth] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Qayta yaratishda xatolik");
    },
  });

  const groupInfo = lessonsData?.group || null;
  let lessons = [];

  if (Array.isArray(lessonsData)) {
    lessons = lessonsData;
  } else if (Array.isArray(lessonsData?.lessons)) {
    lessons = lessonsData.lessons;
  }
  // Show newest lessons first
  lessons = [...lessons].reverse();

  const handleEditLessonDate = (lesson) => {
    setEditLessonDateValue(String(lesson?.date || "").slice(0, 10));
    setEditModal({ isOpen: true, lesson });
  };

  const handleToggleAttendancePanel = async (lessonId) => {
    if (expandedLessonId === lessonId) {
      setExpandedLessonId(null);
      return;
    }

    setExpandedLessonId(lessonId);
    const existingPanel = lessonPanels[lessonId];
    if (existingPanel?.students) return;

    setLessonPanels((prev) => ({
      ...prev,
      [lessonId]: {
        ...(prev[lessonId] || {}),
        isLoading: true,
        error: null,
      },
    }));

    try {
      const students = await getLessonStudents(lessonId);
      const attendanceData = {};
      students.forEach((student) => {
        const rawStatus = student?.status;
        const isMarked = Boolean(student?.is_marked);
        if (!isMarked || !rawStatus) {
          attendanceData[student.attendance_id] = "__unmarked__";
          return;
        }
        attendanceData[student.attendance_id] = rawStatus;
      });

      setLessonPanels((prev) => ({
        ...prev,
        [lessonId]: {
          students,
          attendanceData,
          hasChanges: false,
          isSaving: false,
          isLoading: false,
          error: null,
        },
      }));
    } catch (err) {
      setLessonPanels((prev) => ({
        ...prev,
        [lessonId]: {
          ...(prev[lessonId] || {}),
          isLoading: false,
          error: err?.response?.data?.message || "Davomat ma'lumotlarini yuklashda xatolik",
        },
      }));
    }
  };

  const handleInlineStatusChange = (lessonId, attendanceId, status) => {
    setLessonPanels((prev) => {
      const panel = prev[lessonId] || {};
      return {
        ...prev,
        [lessonId]: {
          ...panel,
          attendanceData: {
            ...(panel.attendanceData || {}),
            [attendanceId]: status,
          },
          hasChanges: true,
        },
      };
    });
  };

  const handleSaveInlineAttendance = async (lessonId) => {
    const panel = lessonPanels[lessonId];
    if (!panel?.hasChanges) {
      toast("Hech qanday o'zgarish yo'q");
      return;
    }

    const allowedStatuses = ["keldi", "kelmadi"];
    const attendance_records = Object.entries(panel.attendanceData || {})
      .filter(([, status]) => allowedStatuses.includes(status))
      .map(([attendance_id, status]) => ({
        attendance_id: Number(attendance_id),
        status,
      }));

    if (!attendance_records.length) {
      toast.error("Saqlash uchun kamida bitta davomat statusini tanlang");
      return;
    }

    setLessonPanels((prev) => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        isSaving: true,
      },
    }));

    try {
      await saveLessonAttendance({
        lesson_id: lessonId,
        attendance_records,
      });

      toast.success("Davomat saqlandi!");
      setExpandedLessonId(null);
      queryClient.invalidateQueries({ queryKey: ['group-lessons', groupId, selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['monthly-attendance', groupId, selectedMonth] });

      setLessonPanels((prev) => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          hasChanges: false,
          isSaving: false,
        },
      }));
    } catch (err) {
      setLessonPanels((prev) => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          isSaving: false,
        },
      }));
      toast.error(err?.response?.data?.message || "Davomatni saqlashda xatolik");
    }
  };

  // Format date for display (UTC, YYYY MM DD, no timezone shift)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Only take the date part, avoid timezone shift
    return dateString.slice(0, 10).replace(/-/g, ' ');
  };
  const getWeekdayFull = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = String(dateString).slice(0, 10).split("-").map(Number);
    if (!year || !month || !day) return "";
    const date = new Date(year, month - 1, day);
    const weekdays = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
    return weekdays[date.getDay()] || "";
  };
  // Optionally keep time formatter if needed elsewhere
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate overall statistics
  const totalLessons = lessons.length;
  const totalStudentsAttended = lessons.reduce((sum, lesson) => sum + (parseInt(lesson.present_count) || 0), 0);
  const totalStudentsExpected = lessons.reduce((sum, lesson) => sum + (parseInt(lesson.total_students) || 0), 0);
  const averageAttendance = totalStudentsExpected > 0 
    ? Math.round((totalStudentsAttended / totalStudentsExpected) * 100)
    : 0;

  const renderAttendancePanel = (lesson, panel) => (
    <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
      {panel.isLoading ? (
        <div className="text-sm text-gray-500">Yuklanmoqda...</div>
      ) : panel.error ? (
        <div className="text-sm text-red-600">{panel.error}</div>
      ) : (panel.students || []).length === 0 ? (
        <div className="text-sm text-gray-500">Bu dars uchun talabalar topilmadi</div>
      ) : (
        <>
          <div className="space-y-2">
            {(panel.students || []).map((student) => {
              const currentStatus = (panel.attendanceData || {})[student.attendance_id] || "__unmarked__";
              const statusBadgeClass =
                student.monthly_status === "active"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : student.monthly_status === "stopped"
                    ? "bg-orange-100 text-orange-700 border-orange-200"
                    : "bg-gray-100 text-gray-700 border-gray-200";

              return (
                <div key={student.student_id} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                    <div className="text-[11px] text-gray-500">{student.phone}</div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${statusBadgeClass}`}>
                        {student.monthly_status_description || student.monthly_status || "Status yo'q"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <select
                      value={currentStatus}
                      onChange={(e) => handleInlineStatusChange(lesson.id, student.attendance_id, e.target.value)}
                      disabled={panel.isSaving || !student.can_mark}
                      className={`w-full sm:w-32 px-2.5 py-1.5 rounded-lg border text-xs font-semibold outline-none transition ${
                        currentStatus === "keldi"
                          ? "bg-green-50 border-green-300 text-green-700"
                          : currentStatus === "kelmadi"
                            ? "bg-red-50 border-red-300 text-red-700"
                            : "bg-gray-50 border-gray-300 text-gray-600"
                      } disabled:opacity-50`}
                    >
                      <option value="__unmarked__" disabled>Hali belgilanmagan</option>
                      <option value="keldi">Keldi</option>
                      <option value="kelmadi">Kelmadi</option>
                    </select>
                    {!student.can_mark && (
                      <span className="text-[11px] text-gray-400">Yopiq</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {panel.hasChanges && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => handleSaveInlineAttendance(lesson.id)}
                disabled={panel.isSaving}
                className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
                style={{ backgroundColor: MAIN_COLOR }}
              >
                {panel.isSaving ? "Saqlanmoqda..." : "Davomatni saqlash"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: MAIN_COLOR }}></div>
            <p className="text-gray-600 mt-4">Yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Xatolik yuz berdi:</p>
            <p className="text-sm">{error.message || 'API bilan bog\'lanishda xatolik'}</p>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mx-auto">
        
        {/* Header */}
        <div className="mb-5 flex items-start gap-3 sm:mb-6 sm:gap-4">
          <button 
            onClick={() => router.back()}
            className="rounded-lg bg-white p-2 shadow-md transition-all hover:shadow-lg"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="min-w-0 flex-1">
            <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl break-words">
              {groupInfo?.group_name || 'Guruh'} - Darslar
            </h1>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                O&apos;qituvchi: {groupInfo?.teacher_name || 'Belgilanmagan'}
              </p>
              {/* <p className="text-sm text-gray-600">
                Fan: {groupInfo?.subject_name || 'Belgilanmagan'}
              </p> */}
              
            </div>
          </div>
        </div>

        {/* Month Filter */}
        <div className="mb-6">
          <div className="rounded-lg bg-white p-4 shadow-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Oy bo&apos;yicha filter:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  const newMonth = e.target.value;
                  setSelectedMonth(newMonth);
                  updateURLWithMonth(newMonth);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#A60E07] sm:w-auto"
              />
            </div>
          </div>
        </div>

        {/* Statistics - Compact */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatCard 
            title="Jami Darslar" 
            value={totalLessons}
            icon={CalendarIcon}
            color="text-blue-600"
          />
          <StatCard 
            title="O'rtacha Davomat" 
            value={`${averageAttendance}%`}
            icon={CheckCircleIcon}
            color={averageAttendance >= 80 ? 'text-green-600' : 
                   averageAttendance >= 60 ? 'text-orange-600' : 'text-red-600'}
          />
        </div> */}

        {/* Lessons Table */}
        {lessons.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md sm:p-12">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {selectedMonth ? 'Tanlangan oyda darslar topilmadi' : 'Hali darslar yaratilmagan'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {selectedMonth ? 'Boshqa oy tanlang yoki yangi dars yarating' : 'Yangi dars yaratish uchun tugmani bosing'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mx-auto mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-2 text-sm font-medium text-white shadow-md transition-colors hover:opacity-90 sm:w-auto"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              <PlusIcon className="h-4 w-4" />
              Yangi Dars Yaratish
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <h2 className="text-base font-semibold text-gray-800 sm:text-lg">
                Darslar ro&apos;yxati ({lessons.length} ta)
              </h2>
              
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:opacity-90 sm:w-auto"
                style={{ backgroundColor: MAIN_COLOR }}
              >
                <PlusIcon className="h-4 w-4" />
                Yangi Dars
              </button>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-[980px] w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      №
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dars vaqti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qatnashganlar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelmaganlar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Davomat %
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lessons.map((lesson, index) => {
                    const totalStudents = parseInt(lesson.total_students) || 0;
                    const presentCount = parseInt(lesson.present_count) || 0;
                    const absentCount = parseInt(lesson.absent_count) || 0;
                    const attendancePercentage = totalStudents > 0 
                      ? Math.round((presentCount / totalStudents) * 100)
                      : 0;
                    const panel = lessonPanels[lesson.id] || {};
                    const isExpanded = expandedLessonId === lesson.id;
                    
                    return (
                      <React.Fragment key={lesson.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {getWeekdayFull(lesson.date)} {lesson.formatted_date || formatDate(lesson.date)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-lg font-bold text-green-600">
                                {presentCount}
                              </div>
                              <div className="text-sm text-gray-500 ml-1">
                                / {totalStudents}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold text-red-600">
                              {absentCount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    attendancePercentage >= 80 ? 'bg-green-500' :
                                    attendancePercentage >= 60 ? 'bg-yellow-500' : 
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${attendancePercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-gray-700">{attendancePercentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleAttendancePanel(lesson.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors"
                                style={{ backgroundColor: MAIN_COLOR }}
                              >
                                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                Davomat qilish
                              </button>
                              <button
                                onClick={() => handleEditLessonDate(lesson)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                                Sana
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-6 py-4">
                              {renderAttendancePanel(lesson, panel)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-2.5 p-3 lg:hidden">
              {lessons.map((lesson, index) => {
                const totalStudents = parseInt(lesson.total_students) || 0;
                const presentCount = parseInt(lesson.present_count) || 0;
                const absentCount = parseInt(lesson.absent_count) || 0;
                const attendancePercentage = totalStudents > 0
                  ? Math.round((presentCount / totalStudents) * 100)
                  : 0;
                const panel = lessonPanels[lesson.id] || {};
                const isExpanded = expandedLessonId === lesson.id;

                return (
                  <div key={lesson.id} className="rounded-xl border border-gray-200 p-2.5">
                    <div className="mb-2.5 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-gray-400">#{index + 1}</p>
                        <p className="text-xs font-semibold text-gray-900 break-words">
                          {getWeekdayFull(lesson.date)} {lesson.formatted_date || formatDate(lesson.date)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEditLessonDate(lesson)}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-1 text-[11px] font-medium text-white"
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" />
                        Sana
                      </button>
                    </div>

                    <div className="mb-2.5 grid grid-cols-3 gap-1.5 rounded-lg bg-gray-50 p-2 text-center">
                      <div>
                        <p className="text-[10px] text-gray-500">Keldi</p>
                        <p className="text-xs font-bold text-green-600">{presentCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Kelmadi</p>
                        <p className="text-xs font-bold text-red-600">{absentCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Davomat</p>
                        <p className="text-xs font-bold text-gray-700">{attendancePercentage}%</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAttendancePanel(lesson.id)}
                      className="inline-flex w-full items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: MAIN_COLOR }}
                    >
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      Davomat qilish
                    </button>

                    {isExpanded ? <div className="mt-2">{renderAttendancePanel(lesson, panel)}</div> : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly Attendance Table (inline) */}
        <MonthlyAttendanceInline groupId={groupId} selectedMonth={selectedMonth} />

        {/* Create Lesson Modal */}
        <CreateLessonModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          groupId={groupId}
        />
        
        {/* Delete Confirmation Modal */}
        <EditLessonDateModal
          isOpen={editModal.isOpen}
          onClose={() => {
            setEditModal({ isOpen: false, lesson: null });
            setEditLessonDateValue("");
          }}
          lesson={editModal.lesson}
          selectedDate={editLessonDateValue}
          setSelectedDate={setEditLessonDateValue}
          onSubmit={(payload) => updateLessonDateMutation.mutate(payload)}
          isLoading={updateLessonDateMutation.isLoading}
        />
        <RegenerateLessonsModal
          isOpen={isRegenerateModalOpen}
          onClose={() => {
            setIsRegenerateModalOpen(false);
            setRegenerateFromDate("");
          }}
          month={selectedMonth}
          fromDate={regenerateFromDate}
          setFromDate={setRegenerateFromDate}
          onSubmit={() => regenerateLessonsMutation.mutate()}
          isLoading={regenerateLessonsMutation.isLoading}
        />
      </div>
    </div>
  );
};

export default GroupLessonsPage;

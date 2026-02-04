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
  EyeIcon,
  ChevronRightIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  Calendar as CalendarLucide,
  Clock as ClockLucide,
  Users as UsersLucide,
  User
} from 'lucide-react';
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "../../../../hooks/api";
import MonthlyAttendanceInline from "../../../../components/MonthlyAttendanceInline";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

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

// Delete lesson API
const deleteLesson = async (lessonId) => {
  const response = await instance.delete(`/api/attendance/lessons/${lessonId}`);
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
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Yangi Dars Yaratish</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Dars sanasi
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
              required
            />
          </div>
          
          <div className="flex gap-2 sm:gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={createLessonMutation.isLoading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
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

// Delete Lesson Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, lessonInfo, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50 p-3 sm:p-4">
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Darsni o'chirish</h3>
        
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
          <strong>{lessonInfo?.date}</strong> kungi darsni o'chirishni tasdiqlaysizmi?
          <br />
          <span className="text-xs sm:text-sm text-red-600 mt-1.5 sm:mt-2 block">
            Bu amalni bekor qilib bo'lmaydi!
          </span>
        </p>
        
        <div className="flex gap-2 sm:gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 sm:gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">O'chirilmoqda...</span>
              </>
            ) : (
              <>
                <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                O'chirish
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const TeacherGroupAttendance = () => {
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

  // URL dan month parametrini o'qish (sahifa yangilanganida)
  useEffect(() => {
    const monthFromURL = searchParams.get('month');
    if (monthFromURL && monthFromURL !== selectedMonth) {
      setSelectedMonth(monthFromURL);
    }
  }, [searchParams]);

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
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, lesson: null });

  const { data: lessonsData, isLoading, error } = useQuery({
    queryKey: ['group-lessons', groupId, selectedMonth],
    queryFn: () => getGroupLessons(groupId, selectedMonth),
    enabled: !!groupId,
  });

  // Delete lesson mutation
  const deleteLessonMutation = useMutation({
    mutationFn: deleteLesson,
    onSuccess: (data) => {
      toast.success('Dars muvaffaqiyatli o\'chirildi!');
      queryClient.invalidateQueries(['group-lessons', groupId]);
      setDeleteModal({ isOpen: false, lesson: null });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Darsni o\'chirishda xatolik yuz berdi';
      toast.error(message);
    }
  });

  const groupInfo = null; // Group info not provided in new API
  let lessons = Array.isArray(lessonsData) ? lessonsData : [];
  // Show newest lessons first
  lessons = [...lessons].reverse();

  // Handle delete lesson
  const handleDeleteLesson = (lesson) => {
    setDeleteModal({ isOpen: true, lesson });
  };

  const confirmDeleteLesson = () => {
    if (deleteModal.lesson) {
      deleteLessonMutation.mutate(deleteModal.lesson.id);
    }
  };

  // Format date for display - use formatted_date if available, otherwise format date
  const formatDate = (lesson) => {
    if (lesson.formatted_date) {
      return lesson.formatted_date;
    }
    if (!lesson.date) return '';
    // Fallback formatting if formatted_date not available
    return lesson.date.slice(0, 10).replace(/-/g, '.');
  };

  // Calculate overall statistics
  const totalLessons = lessons.length;
  const totalStudentsAttended = lessons.reduce((sum, lesson) => sum + parseInt(lesson.present_count || 0), 0);
  const totalStudentsExpected = lessons.reduce((sum, lesson) => sum + parseInt(lesson.total_students || 0), 0);
  const averageAttendance = totalStudentsExpected > 0 
    ? Math.round((totalStudentsAttended / totalStudentsExpected) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2" style={{ borderColor: MAIN_COLOR }}></div>
            <p className="text-gray-600 mt-3 sm:mt-4 text-sm sm:text-base">Yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg">
            <p className="font-semibold text-sm sm:text-base">Xatolik yuz berdi:</p>
            <p className="text-xs sm:text-sm">{error.message || 'API bilan bog\'lanishda xatolik'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-0">
      <div className="">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <button 
              onClick={() => router.back()}
              className="p-1.5 sm:p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all flex-shrink-0"
            >
              <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1 truncate">
                {groupInfo?.name || 'Guruh'} - Darslar
              </h1>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">
              Fan: {groupInfo?.subject_name || 'Belgilanmagan'}
            </p>
          </div>
        </div>

        {/* Month Filter */}
        <div className="mb-3 sm:mb-0 md:mb-6">
          <div className="bg-white p-2.5 sm:p-3 md:p-4 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 shrink-0 hidden sm:block" />
              <label className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700">Oy bo'yicha filter:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  const newMonth = e.target.value;
                  setSelectedMonth(newMonth);
                  updateURLWithMonth(newMonth);
                }}
                className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent w-full sm:w-auto"
              />
            </div>
          </div>
        </div>

        {/* Lessons Table */}
        {lessons.length === 0 ? (
          <div className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-md text-center">
            <CalendarIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-sm sm:text-base md:text-lg font-medium">
              {selectedMonth ? 'Tanlangan oyda darslar topilmadi' : 'Hali darslar yaratilmagan'}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
              {selectedMonth ? 'Boshqa oy tanlang yoki yangi dars yarating' : 'Yangi dars yaratish uchun tugmani bosing'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors shadow-md mx-auto"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Yangi Dars Yaratish
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 truncate">
                <span className="hidden sm:inline">Darslar ro'yxati ({lessons.length} ta)</span>
                <span className="sm:hidden">Darslar ({lessons.length})</span>
              </h2>
              
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors shadow-md flex-shrink-0"
                style={{ backgroundColor: MAIN_COLOR }}
              >
                <PlusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                <span className="hidden md:inline">Yangi Dars</span>
                <span className="md:hidden">Dars</span>
              </button>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      №
                    </th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dars vaqti
                    </th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Qatnashganlar
                    </th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Kelmaganlar
                    </th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Davomat %
                    </th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lessons.map((lesson, index) => {
                    const totalStudents = parseInt(lesson.total_students || 0);
                    const presentCount = parseInt(lesson.present_count || 0);
                    const absentCount = parseInt(lesson.absent_count || 0);
                    const attendancePercentage = totalStudents > 0 
                      ? Math.round((presentCount / totalStudents) * 100)
                      : 0;
                    
                    return (
                      <tr key={lesson.id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1 sm:mr-2" />
                            <div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {formatDate(lesson)}
                              </div>
                              <div className="sm:hidden text-[10px] text-green-600">
                                {presentCount}/{totalStudents} ({attendancePercentage}%)
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="flex items-center">
                            <div className="text-base sm:text-lg font-bold text-green-600">
                              {presentCount}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 ml-1">
                              /{totalStudents}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-base sm:text-lg font-bold text-red-600">
                            {absentCount}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="flex items-center">
                            <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2 mr-2 sm:mr-3">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${attendancePercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-gray-700">{attendancePercentage}%</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-1 sm:gap-2 justify-end">
                            <Link 
                              href={`/teacher/attendance/${groupId}/lesson/${lesson.id}?month=${selectedMonth}`}
                              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors"
                              style={{ backgroundColor: MAIN_COLOR }}
                            >
                              <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Kirish</span>
                            </Link>
                            <button
                              onClick={() => handleDeleteLesson(lesson)}
                              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">O'chirish</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, lesson: null })}
          onConfirm={confirmDeleteLesson}
          lessonInfo={deleteModal.lesson ? {
            date: formatDate(deleteModal.lesson)
          } : null}
          isLoading={deleteLessonMutation.isLoading}
        />
        </div>
      </div>
    </div>
  );
};

export default TeacherGroupAttendance;

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
import { useParams, useRouter } from "next/navigation";
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
  return response.data;
};

// Create lesson API
const createLesson = async ({ group_id, date }) => {
  const response = await instance.post('/api/attendance/lessons/create', {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
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
          
          <div className="flex gap-3 justify-end">
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

// Delete Lesson Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, lessonInfo, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Darsni o'chirish</h3>
        
        <p className="text-gray-600 mb-6">
          <strong>{lessonInfo?.date}</strong> kungi darsni o'chirishni tasdiqlaysizmi?
          <br />
          <span className="text-sm text-red-600 mt-2 block">
            Bu amalni bekor qilib bo'lmaydi!
          </span>
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                O'chirilmoqda...
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4" />
                O'chirish
              </>
            )}
          </button>
        </div>
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
  const queryClient = useQueryClient();
  
  const groupId = params.id;
  
  // Current month by default
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  
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

  const groupInfo = lessonsData?.data?.group_info;
  let lessons = lessonsData?.data?.lessons || [];
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

  // Format date for display (UTC, YYYY MM DD, no timezone shift)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Only take the date part, avoid timezone shift
    return dateString.slice(0, 10).replace(/-/g, ' ');
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
  const totalStudentsAttended = lessons.reduce((sum, lesson) => sum + lesson.present_count, 0);
  const totalStudentsExpected = lessons.reduce((sum, lesson) => sum + lesson.students_count, 0);
  const averageAttendance = totalStudentsExpected > 0 
    ? Math.round((totalStudentsAttended / totalStudentsExpected) * 100)
    : 0;

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="px-2">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {groupInfo?.name || 'Guruh'} - Darslar
            </h1>
            <p className="text-sm text-gray-600">
              O'qituvchi: {groupInfo?.teacher_name || 'Belgilanmagan'}
            </p>
          </div>
        </div>

        {/* Month Filter */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Oy bo'yicha filter:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
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
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {selectedMonth ? 'Tanlangan oyda darslar topilmadi' : 'Hali darslar yaratilmagan'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {selectedMonth ? 'Boshqa oy tanlang yoki yangi dars yarating' : 'Yangi dars yaratish uchun tugmani bosing'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors shadow-md mx-auto"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              <PlusIcon className="h-4 w-4" />
              Yangi Dars Yaratish
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Darslar ro'yxati ({lessons.length} ta)
              </h2>
              
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors shadow-md"
                style={{ backgroundColor: MAIN_COLOR }}
              >
                <PlusIcon className="h-4 w-4" />
                Yangi Dars
              </button>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
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
                    const attendancePercentage = lesson.students_count > 0 
                      ? Math.round((lesson.present_count / lesson.students_count) * 100)
                      : 0;
                    
                    return (
                      <tr key={lesson.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(lesson.lesson_date)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-lg font-bold text-green-600">
                              {lesson.present_count}
                            </div>
                            <div className="text-sm text-gray-500 ml-1">
                              / {lesson.students_count}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-red-600">
                            {lesson.absent_count || (lesson.students_count - lesson.present_count)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            attendancePercentage >= 80 ? 'bg-green-100 text-green-800' :
                            attendancePercentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {attendancePercentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2 justify-end">
                            <Link 
                              href={`/admin/attendance/${groupId}/lesson/${lesson.id}`}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors"
                              style={{ backgroundColor: MAIN_COLOR }}
                            >
                              <EyeIcon className="h-4 w-4" />
                              Kirish
                            </Link>
                            <button
                              onClick={() => handleDeleteLesson(lesson)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                              O'chirish
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
            date: formatDate(deleteModal.lesson.lesson_date)
          } : null}
          isLoading={deleteLessonMutation.isLoading}
        />
      </div>
    </div>
  );
};

export default GroupLessonsPage;
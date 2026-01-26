"use client";
import React from 'react';
import { XMarkIcon} from '@heroicons/react/24/outline';
import { useGetStudentMonthlyAttendance } from '../../hooks/attendance';

const StudentAttendanceModal = ({ isOpen, onClose, student, month }) => {
    const { data: attendanceData, isLoading, error } = useGetStudentMonthlyAttendance(
        student?.student_id, 
        month
    );

    if (!isOpen) return null;

    // Barcha darslarni birlashtirib, sanalar bo'yicha tartiblash
    const getAllLessons = () => {
        if (!attendanceData?.success) return [];
        
        const allLessons = [];
        attendanceData.data.groups?.forEach(group => {
            group.lessons?.forEach(lesson => {
                allLessons.push({
                    ...lesson,
                    group_name: group.group_name,
                    subject_name: group.subject_name
                });
            });
        });
        
        // Sana bo'yicha tartiblash
        return allLessons.sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const lessons = getAllLessons();
    const uniqueDates = [...new Set(lessons.map(lesson => lesson.date))].sort();

    const getAttendanceForDate = (date) => {
        const lesson = lessons.find(l => l.date === date);
        return lesson || null;
    };

    const getAttendanceDisplay = (attendance) => {
        if (!attendance) {
            return <span className="text-gray-400">-</span>;
        }

        // API dan kelgan haqiqiy status description ni ko'rsatish
        switch (attendance.attendance_status) {
            case 'keldi':
                return <span className="text-green-600 text-lg">✓</span>;
            case 'kelmadi':
                return <span className="text-red-600 text-lg">✗</span>;
            default:
                // Har qanday boshqa status uchun API dan kelgan description ni ko'rsatish
                return <span className="text-orange-600 text-xs font-medium">{ '--' || attendance.attendance_status_description || attendance.attendance_status}</span>;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year} ${month} ${day}`;
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-auto max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        To'liq oylik davomat hisoboti
                    </h3>
                    <div className="flex items-center gap-2">
                        
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-auto max-h-[calc(90vh-100px)]">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                            <p className="text-gray-600 mt-2 text-sm">Yuklanmoqda...</p>
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center">
                            <p className="text-red-600">Xatolik yuz berdi</p>
                        </div>
                    ) : attendanceData?.success ? (
                        <div className="p-4">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700 w-12">#</th>
                                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Talaba</th>
                                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700 w-20">Holati</th>
                                        {uniqueDates.map(date => (
                                            <th key={date} className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 w-24">
                                                {formatDate(date)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">1</td>
                                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium">
                                            {attendanceData.data.student.name} {attendanceData.data.student.surname}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-sm text-green-600">
                                            Faol
                                        </td>
                                        {uniqueDates.map(date => (
                                            <td key={date} className="border border-gray-300 px-3 py-2 text-center">
                                                {getAttendanceDisplay(getAttendanceForDate(date))}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>

                            {uniqueDates.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Bu oyda darslar o'tkazilmagan</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-gray-500">Ma'lumot topilmadi</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceModal;
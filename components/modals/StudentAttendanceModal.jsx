"use client";
import React from 'react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useGetStudentAttendanceSnapshot } from '../../hooks/attendance';

const StudentAttendanceModal = ({ isOpen, onClose, student, month }) => {
    const { data: attendanceData, isLoading, error } = useGetStudentAttendanceSnapshot(
        student?.student_id, 
        student?.group_id,
        month,
        student?.teacher_id, // teacher_id filter
        student?.subject_id  // subject_id filter
    );

    if (!isOpen) return null;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'keldi':
                return <span className="text-green-600 text-xl font-bold">✓</span>;
            case 'kelmadi':
                return <span className="text-red-600 text-xl font-bold">✗</span>;
          
            default:
                return <span className="text-gray-400">-</span>;
        }
    };

    const getStatusText = (status) => {
        if (attendanceData?.data?.monthly_status === 'active') {
            return <span className="text-green-600 font-medium">Faol</span>;
        } else {
            return <span className="text-blue-600 font-medium">O'zgartirishda</span>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-md w-full max-w-5xl mx-auto max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            Davomat ma'lumotlari
                        </h3>
                        {attendanceData?.success && (
                            <p className="text-sm text-gray-600 mt-1">
                                {attendanceData.data.group_info.name} - {attendanceData.data.group_info.subject}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="overflow-auto max-h-[calc(90vh-120px)]">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                            <p className="text-gray-600 mt-2 text-sm">Yuklanmoqda...</p>
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center">
                            <p className="text-red-600">Xatolik yuz berdi: {error?.message || 'Ma\'lumotlarni yuklashda xatolik'}</p>
                        </div>
                    ) : attendanceData?.success ? (
                        <div className="p-6">
                            {/* Attendance Table */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 w-12">#</th>
                                            <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Talaba</th>
                                            <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 w-24">Holati</th>
                                            {attendanceData.data.daily_attendance?.map((attendance, index) => (
                                                <th key={index} className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 min-w-[100px]">
                                                    {attendance.formatted_date}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="hover:bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 text-center">1</td>
                                            <td className="border border-gray-300 px-4 py-3">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {attendanceData.data.student_info.name} {attendanceData.data.student_info.surname}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {attendanceData.data.student_info.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-4 py-3 text-center">
                                                {getStatusText(attendanceData.data.monthly_status)}
                                            </td>
                                            {attendanceData.data.daily_attendance?.map((attendance, index) => (
                                                <td key={index} className="border border-gray-300 px-4 py-3 text-center">
                                                    {getStatusIcon(attendance.status)}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Statistics Summary */}
                            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{attendanceData.data.attendance_statistics.total_lessons}</div>
                                    <div className="text-sm text-gray-600">Jami darslar</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{attendanceData.data.attendance_breakdown.keldi}</div>
                                    <div className="text-sm text-gray-600">Keldi</div>
                                </div>
                                <div className="bg-red-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-red-600">{attendanceData.data.attendance_breakdown.kelmadi}</div>
                                    <div className="text-sm text-gray-600">Kelmadi</div>
                                </div>
                             
                            </div>

                       
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-gray-600">Ma'lumot topilmadi</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default StudentAttendanceModal;
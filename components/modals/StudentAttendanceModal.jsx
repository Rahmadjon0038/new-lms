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

    const getWeekdayFull = (dateString) => {
        if (!dateString) return '';
        const base = String(dateString).slice(0, 10);
        const [year, monthNum, day] = base.split('-').map(Number);
        if (!year || !monthNum || !day) return '';
        const date = new Date(year, monthNum - 1, day);
        const weekdays = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
        return weekdays[date.getDay()] || '';
    };

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
            return <span className="text-blue-600 font-medium">O&apos;zgartirishda</span>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
            <div className="mx-auto h-[94vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-md sm:h-auto sm:max-h-[92vh]">
                {/* Header */}
                <div className="sticky top-0 z-20 flex items-start justify-between border-b border-gray-200 bg-white p-3 sm:items-center sm:p-6">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 sm:text-xl">
                            Davomat ma&apos;lumotlari
                        </h3>
                        {attendanceData?.success && (
                            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                                {attendanceData.data.group_info.name} - {attendanceData.data.group_info.subject}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>

                <div className="max-h-[calc(94vh-76px)] overflow-auto sm:max-h-[calc(92vh-120px)]">
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
                        <div className="p-3 sm:p-6">
                            {/* Student quick info */}
                            <div className="mb-3 grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-2.5 sm:mb-4 sm:grid-cols-3 sm:p-3">
                                <div className="text-xs text-gray-700">
                                    <span className="text-gray-500">Talaba:</span>{" "}
                                    <span className="font-medium">
                                        {attendanceData.data.student_info.name} {attendanceData.data.student_info.surname}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-700">
                                    <span className="text-gray-500">Telefon:</span>{" "}
                                    <span className="font-medium">{attendanceData.data.student_info.phone}</span>
                                </div>
                                <div className="text-xs text-gray-700">
                                    <span className="text-gray-500">Holati:</span>{" "}
                                    {getStatusText(attendanceData.data.monthly_status)}
                                </div>
                            </div>

                            {/* Attendance Table */}
                            <div className="-mx-3 overflow-x-auto rounded-lg border border-gray-200 bg-white sm:mx-0">
                                <table className="w-full min-w-[760px] border-collapse sm:min-w-[900px]">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="w-10 border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 sm:w-12 sm:px-4 sm:py-3 sm:text-sm">#</th>
                                            <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 sm:px-4 sm:py-3 sm:text-sm">Talaba</th>
                                            <th className="w-20 border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-700 sm:w-24 sm:px-4 sm:py-3 sm:text-sm">Holati</th>
                                            {attendanceData.data.daily_attendance?.map((attendance, index) => (
                                                <th key={index} className="min-w-[100px] border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-700 sm:px-4 sm:py-3 sm:text-sm">
                                                    <div>{attendance.formatted_date}</div>
                                                    <div className="text-[11px] text-gray-500 font-medium">
                                                        {getWeekdayFull(attendance.date || attendance.lesson_date || attendance.formatted_date)}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="hover:bg-gray-50">
                                            <td className="border border-gray-300 px-2 py-2 text-center text-xs text-gray-900 sm:px-4 sm:py-3 sm:text-sm">1</td>
                                            <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-3">
                                                <div>
                                                    <div className="text-xs font-medium text-gray-900 sm:text-sm">
                                                        {attendanceData.data.student_info.name} {attendanceData.data.student_info.surname}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500">
                                                        {attendanceData.data.student_info.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-center sm:px-4 sm:py-3">
                                                {getStatusText(attendanceData.data.monthly_status)}
                                            </td>
                                            {attendanceData.data.daily_attendance?.map((attendance, index) => (
                                                <td key={index} className="border border-gray-300 px-2 py-2 text-center sm:px-4 sm:py-3">
                                                    {getStatusIcon(attendance.status)}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Statistics Summary */}
                            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-4 md:grid-cols-4">
                                <div className="rounded-lg bg-gray-50 p-3 text-center sm:p-4">
                                    <div className="text-xl font-bold text-blue-600 sm:text-2xl">{attendanceData.data.attendance_statistics.total_lessons}</div>
                                    <div className="text-xs text-gray-600 sm:text-sm">Jami darslar</div>
                                </div>
                                <div className="rounded-lg bg-green-50 p-3 text-center sm:p-4">
                                    <div className="text-xl font-bold text-green-600 sm:text-2xl">{attendanceData.data.attendance_breakdown.keldi}</div>
                                    <div className="text-xs text-gray-600 sm:text-sm">Keldi</div>
                                </div>
                                <div className="rounded-lg bg-red-50 p-3 text-center sm:p-4">
                                    <div className="text-xl font-bold text-red-600 sm:text-2xl">{attendanceData.data.attendance_breakdown.kelmadi}</div>
                                    <div className="text-xs text-gray-600 sm:text-sm">Kelmadi</div>
                                </div>
                                <div className="rounded-lg bg-indigo-50 p-3 text-center sm:p-4">
                                    <div className="text-xl font-bold text-indigo-600 sm:text-2xl">
                                        {attendanceData.data.attendance_statistics.attendance_percentage || 0}%
                                    </div>
                                    <div className="text-xs text-gray-600 sm:text-sm">Davomat foizi</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-gray-600">Ma&apos;lumot topilmadi</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default StudentAttendanceModal;

"use client";
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useGetStudentAttendanceSnapshot } from '../../hooks/attendance';
import { formatDateYMD } from '../../utils/date';

const StudentAttendanceModal = ({ isOpen, onClose, student, month }) => {
    const { data: attendanceData, isLoading, error } = useGetStudentAttendanceSnapshot(
        student?.student_id, 
        student?.group_id,
        month,
        student?.teacher_id, // teacher_id filter
        student?.subject_id  // subject_id filter
    );

    const formatPhoneNumber = (value) => {
        const digits = String(value || "").replace(/\D/g, "");
        const normalized = digits.startsWith("998") ? digits.slice(3) : digits.startsWith("8") ? digits.slice(1) : digits;
        if (normalized.length !== 9) return value || "-";
        return `+998-${normalized.slice(0, 2)}-${normalized.slice(2, 5)}-${normalized.slice(5, 7)}-${normalized.slice(7, 9)}`;
    };

    const getWeekdayFull = (dateString) => {
        if (!dateString) return '';
        const base = String(dateString).slice(0, 10);
        const [year, monthNum, day] = base.split('-').map(Number);
        if (!year || !monthNum || !day) return '';
        const date = new Date(year, monthNum - 1, day);
        const weekdays = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
        return weekdays[date.getDay()] || '';
    };

    const formatLessonDate = (dateString) => {
        if (!dateString) return '-';
        const base = String(dateString).slice(0, 10);
        const [year, monthNum, day] = base.split('-').map(Number);
        if (!year || !monthNum || !day) return formatDateYMD(dateString);
        return `${String(day).padStart(2, '0')}.${String(monthNum).padStart(2, '0')}.${year}`;
    };

    const parseDateOnly = (dateString) => {
        if (!dateString) return null;
        const base = String(dateString).slice(0, 10);
        const isoMatch = base.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoMatch) {
            const [, year, monthNum, day] = isoMatch.map(Number);
            return new Date(year, monthNum - 1, day);
        }
        const dotMatch = base.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (dotMatch) {
            const [, day, monthNum, year] = dotMatch.map(Number);
            return new Date(year, monthNum - 1, day);
        }
        return null;
    };

    const parseLessonDate = (rawDate) => {
        if (!rawDate) return null;
        const value = String(rawDate).trim();

        const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const [, year, monthNum, day] = isoMatch.map(Number);
            return new Date(year, monthNum - 1, day);
        }

        const dotMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (dotMatch) {
            const [, day, monthNum, year] = dotMatch.map(Number);
            return new Date(year, monthNum - 1, day);
        }

        return null;
    };

    const isFutureAttendanceDate = (attendance) => {
        const lessonDate = parseLessonDate(
            attendance?.date || attendance?.lesson_date || attendance?.formatted_date
        );
        if (!lessonDate) return false;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return lessonDate.getTime() > todayStart.getTime();
    };

    const getAttendanceStatus = (attendance) => {
        if (!attendance) return null;
        if (isFutureAttendanceDate(attendance)) return null;
        if (attendance.is_marked === false) return null;
        const status = attendance.status;
        if (status === 'keldi' || status === 'kelmadi') return status;
        return null;
    };

    const monthlyStatus = attendanceData?.data?.monthly_status;
    const stopBoundaryDate = React.useMemo(() => {
        if (monthlyStatus !== 'stopped' && monthlyStatus !== 'finished') return null;
        const snapshotTime = attendanceData?.data?.snapshot_info?.updated_at || attendanceData?.data?.snapshot_info?.created_at;
        return parseDateOnly(snapshotTime);
    }, [attendanceData?.data?.snapshot_info?.updated_at, attendanceData?.data?.snapshot_info?.created_at, monthlyStatus]);

    const shouldShowDashAfterStop = (attendance, index) => {
        if (monthlyStatus !== 'stopped' && monthlyStatus !== 'finished') return false;
        if (!stopBoundaryDate) return false;
        const lessonDate = parseDateOnly(attendance?.date || attendance?.lesson_date || attendance?.formatted_date);
        if (!lessonDate) return false;
        return lessonDate.getTime() > stopBoundaryDate.getTime();
    };

    if (!isOpen) return null;

    const getStatusIcon = (attendance, index) => {
        if (shouldShowDashAfterStop(attendance, index)) {
            return <span className="text-gray-400">-</span>;
        }
        const status = getAttendanceStatus(attendance);
        switch (status) {
            case 'keldi':
                return <span className="text-green-600 text-xl font-bold">✓</span>;
            case 'kelmadi':
                return <span className="text-red-600 text-xl font-bold">✗</span>;
          
            default:
                return <span className="text-gray-400">-</span>;
        }
    };

    const getStatusLabel = (attendance, index) => {
        if (shouldShowDashAfterStop(attendance, index)) {
            return "-";
        }
        const status = getAttendanceStatus(attendance);
        switch (status) {
            case 'keldi':
                return "Keldi";
            case 'kelmadi':
                return "Kelmadi";
            default:
                return "-";
        }
    };

    const getStatusText = (status) => {
        const monthlyStatus = attendanceData?.data?.monthly_status;
        if (monthlyStatus === 'active') {
            return <span className="text-green-600 font-medium">Faol</span>;
        }
        if (monthlyStatus === 'stopped') {
            return <span className="text-orange-600 font-medium">To&apos;xtatilgan</span>;
        }
        if (monthlyStatus === 'finished') {
            return <span className="text-red-600 font-medium">Tugatilgan</span>;
        }
        return <span className="text-gray-600 font-medium">{monthlyStatus || '-'}</span>;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-1 sm:items-center sm:p-4"
            onClick={onClose}
        >
            <div
                className="mx-auto h-[95vh] w-full max-w-6xl overflow-hidden rounded-t-2xl bg-white shadow-md sm:h-auto sm:max-h-[92vh] sm:rounded-xl"
                onClick={(e) => e.stopPropagation()}
            >
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

                <div className="max-h-[calc(95vh-76px)] overflow-auto sm:max-h-[calc(92vh-120px)]">
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
                            {/* Attendance Table - desktop/tablet */}
                            <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white sm:block">
                                <table className="w-full min-w-[860px] border-collapse xl:min-w-[980px]">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="w-12 border border-gray-300 px-3 py-3 text-left text-sm font-medium text-gray-700 xl:w-14 xl:px-4 xl:py-4 xl:text-base">#</th>
                                            <th className="min-w-[250px] border border-gray-300 px-3 py-3 text-left text-sm font-medium text-gray-700 xl:px-4 xl:py-4 xl:text-base">Talaba</th>
                                                    <th className="w-24 border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700 xl:w-28 xl:px-4 xl:py-4 xl:text-base">Holati</th>
                                            {attendanceData.data.daily_attendance?.map((attendance, index) => (
                                                <th key={index} className="min-w-[110px] border border-gray-300 px-3 py-3 text-center text-sm font-medium text-gray-700 xl:min-w-[120px] xl:px-4 xl:py-4 xl:text-base">
                                                    <div className="whitespace-nowrap">
                                                        {formatLessonDate(attendance.date || attendance.lesson_date || attendance.formatted_date)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-medium whitespace-nowrap xl:text-sm">
                                                        {getWeekdayFull(attendance.date || attendance.lesson_date || attendance.formatted_date)}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="hover:bg-gray-50">
                                            <td className="border border-gray-300 px-3 py-3 text-center text-sm text-gray-900 xl:px-4 xl:py-4 xl:text-base">1</td>
                                            <td className="border border-gray-300 px-3 py-3 xl:px-4 xl:py-4">
                                                <div className="max-w-[420px] text-sm font-medium text-gray-900 xl:max-w-[520px] xl:text-base">
                                                    <div className="truncate whitespace-nowrap">
                                                        {attendanceData.data.student_info.surname} {attendanceData.data.student_info.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate whitespace-nowrap xl:text-sm">
                                                        {formatPhoneNumber(attendanceData.data.student_info.phone)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-3 py-3 text-center xl:px-4 xl:py-4">
                                                {getStatusText(attendanceData.data.monthly_status)}
                                            </td>
                                            {attendanceData.data.daily_attendance?.map((attendance, index) => (
                                                <td key={index} className="border border-gray-300 px-3 py-3 text-center xl:px-4 xl:py-4">
                                                    {getStatusIcon(attendance, index)}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Attendance list - mobile */}
                            <div className="space-y-2 sm:hidden">
                                {attendanceData.data.daily_attendance?.map((attendance, index) => (
                                    <div key={index} className="rounded-lg border border-gray-200 bg-white p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                                    {formatLessonDate(attendance.date || attendance.lesson_date || attendance.formatted_date)}
                                                </p>
                                                <p className="text-xs text-gray-500 whitespace-nowrap">
                                                    {getWeekdayFull(attendance.date || attendance.lesson_date || attendance.formatted_date)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(attendance, index)}
                                                <span className="text-sm font-medium text-gray-700">{getStatusLabel(attendance, index)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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

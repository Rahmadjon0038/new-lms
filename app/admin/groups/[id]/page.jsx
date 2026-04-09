'use client'
import React, { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    UsersIcon,
    ClockIcon,
    UserIcon,
    CalendarDaysIcon,
    PhoneIcon,
    BookOpenIcon,
    ArchiveBoxXMarkIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Building2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetGroupById, useRemoveStudentFromGroup } from '../../../../hooks/groups';
import { useDeleteStudent } from '../../../../hooks/students';
import { useGetNotify } from '../../../../hooks/notify';
import { formatDateYMD, formatDateTimeYMDHM } from '../../../../utils/date';

const getStudentStatusBadge = (status) => {
    if (status === 'active') {
        return 'bg-green-100 text-green-800';
    }
    if (status === 'stopped') {
        return 'bg-yellow-100 text-yellow-800';
    }
    if (status === 'finished') {
        return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-700';
};

const getStudentStatusLabel = (status) => {
    if (status === 'active') return 'Faol';
    if (status === 'stopped') return "To'xtatilgan";
    if (status === 'finished') return 'Tugatgan';
    return "Noma'lum";
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isLoading, type = 'danger' }) => {
    if (!isOpen) return null;

    const getIconColor = () => {
        if (type === 'warning') return 'text-yellow-500';
        if (type === 'info') return 'text-blue-500';
        return 'text-red-500';
    };

    const getButtonColor = () => {
        if (type === 'warning') return 'bg-yellow-600 hover:bg-yellow-700';
        if (type === 'info') return 'bg-blue-600 hover:bg-blue-700';
        return 'bg-red-600 hover:bg-red-700';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <ExclamationTriangleIcon className={`h-12 w-12 ${getIconColor()}`} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                        >
                            Bekor qilish
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 py-2.5 rounded-xl font-medium text-white transition disabled:opacity-50 ${getButtonColor()}`}
                        >
                            {isLoading ? 'Bajarilmoqda...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GroupDetailPage = () => {
    const params = useParams();
    const groupId = params.id;
    const { data: groupData, isLoading, error } = useGetGroupById(groupId);
    const queryClient = useQueryClient();
    const notify = useGetNotify();
    const removeStudentMutation = useRemoveStudentFromGroup();
    const deleteStudentMutation = useDeleteStudent();
    const [removingId, setRemovingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        type: 'danger',
        isLoading: false,
        onConfirm: null,
    });

    const handleRemoveStudent = useCallback((student) => {
        if (!student?.id || !groupId) return;
        const fullName = student.full_name || `${student.surname || ''} ${student.name || ''}`.trim() || 'talaba';
        setConfirmModal({
            isOpen: true,
            title: "Talabani guruhdan chiqarish",
            message: `${fullName} guruhdan chiqarilsinmi?`,
            confirmText: "Chiqarish",
            type: 'warning',
            isLoading: false,
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isLoading: true }));
                setRemovingId(student.id);
                removeStudentMutation.mutate(
                    { group_id: groupId, student_id: student.id },
                    {
                        onSuccess: (data) => {
                            notify('ok', data?.message || "Talaba guruhdan chiqarildi");
                            queryClient.invalidateQueries(['group', groupId]);
                        },
                        onError: (err) => {
                            notify('err', err?.response?.data?.message || "Talabani guruhdan chiqarishda xatolik");
                        },
                        onSettled: () => {
                            setRemovingId(null);
                            setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
                        }
                    }
                );
            }
        });
    }, [groupId, removeStudentMutation, notify, queryClient]);

    const handleDeleteStudent = useCallback((student) => {
        if (!student?.id) return;
        const fullName = student.full_name || `${student.surname || ''} ${student.name || ''}`.trim() || 'talaba';
        setConfirmModal({
            isOpen: true,
            title: "Talabani o'chirish",
            message: `${fullName} o'chirilsinmi? Bu amal qaytarilmaydi.`,
            confirmText: "O'chirish",
            type: 'danger',
            isLoading: false,
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isLoading: true }));
                setDeletingId(student.id);
                deleteStudentMutation.mutate(student.id, {
                    onSuccess: (data) => {
                        notify('ok', data?.message || "Talaba o'chirildi");
                        queryClient.invalidateQueries(['group', groupId]);
                        queryClient.invalidateQueries(['students']);
                    },
                    onError: (err) => {
                        notify('err', err?.response?.data?.message || "Talabani o'chirishda xatolik");
                    },
                    onSettled: () => {
                        setDeletingId(null);
                        setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
                    }
                });
            }
        });
    }, [deleteStudentMutation, notify, queryClient, groupId]);

    if (isLoading) return <div className="p-4 sm:p-8 text-center">Yuklanmoqda...</div>;

    if (error) return (
        <div className="p-4 sm:p-8 text-center">
            <div className="text-red-500 mb-4">❌ Xatolik yuz berdi</div>
            <p className="text-gray-600">{error.message}</p>
        </div>
    );

    if (!groupData?.success || !groupData?.group) return (
        <div className="p-4 sm:p-8 text-center">
            <div className="text-yellow-500 mb-4">⚠️ Guruh topilmadi</div>
        </div>
    );

    const group = groupData.group;
    const students = groupData.students || [];

    const formatDate = (dateString) => formatDateYMD(dateString);
    const formatDateTime = (dateString) => formatDateTimeYMDHM(dateString);

    return (
        <div className="min-h-full p-1.5 sm:p-4 bg-gray-50">
            <div>
                <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-md border-0 sm:border sm:border-gray-100 p-2 sm:p-4 mb-2 sm:mb-4">
                    <div className="border-b border-gray-100 pb-2.5 sm:pb-3 mb-2.5 sm:mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="min-w-0">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2 mb-1.5 sm:mb-2">
                                    {group.status === 'active' ? (
                                        <BookOpenIcon className="h-5 w-5 text-[#A60E07] shrink-0" />
                                    ) : (
                                        <ArchiveBoxXMarkIcon className="h-5 w-5 text-gray-500 shrink-0" />
                                    )}
                                    <span className="truncate">{group.name}</span>
                                    {group.status === 'blocked' && (
                                        <span className="text-xs font-medium text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
                                            Yopilgan
                                        </span>
                                    )}
                                </h2>
                            </div>
                            <div className="w-full sm:w-auto text-left sm:text-right">
                                <div className="text-xl sm:text-2xl font-extrabold text-[#A60E07] leading-tight">
                                    {parseFloat(group.price).toLocaleString()} so'm
                                </div>
                                <div className="text-xs font-medium text-gray-500">Kurs narxi</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                        <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-100">
                            <div className="flex items-center space-x-2">
                                <UserIcon className="h-4 w-4 text-[#A60E07] shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">O'qituvchi</p>
                                    <p className="text-xs font-semibold text-gray-800 truncate">
                                        {group.teacher_name || 'Tayinlanmagan'}
                                    </p>
                                    {group.teacher_phone && (
                                        <div className="flex items-center mt-0.5 text-xs text-gray-600">
                                            <PhoneIcon className="h-2.5 w-2.5 mr-1" />
                                            {group.teacher_phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-2.5 sm:p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <BookOpenIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fan</p>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                                        {group.subject_name || 'Belgilanmagan'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-2.5 sm:p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <CalendarDaysIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Boshlanish sanasi</p>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                        {group.class_start_date ? formatDate(group.class_start_date) : 'Belgilanmagan'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-2.5 sm:p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dars vaqti</p>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                        {group.schedule?.time || 'Belgilanmagan'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-2.5 sm:p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Holat</p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-lg ${
                                        group.status === 'active' ? 'bg-green-100 text-green-800' :
                                        group.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {group.status === 'active' ? 'Faol' :
                                         group.status === 'draft' ? 'Darsi boshlanmagan' : 'Yopilgan'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-2.5 sm:p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Xona</p>
                                    {group.room_number ? (
                                        <>
                                            <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                                Xona {group.room_number}
                                            </p>
                                            {group.room_capacity && (
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    {group.room_capacity} o'rinlik
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-xs sm:text-sm text-gray-500">Xona belgilanmagan</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                            <CalendarDaysIcon className="h-4 w-4 text-orange-500 shrink-0" />
                            <div>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Dars kunlari</p>
                                <div className="flex flex-wrap gap-1">
                                    {group.schedule?.days?.map((day, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-0.5 text-xs font-bold bg-[#A60E07] text-white rounded"
                                        >
                                            {day}
                                        </span>
                                    )) || (
                                        <span className="text-xs text-gray-500">Belgilanmagan</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Yaratilgan: {formatDateTime(group.created_at)}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-md border-0 sm:border sm:border-gray-100 overflow-hidden">
                    <div className="px-2.5 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm sm:text-lg font-bold text-gray-800 flex items-center uppercase tracking-tight">
                                <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-[#A60E07]" />
                                Talabalar Ro'yxati
                            </h3>
                            <span className="px-2.5 sm:px-3 py-1 text-[11px] sm:text-sm bg-[#A60E07] text-white rounded-lg font-bold shadow-sm">
                                {students.length} ta talaba
                            </span>
                        </div>
                    </div>

                    {students.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-2.5 sm:px-3 py-2 text-left text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Talaba ma'lumotlari
                                        </th>
                                        <th className="px-2.5 sm:px-3 py-2 text-left text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Guruhga qo'shilgan
                                        </th>
                                        <th className="px-2.5 sm:px-3 py-2 text-left text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 hidden md:table-cell">
                                            Ro'yxatdan o'tgan
                                        </th>
                                        <th className="px-2.5 sm:px-3 py-2 text-left text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Holati
                                        </th>
                                        <th className="px-2.5 sm:px-3 py-2 text-right text-[11px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Amallar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {students.map((student, index) => (
                                        <tr key={`${student.id}-${index}`} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                                            <td className="px-2.5 sm:px-3 py-2 text-xs text-gray-700">
                                                <div className="text-xs sm:text-sm font-semibold text-gray-900">
                                                    {student.full_name || `${student.surname} ${student.name}`}
                                                </div>
                                                <div className="mt-0.5">{student.phone || '-'}</div>
                                                {student.phone2 && <div className="text-[11px] text-gray-500">{student.phone2}</div>}
                                                <div className="mt-0.5">
                                                    Ota-ona: {student.father_name || '-'} {student.father_phone ? `(${student.father_phone})` : ''}
                                                </div>
                                                <div>Yosh: {student.age || '-'}</div>
                                                {student.address && <div className="mt-0.5 break-words">Manzil: {student.address}</div>}
                                            </td>
                                            <td className="px-2.5 sm:px-3 py-2 text-xs text-gray-700">
                                                {student.joined_at ? formatDateYMD(student.joined_at) : '-'}
                                            </td>
                                            <td className="px-2.5 sm:px-3 py-2 text-xs text-gray-700 hidden md:table-cell">
                                                {student.registration_date?.split('T')[0] || '-'}
                                            </td>
                                            <td className="px-2.5 sm:px-3 py-2">
                                                <span className={`inline-flex px-2 py-0.5 text-[11px] sm:text-xs font-bold rounded-full ${getStudentStatusBadge(student.group_status)}`}>
                                                    {getStudentStatusLabel(student.group_status)}
                                                </span>
                                            </td>
                                            <td className="px-2.5 sm:px-3 py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveStudent(student)}
                                                        disabled={removeStudentMutation.isLoading && removingId === student.id}
                                                        className="px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition disabled:opacity-50"
                                                    >
                                                        {removeStudentMutation.isLoading && removingId === student.id ? "Chiqarilmoqda..." : "Guruhdan chiqarish"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteStudent(student)}
                                                        disabled={deleteStudentMutation.isLoading && deletingId === student.id}
                                                        className="px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
                                                    >
                                                        {deleteStudentMutation.isLoading && deletingId === student.id ? "O'chirilmoqda..." : "O'chirish"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-6 sm:py-8">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                            </div>
                            <div className="text-sm sm:text-base font-medium text-gray-500">Talabalar yo'q</div>
                            <p className="text-xs text-gray-400 max-w-md text-center px-3">
                                Bu guruhda hali hech qanday talaba ro'yxatdan o'tmagan.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isLoading={confirmModal.isLoading}
                type={confirmModal.type}
            />
        </div>
    );
};

export default GroupDetailPage;

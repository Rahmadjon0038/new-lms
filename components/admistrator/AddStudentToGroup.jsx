'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    MagnifyingGlassIcon,
    UserPlusIcon,
    XMarkIcon,
    IdentificationIcon,
} from '@heroicons/react/24/outline';
import { useGetAllStudentsAll, useJoinStudentToGroup, useRegisterStudent } from '../../hooks/students';
import { useGetNotify } from '../../hooks/notify';

const DEFAULT_PASSWORD = '123456';

const deriveUsernameFromPhone = (phone = '') => String(phone || '').replace(/\D/g, '');

const AddStudentToGroup = ({
    groupId,
    groupName,
    subjectId,
    subjectName,
    onSuccess,
    buttonLabel = "Talaba qo'shish",
    className = '',
}) => {
    const notify = useGetNotify();
    const queryClient = useQueryClient();
    const registerMutation = useRegisterStudent();
    const joinMutation = useJoinStudentToGroup();

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('existing');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newStudentForm, setNewStudentForm] = useState({
        name: '',
        surname: '',
        phone: '',
        phone2: '',
        username: '',
        password: DEFAULT_PASSWORD,
    });

    const { data: studentsData, isLoading: studentsLoading } = useGetAllStudentsAll(
        {
            search: searchTerm.trim() || undefined,
            limit: 50,
        },
        {
            enabled: isOpen && activeTab === 'existing' && searchTerm.trim().length >= 2,
        }
    );

    const students = useMemo(() => (
        Array.isArray(studentsData?.students)
            ? studentsData.students
            : Array.isArray(studentsData?.data?.students)
                ? studentsData.data.students
                : []
    ), [studentsData]);

    const closeModal = () => {
        setIsOpen(false);
        setActiveTab('existing');
        setSearchTerm('');
        setSelectedStudent(null);
        setNewStudentForm({
            name: '',
            surname: '',
            phone: '',
            phone2: '',
            username: '',
            password: DEFAULT_PASSWORD,
        });
    };

    useEffect(() => {
        if (!isOpen) return undefined;
        const onEscape = (event) => {
            if (event.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', onEscape);
        return () => document.removeEventListener('keydown', onEscape);
    }, [isOpen]);

    const handleNewStudentChange = (event) => {
        const { name, value } = event.target;
        setNewStudentForm((prev) => {
            if (name === 'phone') {
                const derivedUsername = deriveUsernameFromPhone(value);
                const shouldAutoFillUsername = !prev.username || prev.username === deriveUsernameFromPhone(prev.phone);
                return {
                    ...prev,
                    phone: value,
                    username: shouldAutoFillUsername ? derivedUsername : prev.username,
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const invalidateAfterMutation = async () => {
        await queryClient.invalidateQueries({ queryKey: ['students'] });
        await queryClient.invalidateQueries({ queryKey: ['students-all-pages'] });
        await queryClient.invalidateQueries({ queryKey: ['groups'] });
        await queryClient.invalidateQueries({ queryKey: ['attendance-groups'] });
        await queryClient.invalidateQueries({ queryKey: ['attendance-teacher-groups'] });
        await queryClient.invalidateQueries({ queryKey: ['attendance-my-groups'] });
        await queryClient.invalidateQueries({ queryKey: ['monthly-attendance'] });
        if (typeof onSuccess === 'function') {
            onSuccess();
        }
    };

    const handleJoinExistingStudent = async () => {
        if (!groupId) {
            notify('err', 'Guruh topilmadi');
            return;
        }
        if (!selectedStudent) {
            notify('err', 'Talabani tanlang');
            return;
        }

        const isAlreadyInTargetGroup = Array.isArray(selectedStudent.groups)
            && selectedStudent.groups.some((group) => String(group.group_id) === String(groupId));
        if (isAlreadyInTargetGroup) {
            notify('err', 'Bu talaba allaqachon shu guruhda');
            return;
        }

        notify('load');
        try {
            await joinMutation.mutateAsync({
                student_id: Number(selectedStudent.id),
                group_id: Number(groupId),
            });
            notify('dismiss');
            notify('ok', "Talaba guruhga qo'shildi");
            await invalidateAfterMutation();
            closeModal();
        } catch (error) {
            notify('dismiss');
            notify('err', error?.response?.data?.message || "Talabani guruhga qo'shishda xatolik");
        }
    };

    const handleRegisterAndJoin = async (event) => {
        event.preventDefault();

        if (!groupId) {
            notify('err', 'Guruh topilmadi');
            return;
        }
        if (!subjectId) {
            notify('err', 'Guruh fani aniqlanmadi');
            return;
        }

        const name = String(newStudentForm.name || '').trim();
        const surname = String(newStudentForm.surname || '').trim();
        const phone = String(newStudentForm.phone || '').trim();
        const phone2 = String(newStudentForm.phone2 || '').trim();
        const username = String(newStudentForm.username || '').trim() || deriveUsernameFromPhone(phone);
        const password = String(newStudentForm.password || DEFAULT_PASSWORD).trim() || DEFAULT_PASSWORD;

        if (!name || !surname || !phone || !username || !password) {
            notify('err', "Ism, familiya, telefon, login va parol majburiy");
            return;
        }

        notify('load');
        try {
            const registerResponse = await registerMutation.mutateAsync({
                name,
                surname,
                username,
                password,
                phone,
                phone2: phone2 || undefined,
                subject_id: Number(subjectId),
            });

            const registeredUser = registerResponse?.user;
            if (!registeredUser?.id) {
                throw new Error("Ro'yxatdan o'tkazilgan talaba topilmadi");
            }

            await joinMutation.mutateAsync({
                student_id: Number(registeredUser.id),
                group_id: Number(groupId),
            });

            notify('dismiss');
            notify('ok', "Talaba ro'yxatdan o'tkazildi va guruhga qo'shildi");
            await invalidateAfterMutation();
            closeModal();
        } catch (error) {
            notify('dismiss');
            notify('err', error?.response?.data?.message || "Talabani ro'yxatdan o'tkazish yoki guruhga qo'shishda xatolik");
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                disabled={!groupId}
                className={`inline-flex items-center gap-2 rounded-xl bg-[#A60E07] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2.5 sm:text-sm ${className}`}
            >
                <UserPlusIcon className="h-4 w-4" />
                {buttonLabel}
            </button>

            {isOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
                    onClick={closeModal}
                >
                    <div
                        className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4">
                            <div>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <IdentificationIcon className="h-5 w-5 text-[#A60E07]" />
                                    Guruhga talaba qo&apos;shish
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    {groupName ? `${groupName}` : 'Tanlangan guruh'} {subjectName ? `• ${subjectName}` : ''}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
                                aria-label="Yopish"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="border-b border-gray-200 px-4 pt-4">
                            <div className="inline-flex rounded-xl bg-gray-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('existing')}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                        activeTab === 'existing'
                                            ? 'bg-white text-[#A60E07] shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Mavjud talaba
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('new')}
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                        activeTab === 'new'
                                            ? 'bg-white text-[#A60E07] shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Yangi talaba
                                </button>
                            </div>
                        </div>

                        {activeTab === 'existing' ? (
                            <div className="space-y-4 p-4">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Ism, familiya, telefon yoki login bo'yicha qidiring"
                                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#A60E07]"
                                    />
                                </div>

                                <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-gray-200">
                                    {searchTerm.trim().length < 2 ? (
                                        <div className="p-4 text-sm text-gray-500">Kamida 2 ta belgi kiriting.</div>
                                    ) : studentsLoading ? (
                                        <div className="p-4 text-sm text-gray-500">Talabalar yuklanmoqda...</div>
                                    ) : students.length ? (
                                        <div className="divide-y divide-gray-100">
                                            {students.map((student) => {
                                                const targetGroupAlreadyAdded = Array.isArray(student.groups)
                                                    && student.groups.some((group) => String(group.group_id) === String(groupId));
                                                const groupLabels = Array.isArray(student.groups) && student.groups.length
                                                    ? student.groups.map((group) => group.group_name).join(', ')
                                                    : 'Guruhsiz';

                                                return (
                                                    <button
                                                        key={student.id}
                                                        type="button"
                                                        onClick={() => setSelectedStudent(student)}
                                                        className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${
                                                            selectedStudent?.id === student.id ? 'bg-orange-50' : ''
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {student.surname} {student.name}
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-600">
                                                                Telefon: {student.phone || '-'}
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                Login: {student.username || '-'}
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                Guruhlar: {groupLabels}
                                                            </div>
                                                        </div>
                                                        <div className="pt-0.5">
                                                            {targetGroupAlreadyAdded ? (
                                                                <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
                                                                    Shu guruhda
                                                                </span>
                                                            ) : selectedStudent?.id === student.id ? (
                                                                <span className="rounded-full bg-[#A60E07] px-2 py-1 text-[11px] font-semibold text-white">
                                                                    Tanlandi
                                                                </span>
                                                            ) : (
                                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                                                                    Tanlash
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-sm text-gray-500">
                                            Talaba topilmadi. Yangi talaba qo&apos;shish tabiga o&apos;ting.
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleJoinExistingStudent}
                                        disabled={!selectedStudent || joinMutation.isLoading}
                                        className="rounded-xl bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {joinMutation.isLoading ? "Qo\u0027shilmoqda..." : "Tanlangan talabani qo\u0027shish"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleRegisterAndJoin} className="space-y-4 p-4">
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                                    Yangi talaba ro&apos;yxatdan o&apos;tadi va darhol shu guruhga biriktiriladi.
                                    Login avtomatik bo&apos;sh qolsa telefon raqamidan olinadi, parol esa odatda
                                    <strong> {DEFAULT_PASSWORD}</strong> bo&apos;ladi.
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Ism *
                                        <input
                                            type="text"
                                            name="name"
                                            value={newStudentForm.name}
                                            onChange={handleNewStudentChange}
                                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#A60E07]"
                                            required
                                        />
                                    </label>
                                    <label className="text-sm font-medium text-gray-700">
                                        Familiya *
                                        <input
                                            type="text"
                                            name="surname"
                                            value={newStudentForm.surname}
                                            onChange={handleNewStudentChange}
                                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#A60E07]"
                                            required
                                        />
                                    </label>
                                    <label className="text-sm font-medium text-gray-700">
                                        Telefon *
                                        <input
                                            type="text"
                                            name="phone"
                                            value={newStudentForm.phone}
                                            onChange={handleNewStudentChange}
                                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#A60E07]"
                                            required
                                        />
                                    </label>
                                    <label className="text-sm font-medium text-gray-700">
                                        Qo&apos;shimcha telefon
                                        <input
                                            type="text"
                                            name="phone2"
                                            value={newStudentForm.phone2}
                                            onChange={handleNewStudentChange}
                                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#A60E07]"
                                        />
                                    </label>
                                    <label className="text-sm font-medium text-gray-700">
                                        Login *
                                        <input
                                            type="text"
                                            name="username"
                                            value={newStudentForm.username}
                                            onChange={handleNewStudentChange}
                                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#A60E07]"
                                            placeholder="Odatda telefon raqamidan foydalaniladi"
                                            required
                                        />
                                    </label>
                                    <label className="text-sm font-medium text-gray-700">
                                        Parol *
                                        <input
                                            type="text"
                                            name="password"
                                            value={newStudentForm.password}
                                            onChange={handleNewStudentChange}
                                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#A60E07]"
                                            required
                                        />
                                    </label>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={registerMutation.isLoading || joinMutation.isLoading || !subjectId}
                                        className="rounded-xl bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {registerMutation.isLoading || joinMutation.isLoading ? 'Saqlanmoqda...' : "Ro\u0027yxatdan o\u0027tkazib qo\u0027shish"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default AddStudentToGroup;

"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
    BookOpenIcon,
    PlusCircleIcon,
    UsersIcon,
    CalendarDaysIcon,
    ArrowRightIcon,
    PencilSquareIcon,
    CheckIcon,
    ArchiveBoxXMarkIcon,
    LockClosedIcon,
    CalendarIcon,
    PlayIcon,
} from "@heroicons/react/24/outline";
import { FiFilter } from 'react-icons/fi';
import Link from "next/link";
import AdminUpdateGroupModal from "../../../components/admistrator/AdminUpdateGroup";
import { useChangeGroupStatus } from "../../../hooks/groups";
import AdminNewGroupModal from "../../../components/admistrator/CreateGroup";
import { usegetAllgroups } from "../../../hooks/groups";
import { Clock, Building2 } from "lucide-react";
import TeacherSelect from "../../../components/teacher/Select";
import SubjectsSelect from "../../../components/SubjectsSelect";

// --- Tasdiqlash Modali Komponenti ---
const ConfirmToggleModal = ({ isOpen, onClose, onConfirm, isClosing, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
                <div className="flex justify-center mb-4">
                    {isClosing ?
                        <ArchiveBoxXMarkIcon className="h-14 w-14 text-orange-500" /> :
                        <CheckIcon className="h-14 w-14 text-green-500" />
                    }
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
                    {isClosing ? "Guruhni yopish" : "Guruhni ochish"}
                </h3>
                <p className="text-gray-500 text-center text-sm mb-6">
                    {isClosing
                        ? "Haqiqatan ham ushbu guruhni yopmoqchimisiz? Guruh yopilgach, talabalar uni faol guruhlar ro'yxatida ko'ra olmaydi."
                        : "Ushbu guruhni qayta faollashtirmoqchimisiz?"}
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                        Bekor qilish
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-white transition disabled:opacity-50 ${isClosing ? 'bg-orange-600' : 'bg-[#A60E07]'}`}
                    >
                        {isLoading ? "Bajarilmoqda..." : "Tasdiqlash"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const GroupCard = ({ group, onToggleGroupStatus, onStartClass, updateGroupLoading = false }) => {
    const [showStudentDetails, setShowStudentDetails] = useState(false);

    // Dropdown ni yopish uchun outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showStudentDetails && !event.target.closest('.student-dropdown')) {
                setShowStudentDetails(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showStudentDetails]);

    const scheduleDays = group.schedule?.days?.join(", ") || "Belgilanmagan";
    const timeInfo = group.schedule?.time ? ` (${group.schedule.time})` : "";

    const startDate = group.class_start_date
        ? new Date(group.class_start_date).toLocaleDateString('uz-UZ')
        : "Belgilanmagan";

    // Updated status logic to include class_status
    const getStatusInfo = () => {
        if (group.status === 'draft' || group.class_status === 'not_started') {
            return {
                borderColor: "border-yellow-400",
                statusTextColor: "text-yellow-700",
                statusIcon: <CalendarIcon className="h-5 w-5 text-yellow-500 sm:h-6 sm:w-6" />,
                statusText: "Darsi boshlanmagan"
            };
        } else if (group.status === 'active' && group.class_status === 'started') {
            return {
                borderColor: "border-[#A60E07]",
                statusTextColor: "text-gray-800",
                statusIcon: <BookOpenIcon className="h-5 w-5 text-[#A60E07] sm:h-6 sm:w-6" />,
                statusText: "Aktiv"
            };
        } else if (group.status === 'blocked') {
            return {
                borderColor: "border-gray-400",
                statusTextColor: "text-gray-500",
                statusIcon: <ArchiveBoxXMarkIcon className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6" />,
                statusText: "Yopilgan"
            };
        } else {
            return {
                borderColor: "border-blue-400",
                statusTextColor: "text-blue-700",
                statusIcon: <CheckIcon className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />,
                statusText: "Faol"
            };
        }
    };

    const { borderColor, statusTextColor, statusIcon, statusText } = getStatusInfo();
    const isDraft = group.status === 'draft' || group.class_status === 'not_started';

    return (
        <div className={`flex flex-col justify-between rounded-xl border-t-4 bg-white p-4 shadow-lg transition duration-150 hover:shadow-xl sm:p-6 ${borderColor}`}>
            <div className="mb-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className={`flex flex-wrap items-center gap-2 text-base font-bold sm:text-xl ${statusTextColor}`}>
                            {statusIcon}
                            <span className="min-w-0 break-words">{group.name}</span>
                        </h3>
                        {isDraft && <span className="mt-1 inline-block text-xs font-medium text-yellow-600 sm:text-sm">(Darsi boshlanmagan)</span>}
                        {group.status === 'blocked' && <span className="mt-1 inline-block text-xs font-medium text-gray-400 sm:text-sm">(Yopilgan)</span>}
                    </div>
                    {/* Talabalar soni - dropdown ko'rinishida */}
                    <div className="relative student-dropdown shrink-0">
                        <div 
                            onClick={() => setShowStudentDetails(!showStudentDetails)}
                            className="cursor-pointer flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors"
                        >
                            <UsersIcon className="h-3 w-3" />
                            <span>{group.total_students_count || 0}</span>
                            <svg 
                                className={`h-3 w-3 transition-transform ${showStudentDetails ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        
                        {/* Dropdown menu */}
                        {showStudentDetails && (
                            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-md shadow-lg border border-gray-200 py-1.5 min-w-[160px]">
                                <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 mb-1">
                                    Holat
                                </div>
                                
                                <div className="space-y-0.5 px-1">
                                    <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-green-50 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            <span className="text-xs font-medium text-green-700">Faol</span>
                                        </div>
                                        <span className="text-xs font-bold text-green-800">{group.active_students_count || 0}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-orange-50 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                            <span className="text-xs font-medium text-orange-700">To'xtatilgan</span>
                                        </div>
                                        <span className="text-xs font-bold text-orange-800">{group.stopped_students_count || 0}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between px-2 py-1 rounded hover:bg-purple-50 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                            <span className="text-xs font-medium text-purple-700">Bitirgan</span>
                                        </div>
                                        <span className="text-xs font-bold text-purple-800">{group.finished_students_count || 0}</span>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-100 mt-1.5 pt-1.5 px-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-700">Jami:</span>
                                        <span className="text-xs font-bold text-blue-700">{group.total_students_count || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Narxi yuqorida, ko'zga tashlanadigan */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="break-words text-xl font-extrabold text-[#A60E07] sm:text-2xl">{group.price ? parseFloat(group.price).toLocaleString() + ' so\'m' : 'Narxi belgilanmagan'}</span>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex items-start">
                        <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Holati: <span className="ml-1 font-semibold text-[#A60E07]">{statusText}</span></span>
                    </p>
                    <p className="flex items-start">
                        <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Jadval: <span className="ml-1 font-semibold break-words">{scheduleDays}</span></span>
                    </p>
                    <p className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Vaqti: <span className="ml-1 font-medium text-gray-600">{timeInfo}</span></span>
                    </p>
                    <p className="flex items-start">
                        <PencilSquareIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>O'qituvchi: <span className="ml-1 font-bold text-gray-800 break-words">{group.teacher_name || "Tayinlanmagan"}</span></span>
                    </p>
                    {group.subject_name && (
                        <p className="flex items-start">
                            <BookOpenIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Fan: <span className="ml-1 font-bold text-gray-800 break-words">{group.subject_name}</span></span>
                        </p>
                    )}
                    <p className="flex items-start">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Xona: <span className="ml-1 font-bold text-gray-800">
                            {group.room_number ? (
                                <>
                                    {group.room_number}
                                    {group.room_capacity && ` (${group.room_capacity} o'rinlik)`}
                                    {group.has_projector && <span className="ml-1 text-green-600 text-xs">• Proyektor ✓</span>}
                                </>
                            ) : (
                                <span className="text-gray-500">Xona belgilanmagan</span>
                            )}
                        </span></span>
                    </p>
                    <p className="flex items-start">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Dars boshlanish sanasi: <span className="ml-1 font-semibold text-gray-600">{startDate}</span></span>
                    </p>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                <Link
                    href={`/admin/groups/${group.id}`}
                    className={`flex w-full items-center justify-center rounded-lg py-2.5 font-semibold text-white shadow-md transition duration-150
                        ${group.status === 'blocked' ? 'bg-gray-400 hover:bg-gray-500' : 'bg-[#A60E07] hover:opacity-90'}`}
                >
                    <ArrowRightIcon className="h-5 w-5 mr-2" />
                    Guruhga Kirish
                </Link>

                <div className="flex flex-wrap items-center justify-end gap-2">
                    {isDraft && (
                        <button
                            onClick={() => onStartClass(group.id)}
                            className="flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white shadow-md transition duration-150 hover:bg-green-700 sm:w-auto"
                            disabled={updateGroupLoading}
                        >
                            <PlayIcon className="mr-2 h-5 w-5" />
                            Darsni Boshlash
                        </button>
                    )}

                    <AdminUpdateGroupModal initialData={group}>
                        <button className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-lg bg-gray-600 p-2.5 text-white shadow-md transition duration-150 hover:bg-gray-700">
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                    </AdminUpdateGroupModal>

                    {!isDraft && (
                        <button
                            onClick={() => onToggleGroupStatus(group.id, group.status === 'active' ? 'blocked' : 'active')}
                            className={`flex min-h-[42px] min-w-[42px] items-center justify-center rounded-lg p-2.5 text-white shadow-md transition duration-150 ${
                                group.status === 'active' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#A60E07] hover:opacity-90'
                            }`}
                            disabled={updateGroupLoading}
                        >
                            {group.status === 'active' ? <LockClosedIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

function AdminGroupsPage() {
    const [selectedTeacher, setSelectedTeacher] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [currentTab, setCurrentTab] = useState('active');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const mobileFilterRef = useRef(null);

    // --- Modal State ---
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, groupId: null, newStatus: null });

    // Updated to handle draft status and exclude draft from active
    const getIsActiveFilter = () => {
        if (currentTab === 'active') return 'active';
        if (currentTab === 'closed') return 'blocked';
        if (currentTab === 'draft') return 'draft';
        return undefined;
    };

    const { data: backendData, isLoading, error } = usegetAllgroups(getIsActiveFilter(), selectedTeacher, selectedSubject);
    
    // Filter groups based on current tab
    const filteredGroups = useMemo(() => {
        // Yangi API formatni handle qilish
        if (!backendData?.success || !backendData.groups) {
            return [];
        }
        
        const groups = backendData.groups;
        
        // Backend allaqachon status bo'yicha filter qiladi, lekin
        // additional frontend filtering qilish mumkin
        return groups;
    }, [backendData]);

    const changeGroupStatusMutation = useChangeGroupStatus();

    const groups = filteredGroups;
    const hasActiveFilters = selectedTeacher !== 'all' || selectedSubject !== 'all';

    useEffect(() => {
        if (!showMobileFilters) return undefined;

        const handleOutsideClick = (event) => {
            if (mobileFilterRef.current && !mobileFilterRef.current.contains(event.target)) {
                setShowMobileFilters(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowMobileFilters(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showMobileFilters]);

    // Darsni boshlash funksiyasi (draft -> active)
    const handleStartClass = (groupId) => {
        changeGroupStatusMutation.mutate({
            id: groupId,
            status: 'active'
        }, {
            onSuccess: (data) => {
                console.log('Dars muvaffaqiyatli boshlandi:', data);
                // Draft tabdan Active tabga o'tish
                if (currentTab === 'draft') {
                    setCurrentTab('active');
                }
            },
            onError: (error) => {
                console.error('Darsni boshlashda xatolik:', error);
            }
        });
    };

    // Modalni ochish funksiyasi
    const handleOpenConfirm = (groupId, newStatus) => {
        setConfirmModal({ isOpen: true, groupId, newStatus });
    };

    // Haqiqiy update funksiyasi
    const handleConfirmToggle = () => {
        const targetStatus = confirmModal.newStatus;
        changeGroupStatusMutation.mutate({
            id: confirmModal.groupId,
            status: targetStatus
        }, {
            onSuccess: (data) => {
                console.log(data);
                // Status o'zgarganda mos tabga o'tish
                if (targetStatus === 'blocked' && currentTab !== 'closed') {
                    setConfirmModal({ isOpen: false, groupId: null, newStatus: null });
                    setCurrentTab('closed');
                } else if (targetStatus === 'active' && currentTab !== 'active') {
                    setConfirmModal({ isOpen: false, groupId: null, newStatus: null });
                    setCurrentTab('active');
                } else {
                    setConfirmModal({ isOpen: false, groupId: null, newStatus: null });
                }
            },
            onError: (error) => {
                console.error('Guruh status o\'zgartirishda xatolik:', error);
                setConfirmModal({ isOpen: false, groupId: null, newStatus: null });
            }
        });
    };

    if (isLoading) return <div className="p-6 text-center text-base font-bold text-[#A60E07] animate-pulse sm:p-10 sm:text-xl">Guruhlar yuklanmoqda...</div>;
    if (error) return <div className="p-6 text-center font-bold text-red-600 sm:p-10">Xatolik yuz berdi!</div>;

    const tabClass = (tabName) =>
        `px-2 py-2 text-center text-xs font-bold border-b-4 transition duration-200 cursor-pointer whitespace-nowrap sm:px-6 sm:text-base
         ${currentTab === tabName
            ? 'border-[#A60E07] text-[#A60E07] bg-red-50'
            : 'border-transparent text-gray-500 hover:text-[#A60E07] hover:border-gray-300'}`;

    return (
        <div className="min-h-full p-2 sm:p-4 md:p-6">
            {/* <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-3xl">Guruhlarni Boshqarish Paneli</h1> */}
            <p className="mb-5 text-sm text-gray-500 sm:text-lg">Jami {backendData?.success ? backendData.count || 0 : 0} ta guruh mavjud</p>

            <div className="mb-6 overflow-x-auto border-b border-gray-200">
                <div className="flex min-w-max">
                <button onClick={() => setCurrentTab('active')} className={tabClass('active')}>
                    <UsersIcon className="mr-1 inline h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                    Faol Guruhlar
                </button>
                <button onClick={() => setCurrentTab('draft')} className={tabClass('draft')}>
                    <CalendarIcon className="mr-1 inline h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                    Darsi Boshlanmagan
                </button>
                <button onClick={() => setCurrentTab('closed')} className={tabClass('closed')}>
                    <LockClosedIcon className="mr-1 inline h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                    Yopilgan Guruhlar
                </button>
                </div>
            </div>

            <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[#A60E07]">
                            <FiFilter className="h-4 w-4" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Filtrlar</p>
                            <p className="text-xs text-slate-500">O&apos;qituvchi va fan bo&apos;yicha guruhlarni saralang</p>
                        </div>
                    </div>

                    <AdminNewGroupModal onSuccess={() => setCurrentTab('draft')}>
                        <button className="flex w-full items-center justify-center rounded-xl bg-[#A60E07] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 sm:w-auto">
                            <PlusCircleIcon className="mr-1 h-5 w-5" /> Yangi Guruh Ochish
                        </button>
                    </AdminNewGroupModal>
                </div>

                <div className="mb-3 flex items-center justify-end md:hidden" ref={mobileFilterRef}>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowMobileFilters((prev) => !prev)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700"
                            aria-label="Filtrlarni ochish"
                        >
                            <FiFilter className="h-4 w-4" />
                            {hasActiveFilters ? <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#A60E07]" /> : null}
                        </button>

                        {showMobileFilters ? (
                            <div className="absolute right-0 z-30 mt-2 w-[300px] max-w-[85vw] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                                <div className="space-y-3">
                                    <TeacherSelect
                                        value={selectedTeacher}
                                        onChange={setSelectedTeacher}
                                    />

                                    <SubjectsSelect
                                        value={selectedSubject}
                                        onChange={setSelectedSubject}
                                        placeholder="Fanni tanlang"
                                        showAll={true}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold"
                                    />

                                    {hasActiveFilters ? (
                                        <button
                                            onClick={() => {
                                                setSelectedTeacher('all');
                                                setSelectedSubject('all');
                                                setShowMobileFilters(false);
                                            }}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                        >
                                            Filtrni tozalash
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="hidden grid-cols-1 gap-3 md:grid xl:grid-cols-[minmax(260px,1fr)_minmax(260px,1fr)_auto] xl:items-end">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">O&apos;qituvchi</label>
                        <TeacherSelect
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Fan</label>
                        <SubjectsSelect
                            value={selectedSubject}
                            onChange={setSelectedSubject}
                            placeholder="Fanni tanlang"
                            showAll={true}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold"
                        />
                    </div>

                    {hasActiveFilters ? (
                        <button
                            onClick={() => {
                                setSelectedTeacher('all');
                                setSelectedSubject('all');
                            }}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Filtrni tozalash
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {groups.map((group) => (
                    <GroupCard
                        key={group.id}
                        group={group}
                        onToggleGroupStatus={handleOpenConfirm}
                        onStartClass={handleStartClass}
                        updateGroupLoading={changeGroupStatusMutation.isLoading}
                    />
                ))}
            </div>

            {/* TASDIQLASH MODALI */}
            <ConfirmToggleModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={handleConfirmToggle}
                isClosing={confirmModal.newStatus === 'blocked'}
                isLoading={changeGroupStatusMutation.isLoading}
            />

            {groups.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 mt-8">
                    <p className="text-xl text-gray-600 font-medium">Bu bo'limda guruhlar mavjud emas.</p>
                </div>
            )}
        </div>
    );
}

export default function page() {
    return <AdminGroupsPage />;
}

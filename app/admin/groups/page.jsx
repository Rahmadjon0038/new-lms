"use client";
import React, { useState, useMemo, useEffect } from "react";
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
    console.log(group);
    
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
                statusIcon: <CalendarIcon className="h-6 w-6 mr-2 text-yellow-500" />,
                statusText: "Darsi boshlanmagan"
            };
        } else if (group.status === 'active' && group.class_status === 'started') {
            return {
                borderColor: "border-[#A60E07]",
                statusTextColor: "text-gray-800",
                statusIcon: <BookOpenIcon className="h-6 w-6 mr-2 text-[#A60E07]" />,
                statusText: "Aktiv"
            };
        } else if (group.status === 'blocked') {
            return {
                borderColor: "border-gray-400",
                statusTextColor: "text-gray-500",
                statusIcon: <ArchiveBoxXMarkIcon className="h-6 w-6 mr-2 text-gray-500" />,
                statusText: "Yopilgan"
            };
        } else {
            return {
                borderColor: "border-blue-400",
                statusTextColor: "text-blue-700",
                statusIcon: <CheckIcon className="h-6 w-6 mr-2 text-blue-500" />,
                statusText: "Faol"
            };
        }
    };

    const { borderColor, statusTextColor, statusIcon, statusText } = getStatusInfo();
    const isDraft = group.status === 'draft' || group.class_status === 'not_started';

    return (
        <div className={`flex flex-col justify-between bg-white p-6 rounded-xl shadow-lg border-t-4 ${borderColor} transition duration-150 hover:shadow-xl`}>
            <div className="mb-4">
                <h3 className={`text-xl font-bold ${statusTextColor} flex items-center mb-2`}>
                    {statusIcon}
                    {group.name}
                    {isDraft && <span className="ml-2 text-sm font-medium text-yellow-600">(Darsi boshlanmagan)</span>}
                    {group.status === 'blocked' && <span className="ml-2 text-sm font-medium text-gray-400">(Yopilgan)</span>}
                    {/* Talabalar soni - dropdown ko'rinishida */}
                    <div className="relative ml-auto student-dropdown">
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
                </h3>

                {/* Narxi yuqorida, ko'zga tashlanadigan */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-extrabold text-[#A60E07]">{group.price ? parseFloat(group.price).toLocaleString() + ' so\'m' : 'Narxi belgilanmagan'}</span>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex ">
                        <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Holati: <span className="ml-1 font-semibold text-[#A60E07]">{statusText}</span>
                    </p>
                    <p className="flex ">
                        <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Jadval: <span className="ml-1 font-semibold">{scheduleDays}</span>
                    </p>
                    <p className="flex ">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        Vaqti: <span className="ml-1 font-medium text-gray-600">{timeInfo}</span>
                    </p>
                    <p className="flex ">
                        <PencilSquareIcon className="h-4 w-4 mr-2 text-gray-400" />
                        O'qituvchi: <span className="ml-1 font-bold text-gray-800">{group.teacher_name || "Tayinlanmagan"}</span>
                    </p>
                    {group.subject_name && (
                        <p className="flex ">
                            <BookOpenIcon className="h-4 w-4 mr-2 text-gray-400" />
                            Fan: <span className="ml-1 font-bold text-gray-800">{group.subject_name}</span>
                        </p>
                    )}
                    <p className="flex ">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        Xona: <span className="ml-1 font-bold text-gray-800">
                            {group.room_number ? (
                                <>
                                    {group.room_number}
                                    {group.room_capacity && ` (${group.room_capacity} o'rinlik)`}
                                    {group.has_projector && <span className="ml-1 text-green-600 text-xs">• Proyektor ✓</span>}
                                </>
                            ) : (
                                <span className="text-gray-500">Xona belgilanmagan</span>
                            )}
                        </span>
                    </p>
                    <p className="flex ">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Dars boshlanish sanasi: <span className="ml-1 font-semibold text-gray-600">{startDate}</span>
                    </p>
                </div>
            </div>

            <div className="mt-4 flex space-x-3 items-stretch">
                <Link
                    href={`/admin/groups/${group.id}`}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-lg font-semibold text-white transition duration-150 shadow-md h-full 
                        ${group.status === 'blocked' ? 'bg-gray-400 hover:bg-gray-500' : 'bg-[#A60E07] hover:opacity-90'}`}
                >
                    <ArrowRightIcon className="h-5 w-5 mr-2" />
                    Guruhga Kirish
                </Link>

                {isDraft && (
                    <button
                        onClick={() => onStartClass(group.id)}
                        className="flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition duration-150 shadow-md h-full"
                        disabled={updateGroupLoading}
                    >
                        <PlayIcon className="h-5 w-5 mr-2" />
                        Darsni Boshlash
                    </button>
                )}

                <AdminUpdateGroupModal initialData={group}>
                    <button className="p-2.5 rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition duration-150 shadow-md h-full">
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                </AdminUpdateGroupModal>

                {!isDraft && (
                    <button
                        onClick={() => onToggleGroupStatus(group.id, group.status === 'active' ? 'blocked' : 'active')}
                        className={`p-2.5 rounded-lg text-white transition duration-150 shadow-md h-full ${
                            group.status === 'active' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#A60E07] hover:opacity-90'
                        }`}
                        disabled={updateGroupLoading}
                    >
                        {group.status === 'active' ? <LockClosedIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                    </button>
                )}
            </div>
        </div>
    );
};

function AdminGroupsPage() {
    const [selectedTeacher, setSelectedTeacher] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [currentTab, setCurrentTab] = useState('active');

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

    // Darsni boshlash funksiyasi (draft -> active)
    const handleStartClass = (groupId) => {
        changeGroupStatusMutation.mutate({
            id: groupId,
            status: 'active'
        }, {
            onSuccess: () => {
                // Draft tabdan Active tabga o'tish
                if (currentTab === 'draft') {
                    setCurrentTab('active');
                }
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
            onSuccess: () => {
                // Status o'zgarganda mos tabga o'tish
                if (targetStatus === 'blocked' && currentTab !== 'closed') {
                    setCurrentTab('closed');
                } else if (targetStatus === 'active' && currentTab !== 'active') {
                    setCurrentTab('active');
                }
            }
        });
        setConfirmModal({ isOpen: false, groupId: null, newStatus: null });
    };

    if (isLoading) return <div className="p-10 text-center font-bold text-[#A60E07] text-xl animate-pulse">Guruhlar yuklanmoqda...</div>;
    if (error) return <div className="p-10 text-center text-red-600 font-bold">Xatolik yuz berdi!</div>;

    const tabClass = (tabName) =>
        `px-6 py-2 text-center text-lg font-bold border-b-4 transition duration-200 cursor-pointer
         ${currentTab === tabName
            ? 'border-[#A60E07] text-[#A60E07] bg-red-50'
            : 'border-transparent text-gray-500 hover:text-[#A60E07] hover:border-gray-300'}`;

    return (
        <div className="min-h-full p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Guruhlarni Boshqarish Paneli</h1>
            <p className="text-lg text-gray-500 mb-6">Jami {backendData?.success ? backendData.count || 0 : 0} ta guruh mavjud</p>

            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setCurrentTab('active')} className={tabClass('active')}>
                    <UsersIcon className="h-5 w-5 inline mr-2" />
                    Faol Guruhlar
                </button>
                <button onClick={() => setCurrentTab('draft')} className={tabClass('draft')}>
                    <CalendarIcon className="h-5 w-5 inline mr-2" />
                    Darsi Boshlanmagan
                </button>
                <button onClick={() => setCurrentTab('closed')} className={tabClass('closed')}>
                    <LockClosedIcon className="h-5 w-5 inline mr-2" />
                    Yopilgan Guruhlar
                </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                    <FiFilter className="h-5 w-5 text-[#A60E07]" />
                    <div className="min-w-[200px]">
                        <TeacherSelect
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                        />
                    </div>
                    <div className="min-w-[200px]">
                        <SubjectsSelect
                            value={selectedSubject}
                            onChange={setSelectedSubject}
                            placeholder="Fanni tanlang"
                        />
                    </div>
                </div>

                <AdminNewGroupModal onSuccess={() => setCurrentTab('draft')}>
                    <button className="flex items-center px-4 py-2.5 rounded-lg text-white bg-[#A60E07] hover:opacity-90 transition text-sm font-bold shadow-md">
                        <PlusCircleIcon className="h-5 w-5 mr-1" /> Yangi Guruh Ochish
                    </button>
                </AdminNewGroupModal>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
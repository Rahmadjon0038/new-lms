"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
    BookOpenIcon,
    PlusCircleIcon,
    UsersIcon,
    CalendarDaysIcon,
    ArrowRightIcon,
    PencilSquareIcon,
    DocumentDuplicateIcon,
    CheckIcon,
    ArchiveBoxXMarkIcon,
    LockClosedIcon,
    CalendarIcon,
} from "@heroicons/react/24/outline";
import { FiFilter } from 'react-icons/fi';
import Link from "next/link";
import AdminUpdateGroupModal from "../../../components/admistrator/AdminUpdateGroup";
import { useUpdateGroup } from "../../../hooks/groups";
import AdminNewGroupModal from "../../../components/admistrator/CreateGroup";
import { usegetAllgroups } from "../../../hooks/groups";
import { Clock } from "lucide-react";
import TeacherSelect from "../../../components/teacher/Select";

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

const GroupCard = ({ group, onToggleGroupStatus, updateGroupLoading = false }) => {
    const [isCopied, setIsCopied] = useState(false);
    console.log(group)

    const handleCopy = () => {
        navigator.clipboard.writeText(group.unique_code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const scheduleDays = group.schedule?.days?.join(", ") || "Belgilanmagan";
    const timeInfo = group.schedule?.time ? ` (${group.schedule.time})` : "";

    const startDate = group.start_date
        ? new Date(group.start_date).toLocaleDateString('uz-UZ')
        : "Belgilanmagan";

    const borderColor = group.is_active ? "border-[#A60E07]" : "border-gray-400";
    const statusTextColor = group.is_active ? "text-gray-800" : "text-gray-500";
    const statusIcon = group.is_active ? (
        <BookOpenIcon className="h-6 w-6 mr-2 text-[#A60E07]" />
    ) : (
        <ArchiveBoxXMarkIcon className="h-6 w-6 mr-2 text-gray-500" />
    );

    return (
        <div className={`flex flex-col justify-between bg-white p-6 rounded-xl shadow-lg border-t-4 ${borderColor} transition duration-150 hover:shadow-xl`}>
            <div className="mb-4">
                <b>Id: {group.id} </b>
                <h3 className={`text-xl font-bold ${statusTextColor} flex items-center mb-2`}>
                    {statusIcon}
                    {group.name}
                    {!group.is_active && <span className="ml-2 text-sm font-medium text-gray-400">(Yopilgan)</span>}
                </h3>

                {/* Narxi yuqorida, ko'zga tashlanadigan */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-extrabold text-[#A60E07]">{group.price ? group.price + ' so‘m' : 'Narxi belgilanmagan'}</span>
                    <span className="text-lg">💵</span>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                    <span className="text-sm font-semibold text-gray-700">
                        Kod: <span className="font-mono text-[#A60E07] ml-1">{group.unique_code}</span>
                    </span>
                    <button
                        onClick={handleCopy}
                        className={`p-1 rounded transition duration-150 ${isCopied ? "bg-green-100 text-green-600" : "bg-red-50 text-[#A60E07] hover:bg-red-100"}`}
                    >
                        {isCopied ? <CheckIcon className="h-4 w-4" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
                    </button>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex ">
                        <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Holati: <span className="ml-1 font-semibold text-[#A60E07]">{group.is_active ? "Aktiv" : "Nofaol"}</span>
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
                        ${group.is_active ? 'bg-[#A60E07] hover:opacity-90' : 'bg-gray-400 cursor-not-allowed'}`}
                    onClick={(e) => !group.is_active && e.preventDefault()}
                >
                    <ArrowRightIcon className="h-5 w-5 mr-2" />
                    {group.is_active ? "Guruhga Kirish" : "Ma'lumotlar"}
                </Link>

                <AdminUpdateGroupModal initialData={group}>
                    <button className="p-2.5 rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition duration-150 shadow-md h-full">
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                </AdminUpdateGroupModal>

                <button
                    onClick={() => onToggleGroupStatus(group.id, !group.is_active)}
                    className={`p-2.5 rounded-lg text-white transition duration-150 shadow-md h-full ${group.is_active ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#A60E07] hover:opacity-90'}`}
                    disabled={updateGroupLoading}
                >
                    {group.is_active ? <LockClosedIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
};

function AdminGroupsPage() {
    const [selectedTeacher, setSelectedTeacher] = useState('all');
    const [currentTab, setCurrentTab] = useState('active');

    // --- Modal State ---
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, groupId: null, newStatus: null });

    const isActive = currentTab === 'active' ? true : currentTab === 'closed' ? false : undefined;
    const { data: backendData, isLoading, error } = usegetAllgroups(isActive, selectedTeacher);
    const updateGroupMutation = useUpdateGroup();

    const groups = backendData?.groups || [];

    // Modalni ochish funksiyasi
    const handleOpenConfirm = (groupId, newStatus) => {
        setConfirmModal({ isOpen: true, groupId, newStatus });
    };

    // Haqiqiy update funksiyasi
    const handleConfirmToggle = () => {
        updateGroupMutation.mutate({
            id: confirmModal.groupId,
            groupdata: { is_active: confirmModal.newStatus },
            onSuccess: () => {
                setConfirmModal({ isOpen: false, groupId: null, newStatus: null });
            },
            onError: (err) => {
                alert("Guruhni yangilashda xatolik: " + (err?.message || ""));
                setConfirmModal({ isOpen: false, groupId: null, newStatus: null });
            }
        });
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
            <p className="text-lg text-gray-500 mb-6">Jami {groups.length} ta guruh mavjud</p>

            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setCurrentTab('active')} className={tabClass('active')}>
                    <UsersIcon className="h-5 w-5 inline mr-2" />
                    Faol Guruhlar
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
                </div>

                <AdminNewGroupModal>
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
                        updateGroupLoading={updateGroupMutation.isLoading}
                    />
                ))}
            </div>

            {/* TASDIQLASH MODALI */}
            <ConfirmToggleModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={handleConfirmToggle}
                isClosing={confirmModal.newStatus === false}
                isLoading={updateGroupMutation.isLoading}
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
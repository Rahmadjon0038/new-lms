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
    XMarkIcon,
    ArchiveBoxXMarkIcon,
    LockClosedIcon,
    CalendarIcon, // Sana uchun ikonka
} from "@heroicons/react/24/outline";
import { FiFilter } from 'react-icons/fi';
import Link from "next/link";
import AdminUpdateGroupModal from "../../../components/admistrator/AdminUpdateGroup";
import AdminNewGroupModal from "../../../components/admistrator/CreateGroup";
import { usegetAllgroups } from "../../../hooks/groups";
import { Clock } from "lucide-react";


const GroupCard = ({ group, onToggleGroupStatus }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(group.unique_code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const scheduleDays = group.schedule?.days?.join(", ") || "Belgilanmagan";
    const timeInfo = group.schedule?.time ? ` (${group.schedule.time})` : "";
    
    // Sana formatlash (Kun.Oy.Yil)
    const createdAtDate = group.created_at 
        ? new Date(group.created_at).toLocaleDateString('uz-UZ') 
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
                <h3 className={`text-xl font-bold ${statusTextColor} flex items-center mb-2`}>
                    {statusIcon}
                    {group.name}
                    {!group.is_active && <span className="ml-2 text-sm font-medium text-gray-400">(Yopilgan)</span>}
                </h3>

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
                    <p className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Holati: <span className="ml-1 font-semibold text-[#A60E07]">{group.is_active ? "Aktiv" : "Nofaol"}</span>
                    </p>
                    <p className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Jadval: <span className="ml-1 font-semibold">{scheduleDays}</span>
                    </p>
                    <p className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        Vaqti: <span className="ml-1 font-medium text-gray-600">{timeInfo}</span>
                    </p>
                    <p className="flex items-center">
                        <PencilSquareIcon className="h-4 w-4 mr-2 text-gray-400" />
                        O'qituvchi: <span className="ml-1 font-bold text-gray-800">{group.teacher_name || "Tayinlanmagan"}</span>
                    </p>
                    {/* YARATILGAN VAQT QATORI */}
                    <p className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        Ochilgan sana: <span className="ml-1 font-semibold text-gray-600">{createdAtDate}</span>
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
                >
                    {group.is_active ? <LockClosedIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
};

function AdminGroupsPage() {
    const { data: backendData, isLoading, error } = usegetAllgroups();
    const [selectedTeacher, setSelectedTeacher] = useState('all');
    const [currentTab, setCurrentTab] = useState('active');
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if (backendData?.groups) {
            setGroups(backendData.groups);
        }
    }, [backendData]);

    const handleToggleGroupStatus = (groupId, newStatus) => {
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, is_active: newStatus } : g));
    };

    const TEACHERS = useMemo(() => {
        const teachers = Array.from(new Set(groups.map(g => g.teacher_name).filter(Boolean)));
        return [{ value: 'all', label: 'Barcha O\'qituvchilar' }, ...teachers.map(t => ({ value: t, label: t }))];
    }, [groups]);

    const filteredGroups = useMemo(() => {
        return groups.filter(g => {
            const statusMatch = currentTab === 'active' ? g.is_active : !g.is_active;
            const teacherMatch = selectedTeacher === 'all' || g.teacher_name === selectedTeacher;
            return statusMatch && teacherMatch;
        });
    }, [selectedTeacher, currentTab, groups]);

    // YUKLANMOQDA YOZUVI
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
                    Aktiv Guruhlar
                    <span className="ml-2 text-sm font-semibold p-1 rounded-full bg-red-100 text-[#A60E07]">
                        {groups.filter(g => g.is_active).length}
                    </span>
                </button>
                <button onClick={() => setCurrentTab('closed')} className={tabClass('closed')}>
                    <LockClosedIcon className="h-5 w-5 inline mr-2" />
                    Yopilgan Guruhlar
                    <span className="ml-2 text-sm font-semibold p-1 rounded-full bg-gray-200 text-gray-700">
                        {groups.filter(g => !g.is_active).length}
                    </span>
                </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                    <FiFilter className="h-5 w-5 text-[#A60E07]" />
                    <select
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                        className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-[#A60E07] outline-none"
                    >
                        {TEACHERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>

                <AdminNewGroupModal>
                    <button className="flex items-center px-4 py-2.5 rounded-lg text-white bg-[#A60E07] hover:opacity-90 transition text-sm font-bold shadow-md">
                        <PlusCircleIcon className="h-5 w-5 mr-1" /> Yangi Guruh Ochish
                    </button>
                </AdminNewGroupModal>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                    <GroupCard key={group.id} group={group} onToggleGroupStatus={handleToggleGroupStatus} />
                ))}
            </div>

            {filteredGroups.length === 0 && (
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
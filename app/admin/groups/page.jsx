"use client";
import React, { useState, useMemo } from "react";
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
    ArchiveBoxXMarkIcon, // Yopilgan (arxiv) ikonka
    LockClosedIcon, // Guruhni Yopish uchun ikonka
} from "@heroicons/react/24/outline";
import { FiFilter } from 'react-icons/fi';
import Link from "next/link";
// Importlar to'g'ri yo'llarga ishora qilishi kerak
import AdminUpdateGroupModal from "../../../components/admistrator/AdminUpdateGroup"; 
import AdminNewGroupModal from "../../../components/admistrator/CreateGroup";

// --- MOCK DATA ---
const initialMockGroupsData = [
    // Aktiv guruhlar
    { id: 1, name: "Web Dasturlash (Fullstack) 1-guruh", teacher: "Jasur Raximov", subject: "Web Dasturlash", schedule: "Dush, Chor, Jum", time: "18:00 - 20:00", studentsCount: 15, groupCode: "WD-FS-101", isActive: true },
    { id: 2, name: "Python va AI asoslari", teacher: "Alijon Vohidov", subject: "Python AI", schedule: "Seshanba, Pay", time: "10:00 - 12:00", studentsCount: 8, groupCode: "PAI-7G1Q-25", isActive: true },
    { id: 3, name: "Grafik Dizayn Master", teacher: "Nigora Qosimova", subject: "Grafik Dizayn", schedule: "Har kuni", time: "14:00 - 16:00", studentsCount: 22, groupCode: "GDM-Q2-25", isActive: true },
    { id: 4, name: "Ingliz Tili (B1)", teacher: "Alijon Vohidov", subject: "Ingliz Tili", schedule: "Dush, Chor, Jum", time: "16:00 - 18:00", studentsCount: 12, groupCode: "ET-B1-04", isActive: true },
    
    // Yopilgan (Arxivlangan) guruhlar
    { id: 5, name: "Matematika (K1) - BITTI", teacher: "Jasur Raximov", subject: "Matematika", schedule: "Seshanba, Pay", time: "17:00 - 19:00", studentsCount: 10, groupCode: "MAT-K1-15", isActive: false },
    { id: 6, name: "SMM (Targeting) - YOPILGAN", teacher: "Nigora Qosimova", subject: "SMM", schedule: "Shan, Yak", time: "19:00 - 21:00", studentsCount: 18, groupCode: "SMM-T-02", isActive: false },
];

// --- Filter Ma'lumotlarini Ajratib Olish ---
const TEACHERS = [
    { value: 'all', label: 'Barcha O\'qituvchilar' },
    ...Array.from(new Set(initialMockGroupsData.map(g => g.teacher))).map(t => ({ value: t, label: t }))
];

const SUBJECTS = [
    { value: 'all', label: 'Barcha Fanlar' },
    ...Array.from(new Set(initialMockGroupsData.map(g => g.subject))).map(s => ({ value: s, label: s }))
];


// --- Guruh Kartochkasi ---
const GroupCard = ({ group, onToggleGroupStatus }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(group.groupCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const timeInfo = group.time ? ` (${group.time})` : "";

    // Karta chekkasi rangi holatga qarab o'zgaradi
    const borderColor = group.isActive ? "border-blue-600" : "border-red-600";
    const statusText = group.isActive ? "" : "(Yopilgan)";
    const statusTextColor = group.isActive ? "text-gray-800" : "text-red-700";
    const statusIcon = group.isActive ? (
        <BookOpenIcon className="h-6 w-6 mr-2 text-blue-600" />
    ) : (
        <ArchiveBoxXMarkIcon className="h-6 w-6 mr-2 text-red-600" />
    );

    return (
        <div className={`flex flex-col justify-between bg-white p-6 rounded-xl shadow-lg border-t-4 ${borderColor} transition duration-150 hover:shadow-xl`}>
            <div className="mb-4">
                <h3 className={`text-xl font-bold ${statusTextColor} flex items-center mb-2`}>
                    {statusIcon}
                    {group.name} 
                    <span className="ml-2 text-sm font-medium text-red-500">{statusText}</span>
                </h3>

                {/* Fan nomi */}
                <span className="inline-block text-xs font-medium text-gray-500 mb-4">{group.subject}</span>


                {/* Guruh KODI va Nusxalash */}
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                    <span className="text-sm font-semibold text-gray-700">
                        Kod:{" "}
                        <span className="font-mono text-blue-700 ml-1">
                            {group.groupCode}
                        </span>
                    </span>
                    <button
                        onClick={handleCopy}
                        className={`p-1 rounded transition duration-150 ${isCopied
                                ? "bg-green-100 text-green-600"
                                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                            }`}
                        title={isCopied ? "Nusxalandi!" : "Kodni nusxalash"}
                    >
                        {isCopied ? (
                            <CheckIcon className="h-4 w-4" />
                        ) : (
                            <DocumentDuplicateIcon className="h-4 w-4" />
                        )}
                    </button>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-2 text-gray-500" />
                        Talabalar soni:{" "}
                        <span className="ml-1 font-semibold text-blue-700">
                            {group.studentsCount} ta
                        </span>
                    </p>
                    <p className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-500" />
                        Jadval: <span className="ml-1 font-semibold">{group.schedule}</span>
                        <span className="ml-1 font-medium text-gray-600">{timeInfo}</span>
                    </p>
                    <p className="flex items-center">
                        <PencilSquareIcon className="h-4 w-4 mr-2 text-gray-500" />
                        O'qituvchi: <span className="ml-1 font-bold text-gray-800">{group.teacher}</span>
                    </p>
                </div>
            </div>

            {/* Tugmalar Bloki */}
            <div className="mt-4 flex space-x-3 items-stretch">
                
                {/* 1. Guruhga Kirish/Ma'lumot */}
                <Link
                    href={`/admin/groups/${group.id}`} // Admin yo'li
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-lg font-semibold text-white transition duration-150 shadow-md h-full 
                        ${group.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed'}`}
                    onClick={(e) => !group.isActive && e.preventDefault()} 
                    title={group.isActive ? "Guruh ma'lumotlarini ko'rish" : "Yopilgan guruh ma'lumotlarini ko'rish"}
                >
                    <ArrowRightIcon className="h-5 w-5 mr-2" />
                    {group.isActive ? "Guruhga Kirish" : "Ma'lumotlar"}
                </Link>

                {/* 2. Tahrirlash Tugmasi (Modal trigger) */}
                <AdminUpdateGroupModal initialData={group}>
                    <button
                        className=" p-2.5 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 transition duration-150 shadow-md h-full"
                        title="Guruh nomini, o'qituvchisini va jadvalini tahrirlash" // YANGILANDI
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                </AdminUpdateGroupModal>
                
                {/* 3. Guruh Holatini O'zgartirish Tugmasi */}
                <button
                    onClick={() => onToggleGroupStatus(group.id, !group.isActive)}
                    className={`p-2.5 rounded-lg text-white transition duration-150 shadow-md h-full ${
                        group.isActive 
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    // YANGILANDI
                    title={group.isActive ? "Guruhni Yopish (Arxivlash)" : "Guruhni Qayta Aktivlash"}
                >
                    {group.isActive ? (
                        <LockClosedIcon className="h-5 w-5" />
                    ) : (
                        <CheckIcon className="h-5 w-5" />
                    )}
                </button>
            </div>
        </div>
    );
};


// --- Asosiy Admin Komponenti ---
function AdminGroupsPage() {
    const [groupsData, setGroupsData] = useState(initialMockGroupsData);
    const [selectedTeacher, setSelectedTeacher] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [currentTab, setCurrentTab] = useState('active'); 
    
    // Guruh holatini o'zgartirish funksiyasi (Mock)
    const handleToggleGroupStatus = (groupId, newIsActiveStatus) => {
        console.log("-----------------------------------------");
        console.log(`Guruh ID: ${groupId} holati o'zgartirildi:`);
        console.log(`Yangi Holat: ${newIsActiveStatus ? "Aktiv" : "Yopilgan"}`);
        console.log("-----------------------------------------");
        
        setGroupsData(prevData => 
            prevData.map(group => 
                group.id === groupId ? { ...group, isActive: newIsActiveStatus } : group
            )
        );
    };

    // Guruhlarni tab va filterlarga ko'ra filterlash
    const filteredGroups = useMemo(() => {
        const statusFiltered = groupsData.filter(group => {
            return currentTab === 'active' ? group.isActive : !group.isActive;
        });

        let currentGroups = statusFiltered;

        if (selectedTeacher !== 'all') {
            currentGroups = currentGroups.filter(group => group.teacher === selectedTeacher);
        }

        if (selectedSubject !== 'all') {
            currentGroups = currentGroups.filter(group => group.subject === selectedSubject);
        }

        return currentGroups;
    }, [selectedTeacher, selectedSubject, currentTab, groupsData]); 

    // Filterlarni tozalash funksiyasi
    const handleClearFilters = () => {
        setSelectedTeacher('all');
        setSelectedSubject('all');
    };

    // Filter qo'llanilganligini tekshirish
    const isFiltered = selectedTeacher !== 'all' || selectedSubject !== 'all';

    // Tabni boshqarish uchun dizayn
    const tabClass = (tabName) => 
        `px-6 py-2 text-center text-lg font-bold border-b-4 transition duration-200 cursor-pointer
         ${currentTab === tabName 
            ? 'border-blue-600 text-blue-600 bg-blue-50/70' 
            : 'border-transparent text-gray-500 hover:text-blue-500 hover:border-gray-300'}`;


    return (
        <div className="min-h-full p-8">

            {/* Sarlavha */}
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Guruhlarni Boshqarish Paneli
            </h1>
            <p className="text-lg text-gray-500 mb-6">
                Markazda faoliyat yuritayotgan jami guruhlar
            </p>
            
            {/* --- TABLAR --- */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => {setCurrentTab('active'); handleClearFilters();}}
                    className={tabClass('active')}
                    title="Hozirda dars jarayonida bo'lgan guruhlar ro'yxati" // YANGILANDI
                >
                    <UsersIcon className="h-5 w-5 inline mr-2" />
                    Aktiv Guruhlar 
                    <span className="ml-2 text-sm font-semibold p-1 rounded-full bg-blue-100 text-blue-700">
                        {groupsData.filter(g => g.isActive).length}
                    </span>
                </button>
                <button
                    onClick={() => {setCurrentTab('closed'); handleClearFilters();}}
                    className={tabClass('closed')}
                    title="Tugagan yoki to'xtatilgan guruhlar ro'yxati (Arxiv)" // YANGILANDI
                >
                    <LockClosedIcon className="h-5 w-5 inline mr-2" />
                    Yopilgan Guruhlar 
                    <span className="ml-2 text-sm font-semibold p-1 rounded-full bg-gray-200 text-gray-700">
                        {groupsData.filter(g => !g.isActive).length}
                    </span>
                </button>
            </div>


            {/* --- FILTERLAR VA YANGI GURUH TUGMASI --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">

                {/* Filterlar Bloki */}
                <div className="flex flex-wrap items-center gap-3">
                    <FiFilter className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Filterlar:</span>

                    {/* O'qituvchilar Filteri */}
                    <select
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                        className="block border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm font-medium text-gray-800 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[180px]"
                        title="O'qituvchi bo'yicha filterlash" // YANGILANDI
                    >
                        {TEACHERS.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>

                    {/* Fanlar Filteri */}
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="block border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm font-medium text-gray-800 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[180px]"
                        title="Fan nomi bo'yicha filterlash" // YANGILANDI
                    >
                        {SUBJECTS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>

                    {/* Filterlarni Olib Tashlash Tugmasi */}
                    {isFiltered && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center justify-center px-3 py-2.5 rounded-lg shadow-md font-semibold text-white bg-red-500 hover:bg-red-600 transition duration-150 text-sm"
                            title="Barcha filterlarni tozalash"
                        >
                            <XMarkIcon className="h-5 w-5 mr-1" />
                            Filterni olib tashlash
                        </button>
                    )}
                </div>

                {/* Yangi Guruh Yaratish Tugmasi */}
                <AdminNewGroupModal>
                    <button
                        className="flex items-center justify-center px-4 py-2.5 rounded-lg shadow-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition duration-150 text-sm"
                        title="Yangi o'quv guruhini yaratish" // YANGILANDI
                    >
                        <PlusCircleIcon className="h-5 w-5 mr-1" />
                        Yangi Guruh Ochish
                    </button>
                </AdminNewGroupModal>
            </div>

            {/* Guruhlar Ro'yxati */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                    <GroupCard 
                        key={group.id} 
                        group={group} 
                        onToggleGroupStatus={handleToggleGroupStatus}
                    />
                ))}
            </div>

            {filteredGroups.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl shadow-inner mt-8 border border-dashed border-gray-300">
                    <p className="text-xl text-gray-600 font-medium">
                        Tanlangan filterlar bo'yicha guruhlar topilmadi.
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        Holat: <span className="font-semibold text-gray-500">{currentTab === 'active' ? 'Aktiv' : 'Yopilgan'}</span>
                    </p>
                </div>
            )}
        </div>
    );
}

// Sahifani eksport qilish
function page() {
    return <AdminGroupsPage />;
}

export default page;
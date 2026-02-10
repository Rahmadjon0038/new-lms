'use client'
import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { FiUserPlus, FiSearch } from 'react-icons/fi';
import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon, InformationCircleIcon, KeyIcon } from '@heroicons/react/24/outline';
import {
    User, Phone, MapPin, Calendar, GraduationCap,
    CheckCircle, XCircle, Clock, BookOpen, Users,
    Home, UserCheck, AlertCircle, PlayCircle, PauseCircle, MoreVertical,
    Shield, ShieldBan, Award, UserX, Settings, Building2
} from 'lucide-react';
import Link from 'next/link';
import { useGetAllStudents, useUpdateStudentStatus } from '../../../hooks/students';
import { usegetTeachers } from '../../../hooks/teacher';
import { useGetAllSubjects } from '../../../hooks/subjects';
import { usegetAllgroups } from '../../../hooks/groups';
import { useGetNotify } from '../../../hooks/notify';
import { getAllStatusOptions, getStatusInfo } from '../../../utils/studentStatus';
import AddGroup from '../../../components/admistrator/AddGroup';

// --- Tahrirlash Holatida Input Komponenti ---
const EditableCellComponent = ({ name, value, onChange, type = 'text', placeholder = '' }) => (
    <input
        className="p-2 border border-[#A60E07] rounded w-full text-sm outline-none mb-1 transition duration-200 focus:ring-1 focus:ring-[#A60E07]"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
    />
);

const EditableCell = memo(EditableCellComponent);

const StudentsPage = () => {
    // Filter state'lari
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('all');
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showUnassigned, setShowUnassigned] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(null); // Status dropdown state

    // Filter options uchun data
    const { data: teachersData } = usegetTeachers();
    const { data: subjectsData } = useGetAllSubjects();
    const { data: groupsData } = usegetAllgroups();

    // Filterlarni backend uchun tayyorlash
    const filters = {
        teacher_id: selectedTeacher,
        group_id: selectedGroup,
        subject_id: selectedSubject,
        group_status: selectedStatus,
        unassigned: showUnassigned ? 'true' : undefined
    };

    // Backenddan ma'lumotlarni olish
    const { data: backendData, isLoading, error, refetch } = useGetAllStudents(filters);

    // Student status o'zgartirish hook
    const updateStatusMutation = useUpdateStudentStatus();
    const notify = useGetNotify();

    // Backenddan ma'lumotlarni boshqarish uchun lokal state
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [visibleRecoveryKeys, setVisibleRecoveryKeys] = useState({});
    const [copiedRecoveryRow, setCopiedRecoveryRow] = useState(null);

    // Ma'lumot kelganda state-ni yangilash
    useEffect(() => {
        if (backendData?.success) {
            // Har bir guruh uchun alohida qator yaratish
            const expandedStudents = [];
            backendData.students?.forEach(student => {
                if (student.groups && student.groups.length > 0) {
                    // Har bir guruh uchun alohida qator
                    student.groups.forEach(group => {
                        expandedStudents.push({
                            ...student,
                            group_id: group.group_id,
                            group_name: group.group_name,
                            group_status: group.group_status,
                            group_admin_status: group.group_admin_status,
                            group_class_status: group.group_class_status,
                            teacher_name: group.teacher_name,
                            subject_name: group.subject_name,
                            room_number: group.room_number,
                            room_capacity: group.room_capacity,
                            has_projector: group.has_projector,
                            group_joined_at: group.group_joined_at,
                            group_left_at: group.group_left_at,
                            price: group.price,
                            class_start_date: group.class_start_date,
                            started_at: group.started_at
                        });
                    });
                } else {
                    // Guruhsiz studentlar
                    expandedStudents.push({
                        ...student,
                        group_id: null,
                        group_name: 'Guruh biriktirilmagan',
                        group_status: null
                    });
                }
            });
            setStudents(expandedStudents);
            setStats(backendData.stats);
        }
    }, [backendData]);

    // Dropdown yopish uchun click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.relative')) {
                setStatusDropdownOpen(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // --- Faqat local qidiruv (backend filter backend'da amalga oshiriladi) ---
    const filteredStudents = useMemo(() => {
        let currentList = students || [];

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            currentList = currentList.filter(student =>
                `${student.name} ${student.surname}`.toLowerCase().includes(lowerCaseSearch) ||
                (student.phone && student.phone.replace(/[\s\+]/g, '').includes(searchTerm.replace(/[\s\+]/g, ''))) ||
                (student.group_name && student.group_name.toLowerCase().includes(lowerCaseSearch))
            );
        }
        return currentList;
    }, [searchTerm, students]);

    const handleEditChange = useCallback((e) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' && value !== '' ? value : value;
        setEditData(prev => ({ ...prev, [name]: newValue }));
    }, []);

    const handleEditClick = (student, index) => {
        // ID, Group ID va Index birikmasi orqali unique key yaratamiz
        setEditingId(`${student.id}-${student.group_id}-${index}`);
        setEditData({
            name: student.name,
            surname: student.surname,
            registration_date: student.registration_date?.split('T')[0],
            group_name: student.group_name || '',
            phone: student.phone,
            phone2: student.phone2,
            father_name: student.father_name || '',
            father_phone: student.father_phone || '',
            address: student.address || '',
            age: student.age || '',
            status: student.group_status,
            course_status: student.course_status,
        });
    };

    const handleGroupActionClick = (student) => {
        // Bu function artiq kerak emas, AddGroup komponenti o'zi modal ochadi
    };

    const handleModalSuccess = () => {
        refetch(); // Ma'lumotlarni qayta yuklash
    };

    // Status o'zgartirish function
    const handleStatusChange = async (studentId, newStatus, groupId) => {
        if (!groupId) {
            notify('err', 'Guruh IDsi talab qilinadi.');
            return;
        }

        const loadingToast = notify('load');
        try {
            await updateStatusMutation.mutateAsync({
                studentId: studentId,
                groupId: groupId,
                status: newStatus,
                onSuccess: () => {
                    notify('dismiss');
                    notify('ok', 'Talaba guruh holati muvaffaqiyatli o\'zgartirildi');
                    refetch();
                    setStatusDropdownOpen(null);
                },
                onError: (error) => {
                    notify('dismiss');
                    const errorMessage = error?.response?.data?.message || 'Status o\'zgartirishda xatolik yuz berdi';
                    notify('err', errorMessage);
                }
            });
        } catch (error) {
            notify('dismiss');
            const errorMessage = error?.response?.data?.message || 'Nomalum xatolik yuz berdi';
            notify('err', errorMessage);
        }
    };

    // Barcha filterlarni tozalash
    const clearAllFilters = () => {
        setSelectedTeacher('all');
        setSelectedGroup('all');
        setSelectedSubject('all');
        setSelectedStatus('all');
        setShowUnassigned(false);
        setSearchTerm('');
    };

    const handleSave = (uniqueId) => {
        setStudents(prevStudents =>
            prevStudents.map((s, idx) =>
                `${s.id}-${s.group_id}-${idx}` === uniqueId
                    ? {
                        ...s,
                        name: String(editData.name).trim(),
                        surname: String(editData.surname).trim(),
                        registration_date: editData.registration_date,
                        group_name: String(editData.group_name).trim() || 'Guruh biriktirilmagan',
                        phone: String(editData.phone).trim(),
                        phone2: String(editData.phone2).trim(),
                        father_name: String(editData.father_name).trim(),
                        father_phone: String(editData.father_phone).trim(),
                        address: String(editData.address).trim(),
                        age: editData.age,
                        group_status: editData.status,
                        course_status: editData.course_status
                    }
                    : s
            )
        );
        setEditingId(null);
        setEditData({});
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };

    const toggleRecoveryKey = (rowKey) => {
        setVisibleRecoveryKeys((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
    };

    const copyRecoveryKey = async (rowKey, value) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopiedRecoveryRow(rowKey);
            notify('ok', "Recovery key nusxalandi");
            setTimeout(() => setCopiedRecoveryRow(null), 1500);
        } catch {
            notify('err', "Recovery key ni nusxalab bo'lmadi");
        }
    };

    if (isLoading) return <div className="p-4 text-center sm:p-8">Yuklanmoqda...</div>;

    return (
        <div className="mx-auto min-h-screen bg-gray-50 p-3 font-sans sm:p-4 md:p-6">
            <h1 className="mb-6 text-2xl font-bold text-gray-800 sm:text-3xl">Talabalar Ro'yxati (Admin)</h1>

            <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg bg-white p-4 shadow-md sm:grid-cols-2 xl:grid-cols-6">
                {/* Qidiruv */}
                <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 p-2 focus-within:border-[#A60E07] sm:col-span-2 xl:col-span-2">
                    <FiSearch className="text-gray-400 mr-2" size={20} />
                    <input
                        type="text"
                        placeholder="Ism, telefon bo'yicha qidiruv..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-none p-1 flex-grow outline-none bg-transparent text-sm"
                    />
                </div>

                {/* Guruhlanmaganlar tugmasi */}
                <button
                    onClick={() => setShowUnassigned(!showUnassigned)}
                    className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition duration-200 ${showUnassigned
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    <Users className="inline h-4 w-4 mr-1" />
                    {showUnassigned ? 'Hammasi' : 'Guruhlanmaganlar'}
                </button>

                {/* Teacher filter */}
                <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-[#A60E07]"
                >
                    <option value="all">Barcha o'qituvchilar</option>
                    {teachersData?.teachers?.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                            {teacher.name} {teacher.surname}
                        </option>
                    ))}
                </select>

                {/* Group filter */}
                <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-[#A60E07]"
                >
                    <option value="all">Barcha guruhlar</option>
                    {groupsData?.groups?.map(group => (
                        <option key={group.id} value={group.id}>
                            {group.name}
                        </option>
                    ))}
                </select>

                {/* Subject filter */}
                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-[#A60E07]"
                >
                    <option value="all">Barcha fanlar</option>
                    {subjectsData?.subjects?.map(subject => (
                        <option key={subject.id} value={subject.id}>
                            {subject.name}
                        </option>
                    ))}
                </select>

                {/* Status filter */}
                <div className="relative w-full">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full p-2 pr-8 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#A60E07] appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                    >
                        <option value="all">Barcha holatlar</option>
                        <option value="active"> Faol</option>
                        <option value="stopped">To'xtatilgan</option>
                        <option value="finished">Bitirgan</option>
                    </select>
                    {/* Dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Clear filters button */}
                {(selectedTeacher !== 'all' || selectedGroup !== 'all' || selectedSubject !== 'all' || selectedStatus !== 'all' || showUnassigned || searchTerm) && (
                    <button
                        onClick={clearAllFilters}
                        className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                    >
                        <XCircle className="inline h-4 w-4 mr-1" />
                        Tozalash
                    </button>
                )}

                {/* Yangi talaba tugmasi */}
                <Link href="/admin/students/new" className="w-full">
                    <button
                        className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:opacity-90">
                        <FiUserPlus size={18} />
                        Yangi Talaba
                    </button>
                </Link>
            </div>

            {/* Statistika bo'limi */}
            {/* {stats && stats.group_memberships && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Statistika</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-700">{stats.total_students || 0}</div>
                            <div className="text-sm text-blue-600">Jami talabalar</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-700">{stats.group_memberships.active || 0}</div>
                            <div className="text-sm text-green-600">Faol</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="text-2xl font-bold text-orange-700">{stats.group_memberships.stopped || 0}</div>
                            <div className="text-sm text-orange-600">To'xtatilgan</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="text-2xl font-bold text-purple-700">{stats.group_memberships.finished || 0}</div>
                            <div className="text-sm text-purple-600">Bitirgan</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-2xl font-bold text-gray-700">{stats.unassigned_students || 0}</div>
                            <div className="text-sm text-gray-600">Guruhsiz</div>
                        </div>
                    </div>
                </div>
            )} */}

            <div className="bg-white rounded-lg shadow-lg overflow-x-auto border border-gray-300">
                <table className="min-w-[1200px] w-full divide-y divide-gray-300 border-collapse">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-400">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[220px] border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Student ma'lumotlari</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[250px] border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Guruh / Kurs ma'lumotlari</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Ro'yxatdan sana</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Talaba holati</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => {
                                const rowKey = `${student.id}-${student.group_id}-${index}`;
                                const isEditing = editingId === rowKey;
                                const isNotInGroup = !student.group_name || student.group_name === 'Guruh biriktirilmagan';

                                return (
                                    <tr key={rowKey} className={`${isEditing ? 'bg-blue-50 border-l-4 border-blue-400' :
                                            isNotInGroup ? 'bg-orange-50 border-l-4 border-orange-300' :
                                                (index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100')
                                        } transition duration-150 border-b border-gray-200`}>
                                        <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1">
                                                    <EditableCell name="name" value={editData.name} onChange={handleEditChange} placeholder="Ism" />
                                                    <EditableCell name="surname" value={editData.surname} onChange={handleEditChange} placeholder="Familiya" />
                                                    <EditableCell name="phone" value={editData.phone} onChange={handleEditChange} placeholder="Telefon" />
                                                    <EditableCell name="phone2" value={editData.phone2} onChange={handleEditChange} placeholder="Qo'shimcha telefon" />
                                                    <EditableCell name="father_name" value={editData.father_name} onChange={handleEditChange} placeholder="Otasining ismi" />
                                                    <EditableCell name="father_phone" value={editData.father_phone} onChange={handleEditChange} placeholder="Otasining telefoni" />
                                                    <EditableCell name="address" value={editData.address} onChange={handleEditChange} placeholder="Manzil" />
                                                    <EditableCell name="age" type="number" value={editData.age} onChange={handleEditChange} placeholder="Yoshi" />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className='text-lg font-bold text-red-500'>#{student.id}</span>
                                                        <User className="h-4 w-4 text-blue-500" />
                                                        <span className="font-semibold text-gray-900">{student.name} {student.surname}</span>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Phone className="h-3 w-3 text-green-500" />
                                                            <span>{student.phone}</span>
                                                        </div>

                                                        {student.phone2 && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                <Phone className="h-3 w-3 text-green-400" />
                                                                <span>{student.phone2}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <User className="h-3 w-3 text-purple-500" />
                                                            <span><strong>Otasi / Onasi / yaqini:</strong> {student.father_name} ({student.father_phone})</span>
                                                        </div>

                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Calendar className="h-3 w-3 text-orange-500" />
                                                            <span><strong>Yoshi:</strong> {student.age}</span>
                                                        </div>

                                                        {student.address && (
                                                            <div className="flex items-start gap-1 text-xs text-gray-600">
                                                                <Home className="h-3 w-3 text-indigo-500 mt-0.5" />
                                                                <span className="break-words" title={student.address}><strong>Manzil:</strong> {student.address}</span>
                                                            </div>
                                                        )}

                                                        {student.recovery_key ? (
                                                            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleRecoveryKey(rowKey)}
                                                                        className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100"
                                                                    >
                                                                        <KeyIcon className="h-3.5 w-3.5" />
                                                                        Recovery key
                                                                    </button>
                                                                    {visibleRecoveryKeys[rowKey] ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => copyRecoveryKey(rowKey, student.recovery_key)}
                                                                            className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                                                                        >
                                                                            {copiedRecoveryRow === rowKey ? (
                                                                                <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 text-green-600" />
                                                                            ) : (
                                                                                <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                                                                            )}
                                                                            {copiedRecoveryRow === rowKey ? "Nusxalandi" : "Nusxa olish"}
                                                                        </button>
                                                                    ) : null}
                                                                </div>
                                                                {visibleRecoveryKeys[rowKey] ? (
                                                                    <p className="mt-2 break-all rounded-md bg-white px-2 py-1.5 text-[11px] font-bold text-amber-900">
                                                                        {student.recovery_key}
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                            {isEditing ? (
                                                <div className="flex flex-col">
                                                    <EditableCell name="group_name" value={editData.group_name} onChange={handleEditChange} placeholder="Guruh nomi..." />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    {/* Guruh nomi va tahrirlash tugmasi */}
                                                    <div className="flex items-center gap-2">
                                                        {student.group_id && student.group_name && student.group_name !== 'Guruh biriktirilmagan' ? (
                                                            <Link href={`/admin/groups/${student.group_id}`} className="font-bold text-[#A60E07] text-sm hover:underline">
                                                                {student.group_name}
                                                            </Link>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                                                                <AlertCircle className="h-3 w-3 text-orange-500" />
                                                                <span className="text-xs text-orange-700 font-medium">Guruhga biriktirilmagan</span>
                                                            </div>
                                                        )}
                                                        <AddGroup student={student} onSuccess={handleModalSuccess}>
                                                            <div className={`p-1.5 rounded-lg text-white transition duration-200 flex-shrink-0 cursor-pointer ${student.group_id ? 'bg-blue-500 hover:bg-blue-600' : 'bg-[#A60E07] hover:opacity-90'}`}>
                                                                <FiUserPlus size={14} />
                                                            </div>
                                                        </AddGroup>
                                                    </div>

                                                    {/* Guruhga biriktirilgan studentlar uchun ma'lumotlar */}
                                                    {student.group_id && student.group_name !== 'Guruh biriktirilmagan' ? (
                                                        <div className="space-y-1.5 mt-2">
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <GraduationCap className="h-3 w-3 text-blue-600" />
                                                                <span className="font-medium text-gray-700">O'qituvchi:</span>
                                                                <span className="text-gray-900">{student.teacher_name?.trim() || 'Tayinlanmagan'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-1 text-xs">
                                                                <BookOpen className="h-3 w-3 text-green-600" />
                                                                <span className="font-medium text-gray-700">Fan:</span>
                                                                <span className="text-gray-900">{student.subject_name || 'Belgilanmagan'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-1 text-xs">
                                                                <Building2 className="h-3 w-3 text-amber-600" />
                                                                <span className="font-medium text-gray-700">Xona:</span>
                                                                {student.room_number ? (
                                                                    <span className="text-gray-900">
                                                                        {student.room_number}
                                                                        {student.room_capacity && ` (${student.room_capacity} o'rinlik)`}
                                                                        {student.has_projector && <span className="text-green-600 text-xs"> • Proyektor ✓</span>}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-500 italic">Xonasi hali belgilanmagan</span>
                                                                )}
                                                            </div>

                                                            {/* {student.group_joined_at && (
                                                                <div className="flex items-center gap-1 text-xs">
                                                                    <Calendar className="h-3 w-3 text-purple-600" />
                                                                    <span className="font-medium text-gray-700">Guruhga qo'shilgan:</span>
                                                                    <span className="text-gray-900">{student.class_start_date?.slice(0, 10)}</span>
                                                                </div>
                                                            )} */}

                                                            {/* Dars boshlangan sana */}
                                                            {student.class_start_date && (
                                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>Dars boshlangan: <span>
                                                                        {student.class_start_date.slice(0, 10)}
                                                                    </span></span>
                                                                </div>
                                                            )}

                                                            {/* Guruh va dars holatlari */}
                                                            <div className="flex items-center gap-1 mt-2">
                                                                {(() => {
                                                                    // 1. Guruh bloklangan
                                                                    if (student.group_admin_status === 'blocked') {
                                                                        return (
                                                                            <>
                                                                                <ShieldBan className="h-3 w-3 text-red-500" />
                                                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-700">
                                                                                    ❌ Guruh bloklangan
                                                                                </span>
                                                                            </>
                                                                        );
                                                                    }

                                                                    // 2. Talaba bu guruhni tugatgan
                                                                    if (student.group_status === 'finished') {
                                                                        return (
                                                                            <>
                                                                                <Award className="h-3 w-3 text-purple-500" />
                                                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-purple-100 text-purple-700">
                                                                                     Guruhni bitirgan                                                                                    {student.group_left_at && (
                                                                                        <span className="ml-1">
                                                                                            ({student.group_left_at.slice(0, 10)})
                                                                                        </span>
                                                                                    )}                                                                                </span>
                                                                            </>
                                                                        );
                                                                    }

                                                                    // 3. Talaba guruhni to'xtatgan
                                                                    if (student.group_status === 'stopped') {
                                                                        return (
                                                                            <>
                                                                                <PauseCircle className="h-3 w-3 text-orange-500" />
                                                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-orange-100 text-orange-700">
                                                                                    Guruhni to'xtatgan
                                                                                    {student.group_left_at && (
                                                                                        <span className="ml-1">
                                                                                            ({student.group_left_at.slice(0, 10)})
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                            </>
                                                                        );
                                                                    }

                                                                    // 4. Dars hali boshlanmagan
                                                                    if (student.group_class_status === 'not_started') {
                                                                        return (
                                                                            <>
                                                                                <AlertCircle className="h-3 w-3 text-gray-500" />
                                                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-gray-100 text-gray-700">
                                                                                    ⏳ Dars hali boshlanmagan
                                                                                </span>
                                                                            </>
                                                                        );
                                                                    }

                                                                    // 5. Faol va dars davom etmoqda
                                                                    if (student.group_status === 'active' && student.group_class_status === 'started') {
                                                                        return (
                                                                            <>
                                                                                <PlayCircle className="h-3 w-3 text-green-500" />
                                                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-green-100 text-green-700">
                                                                                    Darslar davom etmoqda
                                                                                </span>
                                                                            </>
                                                                        );
                                                                    }

                                                                    return null;
                                                                })()}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                            {isEditing ? (
                                                <EditableCell name="registration_date" type="date" value={editData.registration_date} onChange={handleEditChange} />
                                            ) : (student.registration_date?.split('T')[0])}
                                        </td>

                                        <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-2">
                                                    <select
                                                        name="status"
                                                        value={editData.status}
                                                        onChange={handleEditChange}
                                                        className="p-2 border border-[#A60E07] rounded w-full text-sm outline-none transition duration-200 focus:ring-1 focus:ring-[#A60E07]"
                                                    >
                                                        <option value="active"> Faol</option>
                                                        <option value="stopped"> To'xtatilgan</option>
                                                        <option value="finished"> Bitirgan</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {student.group_id ? (
                                                        /* Custom Status select for students with groups */
                                                        <div className="relative">
                                                            <div
                                                                onClick={() => setStatusDropdownOpen(statusDropdownOpen === `${student.id}-${student.group_id}` ? null : `${student.id}-${student.group_id}`)}
                                                                className={`w-full p-2 pr-8 border border-gray-300 rounded-lg text-sm cursor-pointer hover:border-gray-400 transition-colors ${student.group_status === 'active' ? 'bg-green-50 text-green-800 border-green-300' :
                                                                        student.group_status === 'stopped' ? 'bg-orange-50 text-orange-800 border-orange-300' :
                                                                            student.group_status === 'finished' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                                                                                'bg-gray-50 text-gray-800 border-gray-300'
                                                                    } ${updateStatusMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {React.createElement(getStatusInfo(student.group_status).icon, {
                                                                        className: `h-4 w-4 ${getStatusInfo(student.group_status).iconColor}`
                                                                    })}
                                                                    <span className="font-medium">{getStatusInfo(student.group_status).label}</span>
                                                                </div>
                                                            </div>

                                                            {/* Dropdown arrow */}
                                                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </div>

                                                            {/* Custom dropdown menu */}
                                                            {statusDropdownOpen === `${student.id}-${student.group_id}` && (
                                                                <div className="absolute left-0 top-full mt-1 z-20 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-y-auto">
                                                                    {getAllStatusOptions().map((statusOption) => {
                                                                        const Icon = statusOption.icon;
                                                                        const isSelected = student.group_status === statusOption.value;
                                                                        return (
                                                                            <div
                                                                                key={statusOption.value}
                                                                                onClick={() => {
                                                                                    if (!updateStatusMutation.isLoading) {
                                                                                        handleStatusChange(student.id, statusOption.value, student.group_id);
                                                                                    }
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors ${statusOption.value === 'active' ? 'hover:bg-green-50 text-green-800' :
                                                                                        statusOption.value === 'stopped' ? 'hover:bg-orange-50 text-orange-800' :
                                                                                            statusOption.value === 'finished' ? 'hover:bg-purple-50 text-purple-800' :
                                                                                                'hover:bg-gray-50 text-gray-800'
                                                                                    } ${isSelected ?
                                                                                        statusOption.value === 'active' ? 'bg-green-100 text-green-900' :
                                                                                            statusOption.value === 'stopped' ? 'bg-orange-100 text-orange-900' :
                                                                                                statusOption.value === 'finished' ? 'bg-purple-100 text-purple-900' :
                                                                                                    'bg-gray-100 text-gray-900'
                                                                                        : ''
                                                                                    } ${updateStatusMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                            >
                                                                                <Icon className={`h-4 w-4 ${statusOption.iconColor}`} />
                                                                                <span className="font-medium">{statusOption.label}</span>
                                                                                {isSelected && (
                                                                                    <CheckCircle className="h-3 w-3 ml-auto text-current" />
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        /* Display for unassigned students */
                                                        <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                                                            <AlertCircle className="h-3 w-3 text-orange-500" />
                                                            <span className="text-xs text-orange-700 font-medium">Guruhga biriktirilmagan</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                    </tr>
                                );
                            })
                        ) : (
                            <tr className="bg-white">
                                <td colSpan="4" className="px-4 py-12 text-center text-gray-500 border-b border-gray-200">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <User className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div className="text-lg font-medium">Talaba topilmadi</div>
                                        <p className="text-sm text-gray-400 max-w-md text-center">
                                            Qidiruv shartlaringizga mos talaba mavjud emas. Filterlarni o'zgartirib ko'ring.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentsPage;

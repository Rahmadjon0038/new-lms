'use client'
import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { FiEdit, FiSave, FiX, FiUserPlus, FiSearch } from 'react-icons/fi';
import { TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { 
  User, Phone, MapPin, Calendar, GraduationCap, 
  CheckCircle, XCircle, Clock, BookOpen, Users,
  Home, UserCheck, AlertCircle, PlayCircle, PauseCircle, MoreVertical,
  Shield, ShieldBan, Award, UserX, Settings
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
        status: selectedStatus,
        unassigned: showUnassigned ? 'true' : undefined
    };

    // Backenddan ma'lumotlarni olish
    const { data: backendData, isLoading, error, refetch } = useGetAllStudents(filters);
    
    // Student status o'zgartirish hook
    const updateStatusMutation = useUpdateStudentStatus();
    const notify = useGetNotify();

    // Backenddan kelgan ma'lumotlarni boshqarish uchun lokal state
    const [students, setStudents] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Ma'lumot kelganda state-ni yangilash
    useEffect(() => {
        if (backendData) {
            setStudents(backendData);
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
        // ID va Index birikmasi orqali unique key yaratamiz (agar IDlar bir xil kelsa)
        setEditingId(`${student.id}-${index}`);
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
            status: student.status,
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
    const handleStatusChange = async (studentId, newStatus) => {
        const loadingToast = notify('load');
        try {
            await updateStatusMutation.mutateAsync({
                id: studentId,
                status: newStatus,
                onSuccess: () => {
                    notify('dismiss');
                    notify('ok', 'Talaba holati muvaffaqiyatli o\'zgartirildi');
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
                `${s.id}-${idx}` === uniqueId
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
                        status: editData.status,
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

    const handleDeleteStudent = (id, index) => {
        if (window.confirm(`Talabani o'chirishga ishonchingiz komilmi?`)) {
            setStudents(prevStudents => prevStudents.filter((s, idx) => `${s.id}-${idx}` !== `${id}-${index}`));
        }
    };

    if (isLoading) return <div className="p-8 text-center">Yuklanmoqda...</div>;

    return (
        <div className="p-4 md:p-8 mx-auto font-sans bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">🎓 Talabalar Ro'yxati (Admin)</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-md">
                {/* Qidiruv */}
                <div className="flex items-center flex-grow min-w-[300px] border border-gray-300 rounded-lg bg-gray-50 p-2 focus-within:border-[#A60E07]">
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                        showUnassigned 
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
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#A60E07] min-w-[180px]"
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
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#A60E07] min-w-[150px]"
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
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#A60E07] min-w-[150px]"
                >
                    <option value="all">Barcha fanlar</option>
                    {subjectsData?.subjects?.map(subject => (
                        <option key={subject.id} value={subject.id}>
                            {subject.name}
                        </option>
                    ))}
                </select>

                {/* Status filter */}
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#A60E07] min-w-[140px]"
                >
                    <option value="all">Barcha holatlar</option>
                    <option value="active">✅ Faol</option>
                    <option value="inactive">❌ Nofaol</option>
                    <option value="blocked">🚫 Bloklangan</option>
                    <option value="graduated">🎓 Bitirgan</option>
                    <option value="dropped_out">🚪 Tark etgan</option>
                </select>

                {/* Clear filters button */}
                {(selectedTeacher !== 'all' || selectedGroup !== 'all' || selectedSubject !== 'all' || selectedStatus !== 'all' || showUnassigned || searchTerm) && (
                    <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        <XCircle className="inline h-4 w-4 mr-1" />
                        Tozalash
                    </button>
                )}

                {/* Yangi talaba tugmasi */}
                <Link href="/admin/students/new">
                    <button
                        className="flex items-center gap-1 bg-[#A60E07] hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm shadow-md">
                        <FiUserPlus size={18} />
                        Yangi Talaba
                    </button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-x-auto border border-gray-300">
                <table className="min-w-full divide-y divide-gray-300 border-collapse">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-400">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[220px] border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Student ma'lumotlari</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[250px] border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Guruh / Kurs ma'lumotlari</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Ro'yxatdan sana</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Talaba holati</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-800 uppercase tracking-wider w-[150px] bg-gradient-to-b from-gray-100 to-gray-200">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => {
                                const rowKey = `${student.id}-${index}`;
                                const isEditing = editingId === rowKey;
                                const isNotInGroup = !student.group_name || student.group_name === 'Guruh biriktirilmagan';

                                return (
                                    <tr key={rowKey} className={`${
                                        isEditing ? 'bg-blue-50 border-l-4 border-blue-400' : 
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
                                                    <div className="flex items-center gap-2">
                                                        {student.group_name && student.group_name !== 'Guruh biriktirilmagan' ? (
                                                            <span className="font-bold text-[#A60E07] text-sm">{student.group_name}</span>
                                                        ) : (
                                                            <span className="italic text-gray-400 text-xs">Guruhlanmagan</span>
                                                        )}
                                                        <AddGroup student={student} onSuccess={handleModalSuccess}>
                                                            <div className={`p-1.5 rounded-lg text-white transition duration-200 flex-shrink-0 cursor-pointer ${student.group_name && student.group_name !== 'Guruh biriktirilmagan' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#A60E07] hover:opacity-90'}`}>
                                                                {student.group_name && student.group_name !== 'Guruh biriktirilmagan' ? <FiEdit size={14} /> : <FiUserPlus size={14} />}
                                                            </div>
                                                        </AddGroup>
                                                    </div>
                                                    {student.group_name && student.group_name !== 'Guruh biriktirilmagan' && (
                                                        <div className="space-y-1.5 mt-2">
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <GraduationCap className="h-3 w-3 text-blue-600" />
                                                                <span className="font-medium text-gray-700">O'qituvchi:</span>
                                                                <span className="text-gray-900">{student.teacher_name?.trim() || 'Aniqlanmagan'}</span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <BookOpen className="h-3 w-3 text-green-600" />
                                                                <span className="font-medium text-gray-700">Fan:</span>
                                                                <span className="text-gray-900">{student.subject_name}</span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <Calendar className="h-3 w-3 text-purple-600" />
                                                                <span className="font-medium text-gray-700">Boshlangan:</span>
                                                                <span className="text-gray-900">{student.course_start_date ? new Date(student.course_start_date).toLocaleDateString() : 'Noma\'lum'}</span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-1">
                                                                {student.course_status === 'in_progress' && <PlayCircle className="h-3 w-3 text-blue-500" />}
                                                                {student.course_status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500" />}
                                                                {student.course_status === 'paused' && <PauseCircle className="h-3 w-3 text-yellow-500" />}
                                                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                                                    student.course_status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                                                                    student.course_status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                    {student.course_status === 'in_progress' ? 'Davom etmoqda' : 
                                                                     student.course_status === 'completed' ? 'Yakunlangan' : 
                                                                     student.course_status === 'paused' ? 'To\'xtatilgan' : student.course_status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
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
                                                        <option value="active">✅ Faol</option>
                                                        <option value="inactive">❌ Nofaol</option>
                                                        <option value="blocked">🚫 Bloklangan</option>
                                                        <option value="graduated">🎓 Bitirgan</option>
                                                        <option value="dropped_out">🚪 Tark etgan</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {/* Status o'zgartirish dropdown */}
                                                    <div className="relative">
                                                        <button 
                                                            onClick={() => setStatusDropdownOpen(statusDropdownOpen === student.id ? null : student.id)}
                                                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 transition-all ${getStatusInfo(student.status).color}`}
                                                        >
                                                            {React.createElement(getStatusInfo(student.status).icon, { 
                                                                className: `h-3 w-3 ${getStatusInfo(student.status).iconColor}` 
                                                            })}
                                                            
                                                            <span>{getStatusInfo(student.status).label}</span>
                                                            <Settings className={`h-3 w-3 ${getStatusInfo(student.status).iconColor}`} />
                                                        </button>
                                                        
                                                        {/* Status o'zgartirish dropdown menu */}
                                                        {statusDropdownOpen === student.id && (
                                                            <div className="absolute left-0 top-8 z-20 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                                                                {getAllStatusOptions().map((statusOption) => {
                                                                    const Icon = statusOption.icon;
                                                                    return (
                                                                        <button
                                                                            key={statusOption.value}
                                                                            onClick={() => handleStatusChange(student.id, statusOption.value)}
                                                                            disabled={updateStatusMutation.isLoading}
                                                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors ${
                                                                                student.status === statusOption.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                                            } ${updateStatusMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        >
                                                                            <Icon className={`h-4 w-4 ${statusOption.color}`} />
                                                                            {statusOption.label}
                                                                            {student.status === statusOption.value && (
                                                                                <CheckCircle className="h-3 w-3 text-blue-600 ml-auto" />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Course status information only (no visual badge) */}
                                                    {student.course_start_date && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            <span>Boshlangan: {new Date(student.course_start_date).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            {isEditing ? (
                                                <div className="flex justify-center items-center gap-1">
                                                    <button onClick={() => handleSave(rowKey)} className="p-1.5 rounded text-white bg-green-600 hover:bg-green-700 transition-all duration-150 shadow-sm border border-green-700 hover:shadow-md transform hover:scale-105"><FiSave size={12} /></button>
                                                    <button onClick={handleCancel} className="p-1.5 rounded text-white bg-gray-500 hover:bg-gray-600 transition-all duration-150 shadow-sm border border-gray-600 hover:shadow-md transform hover:scale-105"><FiX size={12} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center items-center gap-1">
                                                    <button 
                                                        onClick={() => handleEditClick(student, index)}
                                                        className="p-1.5 rounded text-white bg-blue-600 hover:bg-blue-700 transition-all duration-150 shadow-sm"
                                                        title="Tahrirlash"
                                                    >
                                                        <FiEdit size={12} />
                                                    </button>
                                                    
                                                    <Link 
                                                        href={`/admin/students/${student.id}`}
                                                        className="p-1.5 rounded text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-150 shadow-sm"
                                                        title="Batafsil ko'rish"
                                                    >
                                                        <InformationCircleIcon className="h-3 w-3" />
                                                    </Link>
                                                    
                                                    <button 
                                                        onClick={() => handleDeleteStudent(student.id, index)}
                                                        className="p-1.5 rounded text-white bg-red-600 hover:bg-red-700 transition-all duration-150 shadow-sm"
                                                        title="O'chirish"
                                                    >
                                                        <TrashIcon className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr className="bg-white">
                                <td colSpan="5" className="px-4 py-12 text-center text-gray-500 border-b border-gray-200">
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
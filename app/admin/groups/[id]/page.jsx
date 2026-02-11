'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { FiEdit} from 'react-icons/fi';
import { 
    UsersIcon, 
    ClockIcon, 
    UserIcon, 
    CalendarDaysIcon, 
    PhoneIcon,
    BookOpenIcon,
    ArchiveBoxXMarkIcon,
    TrashIcon,
    InformationCircleIcon,
   
} from '@heroicons/react/24/outline';
import { 
    User, Phone, Calendar,  
    CheckCircle,
    Home,
    Settings,
    Building2,
} from 'lucide-react';
import Link from 'next/link';
import { useGetGroupById } from '../../../../hooks/groups';
import { useUpdateStudentStatus } from '../../../../hooks/students';
import { useGetNotify } from '../../../../hooks/notify';
import { getAllStatusOptions, getStatusInfo } from '../../../../utils/studentStatus';
import AddGroup from '../../../../components/admistrator/AddGroup';

// --- Tahrirlash Holatida Input Komponenti ---
const EditableCell = ({ name, value, onChange, type = 'text', placeholder = '' }) => (
    <input
        className="p-2 border border-[#A60E07] rounded w-full text-sm outline-none mb-1 transition duration-200 focus:ring-1 focus:ring-[#A60E07]"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
    />
);

const GroupDetailPage = () => {
    const params = useParams();
    const groupId = params.id;
    const queryClient = useQueryClient();
    const notify = useGetNotify();

    // Editing states
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [students, setStudents] = useState([]);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);

    const { data: groupData, isLoading, error } = useGetGroupById(groupId);
    const updateStatusMutation = useUpdateStudentStatus();

    // Ma'lumotlar kelganda students state ni yangilash
    useEffect(() => {
        if (groupData?.success && groupData?.students) {
            setStudents(groupData.students);
        }
    }, [groupData]);

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

    // Editing funksiyalari
    const handleEditChange = useCallback((e) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' && value !== '' ? value : value;
        setEditData(prev => ({ ...prev, [name]: newValue }));
    }, []);

    const handleEditClick = (student, index) => {
        setEditingId(`${student.id}-${index}`);
        setEditData({
            name: student.name,
            surname: student.surname,
            phone: student.phone,
            phone2: student.phone2,
            father_name: student.father_name || '',
            father_phone: student.father_phone || '',
            address: student.address || '',
            age: student.age || '',
            status: student.group_status || 'active',
            course_status: student.course_status,
        });
    };

    const handleSave = (uniqueId) => {
        // Bu yerda backend API chaqirilishi kerak
        console.log('Saving student:', uniqueId, editData);
        setEditingId(null);
        setEditData({});
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleDeleteStudent = (studentId) => {
        if (window.confirm('Talabani guruhdan chiqarishga ishonchingiz komilmi?')) {
            // Bu yerda backend API chaqirilishi kerak
            console.log('Removing student from group:', studentId);
        }
    };

    // Status o'zgartirish function
    const handleStatusChange = async (studentId, newStatus) => {
        try {
            await updateStatusMutation.mutateAsync({
                studentId: studentId,
                groupId: groupId,
                status: newStatus,
                onSuccess: () => {
                    notify('ok', 'Talaba holati muvaffaqiyatli o\'zgartirildi');
                    queryClient.invalidateQueries(['group', groupId]);
                    setStatusDropdownOpen(null);
                },
                onError: (error) => {
                    const errorMessage = error?.response?.data?.message || 'Status o\'zgartirishda xatolik yuz berdi';
                    notify('err', errorMessage);
                }
            });
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Nomalum xatolik yuz berdi';
            notify('err', errorMessage);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Yuklanmoqda...</div>;

    if (error) return (
        <div className="p-8 text-center">
            <div className="text-red-500 mb-4">❌ Xatolik yuz berdi</div>
            <p className="text-gray-600">{error.message}</p>
        </div>
    );

    if (!groupData?.success || !groupData?.group) return (
        <div className="p-8 text-center">
            <div className="text-yellow-500 mb-4">⚠️ Guruh topilmadi</div>
        </div>
    );

    const group = groupData.group;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-full p-4 bg-gray-50">
            <div className="">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">Guruh Tafsilotlari</h1>
                    <p className="text-sm text-gray-500">Guruh ma'lumotlari va talabalar ro'yxati</p>
                </div>

                {/* Guruh Asosiy Ma'lumotlari */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 mb-4">
                    <div className="border-b border-gray-100 pb-3 mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 flex items-center mb-2">
                                    {group.status === 'active' ? (
                                        <BookOpenIcon className="h-5 w-5 mr-2 text-[#A60E07]" />
                                    ) : (
                                        <ArchiveBoxXMarkIcon className="h-5 w-5 mr-2 text-gray-500" />
                                    )}
                                    {group.name}
                                    
                                    {group.status === 'blocked' && (
                                        <span className="ml-2 text-xs font-medium text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
                                            Yopilgan
                                        </span>
                                    )}
                                </h2>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-extrabold text-[#A60E07] mb-0.5">
                                    {parseFloat(group.price).toLocaleString()} so'm
                                </div>
                                <div className="text-xs font-medium text-gray-500">Kurs narxi</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* O'qituvchi */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex items-center space-x-2">
                                <div className="flex-shrink-0">
                                    <UserIcon className="h-4 w-4 text-[#A60E07]" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">O'qituvchi</p>
                                    <p className="text-xs font-semibold text-gray-800">
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

                        {/* Fan */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <BookOpenIcon className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fan</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {group.subject_name || 'Belgilanmagan'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Boshlanish sanasi */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Boshlanish sanasi</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {group.start_date ? formatDate(group.start_date) : 'Belgilanmagan'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dars vaqti */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <ClockIcon className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dars vaqti</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {group.schedule?.time || 'Belgilanmagan'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Holat */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <UsersIcon className="h-6 w-6 text-indigo-500" />
                                </div>
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

                        {/* Xona */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <Building2 className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Xona</p>
                                    {group.room_number ? (
                                        <>
                                            <p className="text-sm font-semibold text-gray-800">
                                                Xona {group.room_number}
                                            </p>
                                            {group.room_capacity && (
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    {group.room_capacity} o'rinlik
                                                    {group.has_projector && <span className="text-green-600"> • Proyektor ✓</span>}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">Xona belgilanmagan</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dars kunlari (alohida qator) */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                            <CalendarDaysIcon className="h-4 w-4 text-orange-500" />
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

                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Yaratilgan: {formatDateTime(group.created_at)}
                        </p>
                    </div>
                </div>

                {/* Talabalar Ro'yxati */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center uppercase tracking-tight">
                                <UsersIcon className="h-5 w-5 mr-2 text-[#A60E07]" />
                                Talabalar Ro'yxati
                            </h3>
                            <span className="px-3 py-1 text-sm bg-[#A60E07] text-white rounded-lg font-bold shadow-sm">
                                {students.length} ta talaba
                            </span>
                        </div>
                    </div>

                    {students.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Student Ma'lumotlari
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Guruhga Qo'shilgan
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Ro'yxatdan Sana
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Talaba Holati
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {students.map((student, index) => {
                                        const rowKey = `${student.id}-${index}`;
                                        const isEditing = editingId === rowKey;
                                        
                                        return (
                                            <tr key={rowKey} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                                                {/* STUDENT MA'LUMOTLARI */}
                                                <td className="px-3 py-2 border-r border-gray-200">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className='text-sm font-bold text-red-500'>#{student.id}</span>
                                                            <User className="h-3 w-3 text-blue-500" />
                                                            <span className="font-semibold text-gray-900 text-sm">{student.name} {student.surname}</span>
                                                        </div>
                                                        
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                <Phone className="h-2.5 w-2.5 text-green-500" />
                                                                <span>{student.phone}</span>
                                                            </div>
                                                            
                                                            {student.phone2 && (
                                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <Phone className="h-2.5 w-2.5 text-green-400" />
                                                                    <span>{student.phone2}</span>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                <User className="h-2.5 w-2.5 text-purple-500" />
                                                                <span><strong>Otasi:</strong> {student.father_name} ({student.father_phone})</span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                <Calendar className="h-2.5 w-2.5 text-orange-500" />
                                                                <span><strong>Yoshi:</strong> {student.age}</span>
                                                            </div>
                                                            
                                                            {student.address && (
                                                                <div className="flex items-start gap-1 text-xs text-gray-600">
                                                                    <Home className="h-2.5 w-2.5 text-indigo-500 mt-0.5" />
                                                                    <span className="break-words truncate" title={student.address}><strong>Manzil:</strong> {student.address}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* GURUHGA QO'SHILGAN SANA */}
                                                <td className="px-3 py-2 border-r border-gray-200 text-sm">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <span className="text-gray-900">{new Date(student.joined_at).toLocaleDateString('uz-UZ')}</span>
                                                        </div>
                                                        {group.status === 'draft' && (
                                                            <AddGroup 
                                                                student={student} 
                                                                isInGroup={true}
                                                                onSuccess={() => {
                                                                    queryClient.invalidateQueries(['group', groupId]);
                                                                }}
                                                            >
                                                                <button className="px-2 py-0.5 text-xs rounded text-white bg-green-600 hover:bg-green-700 transition-all shadow-sm flex items-center gap-0.5">
                                                                    <BookOpenIcon className="h-2.5 w-2.5" />
                                                                    Boshlash
                                                                </button>
                                                            </AddGroup>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* RO'YXATDAN SANA */}
                                                <td className="px-3 py-2 border-r border-gray-200 text-xs">
                                                    {student.registration_date?.split('T')[0]}
                                                </td>

                                                {/* TALABA HOLATI */}
                                                <td className="px-3 py-2 border-r border-gray-200 text-sm">
                                                    <div className="space-y-1">
                                                        {/* Custom Status select */}
                                                        <div className="relative">
                                                            <div 
                                                                onClick={() => setStatusDropdownOpen(statusDropdownOpen === student.id ? null : student.id)}
                                                                className={`w-full p-1.5 pr-6 border border-gray-300 rounded text-xs cursor-pointer hover:border-gray-400 transition-colors ${
                                                                    student.group_status === 'active' ? 'bg-green-50 text-green-800 border-green-300' :
                                                                    student.group_status === 'stopped' ? 'bg-orange-50 text-orange-800 border-orange-300' :
                                                                    student.group_status === 'finished' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                                                                    'bg-gray-50 text-gray-800 border-gray-300'
                                                                } ${updateStatusMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    {React.createElement(getStatusInfo(student.group_status).icon, { 
                                                                        className: `h-3 w-3 ${getStatusInfo(student.group_status).iconColor}` 
                                                                    })}
                                                                    <span className="font-medium">{getStatusInfo(student.group_status).label}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Dropdown arrow */}
                                                            <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                                                                <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </div>

                                                            {/* Custom dropdown menu */}
                                                            {statusDropdownOpen === student.id && (
                                                                <div className="absolute left-0 top-full mt-1 z-20 w-full bg-white rounded shadow-lg border border-gray-200 py-1 max-h-60 overflow-y-auto">
                                                                    {getAllStatusOptions().map((statusOption) => {
                                                                        const Icon = statusOption.icon;
                                                                        const isSelected = student.group_status === statusOption.value;
                                                                        return (
                                                                            <div
                                                                                key={statusOption.value}
                                                                                onClick={() => {
                                                                                    if (!updateStatusMutation.isLoading) {
                                                                                        handleStatusChange(student.id, statusOption.value);
                                                                                    }
                                                                                }}
                                                                                className={`w-full text-left px-2 py-1 text-xs cursor-pointer flex items-center gap-1.5 transition-colors ${
                                                                                    statusOption.value === 'active' ? 'hover:bg-green-50 text-green-800' :
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
                                                                                <Icon className={`h-3 w-3 ${statusOption.iconColor}`} />
                                                                                <span className="font-medium">{statusOption.label}</span>
                                                                                {isSelected && (
                                                                                    <CheckCircle className="h-2.5 w-2.5 ml-auto text-current" />
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* AMALLAR */}
                                                <td className="px-3 py-2 text-center">
                                                    <div className="flex justify-center items-center gap-0.5">
                                                        <button 
                                                            onClick={() => handleEditClick(student, index)}
                                                            className="p-1 rounded text-white bg-blue-600 hover:bg-blue-700 transition-all duration-150 shadow-sm"
                                                            title="Tahrirlash"
                                                        >
                                                            <FiEdit size={10} />
                                                        </button>
                                                        
                                                        <Link 
                                                            href={`/admin/students/${student.id}`}
                                                            className="p-1 rounded text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-150 shadow-sm"
                                                            title="Batafsil ko'rish"
                                                        >
                                                            <InformationCircleIcon className="h-2.5 w-2.5" />
                                                        </Link>
                                                        
                                                        <button 
                                                            onClick={() => handleDeleteStudent(student.id)}
                                                            className="p-1 rounded text-white bg-red-600 hover:bg-red-700 transition-all duration-150 shadow-sm"
                                                            title="O'chirish"
                                                        >
                                                            <TrashIcon className="h-2.5 w-2.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="text-base font-medium text-gray-500">Talabalar yo'q</div>
                            <p className="text-xs text-gray-400 max-w-md text-center">
                                Bu guruhda hali hech qanday talaba ro'yxatdan o'tmagan. 
                                Talabalar guruh kodidan foydalanib qo'shilishlari mumkin.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupDetailPage;

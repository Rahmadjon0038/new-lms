'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { FiEdit, FiSave, FiX } from 'react-icons/fi';
import { 
    UsersIcon, 
    ClockIcon, 
    UserIcon, 
    CurrencyDollarIcon, 
    CalendarDaysIcon, 
    PhoneIcon,
    BookOpenIcon,
    ArchiveBoxXMarkIcon,
    TrashIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
    User, Phone, MapPin, Calendar, GraduationCap, 
    CheckCircle, XCircle, Clock, BookOpen, Users,
    Home, UserCheck, AlertCircle, PlayCircle, PauseCircle, MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { useGetGroupById } from '../../../../hooks/groups';
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

    // Editing states
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [students, setStudents] = useState([]);

    const { data: groupData, isLoading, error } = useGetGroupById(groupId);

    // Ma'lumotlar kelganda students state ni yangilash
    useEffect(() => {
        if (groupData?.students) {
            setStudents(groupData.students);
        }
    }, [groupData]);

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
            status: student.status || 'active',
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
        <div className="min-h-full p-8 bg-gray-50">
            <div className="">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Guruh Tafsilotlari</h1>
                    <p className="text-lg text-gray-500">Guruh ma'lumotlari va talabalar ro'yxati</p>
                </div>

                {/* Guruh Asosiy Ma'lumotlari */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="border-b border-gray-100 pb-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-3">
                                    {group.status === 'active' ? (
                                        <BookOpenIcon className="h-7 w-7 mr-3 text-[#A60E07]" />
                                    ) : (
                                        <ArchiveBoxXMarkIcon className="h-7 w-7 mr-3 text-gray-500" />
                                    )}
                                    {group.name}
                                    {group.status === 'draft' && (
                                        <span className="ml-3 text-sm font-medium text-yellow-600 px-2 py-1 bg-yellow-100 rounded-lg">
                                            Darsi boshlanmagan
                                        </span>
                                    )}
                                    {group.status === 'blocked' && (
                                        <span className="ml-3 text-sm font-medium text-gray-400 px-2 py-1 bg-gray-100 rounded-lg">
                                            Yopilgan
                                        </span>
                                    )}
                                </h2>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-extrabold text-[#A60E07] mb-1">
                                    {parseFloat(group.price).toLocaleString()} so'm
                                </div>
                                <div className="text-sm font-medium text-gray-500">Kurs narxi</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* O'qituvchi */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <UserIcon className="h-6 w-6 text-[#A60E07]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">O'qituvchi</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {group.teacher_name || 'Tayinlanmagan'}
                                    </p>
                                    {group.teacher_phone && (
                                        <div className="flex items-center mt-1 text-xs text-gray-600">
                                            <PhoneIcon className="h-3 w-3 mr-1" />
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
                                        {formatDate(group.start_date)}
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
                    </div>

                    {/* Dars kunlari (alohida qator) */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                            <CalendarDaysIcon className="h-5 w-5 text-orange-500" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dars kunlari</p>
                                <div className="flex flex-wrap gap-2">
                                    {group.schedule?.days?.map((day, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 text-xs font-bold bg-[#A60E07] text-white rounded-lg"
                                        >
                                            {day}
                                        </span>
                                    )) || (
                                        <span className="text-sm text-gray-500">Belgilanmagan</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Yaratilgan: {formatDateTime(group.created_at)}
                        </p>
                    </div>
                </div>

                {/* Talabalar Ro'yxati */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center uppercase tracking-tight">
                                <UsersIcon className="h-6 w-6 mr-3 text-[#A60E07]" />
                                Talabalar Ro'yxati
                            </h3>
                            <span className="px-4 py-2 text-sm bg-[#A60E07] text-white rounded-xl font-bold shadow-md">
                                {students.length} ta talaba
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-x-auto border border-gray-300">
                        <table className="min-w-full divide-y divide-gray-300 border-collapse">
                            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-400">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[220px] border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Student ma'lumotlari</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Ro'yxatdan sana</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Kurs holati</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-800 uppercase tracking-wider w-[150px] bg-gradient-to-b from-gray-100 to-gray-200">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-300">
                                {students.length > 0 ? (
                                    students.map((student, index) => {
                                        const rowKey = `${student.id}-${index}`;
                                        const isEditing = editingId === rowKey;

                                        return (
                                            <tr key={rowKey} className={`${
                                                isEditing ? 'bg-blue-50 border-l-4 border-blue-400' : 
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
                                                                <AddGroup 
                                                                    student={student} 
                                                                    isInGroup={true}
                                                                    onSuccess={() => {
                                                                        queryClient.invalidateQueries(['group', groupId]);
                                                                    }}
                                                                >
                                                                    <span className="text-base font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer">
                                                                        {student.name} {student.surname}
                                                                    </span>
                                                                </AddGroup>
                                                                <UserCheck className="h-4 w-4 text-green-600" />
                                                            </div>
                                                            
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <Phone className="h-3 w-3 text-blue-500" />
                                                                    <span><strong>Asosiy:</strong> {student.phone}</span>
                                                                </div>
                                                                
                                                                {student.phone2 && (
                                                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                        <Phone className="h-3 w-3 text-green-400" />
                                                                        <span><strong>Qo'shimcha:</strong> {student.phone2}</span>
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <User className="h-3 w-3 text-purple-500" />
                                                                    <span><strong>Otasi:</strong> {student.father_name} ({student.father_phone})</span>
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
                                                        <EditableCell name="registration_date" type="date" value={editData.registration_date} onChange={handleEditChange} />
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium text-gray-800">
                                                                {formatDateTime(student.registration_date)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                <strong>Guruhga qo'shilgan:</strong> {formatDateTime(student.joined_at)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                                    {isEditing ? (
                                                        <select
                                                            name="course_status"
                                                            value={editData.course_status}
                                                            onChange={handleEditChange}
                                                            className="p-2 border border-[#A60E07] rounded w-full text-sm outline-none transition duration-200 focus:ring-1 focus:ring-[#A60E07]"
                                                        >
                                                            <option value="in_progress">🔄 Kurs davom etmoqda</option>
                                                            <option value="completed">✅ Kurs yakunlangan</option>
                                                            <option value="paused">⏸️ Kurs to'xtatilgan</option>
                                                        </select>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-1">
                                                                {student.course_status === 'in_progress' && <PlayCircle className="h-4 w-4 text-blue-500" />}
                                                                {student.course_status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                                                {student.course_status === 'paused' && <PauseCircle className="h-4 w-4 text-yellow-500" />}
                                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                                    student.course_status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                                                                    student.course_status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                    {student.course_status === 'in_progress' ? 'Davom etmoqda' : 
                                                                     student.course_status === 'completed' ? 'Yakunlangan' : 
                                                                     'To\'xtatilgan'}
                                                                </span>
                                                            </div>
                                                            <AddGroup 
                                                                student={student} 
                                                                isInGroup={true}
                                                                onSuccess={() => {
                                                                    queryClient.invalidateQueries(['group', groupId]);
                                                                }}
                                                            >
                                                                <button className="w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                                                    Guruh holatini o'zgartirish
                                                                </button>
                                                            </AddGroup>
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
                                                                className="p-1.5 rounded text-white bg-blue-600 hover:bg-blue-700 transition-all duration-150 shadow-sm border border-blue-700 hover:shadow-md transform hover:scale-105"
                                                                title="Tahrirlash"
                                                            >
                                                                <FiEdit size={12} />
                                                            </button>
                                                            
                                                            <Link href={`/admin/students/${student.id}`} 
                                                                className="p-1.5 rounded text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-150 shadow-sm border border-indigo-700 hover:shadow-md transform hover:scale-105"
                                                                title="Batafsil ko'rish"
                                                            >
                                                                <InformationCircleIcon className="h-3 w-3" />
                                                            </Link>
                                                            
                                                            <AddGroup 
                                                                student={student} 
                                                                isInGroup={true}
                                                                onSuccess={() => {
                                                                    queryClient.invalidateQueries(['group', groupId]);
                                                                }}
                                                            >
                                                                <button 
                                                                    className="p-1.5 rounded text-white bg-red-600 hover:bg-red-700 transition-all duration-150 shadow-sm border border-red-700 hover:shadow-md transform hover:scale-105"
                                                                    title="Guruh boshqaruvi"
                                                                >
                                                                    <TrashIcon className="h-3 w-3" />
                                                                </button>
                                                            </AddGroup>
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
                                                <div className="text-lg font-medium">Talabalar yo'q</div>
                                                <p className="text-sm text-gray-400 max-w-md text-center">
                                                    Bu guruhda hali hech qanday talaba ro'yxatdan o'tmagan. 
                                                    Talabalar guruh kodidan foydalanib qo'shilishlari mumkin.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailPage;

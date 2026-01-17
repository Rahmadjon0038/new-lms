'use client'
import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useRegisterStudent, useJoinStudentToGroup } from '../../hooks/students';
import { usegetAllgroups } from '../../hooks/groups';
import { toast } from 'react-hot-toast';

const MAIN_COLOR = "#A60E07";

export default function RegisterStudent({ children }) {
    const [open, setOpen] = useState(false);
    const [registeredStudent, setRegisteredStudent] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        username: '',
        password: '',
        phone: '',
        phone2: ''
    });
    
    const [selectedGroup, setSelectedGroup] = useState('');
    
    const { data: groupsData, isLoading: groupsLoading } = usegetAllgroups();
    const registerMutation = useRegisterStudent();
    const joinGroupMutation = useJoinStudentToGroup();
    
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({
            name: '',
            surname: '',
            username: '',
            password: '',
            phone: '',
            phone2: ''
        });
        setSelectedGroup('');
        setRegisteredStudent(null);
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.name || !formData.surname || !formData.username || !formData.password || !formData.phone) {
            toast.error('Iltimos, barcha majburiy maydonlarni to\'ldiring!');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('studentFormData', JSON.stringify(formData));
        
        // First register student
        registerMutation.mutate(formData, {
            onSuccess: (data) => {
                setRegisteredStudent(data.user);
                toast.success(data.message || 'Student muvaffaqiyatli ro\'yxatdan o\'tdi!');
                
                // If group is selected, join to group
                if (selectedGroup) {
                    joinGroupMutation.mutate({
                        student_id: data.user.id,
                        group_id: selectedGroup
                    }, {
                        onSuccess: () => {
                            toast.success('Student muvaffaqiyatli guruhga qo\'shildi!');
                            localStorage.removeItem('studentFormData');
                            handleClose();
                        },
                        onError: (error) => {
                            toast.error(error.response?.data?.message || 'Guruhga qo\'shishda xatolik!');
                            // Even if group join fails, close modal as student is registered
                            localStorage.removeItem('studentFormData');
                            handleClose();
                        }
                    });
                } else {
                    // No group selected, just close modal
                    localStorage.removeItem('studentFormData');
                    handleClose();
                }
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
            }
        });
    };
    
    // Load form data from localStorage on mount
    useEffect(() => {
        const savedFormData = localStorage.getItem('studentFormData');
        if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
        }
    }, []);

    const isLoading = registerMutation.isLoading || joinGroupMutation.isLoading;

    return (
        <>
            <button 
                onClick={handleOpen}
            >
                {children}
            </button>
            
            {open && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/60 bg-opacity-50 transition-opacity"
                        onClick={handleClose}
                    />
                    
                    {/* Modal */}
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div 
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: `${MAIN_COLOR}15` }}
                                        >
                                            <UserIcon className="w-6 h-6" style={{ color: MAIN_COLOR }} />
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            Yangi student ro'yxatdan o'tkazish
                                        </h2>
                                    </div>
                                    <button 
                                        onClick={handleClose}
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                                
                                {/* General Admin Reminder */}
                                <div 
                                    className="p-4 rounded-lg mb-6 border-l-4"
                                    style={{ 
                                        backgroundColor: `${MAIN_COLOR}08`, 
                                        borderColor: MAIN_COLOR 
                                    }}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 mt-0.5" style={{ color: MAIN_COLOR }} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 mb-1">
                                                Muhim eslatma!
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Yaratilgan <span className="font-medium">foydalanuvchi nomi</span> va <span className="font-medium">parolni</span> studentga bering. 
                                                Student shu ma'lumotlar orqali o'z shaxsiy kabinetiga kiradi.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ism *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                                style={{ focusRingColor: `${MAIN_COLOR}40` }}
                                                placeholder="Ismingizni kiriting"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Familiya *
                                            </label>
                                            <input
                                                type="text"
                                                name="surname"
                                                value={formData.surname}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                                style={{ focusRingColor: `${MAIN_COLOR}40` }}
                                                placeholder="Familiyangizni kiriting"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Foydalanuvchi nomi *
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                            style={{ focusRingColor: `${MAIN_COLOR}40` }}
                                            placeholder="Foydalanuvchi nomini kiriting"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Parol *
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                            style={{ focusRingColor: `${MAIN_COLOR}40` }}
                                            placeholder="Parolni kiriting"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <PhoneIcon className="w-4 h-4 inline mr-1" />
                                            Telefon raqami *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                            style={{ focusRingColor: `${MAIN_COLOR}40` }}
                                            placeholder="+998901234567"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <PhoneIcon className="w-4 h-4 inline mr-1" />
                                            Qo'shimcha telefon (ixtiyoriy)
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone2"
                                            value={formData.phone2}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                            style={{ focusRingColor: `${MAIN_COLOR}40` }}
                                            placeholder="+998912345678"
                                        />
                                    </div>
                                    
                                    {/* Group Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <UserGroupIcon className="w-4 h-4 inline mr-1" />
                                            Guruh (ixtiyoriy)
                                        </label>
                                        <select
                                            value={selectedGroup}
                                            onChange={(e) => setSelectedGroup(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                            style={{ focusRingColor: `${MAIN_COLOR}40` }}
                                            disabled={groupsLoading}
                                        >
                                            <option value="">Guruh tanlash (ixtiyoriy)</option>
                                            {groupsData?.groups?.filter(group => group.status !== 'blocked').map((group) => {
                                                const classStatus = group.class_status === 'started' ? 'Dars boshlangan' : 'Dars boshlanmagan';
                                                const statusIndicator = group.status === 'draft' ? ' (Draft)' : '';
                                                return (
                                                    <option key={group.id} value={group.id}>
                                                        {group.name} - {group.teacher_name || 'O\'qituvchisiz'} - {Number(group.price).toLocaleString()} so'm - {classStatus}{statusIndicator}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {groupsLoading && (
                                            <p className="text-sm text-gray-500 mt-1">Guruhlar yuklanmoqda...</p>
                                        )}
                                    </div>
                                    
                                    <div className="flex space-x-3 pt-4">
                                        <button 
                                            type="submit" 
                                            disabled={isLoading}
                                            className="flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                                            style={{ backgroundColor: MAIN_COLOR }}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {registerMutation.isLoading ? 'Ro\'yxatdan o\'tkazilmoqda...' : 'Guruhga qo\'shilmoqda...'}
                                                </span>
                                            ) : 'Ro\'yxatdan o\'tkazish'}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={handleClose}
                                            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                                            disabled={isLoading}
                                        >
                                            Bekor qilish
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
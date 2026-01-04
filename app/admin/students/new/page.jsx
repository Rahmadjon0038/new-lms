'use client'
import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation';
import { useRegisterStudent, useJoinStudentToGroup } from '../../../../hooks/students';
import { usegetAllgroups } from '../../../../hooks/groups';
import { toast } from 'react-hot-toast';

const MAIN_COLOR = "#A60E07";

export default function NewStudentPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: registration, 2: group selection
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
    
    const { data: groupsData, isLoading: groupsLoading } = usegetAllgroups(true);
    const registerMutation = useRegisterStudent();
    const joinGroupMutation = useJoinStudentToGroup();
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.name || !formData.surname || !formData.username || !formData.password || !formData.phone) {
            toast.error('Iltimos, barcha majburiy maydonlarni to\'ldiring!');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('studentFormData', JSON.stringify(formData));
        
        registerMutation.mutate(formData, {
            onSuccess: (data) => {
                setRegisteredStudent(data.user);
                toast.success(data.message || 'Student muvaffaqiyatli ro\'yxatdan o\'tdi!');
                setStep(2);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Xatolik yuz berdi!');
            }
        });
    };
    
    const handleJoinGroup = () => {
        if (!selectedGroup) {
            toast.error('Iltimos, guruhni tanlang!');
            return;
        }
        
        joinGroupMutation.mutate({
            student_id: registeredStudent.id,
            group_id: selectedGroup
        }, {
            onSuccess: (data) => {
                toast.success('Student muvaffaqiyatli guruhga qo\'shildi!');
                localStorage.removeItem('studentFormData');
                router.push('/admin/students');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Guruhga qo\'shishda xatolik!');
            }
        });
    };
    
    const handleFinish = () => {
        toast.success('Student ro\'yxatdan o\'tdi. Guruhni keyinroq tanlashingiz mumkin.');
        localStorage.removeItem('studentFormData');
        router.push('/admin/students');
    };
    
    const goBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            router.push('/admin/students');
        }
    };
    
    // Load form data from localStorage on mount
    useEffect(() => {
        const savedFormData = localStorage.getItem('studentFormData');
        if (savedFormData) {
            setFormData(JSON.parse(savedFormData));
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="px-12 mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={goBack}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span>Orqaga</span>
                        </button>
                        
                        <div className="text-sm text-gray-500">
                            Qadam {step} / 2
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                                backgroundColor: MAIN_COLOR,
                                width: step === 1 ? '50%' : '100%'
                            }}
                        />
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-800">
                        {step === 1 ? 'Yangi student ro\'yxatdan o\'tkazish' : 'Guruhga biriktirish'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {step === 1 
                            ? 'Student ma\'lumotlarini to\'ldiring' 
                            : 'Studentni guruhga biriktiring (ixtiyoriy)'
                        }
                    </p>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {step === 1 ? (
                        <div className="p-6">
                            {/* General Admin Reminder */}
                            <div 
                                className="p-3 rounded-lg mb-4 border-l-4"
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
                            
                            {/* Registration Form */}
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                            style={{ focusRingColor: `${MAIN_COLOR}40` }}
                                            placeholder="Ismini kiriting"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                            style={{ focusRingColor: `${MAIN_COLOR}40` }}
                                            placeholder="Familiyasini kiriting"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                        style={{ focusRingColor: `${MAIN_COLOR}40` }}
                                        placeholder="+998912345678"
                                    />
                                </div>
                                
                                <div className="flex justify-end pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={registerMutation.isLoading}
                                        className="flex items-center space-x-2 py-2 px-5 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                                        style={{ backgroundColor: MAIN_COLOR }}
                                    >
                                        {registerMutation.isLoading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Ro'yxatdan o'tkazilmoqda...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Keyingi qadam</span>
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="p-6">
                            {/* Success Message */}
                            <div 
                                className="p-3 rounded-lg mb-4"
                                style={{ backgroundColor: `${MAIN_COLOR}10` }}
                            >
                                <div className="flex items-center space-x-3">
                                    <CheckCircleIcon className="w-6 h-6" style={{ color: MAIN_COLOR }} />
                                    <div>
                                        <h3 className="font-medium text-gray-800">
                                            Student muvaffaqiyatli ro'yxatdan o'tdi!
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {registeredStudent?.name} {registeredStudent?.surname}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Group Selection */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <UserGroupIcon className="w-4 h-4 inline mr-1" />
                                        Guruh tanlash (ixtiyoriy)
                                    </label>
                                    <select
                                        value={selectedGroup}
                                        onChange={(e) => setSelectedGroup(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                        style={{ focusRingColor: `${MAIN_COLOR}40` }}
                                        disabled={groupsLoading}
                                    >
                                        <option value="">Guruh tanlash (ixtiyoriy)</option>
                                        {groupsData?.groups?.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name} - {group.teacher_name || 'O\'qituvchisiz'} - {Number(group.price).toLocaleString()} so'm
                                            </option>
                                        ))}
                                    </select>
                                    {groupsLoading && (
                                        <p className="text-sm text-gray-500 mt-1">Guruhlar yuklanmoqda...</p>
                                    )}
                                </div>
                                
                                <div className="flex space-x-4 pt-4">
                                    {selectedGroup ? (
                                        <button 
                                            onClick={handleJoinGroup}
                                            disabled={joinGroupMutation.isLoading}
                                            className="flex-1 flex items-center justify-center space-x-2 py-2 px-5 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                                            style={{ backgroundColor: MAIN_COLOR }}
                                        >
                                            {joinGroupMutation.isLoading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Guruhga qo'shilmoqda...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UserGroupIcon className="w-4 h-4" />
                                                    <span>Guruhga qo'shish</span>
                                                </>
                                            )}
                                        </button>
                                    ) : null}
                                    
                                    <button 
                                        onClick={handleFinish}
                                        className="flex-1 flex items-center justify-center space-x-2 py-2 px-5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                        <span>{selectedGroup ? "Keyinchalik guruga qo'shish" : 'Tugatish'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
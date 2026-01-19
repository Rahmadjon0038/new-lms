'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, Mail, 
  BookOpen, Users, CheckCircle, XCircle, 
  UserCheck, AlertCircle, Shield, ShieldBan, Award, UserX, Settings, Edit
} from 'lucide-react';
import Link from 'next/link';
import { useGetAllStudents, useUpdateStudentStatus } from '../../../../hooks/students';
import { useGetNotify } from '../../../../hooks/notify';
import { getStatusInfo, getAllStatusOptions } from '../../../../utils/studentStatus';

const StudentDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const studentId = params.id;
    
    // State
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Hooks  
    const { data: studentsData, isLoading: studentsLoading } = useGetAllStudents({});
    const updateStatusMutation = useUpdateStudentStatus();
    const notify = useGetNotify();
    
    // Student ma'lumotlarini olish
    useEffect(() => {
        if (studentsData && studentId) {
            const foundStudent = studentsData.find(s => s.id === parseInt(studentId));
            setStudent(foundStudent);
            setIsLoading(false);
        }
    }, [studentsData, studentId]);

    // Status o'zgartirish
    const handleStatusChange = async (newStatus) => {
        const loadingToast = notify('load');
        try {
            await updateStatusMutation.mutateAsync({
                id: parseInt(studentId),
                status: newStatus,
                onSuccess: () => {
                    notify('dismiss');
                    notify('ok', 'Talaba holati muvaffaqiyatli o\'zgartirildi');
                    setStudent(prev => ({ ...prev, status: newStatus }));
                    setStatusDropdownOpen(false);
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

    if (isLoading || studentsLoading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A60E07] mx-auto"></div>
                <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Talaba topilmadi</h2>
                <p className="text-gray-600 mb-4">Bu ID bo'yicha talaba mavjud emas.</p>
                <Link 
                    href="/admin/students" 
                    className="inline-flex items-center gap-2 text-[#A60E07] hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Talabalar ro'yxatiga qaytish
                </Link>
            </div>
        );
    }

    const statusInfo = getStatusInfo(student.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="p-4 md:p-8 mx-auto font-sans bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <Link 
                    href="/admin/students" 
                    className="inline-flex items-center gap-2 text-[#A60E07] hover:underline mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Talabalar ro'yxatiga qaytish
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">🎓 Talaba Ma'lumotlari</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Asosiy Ma'lumotlar */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-[#A60E07] rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {student.name?.[0]}{student.surname?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {student.name} {student.surname}
                                    </h2>
                                    <p className="text-gray-600">ID: #{student.id}</p>
                                </div>
                            </div>
                            
                            {/* Status va Edit */}
                            <div className="flex items-center gap-3">
                                <Link 
                                    href={`/admin/students`} 
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <Edit className="h-4 w-4" />
                                    Tahrirlash
                                </Link>
                            </div>
                        </div>

                        {/* Ma'lumotlar Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shaxsiy ma'lumotlar */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    Shaxsiy Ma'lumotlar
                                </h3>
                                
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Asosiy telefon</p>
                                        <p className="font-medium">{student.phone}</p>
                                    </div>
                                </div>

                                {student.phone2 && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Qo'shimcha telefon</p>
                                            <p className="font-medium">{student.phone2}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Yoshi</p>
                                        <p className="font-medium">{student.age}</p>
                                    </div>
                                </div>

                                {student.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-indigo-600 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600">Manzil</p>
                                            <p className="font-medium">{student.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Oila ma'lumotlari */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    Oila Ma'lumotlari
                                </h3>
                                
                                {student.father_name && (
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Ota/Ona/Yaqin</p>
                                            <p className="font-medium">{student.father_name}</p>
                                        </div>
                                    </div>
                                )}

                                {student.father_phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-purple-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Ota/Ona telefoni</p>
                                            <p className="font-medium">{student.father_phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* O'quv ma'lumotlari */}
                        {student.group_name && student.group_name !== 'Guruh biriktirilmagan' && (
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">O'quv Ma'lumotlari</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Guruh</p>
                                            <p className="font-medium text-[#A60E07]">{student.group_name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">O'qituvchi</p>
                                            <p className="font-medium">{student.teacher_name || 'Aniqlanmagan'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Fan</p>
                                            <p className="font-medium">{student.subject_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status va Actions */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Talaba Holati</h3>
                        
                        {/* Current Status */}
                        <div className="relative mb-4">
                            <button 
                                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                className={`w-full flex items-center justify-between gap-3 p-4 rounded-lg border-2 transition-all ${statusInfo.color} hover:opacity-80`}
                            >
                                <div className="flex items-center gap-3">
                                    <StatusIcon className={`h-6 w-6 ${statusInfo.iconColor}`} />
                                    <div className="text-left">
                                        <p className="text-sm opacity-75">Joriy holat</p>
                                        <p className="font-semibold">{statusInfo.label}</p>
                                    </div>
                                </div>
                                <Settings className={`h-5 w-5 ${statusInfo.iconColor}`} />
                            </button>

                            {/* Status Change Dropdown */}
                            {statusDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                                    {getAllStatusOptions().map((statusOption) => {
                                        const Icon = statusOption.icon;
                                        return (
                                            <button
                                                key={statusOption.value}
                                                onClick={() => handleStatusChange(statusOption.value)}
                                                disabled={updateStatusMutation.isLoading}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 transition-colors ${
                                                    student.status === statusOption.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                } ${updateStatusMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Icon className={`h-5 w-5 ${statusOption.color}`} />
                                                <span className="flex-1">{statusOption.label}</span>
                                                {student.status === statusOption.value && (
                                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Registration Info */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Ro'yxatdan o'tgan</p>
                                    <p className="font-medium">{student.registration_date ? new Date(student.registration_date).toLocaleDateString() : 'Noma\'lum'}</p>
                                </div>
                            </div>
                            
                            {student.course_start_date && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Kurs boshlangan</p>
                                        <p className="font-medium">{new Date(student.course_start_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Card */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Amallar</h3>
                        
                        <div className="space-y-3">
                            <Link 
                                href={`/admin/students/${student.id}/edit`}
                                className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <Edit className="h-5 w-5" />
                                Ma'lumotlarni tahrirlash
                            </Link>
                            
                            {student.group_id && (
                                <Link 
                                    href={`/admin/groups/${student.group_id}`}
                                    className="w-full flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    <Users className="h-5 w-5" />
                                    Guruhni ko'rish
                                </Link>
                            )}
                            
                            <Link 
                                href={`/admin/students-payments?student_id=${student.id}`}
                                className="w-full flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                <Calendar className="h-5 w-5" />
                                To'lovlar tarixi
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailPage;
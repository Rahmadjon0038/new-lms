"use client";
import React, { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    CalendarIcon,
    UserIcon,
    UserGroupIcon,
    AcademicCapIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PhoneIcon,
    PlusCircleIcon,
    CreditCardIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    UserPlusIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";
import { useMonthlyPayments, usePaymentHistory, useCreateSnapshotsForNewStudents, useNewStudentsNotification } from "../../../hooks/payments";
import { instance } from "../../../hooks/api";
import { useGetNotify } from "../../../hooks/notify";
import { usegetTeachers } from "../../../hooks/teacher";
import { useGetAllSubjects } from "../../../hooks/subjects";
import DiscountModal from "../../../components/admistrator/DiscountModal";
import PaymentModal from "../../../components/admistrator/PaymentModal";
import StudentAttendanceModal from "../../../components/modals/StudentAttendanceModal";
import SubjectsSelect from "../../../components/SubjectsSelect";

const MAIN_COLOR = "#A60E07";

const StudentPayments = () => {
    const queryClient = useQueryClient();
    const notify = useGetNotify();
    const createSnapshotsMutation = useCreateSnapshotsForNewStudents();
    
    const [filters, setFilters] = useState({
        month: new Date().toISOString().slice(0, 7), // Current month (YYYY-MM)
        group_id: '',
        payment_status: 'all',
        teacher_id: '',
        subject_id: ''
    });

    const { data: newStudentsNotification } = useNewStudentsNotification(
        filters.month || new Date().toISOString().slice(0, 7)
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showNotificationPopup, setShowNotificationPopup] = useState(true); // Always start as true
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [clearLoading, setClearLoading] = useState(false);
    const [snapshotLoading, setSnapshotLoading] = useState(false);
    const [historyFilters, setHistoryFilters] = useState({
        month: null,
        groupId: null,
        studentId: null,
        limit: 20
    });

    // Use payment history hook
    const { data: paymentHistoryData, isLoading: paymentHistoryLoading } = usePaymentHistory(
        historyFilters,
        { enabled: !!historyFilters.groupId && !!historyFilters.studentId }
    );

    const paymentHistory = paymentHistoryData?.data || [];

    // Fetch teachers for filters
    const { data: teachersData } = usegetTeachers();
    const teachers = teachersData?.teachers || [];

    // Fetch monthly payments
    const { data: paymentsData, isLoading, error } = useMonthlyPayments(filters);

    const students = paymentsData?.data?.students || [];
    const apiSummary = paymentsData?.data?.summary || {};

    const groups = useMemo(() => {
        const map = new Map();
        students.forEach((student) => {
            if (!student.group_id || !student.group_name) return;
            if (!map.has(student.group_id)) {
                map.set(student.group_id, {
                    id: student.group_id,
                    name: student.group_name
                });
            }
        });
        return Array.from(map.values());
    }, [students]);

    // Filter students based on search term
    const filteredStudents = useMemo(() => {
        if (!searchTerm.trim()) {
            return students;
        }

        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        return students.filter(student => {
            const fullName = `${student.student_name || ''} ${student.student_surname || ''}`.toLowerCase();
            const phone = (student.student_phone || '').replace(/\s+/g, '');
            const searchPhone = lowerSearchTerm.replace(/\s+/g, '');

            return fullName.includes(lowerSearchTerm) ||
                phone.includes(searchPhone) ||
                (student.group_name && student.group_name.toLowerCase().includes(lowerSearchTerm));
        });
    }, [students, searchTerm]);

    // Use backend statistics directly
    const stats = {
        total_students: parseInt(apiSummary.total_students || 0),
        paid: parseInt(apiSummary.paid_students || 0),
        partial: parseInt(apiSummary.partial_students || 0),
        unpaid: parseInt(apiSummary.unpaid_students || 0),
        active: parseInt(apiSummary.active_students || 0),
        total_expected: parseFloat(apiSummary.total_required || 0),
        total_collected: parseFloat(apiSummary.total_paid || 0),
        total_debt: parseFloat(apiSummary.total_debt || 0),
        total_discount: parseFloat(apiSummary.total_discount_amount || 0),
        students_with_discounts: parseInt(apiSummary.students_with_discounts || 0)
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Excel export handler
    const handleExport = async () => {
        try {
            // Build query parameters
            const params = new URLSearchParams({
                month: filters.month,
            });

            if (filters.group_id) {
                params.append('group_id', filters.group_id);
            }
            if (filters.payment_status !== 'all') {
                params.append('payment_status', filters.payment_status);
            }

            const response = await instance.get(`/api/snapshots/export?${params.toString()}`, {
                responseType: 'blob'
            });

            // Create blob and download file
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tolovlar_${filters.month}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Excel export error:', error);

            let errorMessage = 'Excel faylini yuklab olishda xatolik yuz berdi';

            if (error.response?.status === 404) {
                errorMessage = 'Excel export API topilmadi. Iltimos adminga murojaat qiling.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server xatosi. Iltimos keyinroq urinib ko\'ring.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            notify('err', errorMessage);
        }
    };

    // Create snapshots for new students
    const handleCreateSnapshotsForNew = async () => {
        if (!filters.month) {
            notify('err', 'Oy tanlanmagan!');
            return;
        }

        try {
            const result = await createSnapshotsMutation.mutateAsync(filters.month);
            if (result.success) {
                notify('suc', `${result.count} ta yangi talaba uchun snapshot yaratildi!`);
                // Clear notification after creating snapshots
                queryClient.invalidateQueries({ queryKey: ['new-students-notification', filters.month] });
                setShowNotificationPopup(false); // Hide popup after successful action
            } else {
                notify('err', result.message || 'Xatolik yuz berdi');
            }
        } catch (error) {
            console.error('Snapshot creation error:', error);
            notify('err', 'Snapshot yaratishda xatolik yuz berdi');
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: {
                label: "To'liq to'langan",
                className: "bg-green-100 text-green-800",
                icon: CheckCircleIcon
            },
            partial: {
                label: "Qisman to'langan",
                className: "bg-yellow-100 text-yellow-800",
                icon: ClockIcon
            },
            unpaid: {
                label: "To'lanmagan",
                className: "bg-red-100 text-red-800",
                icon: XCircleIcon
            }
        };

        const config = statusConfig[status] || statusConfig.unpaid;
        const IconComponent = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
                <IconComponent className="h-3 w-3" />
                {config.label}
            </span>
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            month: new Date().toISOString().slice(0, 7),
            group_id: '',
            payment_status: 'all',
            teacher_id: '',
            subject_id: ''
        });
        setSearchTerm('');
    };

    // Check if any filter is active
    const hasActiveFilters = filters.group_id || filters.payment_status !== 'all' || searchTerm.trim() || filters.teacher_id || filters.subject_id;

    // Clear student month data
    const handleClearStudentMonth = async () => {
        if (!selectedStudent) return;
        
        setClearLoading(true);
        try {
            const response = await instance.post('/api/snapshots/reset-payment', {
                student_id: selectedStudent.student_id,
                group_id: selectedStudent.group_id,
                month: filters.month
            });
            
            if (response.data.success) {
                const resetSummary = response.data.data?.reset_summary;
                
                // Refetch monthly payments data
                queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
                
                // Close modal and reset
                setShowClearModal(false);
                setSelectedStudent(null);
                
                // Show detailed success message
                let successMessage = response.data.message || 'To\'lov ma\'lumotlari muvaffaqiyatli tozalandi';
                
                if (resetSummary) {
                    const details = [];
                    if (resetSummary.discounts_deactivated > 0) {
                        details.push(`${resetSummary.discounts_deactivated} ta chegirma bekor qilindi`);
                    }
                    if (resetSummary.transactions_deleted > 0) {
                        details.push(`${resetSummary.transactions_deleted} ta tranzaksiya o'chirildi`);
                    }
                    if (details.length > 0) {
                        successMessage += `. ${details.join(', ')}.`;
                    }
                }
                
                notify('ok', successMessage);
            } else {
                notify('err', response.data.message || 'Xatolik yuz berdi');
            }
        } catch (error) {
            console.error('Reset error:', error);
            notify('err', error.response?.data?.message || 'Ma\'lumotlarni tozalashda xatolik yuz berdi');
        } finally {
            setClearLoading(false);
        }
    };

    // Create monthly snapshot
    const handleCreateSnapshot = async () => {
        setSnapshotLoading(true);
        try {
            const response = await instance.post('/api/snapshots/create', {
                month: filters.month
            });
            
            if (response.data.success) {
                // Refetch monthly payments data
                queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
                
                // Show detailed success message
                const data = response.data.data;
                const stats = data?.statistics;
                
                let successMessage = response.data.message || `${filters.month} oyi uchun to'lov jadvali muvaffaqiyatli yaratildi!`;
                
                if (data?.created_records) {
                    successMessage += ` (${data.created_records} ta yozuv yaratildi)`;
                }
                
                notify('ok', successMessage);
            } else {
                // Handle error (e.g., snapshot already exists)
                notify('err', response.data.message || 'Xatolik yuz berdi');
            }
        } catch (error) {
            console.error('Snapshot creation error:', error);
            
            // Handle API error response
            const errorMessage = error.response?.data?.message || 'Jadval yaratishda xatolik yuz berdi';
            notify('err', errorMessage);
        } finally {
            setSnapshotLoading(false);
        }
    };

    // Add "All" option to statuses
    const statusTabs = [
        { value: 'all', label: 'Barchasi' },
        { value: 'paid', label: "To'liq to'langan" },
        { value: 'partial', label: "Qisman to'langan" },
        { value: 'unpaid', label: "To'lanmagan" },
        { value: 'inactive', label: "Faol emas" }
    ];



    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: MAIN_COLOR }}></div>
                        <p className="text-gray-600 mt-4">Yuklanmoqda...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <p className="font-semibold">Xatolik yuz berdi:</p>
                        <p className="text-sm">{error.message || 'Ma\'lumotlarni yuklashda xatolik'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="px-2">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Talabalar oylik to'lovlari
                        </h1>
                        <p className="text-gray-600">
                            Talabalarning oylik to'lov ma'lumotlari va statistikasi
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCreateSnapshot}
                            disabled={snapshotLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 bg-green-600"
                            title="Yangi oy uchun to'lov jadvali yaratish"
                        >
                            {snapshotLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Yaratilmoqda...
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="h-4 w-4" />
                                    Oylik jadval yaratish
                                </>
                            )}
                        </button>
                        <div className="relative">
                            <button
                                onClick={handleCreateSnapshotsForNew}
                                disabled={!filters.month || createSnapshotsMutation.isPending}
                                className="group relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 bg-green-600 hover:scale-105 hover:shadow-lg"
                                title="Yangi qo'shilgan talabalar uchun snapshot yaratish"
                            >
                                {createSnapshotsMutation.isPending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Yaratilmoqda...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        Yangi talabalar uchun
                                        {newStudentsNotification?.data?.count > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-bounce">
                                                {newStudentsNotification.data.count}
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>

                            {/* Notification Popup - Minimalistic design */}
                            {showNotificationPopup && newStudentsNotification?.data?.count > 0 && (
                                <div 
                                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg border border-gray-300 p-4 z-50 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-900">Yangi talabalar</span>
                                        </div>
                                        <button
                                            onClick={() => setShowNotificationPopup(false)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <XCircleIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-3">
                                        Shu oyda <span className="font-semibold text-gray-900">{newStudentsNotification.data.count}</span> ta yangi talaba qo'shildi.
                                    </p>
                                    
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        {/* <span>Jami: {newStudentsNotification.data.total_new_students}</span> */}
                                        <span className="text-blue-600">↗ Yuqoridagi tugmani bosing</span>
                                    </div>
                                    
                                    {/* Simple arrow */}
                                    <div className="absolute -top-1 left-6 w-2 h-2 bg-white border-l border-t border-gray-300 rotate-45"></div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 transition-colors"
                            style={{ backgroundColor: MAIN_COLOR, focusRingColor: MAIN_COLOR }}
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Excel yuklab olish
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">

                    {/* Status Filter Buttons */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            To'lov holati:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {statusTabs.map((status) => (
                                <button
                                    key={status.value}
                                    onClick={() => handleFilterChange('payment_status', status.value)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filters.payment_status === status.value
                                        ? 'text-white shadow-md'
                                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                        }`}
                                    style={filters.payment_status === status.value ? { backgroundColor: MAIN_COLOR } : {}}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Other Filters */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                        {/* Search Input - First Column */}
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Qidiruv:
                            </label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Ism, telefon, guruh..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors text-sm"
                                    style={{ focusRingColor: MAIN_COLOR }}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Month Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Oy:
                            </label>
                            <input
                                type="month"
                                value={filters.month}
                                onChange={(e) => handleFilterChange('month', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                                style={{ focusRingColor: MAIN_COLOR }}
                            />
                        </div>

                        {/* Group Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Guruh:
                            </label>
                            <select
                                value={filters.group_id}
                                onChange={(e) => handleFilterChange('group_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                                style={{ focusRingColor: MAIN_COLOR }}
                            >
                                <option value="">Barcha guruhlar</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Teacher Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                O'qituvchi:
                            </label>
                            <select
                                value={filters.teacher_id}
                                onChange={(e) => handleFilterChange('teacher_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                                style={{ focusRingColor: MAIN_COLOR }}
                            >
                                <option value="">Barcha o'qituvchilar</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name} {teacher.surname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fan:
                            </label>
                            <SubjectsSelect
                                value={filters.subject_id}
                                onChange={(value) => handleFilterChange('subject_id', value)}
                                placeholder="Barcha fanlar"
                                className="w-full"
                                showAll={false}
                            />
                        </div>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 transition-colors h-10"
                                    style={{ '--tw-ring-color': MAIN_COLOR }}
                                >
                                    <XCircleIcon className="h-4 w-4" />
                                    Filtrlarni tozalash
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics Cards - Display Only */}
                {stats.total_students > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

                        {/* To'liq to'laganlar */}
                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">To'liq to'laganlar</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
                                </div>
                                <CheckCircleIcon className="h-8 w-8 text-green-400" />
                            </div>
                        </div>

                        {/* Qisman to'laganlar */}
                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Qisman to'laganlar</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.partial}</p>
                                </div>
                                <ClockIcon className="h-8 w-8 text-yellow-400" />
                            </div>
                        </div>

                        {/* To'lamaganlar */}
                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">To'lamaganlar</p>
                                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.unpaid}</p>
                                </div>
                                <XCircleIcon className="h-8 w-8 text-red-400" />
                            </div>
                        </div>

                        {/* Umumiy kerakli summa */}
                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Umumiy kerak</p>
                                    <p className="text-lg font-bold text-indigo-600 mt-1">{formatCurrency(stats.total_expected)}</p>
                                </div>
                                <CurrencyDollarIcon className="h-8 w-8 text-indigo-400" />
                            </div>
                        </div>

                        {/* Umumiy to'langan */}
                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-emerald-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yig'ilgan summa</p>
                                    <p className="text-lg font-bold text-emerald-600 mt-1">{formatCurrency(stats.total_collected)}</p>
                                </div>
                                <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
                            </div>
                        </div>

                        {/* Umumiy qarz */}
                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-rose-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {stats.total_debt < 0 ? 'Ortiqcha' : 'Umumiy qarz'}
                                    </p>
                                    <p className={`text-lg font-bold mt-1 ${stats.total_debt < 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                        {stats.total_debt < 0 ? '-' : ''}{formatCurrency(Math.abs(stats.total_debt))}
                                    </p>
                                </div>
                                <ExclamationTriangleIcon className={`h-8 w-8 ${stats.total_debt < 0 ? 'text-blue-400' : 'text-rose-400'}`} />
                            </div>
                        </div>

                        {/* Chegirmali talabalar */}
                        {stats.students_with_discounts > 0 && (
                            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chegirmali talabalar</p>
                                        <p className="text-2xl font-bold text-orange-600 mt-1">{stats.students_with_discounts}</p>
                                    </div>
                                    <UserIcon className="h-8 w-8 text-orange-400" />
                                </div>
                            </div>
                        )}

                        {/* Umumiy chegirma */}
                        {stats.total_discount > 0 && (
                            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-amber-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Umumiy chegirma</p>
                                        <p className="text-lg font-bold text-amber-600 mt-1">{formatCurrency(stats.total_discount)}</p>
                                    </div>
                                    <CurrencyDollarIcon className="h-8 w-8 text-amber-400" />
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* Results */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">
                            To'lov ma'lumotlari ({students.length} ta)
                        </h2>
                        {/* {stats.total_expected > 0 && (
              <div className="text-sm text-gray-600">
                Yig'ilgan: <span className="font-semibold text-green-600">{formatCurrency(stats.total_collected)}</span>
                {' / '}
                Jami: <span className="font-semibold">{formatCurrency(stats.total_expected)}</span>
                {stats.total_debt !== 0 && (
                  <span className="block mt-1">
                    {stats.total_debt < 0 ? 'Ortiqcha: ' : 'Umumiy qarz: '}
                    <span className={`font-semibold ${
                      stats.total_debt < 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(stats.total_debt))}
                    </span>
                  </span>
                )}
              </div>
            )} */}
                    </div>

                    <div className="overflow-x-auto">
                        {filteredStudents.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Talaba ma'lumotlari
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Guruh / Fan / O'qituvchi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            To'lov ma'lumotlari
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Admin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Holati
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amallar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.map((student, index) => (
                                        <tr key={`${student.student_id}-${student.group_id}-${index}`} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-start space-x-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {student.student_name} {student.student_surname}
                                                            </div>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${student.monthly_status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : student.monthly_status === 'stopped'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : student.monthly_status === 'finished'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {student.monthly_status === 'active' ? "Faol" :
                                                                    student.monthly_status === 'stopped' ? "To'xtatilgan" :
                                                                        student.monthly_status === 'finished' ? "Yakunlangan" : student.monthly_status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                                            <PhoneIcon className="h-3 w-3 mr-1" />
                                                            {student.student_phone}
                                                        </div>
                                                        {student.phone2 && (
                                                            <div className="flex items-center text-xs text-gray-400 mt-1">
                                                                <PhoneIcon className="h-3 w-3 mr-1" />
                                                                {student.phone2} (ikkinchi)
                                                            </div>
                                                        )}
                                                        <div className="flex gap-1">
                                                            {student.student_father_name && (
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    Otasi: {student.student_father_name}
                                                                </div>
                                                            )}
                                                            {student.student_father_phone && (
                                                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                                                    {student.student_father_phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* <div className="text-xs text-gray-400 mt-1">
                                                            ID: {student.student_id}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Qo'shilgan: {new Date(student.joined_at).toLocaleDateString('uz-UZ')}
                                                        </div> */}
                                                        {student.left_at && (
                                                            <div className="text-xs text-gray-400">
                                                                Ketgan: {new Date(student.left_at).toLocaleDateString('uz-UZ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 mb-1">
                                                        {student.group_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mb-1">
                                                        {student.subject_name}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        O'qituvchi: {student.teacher_name}
                                                    </div>
                                                    {/* <div className="text-xs text-gray-400 mt-1">
                                                        Guruh ID: {student.group_id}
                                                    </div> */}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">Asl narx:</span>
                                                        <span className="font-medium ml-2">{formatCurrency(parseFloat(student.group_price || 0))}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">Kerak:</span>
                                                        <span className="font-medium ml-2">{formatCurrency(parseFloat(student.effective_required || student.required_amount))}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">To'langan:</span>
                                                        <span className="font-medium text-green-600 ml-2">
                                                            {formatCurrency(parseFloat(student.paid_amount))}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStudent(student);
                                                                setHistoryFilters({
                                                                    month: filters.month,
                                                                    groupId: student.group_id,
                                                                    studentId: student.student_id,
                                                                    limit: 20
                                                                });
                                                                setShowPaymentHistoryModal(true);
                                                            }}
                                                            className="ml-1 inline-flex items-center justify-center w-5 h-5 bg-green-100 hover:bg-green-200 rounded-full transition-colors group"
                                                            title="To'lov tarixini ko'rish"
                                                        >
                                                            <InformationCircleIcon className="h-3 w-3 text-green-600 group-hover:text-green-700" />
                                                        </button>
                                                    </div>
                                                    {parseFloat(student.discount_amount || 0) > 0 && (
                                                        <div className="text-sm">
                                                            <span className="text-gray-500">Chegirma:</span>
                                                            <span className="font-medium text-orange-600 ml-2">
                                                                -{formatCurrency(parseFloat(student.discount_amount))}
                                                            </span>
                                                            {student.discount_description && (
                                                                <div className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-orange-100 hover:bg-orange-200 rounded-full transition-colors group relative cursor-help">
                                                                    <InformationCircleIcon className="h-3 w-3 text-orange-600 group-hover:text-orange-700" />
                                                                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                                                                        {student.discount_description}
                                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {parseFloat(student.debt_amount) !== 0 && (
                                                        <div className="text-sm">
                                                            <span className="text-gray-500">{parseFloat(student.debt_amount) < 0 ? 'Ortiqcha:' : 'Qarz:'}</span>
                                                            <span className={`font-medium ml-2 ${parseFloat(student.debt_amount) < 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                                {parseFloat(student.debt_amount) < 0 ? '-' : ''}{formatCurrency(Math.abs(parseFloat(student.debt_amount)))}
                                                            </span>
                                                        </div>
                                                    )}

                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    {student.last_payment_date ? (
                                                        <>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                So'nggi to'lov
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {student.last_payment_date}
                                                            </div>
                                                            {(student.payment_admin_full_name || student.last_payment_admin || student.admin_name || student.processed_by) && (
                                                                <div className="text-xs text-blue-600 font-medium">
                                                                    {student.payment_admin_full_name || student.last_payment_admin || student.admin_name || student.processed_by}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="text-sm text-gray-400">
                                                            To'lov yo'q
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(student.payment_status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setShowPaymentModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg transition-colors"
                                                        style={{ backgroundColor: MAIN_COLOR, color: 'white' }}
                                                    >
                                                        <CreditCardIcon className="h-3 w-3" />
                                                        To'lov
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setShowDiscountModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                                                    >
                                                        <PlusCircleIcon className="h-3 w-3" />
                                                        Chegirma
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setShowAttendanceModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                                                    >
                                                        <EyeIcon className="h-3 w-3" />
                                                        Davomat
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setShowClearModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                                                        title="Oylik ma'lumotlarni tozalash"
                                                    >
                                                        <TrashIcon className="h-3 w-3" />
                                                        Tozalash
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12">
                                <CurrencyDollarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                    {searchTerm ? 'Qidiruv bo\'yicha natija topilmadi' : 'Ma\'lumotlar topilmadi'}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {searchTerm
                                        ? `"${searchTerm}" qidiruviga mos keladigan talabalar topilmadi`
                                        : 'Tanlangan filtrlar bo\'yicha hech qanday to\'lov ma\'lumoti yo\'q'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modals */}
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedStudent(null);
                    }}
                    student={selectedStudent}
                    month={filters.month}
                />

                <DiscountModal
                    isOpen={showDiscountModal}
                    onClose={() => {
                        setShowDiscountModal(false);
                        setSelectedStudent(null);
                    }}
                    student={selectedStudent}
                    month={filters.month}
                />

                <StudentAttendanceModal
                    isOpen={showAttendanceModal}
                    onClose={() => {
                        setShowAttendanceModal(false);
                        setSelectedStudent(null);
                    }}
                    student={{...selectedStudent, teacher_id: filters.teacher_id, subject_id: filters.subject_id}}
                    month={filters.month}
                />

                {/* Payment History Modal */}
                {showPaymentHistoryModal && selectedStudent && (
                    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: `${MAIN_COLOR}10` }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <CreditCardIcon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
                                            To'lov tarixi - {filters.month}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {selectedStudent.student_name} {selectedStudent.student_surname}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowPaymentHistoryModal(false);
                                            setSelectedStudent(null);
                                            setHistoryFilters({
                                                month: null,
                                                groupId: null,
                                                studentId: null,
                                                limit: 20
                                            });
                                        }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                                    >
                                        <XCircleIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Content - Table */}
                            <div className="overflow-y-auto max-h-[calc(85vh-160px)]">
                                {paymentHistoryLoading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: MAIN_COLOR }}></div>
                                        <p className="text-gray-600 mt-3 text-sm">Yuklanmoqda...</p>
                                    </div>
                                ) : paymentHistory && paymentHistory.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50" style={{ backgroundColor: `${MAIN_COLOR}05` }}>
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    #
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Sana
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Summa
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    To'lov turi
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Qabul qildi
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Izoh
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {paymentHistory.map((payment, index) => {
                                                const paymentMethodLabels = {
                                                    'cash': 'Naqd',
                                                    'card': 'Karta',
                                                    'transfer': 'O\'tkazma',
                                                    'other': 'Boshqa'
                                                };
                                                
                                                return (
                                                    <tr key={`payment-${index}`} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                                <span className="text-sm text-gray-900">{payment.transaction_date}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <CurrencyDollarIcon className="h-4 w-4" style={{ color: MAIN_COLOR }} />
                                                                <span className="text-sm font-semibold" style={{ color: MAIN_COLOR }}>
                                                                    {formatCurrency(parseFloat(payment.amount))}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                <CreditCardIcon className="h-3 w-3" />
                                                                {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <UserIcon className="h-4 w-4 text-purple-500" />
                                                                <span className="text-sm text-gray-700">{payment.admin_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-600">
                                                                {payment.description || '-'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-12">
                                        <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-base font-medium mb-2">
                                            To'lov tarixi topilmadi
                                        </p>
                                        <p className="text-gray-400 text-sm max-w-md mx-auto">
                                            {filters.month} oyida bu talaba uchun hech qanday to'lov amalga oshirilmagan
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs">
                                        <div className="text-gray-600">
                                            <span className="font-medium">Jami:</span>
                                            <span className="ml-1 font-bold text-blue-600">
                                                {paymentHistory.length} ta
                                            </span>
                                        </div>
                                        <div className="text-gray-600">
                                            <span className="font-bold text-green-600">
                                                {paymentHistory.length > 0 ? 
                                                    formatCurrency(paymentHistory.reduce((sum, payment) => sum + parseFloat(payment.amount), 0)) :
                                                    formatCurrency(parseFloat(selectedStudent?.paid_amount || 0))
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowPaymentHistoryModal(false);
                                            setSelectedStudent(null);
                                            setHistoryFilters({
                                                month: null,
                                                groupId: null,
                                                studentId: null,
                                                limit: 20
                                            });
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors"
                                        style={{ backgroundColor: MAIN_COLOR }}
                                    >
                                        Yopish
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Clear Student Month Confirmation Modal */}
                {showClearModal && selectedStudent && (
                    <div 
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowClearModal(false);
                            setSelectedStudent(null);
                        }}
                    >
                        <div 
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-6 py-4 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                                    <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Oylik ma'lumotlarni tozalash
                                </h3>
                            </div>

                            {/* Content */}
                            <div className="px-6 pb-6">
                                {/* Student Info */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex gap-2">
                                            <span className="text-gray-500">Talaba:</span>
                                            <p className="font-medium text-gray-900">
                                                {selectedStudent.student_name} {selectedStudent.student_surname}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-gray-500">Guruh:</span>
                                            <p className="font-medium text-gray-900">{selectedStudent.group_name}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-gray-500">Fan:</span>
                                            <p className="font-medium text-gray-900">{selectedStudent.subject_name}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-gray-500">Oy:</span>
                                            <p className="font-medium text-gray-900">Joriy oy</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Data Summary */}
                                {(parseFloat(selectedStudent.paid_amount) > 0 || parseFloat(selectedStudent.discount_amount || 0) > 0) && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                                        <h4 className="text-sm font-medium text-amber-800 mb-3">
                                            Hozirgi ma'lumotlar:
                                        </h4>
                                        <div className="space-y-2">
                                            {parseFloat(selectedStudent.paid_amount) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">To'langan:</span>
                                                    <span className="font-semibold text-green-600">
                                                        {formatCurrency(parseFloat(selectedStudent.paid_amount))}
                                                    </span>
                                                </div>
                                            )}
                                            {parseFloat(selectedStudent.discount_amount || 0) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Chegirma:</span>
                                                    <span className="font-semibold text-orange-600">
                                                        {formatCurrency(parseFloat(selectedStudent.discount_amount))}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowClearModal(false);
                                            setSelectedStudent(null);
                                        }}
                                        disabled={clearLoading}
                                        className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        onClick={handleClearStudentMonth}
                                        disabled={clearLoading}
                                        className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                    >
                                        {clearLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Tozalanmoqda...
                                            </>
                                        ) : (
                                            <>
                                                <TrashIcon className="h-4 w-4" />
                                                Ha, tozalash
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default StudentPayments
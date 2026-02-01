"use client";
import React, { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    CalendarIcon,
    UserIcon,
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
    PlusIcon
} from "@heroicons/react/24/outline";
import { usePaymentFilters, useMonthlyPayments, usePaymentHistory } from "../../../hooks/payments";
import { instance } from "../../../hooks/api";
import { useGetNotify } from "../../../hooks/notify";
import DiscountModal from "../../../components/admistrator/DiscountModal";
import PaymentModal from "../../../components/admistrator/PaymentModal";
import StudentAttendanceModal from "../../../components/modals/StudentAttendanceModal";

const MAIN_COLOR = "#A60E07";

const StudentPayments = () => {
    const queryClient = useQueryClient();
    const notify = useGetNotify();
    
    const [filters, setFilters] = useState({
        month: new Date().toISOString().slice(0, 7), // Current month (YYYY-MM)
        teacher_id: '',
        subject_id: '',
        status: 'all'
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
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

    const paymentHistory = paymentHistoryData?.data?.history || [];

    // Fetch filter options
    const { data: filterOptions } = usePaymentFilters();

    // Fetch monthly payments
    const { data: paymentsData, isLoading, error } = useMonthlyPayments(filters);

    const students = paymentsData?.data?.students || [];
    const apiStats = paymentsData?.data?.stats || {};

    // Filter students based on search term
    const filteredStudents = useMemo(() => {
        if (!searchTerm.trim()) {
            return students;
        }

        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        return students.filter(student => {
            const fullName = `${student.name} ${student.surname}`.toLowerCase();
            const phone = student.phone?.replace(/\s+/g, '') || '';
            const searchPhone = lowerSearchTerm.replace(/\s+/g, '');

            return fullName.includes(lowerSearchTerm) ||
                phone.includes(searchPhone) ||
                (student.group_name && student.group_name.toLowerCase().includes(lowerSearchTerm));
        });
    }, [students, searchTerm]);

    // Use backend statistics directly
    const stats = {
        total_students: apiStats.total_students || 0,
        paid: apiStats.paid || 0,
        partial: apiStats.partial || 0,
        unpaid: apiStats.unpaid || 0,
        total_expected: apiStats.total_expected || 0,
        total_collected: apiStats.total_collected || 0,
        total_debt: apiStats.total_debt || 0
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

            if (filters.teacher_id) {
                params.append('teacher_id', filters.teacher_id);
            }
            if (filters.subject_id) {
                params.append('subject_id', filters.subject_id);
            }
            if (filters.status !== 'all') {
                params.append('status', filters.status);
            }

            const response = await instance.get(`/api/payments/monthly/export?${params.toString()}`, {
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

    const teachers = filterOptions?.data?.teachers || [];
    const subjects = filterOptions?.data?.subjects || [];
    const statuses = filterOptions?.data?.statuses || [];

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            month: new Date().toISOString().slice(0, 7),
            teacher_id: '',
            subject_id: '',
            status: 'all'
        });
        setSearchTerm('');
    };

    // Check if any filter is active
    const hasActiveFilters = filters.teacher_id || filters.subject_id || filters.status !== 'all' || searchTerm.trim();

    // Clear student month data
    const handleClearStudentMonth = async () => {
        if (!selectedStudent) return;
        
        setClearLoading(true);
        try {
            const response = await instance.post('/api/payments/clear-student-month', {
                student_id: selectedStudent.student_id,
                group_id: selectedStudent.group_id,
                month: filters.month
            });
            
            if (response.data.success) {
                const deletedCounts = response.data.data?.deleted_counts;
                const totalDeleted = response.data.data?.total_deleted || 0;
                
                // Refetch monthly payments data
                queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
                
                // Close modal and reset
                setShowClearModal(false);
                setSelectedStudent(null);
                
                // Show success message with details
                const message = response.data.message || `${totalDeleted} ta yozuv tozalandi`;
                notify('ok', message);
            } else {
                notify('err', response.data.message || 'Xatolik yuz berdi');
            }
        } catch (error) {
            console.error('Clear error:', error);
            notify('err', error.response?.data?.message || 'Ma\'lumotlarni tozalashda xatolik yuz berdi');
        } finally {
            setClearLoading(false);
        }
    };

    // Create monthly snapshot
    const handleCreateSnapshot = async () => {
        setSnapshotLoading(true);
        try {
            const response = await instance.post('/api/payments/create-monthly-snapshot', {
                month: filters.month
            });
            
            if (response.data.success) {
                // Refetch monthly payments data
                queryClient.invalidateQueries({ queryKey: ['monthly-payments'] });
                
                notify('ok', `${filters.month} oyi uchun to\'lov jadvali muvaffaqiyatli yaratildi!`);
            } else {
                notify('err', response.data.message || 'Xatolik yuz berdi');
            }
        } catch (error) {
            console.error('Snapshot creation error:', error);
            notify('err', error.response?.data?.message || 'Jadval yaratishda xatolik yuz berdi');
        } finally {
            setSnapshotLoading(false);
        }
    };

    // Add "All" option to statuses
    const statusTabs = [
        { value: 'all', label: 'Barchasi' },
        { value: 'paid', label: "To'liq to'langan" },
        { value: 'partial', label: "Qisman to'langan" },
        { value: 'unpaid', label: "To'lanmagan" }
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
                                    onClick={() => handleFilterChange('status', status.value)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filters.status === status.value
                                        ? 'text-white shadow-md'
                                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                        }`}
                                    style={filters.status === status.value ? { backgroundColor: MAIN_COLOR } : {}}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Other Filters */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

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
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fan:
                            </label>
                            <select
                                value={filters.subject_id}
                                onChange={(e) => handleFilterChange('subject_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                                style={{ focusRingColor: MAIN_COLOR }}
                            >
                                <option value="">Barcha fanlar</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">


                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">To'liq to'laganlar</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
                                </div>
                                <CheckCircleIcon className="h-8 w-8 text-green-400" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Qisman to'laganlar</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.partial}</p>
                                </div>
                                <ClockIcon className="h-8 w-8 text-yellow-400" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">To'lamaganlar</p>
                                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.unpaid}</p>
                                </div>
                                <XCircleIcon className="h-8 w-8 text-red-400" />
                            </div>
                        </div>
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
                                                                {student.name} {student.surname}
                                                            </div>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${student.student_status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : student.student_status === 'finished'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : student.student_status === 'stripped'
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {student.student_status === 'active' ? "Faol" :
                                                                    student.student_status === 'finished' ? "bitirgan" :
                                                                        student.student_status === 'stopped' ? "To'xtatgan" : student.student_status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                                            <PhoneIcon className="h-3 w-3 mr-1" />
                                                            {student.phone}
                                                        </div>
                                                        {student.phone2 && (
                                                            <div className="flex items-center text-xs text-gray-400 mt-1">
                                                                <PhoneIcon className="h-3 w-3 mr-1" />
                                                                {student.phone2} (ikkinchi)
                                                            </div>
                                                        )}
                                                        <div className="flex gap-1">
                                                            {student.father_name && (
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    Otasi: {student.father_name}
                                                                </div>
                                                            )}
                                                            {student.father_phone && (
                                                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                                                    {student.father_phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* <div className="text-xs text-gray-400 mt-1">
                                                            ID: {student.student_id}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Qo'shilgan: {new Date(student.join_date).toLocaleDateString('uz-UZ')}
                                                        </div> */}
                                                        {student.leave_date && (
                                                            <div className="text-xs text-gray-400">
                                                                Ketgan: {new Date(student.leave_date).toLocaleDateString('uz-UZ')}
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
                                                        <span className="font-medium ml-2">{formatCurrency(parseFloat(student.original_price))}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">Kerak:</span>
                                                        <span className="font-medium ml-2">{formatCurrency(parseFloat(student.required_amount))}</span>
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

                                                    <div className="text-sm flex items-center">
                                                        <span className="text-gray-500">Chegirma:</span>
                                                        <span className={`font-medium ml-2 ${
                                                            parseFloat(student.discount_amount) > 0 ? 'text-orange-500' : 'text-gray-400'
                                                        }`}>
                                                            {parseFloat(student.discount_amount) > 0 ? '-' : ''}{formatCurrency(parseFloat(student.discount_amount || 0))}
                                                        </span>
                                                        {student.discount_description && (
                                                            <div className="relative group ml-1">
                                                                <InformationCircleIcon className="h-4 w-4 text-blue-500 cursor-help" />
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap max-w-xs z-10">
                                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                                                    {student.discount_description}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {parseFloat(student.debt_amount) !== 0 && (
                                                        <div className="text-sm">
                                                            <span className="text-gray-500">{parseFloat(student.debt_amount) < 0 ? 'Ortiqcha:' : 'Qarz:'}</span>
                                                            <span className={`font-medium ml-2 ${parseFloat(student.debt_amount) < 0 ? 'text-blue-600' : 'text-red-600'
                                                                }`}>
                                                                {parseFloat(student.debt_amount) < 0 ? '-' : ''}{formatCurrency(Math.abs(parseFloat(student.debt_amount)))}
                                                            </span>
                                                        </div>
                                                    )}

                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    {student.last_payment_admin ? (
                                                        <>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {student.last_payment_admin}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {student.last_payment_method}
                                                            </div>
                                                            {student.last_payment_date && (
                                                                <div className="text-xs text-gray-400">
                                                                    {student.last_payment_date}
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
                    student={selectedStudent}
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
                                            {selectedStudent.name} {selectedStudent.surname}
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
                                                                <span className="text-sm text-gray-900">{payment.payment_date}</span>
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
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Oylik ma'lumotlarni tozalash
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Diqqat! Bu harakat qaytarib bo'lmaydi
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-5">
                                {/* Student Info */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-5">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600">Talaba:</span>
                                            <p className="font-semibold text-gray-900">
                                                {selectedStudent.name} {selectedStudent.surname}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Guruh:</span>
                                            <p className="font-semibold text-gray-900">{selectedStudent.group_name}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Fan:</span>
                                            <p className="font-semibold text-gray-900">{selectedStudent.subject_name}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Oy:</span>
                                            <p className="font-semibold text-gray-900">{filters.month}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning Message */}
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5">
                                    <div className="flex">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                                        <div className="ml-3">
                                            <h4 className="text-sm font-semibold text-red-800 mb-2">
                                                Quyidagi ma'lumotlar butunlay o'chiriladi:
                                            </h4>
                                            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                                                <li>Barcha to'lovlar ({filters.month} oyi)</li>
                                                <li>Barcha chegirmalar</li>
                                                <li>To'lov tarixi va tranzaktsiyalar</li>
                                                <li>Oylik statistika ma'lumotlari</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Data Summary */}
                                {(parseFloat(selectedStudent.paid_amount) > 0 || parseFloat(selectedStudent.discount_amount) > 0) && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5">
                                        <h4 className="text-sm font-semibold text-yellow-800 mb-3">
                                            Hozirgi ma'lumotlar:
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {parseFloat(selectedStudent.paid_amount) > 0 && (
                                                <div>
                                                    <span className="text-yellow-700">To'langan:</span>
                                                    <p className="font-bold text-green-600">
                                                        {formatCurrency(parseFloat(selectedStudent.paid_amount))}
                                                    </p>
                                                </div>
                                            )}
                                            {parseFloat(selectedStudent.discount_amount) > 0 && (
                                                <div>
                                                    <span className="text-yellow-700">Chegirma:</span>
                                                    <p className="font-bold text-orange-600">
                                                        {formatCurrency(parseFloat(selectedStudent.discount_amount))}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Final Warning */}
                                <div className="bg-gray-100 rounded-lg p-4 text-center">
                                    <p className="text-sm text-gray-700 font-medium">
                                        Bu amalni amalga oshirmoqchimisiz?
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        O'chirilgan ma'lumotlarni qaytarib bo'lmaydi!
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowClearModal(false);
                                        setSelectedStudent(null);
                                    }}
                                    disabled={clearLoading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={handleClearStudentMonth}
                                    disabled={clearLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
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
                )}

            </div>
        </div>
    );
};

export default StudentPayments
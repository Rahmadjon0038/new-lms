"use client";
import React, { useState, useMemo } from "react";
import {
    CalendarIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PhoneIcon,
    MagnifyingGlassIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";
import { useMonthlyPayments } from "../../../hooks/payments";

const MAIN_COLOR = "#A60E07";

const TeacherPaymentsInfo = () => {
    const [filters, setFilters] = useState({
        month: new Date().toISOString().slice(0, 7), // Current month (YYYY-MM)
        status: 'all'
    });

    const [searchTerm, setSearchTerm] = useState('');

    // Fetch payments using existing hook
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

    // Statistics
    const stats = {
        total_students: apiStats.total_students || 0,
        paid: apiStats.paid || 0,
        partial: apiStats.partial || 0,
        unpaid: apiStats.unpaid || 0,
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Status tabs
    const statusTabs = [
        { value: 'all', label: 'Barchasi' },
        { value: 'paid', label: "To'liq to'langan" },
        { value: 'partial', label: "Qisman to'langan" },
        { value: 'unpaid', label: "To'lanmagan" },
    ];

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

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (isLoading) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: MAIN_COLOR }}></div>
                    <p className="text-gray-600 mt-4">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="font-semibold">Xatolik yuz berdi:</p>
                    <p className="text-sm">{error.message || 'Ma\'lumotlarni yuklashda xatolik'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Talabalar to'lovlari
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    O'quvchilaringizning oylik to'lov ma'lumotlari
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
                {/* Status Filter Buttons */}
                <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                        To'lov holati:
                    </label>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                        {statusTabs.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => handleFilterChange('status', status.value)}
                                className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${filters.status === status.value
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {/* Search Input */}
                    <div>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Ism, telefon, guruh..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 sm:pl-9 pr-6 sm:pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors text-xs sm:text-sm"
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
                        <input
                            type="month"
                            value={filters.month}
                            onChange={(e) => handleFilterChange('month', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-xs sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats.total_students > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-md border-l-4" style={{ borderColor: MAIN_COLOR }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Jami talabalar</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1" style={{ color: MAIN_COLOR }}>{stats.total_students}</p>
                            </div>
                            <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">To'liq to'laganlar</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
                            </div>
                            <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                        </div>
                    </div>

                    <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Qisman to'laganlar</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600 mt-1">{stats.partial}</p>
                            </div>
                            <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                        </div>
                    </div>

                    <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-md border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">To'lamaganlar</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 mt-1">{stats.unpaid}</p>
                            </div>
                            <XCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* Results Table */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                        To'lov ma'lumotlari ({filteredStudents.length} ta)
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {filteredStudents.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Talaba ma'lumotlari
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Guruh / Fan
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        To'lov ma'lumotlari
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Holati
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.map((student, index) => (
                                    <tr key={`${student.student_id}-${student.group_id}-${index}`} className="hover:bg-gray-50">
                                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                                            <div className="flex items-start space-x-2 sm:space-x-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                                            {student.name} {student.surname}
                                                        </div>
                                                        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                                                            student.student_status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : student.student_status === 'finished'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : student.student_status === 'stopped'
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {student.student_status === 'active' ? 'Faol' :
                                                             student.student_status === 'finished' ? 'Bitirgan' :
                                                             student.student_status === 'stopped' ? "To'xtatgan" : student.student_status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                                                        <PhoneIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                                                        <a href={`tel:${student.phone}`} className="hover:underline truncate">
                                                            {student.phone}
                                                        </a>
                                                    </div>
                                                    {student.phone2 && (
                                                        <div className="flex items-center text-[10px] sm:text-xs text-gray-400 mt-1">
                                                            <PhoneIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">{student.phone2} (ikkinchi)</span>
                                                        </div>
                                                    )}
                                                    {student.father_name && (
                                                        <div className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
                                                            Otasi: {student.father_name}
                                                            {student.father_phone && ` - ${student.father_phone}`}
                                                        </div>
                                                    )}
                                                    {student.leave_date && (
                                                        <div className="text-[10px] sm:text-xs text-red-500 mt-1">
                                                            Ketgan: {new Date(student.leave_date).toLocaleDateString('uz-UZ')}
                                                        </div>
                                                    )}
                                                    <div className="sm:hidden text-[10px] text-gray-500 mt-1 truncate">
                                                        {student.group_name} - {student.subject_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 hidden sm:table-cell">
                                            <div>
                                                <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
                                                    {student.group_name}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-500">
                                                    {student.subject_name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                                            <div className="space-y-0.5 sm:space-y-1">
                                                <div className="text-xs sm:text-sm">
                                                    <span className="text-gray-500">Asl narx:</span>
                                                    <span className="font-medium ml-1 sm:ml-2">{formatCurrency(parseFloat(student.original_price))}</span>
                                                </div>
                                                <div className="text-xs sm:text-sm">
                                                    <span className="text-gray-500">Kerak:</span>
                                                    <span className="font-medium ml-1 sm:ml-2">{formatCurrency(parseFloat(student.required_amount))}</span>
                                                </div>
                                                <div className="text-xs sm:text-sm">
                                                    <span className="text-gray-500">To'langan:</span>
                                                    <span className="font-medium text-green-600 ml-1 sm:ml-2">{formatCurrency(parseFloat(student.paid_amount))}</span>
                                                </div>
                                                {parseFloat(student.discount_amount) > 0 && (
                                                    <div className="text-xs sm:text-sm">
                                                        <span className="text-gray-500">Chegirma:</span>
                                                        <span className="font-medium text-orange-500 ml-1 sm:ml-2">-{formatCurrency(parseFloat(student.discount_amount))}</span>
                                                    </div>
                                                )}
                                                {parseFloat(student.debt_amount) > 0 && (
                                                    <div className="text-xs sm:text-sm">
                                                        <span className="text-gray-500">Qarz:</span>
                                                        <span className="font-medium text-red-600 ml-1 sm:ml-2">{formatCurrency(parseFloat(student.debt_amount))}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                                            {getStatusBadge(student.payment_status)}
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
        </div>
    );
};

export default TeacherPaymentsInfo;
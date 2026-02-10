"use client";
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    CalendarIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PhoneIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    UsersIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useMonthlyPayments } from "../../../hooks/payments";

const MAIN_COLOR = "#A60E07";

const TeacherPaymentsInfo = () => {
    const [filters, setFilters] = useState({
        month: new Date().toISOString().slice(0, 7), // Current month (YYYY-MM)
        payment_status: 'all'
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const filterDropdownRef = useRef(null);
    const [tooltipVisible, setTooltipVisible] = useState(null);

    // Fetch payments using existing hook
    const { data: paymentsData, isLoading, error } = useMonthlyPayments(filters);

    const students = paymentsData?.data?.students || [];
    const apiSummary = paymentsData?.data?.summary || {};

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

    // Statistics
    const stats = {
        total_students: parseInt(apiSummary.total_students || 0),
        paid: parseInt(apiSummary.paid_students || 0),
        partial: parseInt(apiSummary.partial_students || 0),
        unpaid: parseInt(apiSummary.unpaid_students || 0),
        active: parseInt(apiSummary.active_students || 0),
        total_required: parseFloat(apiSummary.total_required || 0),
        total_paid: parseFloat(apiSummary.total_paid || 0),
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

    useEffect(() => {
        if (!showFilterDropdown) return undefined;

        const handleOutsideClick = (event) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
                setShowFilterDropdown(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowFilterDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showFilterDropdown]);

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
            <div className="mb-4 rounded-lg bg-white p-3 shadow-md sm:mb-6 sm:p-4 md:p-6">
                <div className="relative" ref={filterDropdownRef}>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 sm:h-4 sm:w-4" />
                            <input
                                type="text"
                                placeholder="Ism, telefon, guruh..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-7 text-xs transition-colors focus:border-transparent focus:ring-2 sm:pl-9 sm:pr-8 sm:text-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 transition-colors hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFilterDropdown((prev) => !prev)}
                            className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <FunnelIcon className="h-4 w-4" />
                            Filter
                        </button>
                    </div>

                    {showFilterDropdown && (
                        <div className="absolute right-0 z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white p-3 shadow-lg sm:w-[560px]">
                            <div className="mb-3">
                                <label className="mb-2 block text-xs font-medium text-gray-700 sm:text-sm">To'lov holati:</label>
                                <div className="flex flex-wrap gap-2">
                                    {statusTabs.map((status) => (
                                        <button
                                            key={status.value}
                                            onClick={() => handleFilterChange('payment_status', status.value)}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${filters.payment_status === status.value
                                                ? 'text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            style={filters.payment_status === status.value ? { backgroundColor: MAIN_COLOR } : {}}
                                        >
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">Oy:</label>
                                <input
                                    type="month"
                                    value={filters.month}
                                    onChange={(e) => handleFilterChange('month', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-transparent focus:outline-none focus:ring-2 sm:text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            {/* {stats.total_students > 0 && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4">
                        <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-md border-l-4" style={{ borderColor: MAIN_COLOR }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Jami talabalar</p>
                                    <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1" style={{ color: MAIN_COLOR }}>{stats.total_students}</p>
                                    <p className="text-[10px] sm:text-xs text-gray-400">Faol: {stats.active}</p>
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

                    {/* Financial Summary */}
                    {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium opacity-90 uppercase tracking-wide">Jami kutilgan</p>
                                    <p className="text-xl font-bold mt-1">{formatCurrency(stats.total_required)}</p>
                                </div>
                                <CurrencyDollarIcon className="h-8 w-8 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium opacity-90 uppercase tracking-wide">To'langan</p>
                                    <p className="text-xl font-bold mt-1">{formatCurrency(stats.total_paid)}</p>
                                </div>
                                <CheckCircleIcon className="h-8 w-8 opacity-80" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium opacity-90 uppercase tracking-wide">Qarz</p>
                                    <p className="text-xl font-bold mt-1">{formatCurrency(stats.total_debt)}</p>
                                    {stats.total_discount > 0 && (
                                        <p className="text-xs opacity-75 mt-1">Chegirma: {formatCurrency(stats.total_discount)}</p>
                                    )}
                                </div>
                                <XCircleIcon className="h-8 w-8 opacity-80" />
                            </div>
                        </div>
                    </div>
                </>
            )}  */}

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
                                                            {student.student_name} {student.student_surname}
                                                        </div>
                                                        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                                                            student.monthly_status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : student.monthly_status === 'finished'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : student.monthly_status === 'stopped'
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {student.monthly_status === 'active' ? 'Faol' :
                                                             student.monthly_status === 'finished' ? 'Bitirgan' :
                                                             student.monthly_status === 'stopped' ? "To'xtatgan" : student.monthly_status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                                                        <PhoneIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                                                        <a href={`tel:${student.student_phone}`} className="hover:underline truncate">
                                                            {student.student_phone}
                                                        </a>
                                                    </div>
                                                    {student.student_father_phone && (
                                                        <div className="flex items-center text-[10px] sm:text-xs text-gray-400 mt-1">
                                                            <PhoneIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">{student.student_father_phone} (ota)</span>
                                                        </div>
                                                    )}
                                                    {student.student_father_name && (
                                                        <div className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
                                                            Otasi: {student.student_father_name}
                                                        </div>
                                                    )}
                                                    {student.last_payment_date && (
                                                        <div className="text-[10px] sm:text-xs text-green-600 mt-1">
                                                            So'nggi to'lov: {student.last_payment_date}
                                                        </div>
                                                    )}
                                                    <div className="sm:hidden text-[10px] text-gray-500 mt-1 truncate">
                                                        {student.group_name} - {student.subject_name}
                                                    </div>
                                                    <div className="text-[10px] text-blue-600 mt-1">
                                                        Davomat: {student.attended_lessons}/{student.total_lessons} ({student.attendance_percentage}%)
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
                                                    <span className="font-medium ml-1 sm:ml-2">{formatCurrency(parseFloat(student.group_price || 0))}</span>
                                                </div>
                                                <div className="text-xs sm:text-sm">
                                                    <span className="text-gray-500">Kerak:</span>
                                                    <span className="font-medium ml-1 sm:ml-2">{formatCurrency(parseFloat(student.required_amount))}</span>
                                                </div>
                                                {parseFloat(student.effective_required) !== parseFloat(student.required_amount) && (
                                                    <div className="text-xs sm:text-sm">
                                                        <span className="text-gray-500">Amalda kerak:</span>
                                                        <span className="font-medium text-blue-600 ml-1 sm:ml-2">{formatCurrency(parseFloat(student.effective_required))}</span>
                                                    </div>
                                                )}
                                                <div className="text-xs sm:text-sm">
                                                    <span className="text-gray-500">To'langan:</span>
                                                    <span className="font-medium text-green-600 ml-1 sm:ml-2">{formatCurrency(parseFloat(student.paid_amount))}</span>
                                                </div>
                                                {parseFloat(student.discount_amount) > 0 && (
                                                    <div className="text-xs sm:text-sm relative">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-gray-500">Chegirma:</span>
                                                            <span className="font-medium text-orange-500 ml-1 sm:ml-2">-{formatCurrency(parseFloat(student.discount_amount))}</span>
                                                            {student.discount_type && (
                                                                <span className="text-[10px] text-gray-400">({student.discount_type === 'percent' ? `${student.discount_value}%` : 'miqdor'})</span>
                                                            )}
                                                            {/* Test uchun - har doim ko'rsatish */}
                                                            <div className="relative">
                                                                <InformationCircleIcon
                                                                    className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                                                                    onMouseEnter={() => setTooltipVisible(`${student.student_id}-${student.group_id}`)}
                                                                    onMouseLeave={() => setTooltipVisible(null)}
                                                                />
                                                                {tooltipVisible === `${student.student_id}-${student.group_id}` && (
                                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 z-50 shadow-lg">
                                                                        <div className="font-medium mb-1">Chegirma sababi:</div>
                                                                        <div>{student.discount_description || 'Izoh mavjud emas'}</div>
                                                                        {/* Triangle Arrow */}
                                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                                                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
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

"use client";
/* eslint-disable react/no-unescaped-entities */
import React, { useMemo, useState } from "react";
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PhoneIcon,
    MagnifyingGlassIcon,
    CurrencyDollarIcon,
    UsersIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useMonthlyPayments } from "../../../hooks/payments";

const MAIN_COLOR = "#A60E07";
const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const formatPhoneNumber = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    const normalized = digits.startsWith("998") ? digits.slice(3) : digits.startsWith("8") ? digits.slice(1) : digits;
    if (normalized.length !== 9) return value || "-";
    return `+998-${normalized.slice(0, 2)}-${normalized.slice(2, 5)}-${normalized.slice(5, 7)}-${normalized.slice(7, 9)}`;
};

const TeacherPaymentsInfo = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tooltipVisible, setTooltipVisible] = useState(null);
    const filters = useMemo(() => ({
        month: CURRENT_MONTH,
        payment_status: 'all'
    }), []);

    // Fetch payments using existing hook
    const { data: paymentsData, isLoading, error } = useMonthlyPayments(filters);

    const students = useMemo(() => paymentsData?.data?.students || [], [paymentsData]);
    const apiSummary = paymentsData?.data?.summary || {};

    // Filter students based on search term
    const filteredStudents = useMemo(() => {
        if (!searchTerm.trim()) {
            return students;
        }
        
        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        return students.filter(student => {
            const fullName = `${student.student_surname || ''} ${student.student_name || ''}`.toLowerCase();
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
        <div className="min-h-full px-1 sm:px-4 md:px-0">
            {/* Header */}
            {/* <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Talabalar to'lovlari
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    O'quvchilaringizning oylik to'lov ma'lumotlari
                </p>
            </div> */}

            {/* Search */}
            <div className="mb-3 sm:mb-6">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-4 sm:w-4" />
                    <input
                        type="text"
                        placeholder="Ism, telefon, guruh..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-8 pr-7 text-[11px] transition-colors focus:border-transparent focus:ring-2 sm:py-2 sm:pl-9 sm:pr-8 sm:text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 transition-colors hover:text-gray-600"
                        >
                            ✕
                        </button>
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
                <div className="border-b border-gray-200 px-3 py-2.5 sm:px-4 sm:py-4 md:px-5">
                    <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                        To'lov ma'lumotlari ({filteredStudents.length} ta)
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {filteredStudents.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 sm:px-4 md:px-5 lg:px-4 py-2 sm:py-3 lg:py-3 text-left text-[10px] sm:text-xs lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-5 lg:px-4 py-2 sm:py-3 lg:py-3 text-left text-[10px] sm:text-xs lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Talaba ma'lumotlari
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-5 lg:px-4 py-2 sm:py-3 lg:py-3 text-left text-[10px] sm:text-xs lg:text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Guruh / Fan
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-5 lg:px-4 py-2 sm:py-3 lg:py-3 text-left text-[10px] sm:text-xs lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        To'lov ma'lumotlari
                                    </th>
                                    <th className="px-2 sm:px-4 md:px-5 lg:px-4 py-2 sm:py-3 lg:py-3 text-left text-[10px] sm:text-xs lg:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Holati
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.map((student, index) => (
                                    <tr key={`${student.student_id}-${student.group_id}-${index}`} className="hover:bg-gray-50">
                                        <td className="px-2 sm:px-4 md:px-5 lg:px-4 py-2 sm:py-4 lg:py-3 whitespace-nowrap text-xs sm:text-sm lg:text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-5 lg:px-4 py-2 sm:py-4 lg:py-3">
                                            <div className="flex items-start space-x-2 sm:space-x-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                                        <div className="text-xs sm:text-sm lg:text-sm font-medium text-gray-900 truncate">
                                                            {student.student_surname} {student.student_name}
                                                        </div>
                                                        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs lg:text-xs font-medium ${
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
                                                    <div className="flex items-center text-xs sm:text-sm lg:text-xs text-gray-500 mt-1">
                                                        <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                                        <a href={`tel:${student.student_phone}`} className="hover:underline truncate">
                                                            {formatPhoneNumber(student.student_phone)}
                                                        </a>
                                                    </div>
                                                    {student.student_father_phone && (
                                                        <div className="flex items-center text-[10px] sm:text-xs lg:text-[11px] text-gray-400 mt-1">
                                                            <PhoneIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 mr-1 flex-shrink-0" />
                                                            <span className="truncate">{formatPhoneNumber(student.student_father_phone)} (ota)</span>
                                                        </div>
                                                    )}
                                                    {student.student_father_name && (
                                                        <div className="text-[10px] sm:text-xs lg:text-[11px] text-gray-400 mt-1 truncate">
                                                            Otasi: {student.student_father_name}
                                                        </div>
                                                    )}
                                                    {student.last_payment_date && (
                                                        <div className="text-[10px] sm:text-xs lg:text-[11px] text-green-600 mt-1">
                                                            So'nggi to'lov: {student.last_payment_date}
                                                        </div>
                                                    )}
                                                    <div className="sm:hidden text-[10px] text-gray-500 mt-1 truncate">
                                                        {student.group_name} - {student.subject_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-5 lg:px-4 py-2 sm:py-4 lg:py-3 hidden sm:table-cell">
                                            <div>
                                                <div className="text-xs sm:text-sm lg:text-sm font-medium text-gray-900 mb-1">
                                                    {student.group_name}
                                                </div>
                                                <div className="text-xs sm:text-sm lg:text-xs text-gray-500">
                                                    {student.subject_name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-5 lg:px-4 py-2 sm:py-4 lg:py-3 whitespace-nowrap">
                                            <div className="space-y-0.5 sm:space-y-1">
                                                <div className="text-xs sm:text-sm lg:text-xs">
                                                    <span className="text-gray-500">Asl narx:</span>
                                                    <span className="font-medium ml-1 sm:ml-2">{formatCurrency(parseFloat(student.group_price || 0))}</span>
                                                </div>
                                                {/* <div className="text-xs sm:text-sm">
                                                    <span className="text-gray-500">Kerak:</span>
                                                    <span className="font-medium ml-1 sm:ml-2">{formatCurrency(parseFloat(student.required_amount))}</span>
                                                </div> */}
                                                {parseFloat(student.effective_required) !== parseFloat(student.required_amount) && (
                                                    <div className="text-xs sm:text-sm lg:text-xs">
                                                        <span className="text-gray-500">Kerak:</span>
                                                        <span className="font-medium text-blue-600 ml-1 sm:ml-2">{formatCurrency(parseFloat(student.effective_required))}</span>
                                                    </div>
                                                )}
                                                <div className="text-xs sm:text-sm lg:text-xs">
                                                    <span className="text-gray-500">To'langan:</span>
                                                    <span className="font-medium text-green-600 ml-1 sm:ml-2">{formatCurrency(parseFloat(student.paid_amount))}</span>
                                                </div>
                                                {parseFloat(student.discount_amount) > 0 && (
                                                    <div className="text-xs sm:text-sm lg:text-xs relative">
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
                                                        <div className="text-xs sm:text-sm lg:text-xs">
                                                        <span className="text-gray-500">Qarz:</span>
                                                        <span className="font-medium text-red-600 ml-1 sm:ml-2">{formatCurrency(parseFloat(student.debt_amount))}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-4 md:px-5 lg:px-4 py-2 sm:py-4 lg:py-3 whitespace-nowrap">
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
                                    : "Hech qanday to'lov ma'lumoti yo'q"
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

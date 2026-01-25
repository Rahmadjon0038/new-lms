"use client";
import React, { useState } from "react";
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
    InformationCircleIcon
} from "@heroicons/react/24/outline";
import { usePaymentFilters, useMonthlyPayments } from "../../../hooks/payments";
import DiscountModal from "../../../components/admistrator/DiscountModal";
import PaymentModal from "../../../components/admistrator/PaymentModal";

const MAIN_COLOR = "#A60E07";

const StudentPayments = () => {
    const [filters, setFilters] = useState({
        month: new Date().toISOString().slice(0, 7), // Current month (YYYY-MM)
        teacher_id: '',
        subject_id: '',
        status: 'all'
    });

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);

    // Fetch filter options
    const { data: filterOptions } = usePaymentFilters();

    // Fetch monthly payments
    const { data: paymentsData, isLoading, error } = useMonthlyPayments(filters);

    const students = paymentsData?.data?.students || [];
    const apiStats = paymentsData?.data?.stats || {};

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
    };

    // Check if any filter is active
    const hasActiveFilters = filters.teacher_id || filters.subject_id || filters.status !== 'all';

    // Add "All" option to statuses
    const statusTabs = [
        { value: 'all', label: 'Barchasi' },
        ...statuses
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
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Talabalar oylik to'lovlari
                    </h1>
                    <p className="text-gray-600">
                        Talabalarning oylik to'lov ma'lumotlari va statistikasi
                    </p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Month Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <CalendarIcon className="h-4 w-4 inline mr-1" />
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
                                <UserIcon className="h-4 w-4 inline mr-1" />
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
                                <AcademicCapIcon className="h-4 w-4 inline mr-1" />
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: MAIN_COLOR }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Jami talabalar</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_students}</p>
                                </div>
                                <UserIcon className="h-8 w-8 text-gray-400" />
                            </div>
                        </div>

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
                        {students.length > 0 ? (
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
                                            Holati
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amallar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student, index) => (
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
                                                        <span className="font-medium text-green-600 ml-2">{formatCurrency(parseFloat(student.paid_amount))}</span>
                                                        {student.payment_descriptions && (
                                                            <div className="relative group ml-1 inline-block">
                                                                <InformationCircleIcon className="h-4 w-4 text-green-500 cursor-help" />
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap max-w-xs z-10">
                                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                                                    To'lov tarixi: {student.payment_descriptions}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {parseFloat(student.discount_amount) > 0 && (
                                                        <div className="text-sm flex items-center">
                                                            <span className="text-gray-500">Chegirma:</span>
                                                            <span className="font-medium text-orange-500 ml-2">{formatCurrency(parseFloat(student.discount_amount))}</span>
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
                                                    )}
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">{parseFloat(student.debt_amount) < 0 ? 'Ortiqcha:' : 'Qarz:'}</span>
                                                        <span className={`font-medium ml-2 ${parseFloat(student.debt_amount) < 0 ? 'text-blue-600' : 'text-red-600'
                                                            }`}>
                                                            {formatCurrency(Math.abs(parseFloat(student.debt_amount)))}
                                                        </span>
                                                    </div>
                                                    {student.last_payment_date && (
                                                        <div className="text-xs text-gray-400">
                                                            Oxirgi to'lov: {new Date(student.last_payment_date).toLocaleDateString('uz-UZ')}
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
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12">
                                <CurrencyDollarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Ma'lumotlar topilmadi</p>
                                <p className="text-gray-400 text-sm">
                                    Tanlangan filtrlar bo'yicha hech qanday to'lov ma'lumoti yo'q
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
                />

                <DiscountModal
                    isOpen={showDiscountModal}
                    onClose={() => {
                        setShowDiscountModal(false);
                        setSelectedStudent(null);
                    }}
                    student={selectedStudent}
                />

            </div>
        </div>
    );
};

export default StudentPayments
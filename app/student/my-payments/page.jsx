"use client";
import React, { useState } from "react";
import {
  BanknotesIcon,
  ClockIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ReceiptPercentIcon,
  TagIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useStudentMonthlyPayments, useStudentPaymentHistoryNew } from "../../../hooks/payments";

// --- Yordamchi Komponent: Status Belgisi ---
const StatusBadge = ({ status }) => {
  const statusStyles = {
    paid: { text: "To'liq to'langan", className: "text-green-700 bg-green-100", icon: CheckCircleIcon },
    partial: { text: "Qisman to'langan", className: "text-yellow-700 bg-yellow-100", icon: ClockIcon },
    unpaid: { text: "To'lanmagan", className: "text-red-700 bg-red-100", icon: XCircleIcon },
  };

  const style = statusStyles[status] || statusStyles.unpaid;
  const IconComponent = style.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${style.className}`}>
      <IconComponent className="h-3 w-3" />
      {style.text}
    </span>
  );
};

// Pul miqdorini formatlash
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Oy nomlarini formatlash
const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split('-');
  const monthNames = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

// Sana formatlash
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function StudentPayments() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedGroupForHistory, setSelectedGroupForHistory] = useState(null);
  const [showHistory, setShowHistory] = useState({});

  // API chaqiruvlari
  const { data: monthlyData, isLoading: monthlyLoading, error: monthlyError } = useStudentMonthlyPayments(selectedMonth);
  const { data: historyData, isLoading: historyLoading } = useStudentPaymentHistoryNew(selectedGroupForHistory, 10);

  const groups = monthlyData?.data?.groups || [];
  const summary = monthlyData?.data?.summary || {};
  const paymentHistory = historyData?.data?.payments || [];

  const toggleHistory = (groupId) => {
    setShowHistory(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
    if (!showHistory[groupId]) {
      setSelectedGroupForHistory(groupId);
    }
  };

  if (monthlyLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-pulse text-[#A60E07] text-xl font-bold">Yuklanmoqda...</div>
      </div>
    );
  }

  if (monthlyError) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">❌ Xatolik yuz berdi</div>
          <p className="text-gray-600">{monthlyError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <BanknotesIcon className="h-7 w-7 mr-3 text-[#A60E07]" />
            Mening To'lovlarim
          </h1>
          <p className="text-sm text-gray-500">Oylik to'lovlar va chegirmalar ma'lumoti</p>
        </div>
        
        {/* Month Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Oyni tanlang:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {summary.total_groups > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-5 border-t-4 border-blue-500">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jami Guruhlar</div>
            <div className="text-2xl font-extrabold text-blue-600">{summary.total_groups}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 border-t-4 border-orange-500">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kerak Bo'lgan</div>
            <div className="text-2xl font-extrabold text-orange-600">{formatCurrency(summary.total_required_amount || 0)}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 border-t-4 border-green-500">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">To'langan</div>
            <div className="text-2xl font-extrabold text-green-600">{formatCurrency(summary.total_paid_amount || 0)}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 border-t-4 border-red-500">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Qolgan</div>
            <div className="text-2xl font-extrabold text-red-600">{formatCurrency(summary.total_remaining_amount || 0)}</div>
          </div>
        </div>
      )}

      {/* Groups Payment Information */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <CalendarDaysIcon className="h-6 w-6 mr-3 text-[#A60E07]" />
            {formatMonth(selectedMonth)} - Guruhlar bo'yicha to'lovlar
          </h2>
        </div>

        {groups.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {groups.map((group) => (
              <div key={group.group_id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.group_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{group.subject_name}</p>
                    <p className="text-xs text-gray-500">O'qituvchi: {group.teacher_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={group.payment_status} />
                    <button
                      onClick={() => toggleHistory(group.group_id)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <EyeIcon className="h-3 w-3" />
                      To'lov tarixi
                      {showHistory[group.group_id] ? 
                        <ChevronUpIcon className="h-3 w-3" /> : 
                        <ChevronDownIcon className="h-3 w-3" />
                      }
                    </button>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Asl narx</p>
                    <p className="text-sm font-bold text-blue-700">{formatCurrency(parseFloat(group.original_price))}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium">Chegirma</p>
                    <p className="text-sm font-bold text-purple-700">-{formatCurrency(parseFloat(group.discount_amount))}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">To'langan</p>
                    <p className="text-sm font-bold text-green-700">{formatCurrency(parseFloat(group.paid_amount))}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-red-600 font-medium">Qolgan</p>
                    <p className="text-sm font-bold text-red-700">{formatCurrency(parseFloat(group.remaining_amount))}</p>
                  </div>
                </div>

                {/* Discount Description */}
                {group.discount_description && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-700 font-medium mb-1">Chegirma sababi:</p>
                    <p className="text-sm text-yellow-800">{group.discount_description}</p>
                  </div>
                )}

                {/* Last Payment Info */}
                {group.last_payment_date && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ClockIcon className="h-3 w-3" />
                    Oxirgi to'lov: {formatDate(group.last_payment_date)}
                  </div>
                )}

                {/* Payment History */}
                {showHistory[group.group_id] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {historyLoading ? (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <p className="text-xs text-gray-500 mt-2">To'lov tarixi yuklanmoqda...</p>
                      </div>
                    ) : paymentHistory.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">To'lov tarixi:</h4>
                        {paymentHistory.map((payment) => (
                          <div key={payment.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-900">{formatCurrency(parseFloat(payment.amount))}</span>
                              <span className="text-xs text-gray-500">{formatDate(payment.payment_date)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">{payment.payment_method}</span>
                              <span className="text-xs text-gray-600">Admin: {payment.received_by}</span>
                            </div>
                            {payment.description && (
                              <p className="text-xs text-gray-500 mt-1">{payment.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">Bu guruh uchun to'lov tarixi topilmadi</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <BanknotesIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">To'lovlar topilmadi</h3>
            <p className="text-sm text-gray-500">Bu oyda to'lov ma'lumotlari mavjud emas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentPayments;

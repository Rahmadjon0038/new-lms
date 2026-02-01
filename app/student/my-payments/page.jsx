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
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${style.className}`}>
      <IconComponent className="h-3 w-3" />
      <span className="hidden sm:inline">{style.text}</span>
      <span className="sm:hidden">
        {status === 'paid' ? 'To\'liq' : status === 'partial' ? 'Qisman' : 'Yo\'q'}
      </span>
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedGroupData, setSelectedGroupData] = useState(null);

  // API chaqiruvlari
  const { data: monthlyData, isLoading: monthlyLoading, error: monthlyError } = useStudentMonthlyPayments(selectedMonth);
  const { data: historyData, isLoading: historyLoading } = useStudentPaymentHistoryNew(
    { month: selectedMonth, groupId: selectedGroupForHistory, limit: 20 },
    { enabled: !!selectedGroupForHistory }
  );

  const groups = monthlyData?.data?.groups || [];
  const summary = monthlyData?.data?.summary || {};
  const paymentHistory = historyData?.data?.payments || [];

  const openHistoryModal = (group) => {
    setSelectedGroupData(group);
    setSelectedGroupForHistory(group.group_id);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedGroupData(null);
    setSelectedGroupForHistory(null);
  };

  if (monthlyLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="animate-pulse text-[#A60E07] text-base sm:text-lg md:text-xl font-bold">Yuklanmoqda...</div>
      </div>
    );
  }

  if (monthlyError) {
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-lg sm:text-xl font-bold mb-2">❌ Xatolik yuz berdi</div>
          <p className="text-gray-600 text-sm sm:text-base">{monthlyError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center">
            <BanknotesIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 mr-2 sm:mr-3 text-[#A60E07]" />
            Mening To'lovlarim
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">Oylik to'lovlar va chegirmalar ma'lumoti</p>
        </div>
        
        {/* Month Selector */}
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1">Oyni tanlang:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {summary.total_groups > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 border-t-4 border-blue-500">
            <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jami Guruhlar</div>
            <div className="text-xl sm:text-2xl font-extrabold text-blue-600">{summary.total_groups}</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 border-t-4 border-orange-500">
            <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">To'lanishi kerak bo'lgan summa</div>
            <div className="text-sm sm:text-lg md:text-2xl font-extrabold text-orange-600 truncate">{formatCurrency(summary.total_required_amount || 0)}</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 border-t-4 border-green-500">
            <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">To'langan</div>
            <div className="text-sm sm:text-lg md:text-2xl font-extrabold text-green-600 truncate">{formatCurrency(summary.total_paid_amount || 0)}</div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 border-t-4 border-red-500">
            <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Qarzdorlik</div>
            <div className="text-sm sm:text-lg md:text-2xl font-extrabold text-red-600 truncate">{formatCurrency(summary.total_remaining_amount || 0)}</div>
          </div>
        </div>
      )}

      {/* Groups Payment Information */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-[#A60E07]" />
            <span className="truncate">{formatMonth(selectedMonth)} - Guruhlar bo'yicha to'lovlar</span>
          </h2>
        </div>

        {groups.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {groups.map((group) => (
              <div key={group.group_id} className="p-3 sm:p-4 md:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{group.group_name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{group.subject_name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">O'qituvchi: {group.teacher_name}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <StatusBadge status={group.payment_status} />
                    <button
                      onClick={() => openHistoryModal(group)}
                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors flex-shrink-0"
                    >
                      <EyeIcon className="h-3 w-3" />
                      <span className="hidden sm:inline">To'lov tarixi</span>
                      <span className="sm:hidden">Tarixi</span>
                    </button>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-blue-600 font-medium">Asl narx</p>
                    <p className="text-xs sm:text-sm font-bold text-blue-700 truncate">{formatCurrency(parseFloat(group.original_price))}</p>
                  </div>
                  <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-purple-600 font-medium">Chegirma</p>
                    <p className="text-xs sm:text-sm font-bold text-purple-700 truncate">-{formatCurrency(parseFloat(group.discount_amount))}</p>
                  </div>
                  <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-green-600 font-medium">To'langan</p>
                    <p className="text-xs sm:text-sm font-bold text-green-700 truncate">{formatCurrency(parseFloat(group.paid_amount))}</p>
                  </div>
                  <div className="bg-red-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-red-600 font-medium">Qolgan</p>
                    <p className="text-xs sm:text-sm font-bold text-red-700 truncate">{formatCurrency(parseFloat(group.remaining_amount))}</p>
                  </div>
                </div>

                {/* Discount Description */}
                {group.discount_description && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                    <p className="text-[10px] sm:text-xs text-yellow-700 font-medium mb-1">Chegirma sababi:</p>
                    <p className="text-xs sm:text-sm text-yellow-800">{group.discount_description}</p>
                  </div>
                )}

                {/* Last Payment Info
                {group.last_payment_date && (
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
                    <ClockIcon className="h-3 w-3 flex-shrink-0" />
                    Oxirgi to'lov: {formatDate(group.last_payment_date)}
                  </div>
                )} */}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center">
            <BanknotesIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">To'lovlar topilmadi</h3>
            <p className="text-xs sm:text-sm text-gray-500">Bu oyda to'lov ma'lumotlari mavjud emas.</p>
          </div>
        )}
      </div>

      {/* Payment History Modal */}
      {showHistoryModal && selectedGroupData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BanknotesIcon className="h-5 w-5 text-[#A60E07]" />
                    To'lov tarixi - {formatMonth(selectedMonth)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedGroupData.group_name} • {selectedGroupData.subject_name}
                  </p>
                </div>
                <button
                  onClick={closeHistoryModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content - Table */}
            <div className="overflow-y-auto max-h-[calc(85vh-160px)]">
              {historyLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#A60E07]"></div>
                  <p className="text-gray-600 mt-3 text-sm">Yuklanmoqda...</p>
                </div>
              ) : paymentHistory && paymentHistory.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
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
                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{formatDate(payment.payment_date)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <BanknotesIcon className="h-4 w-4 text-[#A60E07]" />
                              <span className="text-sm font-semibold text-[#A60E07]">
                                {formatCurrency(parseFloat(payment.amount))}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700">{payment.received_by}</span>
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
                  <BanknotesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-base font-medium mb-2">
                    To'lov tarixi topilmadi
                  </p>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    {formatMonth(selectedMonth)} oyida bu guruh uchun hech qanday to'lov amalga oshirilmagan
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">Jami:</span>
                    <span className="ml-2 font-bold text-blue-600">
                      {paymentHistory.length} ta
                    </span>
                  </div>
                  {paymentHistory.length > 0 && (
                    <div className="text-gray-600">
                      <span className="font-bold text-green-600">
                        {formatCurrency(paymentHistory.reduce((sum, payment) => sum + parseFloat(payment.amount), 0))}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={closeHistoryModal}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors bg-[#A60E07]"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPayments;

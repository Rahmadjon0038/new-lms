"use client";
import React from "react";
import {
  BanknotesIcon,
  ClockIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
import { useStudentPaymentHistory } from "../../../hooks/payments";
import { usegetProfile } from "../../../hooks/user";

// --- Yordamchi Komponent: Status Belgisi ---
const StatusBadge = ({ status }) => {
  const statusStyles = {
    paid: { text: "To'langan", className: "text-green-700 bg-green-100" },
    partial: { text: "Qisman", className: "text-yellow-700 bg-yellow-100" },
    unpaid: { text: "To'lanmagan", className: "text-red-700 bg-red-100" },
  };

  const style = statusStyles[status] || statusStyles.unpaid;

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${style.className}`}>
      {style.text}
    </span>
  );
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

function StudentPayments() {
  // Profildan student_id olish
  const { data: profileData, isLoading: profileLoading } = usegetProfile();
  const studentId = profileData?.id;

  // To'lov tarixini olish
  const { data: paymentData, isLoading, error } = useStudentPaymentHistory(studentId);

  const payments = paymentData?.data?.payments || [];
  const transactions = paymentData?.data?.transactions || [];
  const student = paymentData?.data?.student || {};

  // Jami to'langan summani hisoblash
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.paid_amount || 0), 0);
  const totalRequired = payments.reduce((sum, p) => sum + parseFloat(p.required_amount || 0), 0);
  const totalDiscount = payments.reduce((sum, p) => sum + parseFloat(p.discount_amount || 0), 0);

  if (profileLoading || isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-pulse text-[#A60E07] text-xl font-bold">Yuklanmoqda...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">❌ Xatolik yuz berdi</div>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <BanknotesIcon className="h-7 w-7 mr-3 text-[#A60E07]" />
          Mening To'lovlarim
        </h1>
        <p className="text-sm text-gray-500">Oylik to'lovlar tarixi</p>
      </div>

      {/* Statistika kartochkalari */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-5 border-t-4 border-green-500">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jami To'langan</div>
          <div className="text-2xl font-extrabold text-green-600">{totalPaid.toLocaleString()} so'm</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-5 border-t-4 border-blue-500">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jami qarzdorlik</div>
          <div className="text-2xl font-extrabold text-blue-600">{totalRequired.toLocaleString()} so'm</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-5 border-t-4 border-purple-500">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chegirma</div>
          <div className="text-2xl font-extrabold text-purple-600">{totalDiscount.toLocaleString()} so'm</div>
        </div>
      </div>

      {/* Oylik To'lovlar Jadvali */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <CalendarDaysIcon className="h-6 w-6 mr-3 text-[#A60E07]" />
            Oylik To'lovlar
          </h2>
        </div>

        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Oy
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Guruh / Fan
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Kerak
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    To'langan
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Chegirma
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Holat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment, index) => (
                  <tr key={index} className="hover:bg-red-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-800">
                        {formatMonth(payment.month)}
                      </div>
                      {payment.last_payment_date && (
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {payment.last_payment_date}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-blue-700">{payment.group_name}</div>
                      <div className="text-xs text-gray-500">{payment.subject_name}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-800">
                      {parseFloat(payment.required_amount).toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-green-600">
                      {parseFloat(payment.paid_amount).toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-purple-600">
                      {parseFloat(payment.discount_amount).toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <BanknotesIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">To'lovlar topilmadi</h3>
            <p className="text-sm text-gray-500">Hozircha to'lovlar tarixi mavjud emas.</p>
          </div>
        )}
      </div>

      {/* Tranzaksiyalar Jadvali */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <ReceiptPercentIcon className="h-6 w-6 mr-3 text-[#A60E07]" />
              Tranzaksiyalar Tarixi
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Sana
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Oy
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Summa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    To'lov usuli
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Admin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Izoh
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx, index) => (
                  <tr key={index} className="hover:bg-green-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm font-bold text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tx.created_at}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {formatMonth(tx.month)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-green-600">
                      +{parseFloat(tx.amount).toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tx.payment_method === 'Naqd' ? 'bg-green-100 text-green-700' :
                        tx.payment_method === 'Karta' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tx.admin_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                      {tx.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPayments;

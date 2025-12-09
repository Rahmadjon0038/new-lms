import React from "react";
import {
  BanknotesIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

// --- Mock Data (Talabaning To'lov Ma'lumotlari) ---
// Ma'lumotlar eng yangidan eng eskisiga qarab saralangan deb faraz qilamiz
const mockPaymentData = {
  totalAmountPaid: 1900000,
  totalDuration: "4 ta oy",
  currency: "so'm",

  payments: [
    // Web Dasturlash (Eng yangi to'lov)
    {
      id: 1,
      month: "December 2024",
      amount: 500000,
      paymentDate: "2024-12-01",
      confirmedBy: "Shahzod (Manager)",
      subject: "Web Dasturlash (Fullstack)",
      status: "To'landi",
    },
    // Web Dasturlash (Oldingi to'lov)
    {
      id: 2,
      month: "November 2024",
      amount: 500000,
      paymentDate: "2024-11-01",
      confirmedBy: "Shahzod (Manager)",
      subject: "Web Dasturlash (Fullstack)",
      status: "To'landi",
    },
    // Matematika Asosiy (Eng yangi to'lov)
    {
      id: 3,
      month: "October 2024",
      amount: 450000,
      paymentDate: "2024-10-01",
      confirmedBy: "Alisher (Manager)",
      subject: "Matematika Asosiy",
      status: "qarz",
    },
    // Matematika Asosiy (Oldingi to'lov)
    {
      id: 4,
      month: "September 2024",
      amount: 450000,
      paymentDate: "2024-09-01",
      confirmedBy: "Alisher (Manager)",
      subject: "Matematika Asosiy",
      status: "To'landi",
    },
    // Yangi fan qo'shildi (Faqat bitta to'lov)
    {
      id: 5,
      month: "August 2024",
      amount: 300000,
      paymentDate: "2024-08-01",
      confirmedBy: "Dilshod (Manager)",
      subject: "Ingliz Tili",
      status: "To'landi",
    },
  ],
};

// --- Yordamchi Komponent: Status Belgisi ---
const StatusBadge = ({ status }) => {
  const color =
    status === "To'landi"
      ? "text-green-700 bg-green-100"
      : "text-gray-700 bg-red-300";

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
      {status}
    </span>
  );
};

// --- Funksiya: Har bir fan uchun eng yangi to'lovni aniqlash ---
const findLatestPaymentsBySubject = (payments) => {
  const latestBySubject = new Set();
  const seenSubjects = new Set();

  // payments saralangan (eng yangidan eng eskisiga) deb faraz qilib, iteratsiya qilamiz
  payments.forEach((payment) => {
    if (!seenSubjects.has(payment.subject)) {
      latestBySubject.add(payment.id); // Fan bo'yicha birinchi topilgan (eng yangi) IDni saqlaymiz
      seenSubjects.add(payment.subject);
    }
  });

  return latestBySubject;
};

function StudentPayments() {
  const { totalAmountPaid, totalDuration, currency, payments } =
    mockPaymentData;
  // Har bir fan uchun eng yangi to'lov ID'lari to'plamini topish
  const latestPaymentIds = findLatestPaymentsBySubject(payments);

  return (
    <div className="min-h-full">
      {/* 1. Sarlavha Qismi */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Mening To'lovlarim
      </h1>
      <p className="text-gray-500 mb-8">Oylik to'lovlar tarixi</p>

      {/* 2. Umumiy To'lov Bloki */}
      <div className="flex items-center bg-white p-6 rounded-xl shadow-lg border  mb-10 border-l-4 border-blue-600">
        <div className="mr-6">
          <BanknotesIcon className="h-10 w-10 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">
            Jami To'langan Summa
          </p>
          <span className="text-3xl font-extrabold text-gray-900 block">
            {totalAmountPaid.toLocaleString()} {currency}
          </span>
          <p className="text-sm text-gray-500 mt-1">Davr: {totalDuration}</p>
        </div>
      </div>

      {/* 3. Oylik To'lovlar Jadvali */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-800 p-6 border-b border-gray-100">
          To'lovlar Tarixi
        </h2>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Oy
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fan / Guruh
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tasdiqlovchi
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Summa
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Holat
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {payments.map((payment) => {
              // Har bir fan bo'yicha eng yangi to'lovligini tekshirish
              const isLatestForSubject = latestPaymentIds.has(payment.id);

              // Eng yangi to'lov uchun maxsus stil
              const rowClass = isLatestForSubject
                ? "bg-blue-50/50 hover:bg-blue-100/70 border-l-4 border-blue-500 transition duration-150"
                : "hover:bg-gray-50 transition duration-100";

              return (
                <tr key={payment.id} className={rowClass}>
                  {/* Oy va Sana */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.month}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-0.5">
                      <ClockIcon className="h-3 w-3 mr-1 text-gray-400" />
                      {payment.paymentDate}
                    </div>
                  </td>

                  {/* Fan / Guruh (Ko'k rangda ajratildi) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-semibold">
                    {payment.subject}
                  </td>

                  {/* Tasdiqlovchi */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {payment.confirmedBy}
                  </td>

                  {/* Summa */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-base font-bold text-green-600">
                    {payment.amount.toLocaleString()} {currency}
                  </td>

                  {/* Holat */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge status={payment.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Jadval bo'sh bo'lsa */}
        {payments.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            Hozircha to'lovlar tarixi mavjud emas.
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentPayments;

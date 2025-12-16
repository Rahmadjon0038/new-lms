"use client";
import React, { useState, useMemo } from "react";
import {
  UsersIcon,
  BookOpenIcon,
  UserGroupIcon,
  PlusIcon,
  PhoneIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon, 
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// --- Yagona Mock Data Strukturasi ---
// Iltimos, real ilovada bu ma'lumotlar API orqali kelishi kerak.
const UNIFIED_STUDENTS_DATA = [
    { id: 1001, name: "Alijon", surname: "Murodov", group: null, subject: "Web Dasturlash", teacher: null, status: "Qo'shilmagan", paymentAmount: 0, requiredAmount: 1000, registrationDate: "2025-12-10", phone: "+998 90 123 45 67" },
    { id: 1003, name: "Rustam", surname: "Tursunov", group: null, subject: "Python AI", teacher: null, status: "Qo'shilmagan", paymentAmount: 0, requiredAmount: 1000, registrationDate: "2025-12-10", phone: "+998 99 555 11 22" },
    { id: 1004, name: "Lola", surname: "Saidova", group: null, subject: "Ingliz Tili (B1)", teacher: null, status: "Qo'shilmagan", paymentAmount: 0, requiredAmount: 800, registrationDate: "2025-12-05", phone: "+998 90 111 22 33" },
    { id: 1002, name: "Feruza", surname: "Sobirova", group: "Grafika B1", subject: "Grafik Dizayn", teacher: "Shoxrux Tursunov", status: "O'qiyapti", paymentAmount: 1000, requiredAmount: 1000, registrationDate: "2025-12-10", phone: "+998 91 987 65 43" },
    { id: 1007, name: "Diyora", surname: "Valiyeva", group: "SMM Master", subject: "SMM", teacher: "Shoxrux Tursunov", status: "O'qiyapti", paymentAmount: 800, requiredAmount: 1000, registrationDate: "2025-12-09", phone: "+998 97 123 45 67" },
    { id: 1005, name: "Sherzod", surname: "Nazarov", group: "Matematika K2", subject: "Matematika", teacher: "Umid Karimov", status: "O'qiyapti", paymentAmount: 1000, requiredAmount: 1000, registrationDate: "2025-12-04", phone: "+998 94 444 55 66" },
    { id: 1006, name: "Zuhra", surname: "Rustamova", group: "Web Pro B1", subject: "Web Dasturlash", teacher: "Jasur Raximov", status: "O'qiyapti", paymentAmount: 700, requiredAmount: 1000, registrationDate: "2025-11-01", phone: "+998 93 777 88 99" },
];

// --- Guruhga Qo'shish uchun Mock Ma'lumotlar ---
// Haqiqiy tizimda bular AJAX so'rovlari orqali olinadi
const MOCK_GROUP_INFO = {
    "Web Dasturlash": { groupName: "Web Pro 201", teacherName: "Jasur Raximov" },
    "Python AI": { groupName: "Python 302", teacherName: "Shahnoza Qodirova" },
    "Ingliz Tili (B1)": { groupName: "English B1 N1", teacherName: "Raxmadjon Abdullaev" },
    // Boshqa fanlar uchun default
    default: { groupName: "Yangi Guruh", teacherName: "Noma'lum O'qituvchi" },
};


// --- Ma'lumotlarni Filtrlash Mantig'i ---
const getFilteredStudents = (students, period) => {
  // Mock 'bugungi kun'
  const today = new Date("2025-12-10"); 
  today.setHours(0, 0, 0, 0);

  return students.filter((student) => {
    // Sanani tekshirishda xatolik bo'lmasligi uchun tekshiruv
    if (!student.registrationDate) return false;
    
    const studentDate = new Date(student.registrationDate); 
    studentDate.setHours(0, 0, 0, 0);

    if (period === "today") return studentDate.getTime() === today.getTime();
    if (period === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return studentDate.getTime() === yesterday.getTime();
    }
    if (period === "last7days") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      return studentDate.getTime() >= sevenDaysAgo.getTime();
    }
    if (period === "last30days") {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return studentDate.getTime() >= thirtyDaysAgo.getTime();
    }
    return true; // "all" ga to'g'ri keladi, lekin "all" yo'q. Faqat davrlar bo'yicha
  });
};

// --- Yordamchi Komponent: StatCard ---
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-lg border-b-4 border-${color}-500`}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <Icon className="h-6 w-6 text-gray-400" />
    </div>
    <p className="text-4xl font-extrabold text-gray-900 mt-2">{value}</p>
  </div>
);

// --- Student Enrollment Table Komponenti ---
const StudentEnrollmentTable = ({ students, onDelete, onEnroll }) => {

  if (students.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>Tanlangan davr uchun ro'yxatdan o'tgan talabalar mavjud emas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[25%]">
              Ism & Familiya / Telefon
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Fan
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              O'qituvchi / Guruh
            </th>
             <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Ro'yxatdan sana
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-[100px]">
              Status
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-[120px]">
              Amallar
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {students.map((student, index) => {
            const isEnrolled = student.status === "O'qiyapti";
            
            // Jadval qatori (Tr)
            return (
              <tr 
                key={student.id} 
                className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
              >
                {/* 1. Ism & Familiya / Telefon */}
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="font-bold text-gray-900">
                    {student.name} {student.surname}
                  </div>
                  <span className="flex items-center text-xs text-gray-500 mt-0.5">
                    <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {student.phone}
                  </span>
                </td>

                {/* 2. Fan */}
                <td className="px-3 py-3 whitespace-nowrap">
                  <p className="text-sm text-blue-600 font-medium">
                    {student.subject}
                  </p>
                </td>

                {/* 3. O'qituvchi / Guruh */}
                <td className="px-3 py-3 whitespace-nowrap">
                  {isEnrolled && student.group ? (
                    <>
                        <p className="text-sm text-gray-900 font-medium">
                        {student.teacher}
                        </p>
                        <div className="text-xs text-gray-500">Guruh: {student.group}</div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Guruhlanmagan</p>
                  )}
                </td>
                
                {/* 4. Ro'yxatdan sana */}
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600">
                    {student.registrationDate}
                </td>

                {/* 5. Status */}
                <td className="px-3 py-3 whitespace-nowrap text-center">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            isEnrolled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {isEnrolled ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                        {student.status}
                    </span>
                </td>

                {/* 6. Amallar (YANGILANGAN QISM) */}
                <td className="px-3 py-3 whitespace-nowrap text-center">
                  <div className="flex justify-center items-center gap-2">
                    
                    {/* Guruhga qo'shish (FAQQAT QO'SHILMAGAN BO'LSA) */}
                    {!isEnrolled && (
                      <button
                        onClick={() => onEnroll(student)} // Yangi funksiyani chaqirish
                        className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition duration-200"
                        title="Guruhga qo'shish va statusni o'zgartirish"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    )}

                    {/* Batafsil ma'lumot */}
                    <Link
                          href={`/admin/students/${student.id}`}
                          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition duration-200"
                          title="Batafsil ma'lumot"
                        >
                          <InformationCircleIcon className="h-5 w-5" />
                    </Link>

                    {/* O'chirish (DELETE) tugmasi */}
                    <button
                        onClick={() => onDelete(student.id)}
                        className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition duration-200"
                        title="Talabani ro'yxatdan o'chirish"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                    
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- Asosiy Komponent ---
function AdminDashboard() {
  const [students, setStudents] = useState(UNIFIED_STUDENTS_DATA);
  const [enrollmentPeriod, setEnrollmentPeriod] = useState("today");

  // --- Yangi Talabani Guruhga Qo'shish Mantig'i ---
  const handleEnrollStudent = (studentToEnroll) => {
    // 1. Guruh ma'lumotlarini mock qilish (real holatda bu API'dan keladi)
    const mockGroup = MOCK_GROUP_INFO[studentToEnroll.subject] || MOCK_GROUP_INFO.default;
    
    // 2. Haqiqiy to'lov tizimida bu yerda to'lov tekshiriladi va kerakli summa kiritiladi
    const updatedPayment = studentToEnroll.requiredAmount; // To'lov qilindi deb faraz qilamiz

    if (window.confirm(`${studentToEnroll.name} ni "${mockGroup.groupName}" guruhiga qo'shishga va statusini "O'qiyapti" ga o'zgartirishga ishonchingiz komilmi?`)) {
        
        setStudents(prevStudents => 
            prevStudents.map(s => 
                s.id === studentToEnroll.id 
                    ? { 
                        ...s, 
                        group: mockGroup.groupName,
                        teacher: mockGroup.teacherName,
                        status: "O'qiyapti",
                        paymentAmount: updatedPayment,
                    } 
                    : s
            )
        );
        alert(`${studentToEnroll.name} muvaffaqiyatli guruhga qo'shildi!`);
    }
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm(`ID ${id} bo'lgan talabani ro'yxatdan o'chirishga ishonchingiz komilmi?`)) {
        setStudents(prevStudents => prevStudents.filter(s => s.id !== id));
    }
  };

  const filteredStudents = useMemo(() => {
    return getFilteredStudents(students, enrollmentPeriod);
  }, [enrollmentPeriod, students]);
  
  // STATISTIKA hisoblash
  const totalStudents = students.length;
  const todayEnrollmentCount = getFilteredStudents(students, "today").length;
  const generalStats = {
      totalGroups: 15,
      totalTeachers: 8,
  };

  const periodOptions = [
    { value: "today", name: `Bugun (${getFilteredStudents(students, "today").length} ta)` },
    { value: "yesterday", name: `Kecha (${getFilteredStudents(students, "yesterday").length} ta)` },
    { value: "last7days", name: `So'nggi 7 kun (${getFilteredStudents(students, "last7days").length} ta)` },
    { value: "last30days", name: `So'nggi 30 kun (${getFilteredStudents(students, "last30days").length} ta)` },
  ];

  return (
    <div className="min-h-full p-8 bg-gray-50">
      {/* 1. Sarlavha Qismi */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Administrator Boshqaruv Paneli
      </h1>
      <p className="text-lg text-gray-500 mb-8">
        Markazning umumiy ko'rsatkichlari va qabul ro'yxati
      </p>

      {/* 2. UMUMIY MARKAZ STATISTIKASI (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Jami Talabalar"
          value={totalStudents}
          icon={UsersIcon}
          color="green"
        />
        <StatCard
          title="Jami Guruhlar"
          value={generalStats.totalGroups}
          icon={BookOpenIcon}
          color="blue"
        />
        <StatCard
          title="Jami O'qituvchilar"
          value={generalStats.totalTeachers}
          icon={UserGroupIcon}
          color="yellow"
        />
        <StatCard
          title="Bugun Qabul"
          value={todayEnrollmentCount}
          icon={UsersIcon}
          color="red"
        />
      </div>

      {/* 3. QABUL RO'YXATI VA SELECT FILTER */}
      <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Ro'yxatdan O'tgan Talabalar
          </h2>
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
            <select
              value={enrollmentPeriod}
              onChange={(e) => setEnrollmentPeriod(e.target.value)}
              className="block border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm font-medium text-gray-800 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <StudentEnrollmentTable 
            students={filteredStudents} 
            onDelete={handleDeleteStudent} 
            onEnroll={handleEnrollStudent} // Guruhga qo'shish funksiyasi
        />
      </div>
    </div>
  );
}

function page() {
  return <AdminDashboard />;
}

export default page;
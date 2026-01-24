"use client";
import React, { useState } from "react";
import {
  ArrowLeftIcon,
  CalendarIcon,
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as DelayIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useGetMonthlyAttendance,
  useCreateTodayLesson,
} from "../../../../hooks/attendance";
import { toast } from "react-hot-toast";

// Oylik davomat jadvali komponenti
const MonthlyAttendanceTable = ({ groupId, selectedMonth }) => {
  const { data: monthlyData, isLoading } = useGetMonthlyAttendance(
    groupId,
    selectedMonth
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const group = monthlyData?.data?.group;
  const lessons = monthlyData?.data?.lessons || [];
  const students = monthlyData?.data?.students || [];

  if (lessons.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-md text-center">
        <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">
          Bu oyda dars kunlari topilmadi
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Bugungi darsni yaratish uchun yuqoridagi tugmani bosing
        </p>
      </div>
    );
  }

  // Davomat statusini formatlash
  const getStatusIcon = (status) => {
    if (status === "keldi" || status === "present") {
      return <CheckCircleIcon className="h-5 w-5 text-white" />;
    } else if (status === "kechikdi" || status === "late") {
      return <DelayIcon className="h-5 w-5 text-white" />;
    } else if (status === "kelmadi" || status === "absent") {
      return <XCircleIcon className="h-5 w-5 text-white" />;
    }
    return null;
  };

  const getStatusColor = (status) => {
    if (status === "keldi" || status === "present") {
      return "bg-green-500 border-green-600";
    } else if (status === "kechikdi" || status === "late") {
      return "bg-yellow-500 border-yellow-600";
    } else if (status === "kelmadi" || status === "absent") {
      return "bg-red-500 border-red-600";
    }
    return "bg-gray-100 border-gray-300";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold mb-2">Oylik Davomat Jadvali</h3>
            <p className="text-blue-100 text-sm">
              {group?.name || "Guruh"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{students.length}</div>
            <div className="text-blue-100 text-sm">Talabalar</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="sticky left-0 bg-gray-100 z-20 px-6 py-4 text-left text-sm font-semibold text-gray-700 min-w-[250px] border-r border-gray-300">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-gray-500" />
                  Talaba
                </div>
              </th>
              {lessons.map((lesson) => {
                const date = new Date(lesson.date);
                return (
                  <th
                    key={lesson.id}
                    className="px-3 py-4 text-center min-w-[100px] border-r border-gray-200"
                  >
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      {date.toLocaleDateString("uz-UZ", { weekday: "short" })}
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {date.getDate()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {date.toLocaleDateString("uz-UZ", {
                        month: "short",
                      })}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student, index) => (
              <tr
                key={student.student_id}
                className={`hover:bg-gray-50 transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-25"
                }`}
              >
                <td className="sticky left-0 bg-inherit px-6 py-4 z-10 border-r border-gray-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {student.name?.charAt(0)}
                      {student.surname?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">
                        {student.name} {student.surname}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.phone}
                      </div>
                    </div>
                  </div>
                </td>
                {lessons.map((lesson) => {
                  const status = student.attendance?.[lesson.date];

                  return (
                    <td
                      key={lesson.id}
                      className="px-3 py-4 text-center border-r border-gray-200"
                    >
                      <Link
                        href={`/teacher/attendance/${groupId}/lesson/${lesson.id}`}
                        className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center mx-auto hover:scale-110 ${getStatusColor(
                          status
                        )}`}
                        title={`${lesson.date} - ${status || "Belgilanmagan"}`}
                      >
                        {getStatusIcon(status)}
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Talabalar topilmadi</p>
        </div>
      )}
    </div>
  );
};

// Asosiy komponent
const TeacherGroupAttendance = () => {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id;

  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const getMonthOptions = () => {
    const months = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const value = `${year}-${month}`;

      const monthNames = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
      ];
      const label = `${monthNames[date.getMonth()]} ${year}`;

      months.push({ value, label });
    }

    return months;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const { data: monthlyData, isLoading, error } = useGetMonthlyAttendance(
    groupId,
    selectedMonth
  );
  const createTodayLessonMutation = useCreateTodayLesson();

  const group = monthlyData?.data?.group;

  const handleCreateTodayLesson = () => {
    createTodayLessonMutation.mutate(groupId, {
      onSuccess: (data) => {
        toast.success(data.message || "Bugungi dars muvaffaqiyatli yaratildi");
        
        if (data.lesson_id) {
          router.push(`/teacher/attendance/${groupId}/lesson/${data.lesson_id}`);
        }
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Dars yaratishda xatolik yuz berdi"
        );
      },
    });
  };

  const scheduleDisplay = group?.schedule
    ? `${group.schedule.days?.join(", ")} - ${group.schedule.time}`
    : "Jadval belgilanmagan";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        <Link
          href="/teacher/attendance"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Orqaga
        </Link>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Yuklanmoqda...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Xatolik yuz berdi: {error.message}
          </div>
        )}

        {!isLoading && !error && group && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {group.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <AcademicCapIcon className="h-4 w-4" />
                      <span>{group.subject_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>{scheduleDisplay}</span>
                    </div>
                  </div>
                </div>

                <div className="min-w-[200px]">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {getMonthOptions().map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Bugungi darsni yaratish</p>
                  <p className="text-xs text-gray-500">
                    Dars yaratilgandan so'ng talabalar uchun davomat belgilash mumkin bo'ladi
                  </p>
                </div>
                <button
                  onClick={handleCreateTodayLesson}
                  disabled={createTodayLessonMutation.isPending}
                  className="px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <CalendarIcon className="h-5 w-5" />
                  {createTodayLessonMutation.isPending
                    ? "Yaratilmoqda..."
                    : "Bugungi Darsni Yaratish"}
                </button>
              </div>
            </div>

            <MonthlyAttendanceTable
              groupId={groupId}
              selectedMonth={selectedMonth}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherGroupAttendance;

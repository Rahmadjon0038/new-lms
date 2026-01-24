"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useGetLessonStudents,
  useSaveAttendance,
} from "../../../../../../hooks/attendance";
import { toast } from "react-hot-toast";

const TeacherLessonAttendance = () => {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id;
  const lessonId = params.lesson_id;

  const [attendanceData, setAttendanceData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: lessonData, isLoading, error } = useGetLessonStudents(lessonId);
  const saveAttendanceMutation = useSaveAttendance();

  const lesson = lessonData?.lesson;
  const students = lessonData?.students || [];

  useEffect(() => {
    if (students.length > 0 && Object.keys(attendanceData).length === 0) {
      const initialAttendance = {};
      students.forEach((student) => {
        initialAttendance[student.student_id] = student.status || "kelmadi";
      });
      setAttendanceData(initialAttendance);
    }
  }, [students]);

  const toggleStatus = (studentId) => {
    setAttendanceData((prev) => {
      const currentStatus = prev[studentId] || "kelmadi";
      let newStatus;

      if (currentStatus === "kelmadi") {
        newStatus = "keldi";
      } else if (currentStatus === "keldi") {
        newStatus = "kechikdi";
      } else {
        newStatus = "kelmadi";
      }

      setHasChanges(true);
      return { ...prev, [studentId]: newStatus };
    });
  };

  const markAllAs = (status) => {
    const newAttendance = {};
    students.forEach((student) => {
      newAttendance[student.student_id] = status;
    });
    setAttendanceData(newAttendance);
    setHasChanges(true);
  };

  const handleSave = () => {
    const attendance_array = students.map((student) => ({
      student_id: student.student_id,
      status: attendanceData[student.student_id] || "kelmadi",
    }));

    saveAttendanceMutation.mutate(
      {
        lesson_id: parseInt(lessonId),
        attendance_data: attendance_array,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Davomat muvaffaqiyatli saqlandi");
          setHasChanges(false);
          
          setTimeout(() => {
            router.push(`/teacher/attendance/${groupId}`);
          }, 1000);
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Davomatni saqlashda xatolik yuz berdi"
          );
        },
      }
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "keldi":
        return "bg-green-500 hover:bg-green-600 text-white border-green-600";
      case "kechikdi":
        return "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600";
      case "kelmadi":
        return "bg-red-500 hover:bg-red-600 text-white border-red-600";
      default:
        return "bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "keldi":
        return <CheckCircleIcon className="h-6 w-6" />;
      case "kechikdi":
        return <ClockIcon className="h-6 w-6" />;
      case "kelmadi":
        return <XCircleIcon className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "keldi":
        return "Keldi";
      case "kechikdi":
        return "Kechikdi";
      case "kelmadi":
        return "Kelmadi";
      default:
        return "Belgilanmagan";
    }
  };

  const statistics = {
    total: students.length,
    keldi: Object.values(attendanceData).filter((s) => s === "keldi").length,
    kelmadi: Object.values(attendanceData).filter((s) => s === "kelmadi").length,
    kechikdi: Object.values(attendanceData).filter((s) => s === "kechikdi").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`/teacher/attendance/${groupId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Guruhga qaytish
        </Link>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Yuklanmoqda...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Xatolik: {error.message}
          </div>
        )}

        {!isLoading && !error && lesson && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Dars Davomati
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {new Date(lesson.date).toLocaleDateString("uz-UZ", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4" />
                      <span>{students.length} ta talaba</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {statistics.keldi}
                    </div>
                    <div className="text-xs text-green-600">Keldi</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-700">
                      {statistics.kechikdi}
                    </div>
                    <div className="text-xs text-yellow-600">Kechikdi</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-700">
                      {statistics.kelmadi}
                    </div>
                    <div className="text-xs text-red-600">Kelmadi</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => markAllAs("keldi")}
                  className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium text-sm"
                >
                  Hammani kelgan qilish
                </button>
                <button
                  onClick={() => markAllAs("kechikdi")}
                  className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition font-medium text-sm"
                >
                  Hammani kechikkan qilish
                </button>
                <button
                  onClick={() => markAllAs("kelmadi")}
                  className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                >
                  Hammani kelmagan qilish
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                <h2 className="text-lg font-bold">Talabalar Ro'yxati</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {students.map((student) => {
                  const status = attendanceData[student.student_id] || "kelmadi";

                  return (
                    <div
                      key={student.student_id}
                      className="p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {student.name?.charAt(0)}
                            {student.surname?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {student.name} {student.surname}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.phone}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleStatus(student.student_id)}
                          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 border-2 flex items-center gap-2 shadow-md hover:shadow-lg ${getStatusColor(
                            status
                          )}`}
                        >
                          {getStatusIcon(status)}
                          <span>{getStatusText(status)}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {students.length === 0 && (
                <div className="text-center py-12">
                  <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Bu guruhda talabalar topilmadi
                  </p>
                </div>
              )}
            </div>

            {hasChanges && (
              <div className="fixed bottom-6 right-6 flex gap-3">
                <button
                  onClick={() => {
                    router.push(`/teacher/attendance/${groupId}`);
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition shadow-lg"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveAttendanceMutation.isPending}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-lg flex items-center gap-2"
                >
                  {saveAttendanceMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saqlanmoqda...
                    </>
                  ) : (
                    "Davomatni Saqlash"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherLessonAttendance;
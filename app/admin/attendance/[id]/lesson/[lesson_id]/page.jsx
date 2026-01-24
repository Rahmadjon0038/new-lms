"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  User,
  Phone,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "../../../../../../hooks/api";
import { toast } from "react-hot-toast";

const MAIN_COLOR = "#A60E07";

// API functions
const getLessonStudents = async (lessonId) => {
  const response = await instance.get(`/api/attendance/lessons/${lessonId}/students`);
  return response.data;
};

const saveAttendance = async ({ lesson_id, attendance_data }) => {
  const response = await instance.post("/api/attendance/mark", {
    lesson_id,
    attendance_data
  });
  return response.data;
};

// Attendance Select Component
const AttendanceSelect = ({ student, currentStatus, onStatusChange, isLoading }) => {
  const handleChange = (e) => {
    const newStatus = e.target.value;
    onStatusChange(student.student_id, newStatus);
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isLoading || !student.can_mark_attendance}
      className={`w-full p-2 rounded border text-sm font-medium ${
        currentStatus === "keldi" 
          ? "bg-green-50 border-green-300 text-green-700" 
          : "bg-red-50 border-red-300 text-red-700"
      } ${
        isLoading || !student.can_mark_attendance 
          ? "opacity-50 cursor-not-allowed" 
          : "cursor-pointer hover:shadow-sm"
      }`}
    >
      <option value="kelmadi" className="text-red-700">Kelmadi</option>
      <option value="keldi" className="text-green-700">Keldi</option>
    </select>
  );
};

// Main Component
const LessonAttendancePage = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const groupId = params.id;
  const lessonId = params.lesson_id;

  const [attendanceData, setAttendanceData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch lesson students
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["lesson-students", lessonId],
    queryFn: () => getLessonStudents(lessonId),
    enabled: !!lessonId,
  });

  // Safely extract students array from response
  const students = Array.isArray(response?.data?.students) 
    ? response.data.students 
    : Array.isArray(response?.data) 
    ? response.data 
    : Array.isArray(response?.students)
    ? response.students
    : [];

  // Debug logging
  console.log("API Response:", response);
  console.log("Students array:", students);

  // Initialize attendance data
  useEffect(() => {
    if (students.length > 0) {
      const initialAttendance = {};
      students.forEach((student) => {
        initialAttendance[student.student_id] = student.attendance_status === "keldi" ? "keldi" : "kelmadi";
      });
      setAttendanceData(initialAttendance);
      setHasChanges(false);
    }
  }, [students]);

  // Save attendance mutation
  const saveAttendanceMutation = useMutation({
    mutationFn: saveAttendance,
    onSuccess: () => {
      toast.success("Davomat saqlandi!");
      setHasChanges(false);
      queryClient.invalidateQueries(["lesson-students", lessonId]);
      queryClient.invalidateQueries(["group-lessons", groupId]);
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Davomat saqlashda xatolik yuz berdi";
      toast.error(message);
    }
  });

  // Handle status change
  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: newStatus
    }));
    setHasChanges(true);
  };

  // Save attendance
  const handleSave = () => {
    if (!hasChanges) {
      toast.info("Hech qanday ozgarish yoq");
      return;
    }

    const attendance_data = Object.entries(attendanceData).map(([student_id, status]) => ({
      student_id: parseInt(student_id),
      status
    }));

    saveAttendanceMutation.mutate({
      lesson_id: parseInt(lessonId),
      attendance_data
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: MAIN_COLOR }}></div>
            <p className="text-gray-600 mt-4">Yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("API Error:", error);
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Xatolik yuz berdi:</p>
            <p className="text-sm">{error.message || "API bilan boglanishda xatolik"}</p>
          </div>
        </div>
      </div>
    );
  }

  // Additional safety check
  if (!response) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Malumot topilmadi</p>
            <p className="text-sm">Server javob qaytarmadi</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="px-2">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Dars Davomati
            </h1>
            <p className="text-sm text-gray-600">
              Dars ID: {lessonId} • Studentlar: {students.length} ta
            </p>
          </div>
        </div>

        {/* Students Table */}
        {students.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Talabalar topilmadi</p>
            <p className="text-gray-400 text-sm mt-2">Bu darsga hali talabalar qoshilmagan</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Talabalar royxati ({students.length} ta)
              </h2>
              
              {hasChanges && (
                <div className="text-sm text-orange-600 font-medium">
                  ⚠️ Saqlanmagan ozgarishlar bor
                </div>
              )}
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      №
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Talaba
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Davomat
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student.student_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name} {student.surname}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-1" />
                          {student.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.group_status === "active" ? "bg-green-100 text-green-800" :
                          student.group_status === "stopped" ? "bg-orange-100 text-orange-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {student.group_status_description}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <AttendanceSelect
                            student={student}
                            currentStatus={attendanceData[student.student_id] || "kelmadi"}
                            onStatusChange={handleStatusChange}
                            isLoading={saveAttendanceMutation.isLoading}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Save Button */}
            {hasChanges && (
              <div className="mt-6 flex justify-center pb-6">
                <button
                  onClick={handleSave}
                  disabled={saveAttendanceMutation.isLoading}
                  className="flex items-center gap-2 px-8 py-3 font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 shadow-md"
                  style={{ backgroundColor: MAIN_COLOR }}
                >
                  {saveAttendanceMutation.isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      Ozgarishlarni saqlash
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonAttendancePage;
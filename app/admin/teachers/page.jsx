"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserPlusIcon,
  AcademicCapIcon,
  PhoneIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CheckIcon,
  XMarkIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  usegetTeachers,
  useDeleteTeacher,
  usePutTeacherOnLeave,
  useTerminateTeacher,
  useReactivateTeacher,
  useUpdateTeacherFull
} from "../../../hooks/teacher";
import { useGetNotify } from "../../../hooks/notify";
import { useGetAllSubjects } from "../../../hooks/subjects";
import AddTeacherModal from "../../../components/admistrator/AddTeacher";
import SubjectsSelect from "../../../components/SubjectsSelect";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "500px",
  bgcolor: "background.paper",
  borderRadius: "20px",
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  p: { xs: 3, sm: 4 },
  outline: "none",
  border: "none",
};

const editModalStyle = {
  ...modalStyle,
  maxWidth: "600px",
  maxHeight: "90vh",
  overflowY: "auto"
};

// Tasdiqlash modali komponenti
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isLoading, type = "danger" }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "warning":
        return <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />;
      case "info":
        return <PlayIcon className="h-12 w-12 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "info":
        return "bg-blue-600 hover:bg-blue-700";
      default:
        return "bg-red-600 hover:bg-red-700";
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={modalStyle}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
            >
              Bekor qilish
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-2.5 rounded-xl font-medium text-white transition disabled:opacity-50 ${getButtonColor()}`}
            >
              {isLoading ? "Bajarilmoqda..." : confirmText}
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

// Teacher tahrirlash modali
const EditTeacherModal = ({ isOpen, onClose, teacher, onUpdate, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    password: "",
    phone: "",
    phone2: "",
    subject_ids: [],
    certificate: "",
    age: 0,
    has_experience: false,
    experience_years: 0,
    experience_place: "",
    available_times: "",
    work_days_hours: "",
  });

  const { data: subjects, isLoading: subjectsLoading } = useGetAllSubjects();

  React.useEffect(() => {
    if (teacher && isOpen) {
      setFormData({
        name: teacher.name || "",
        surname: teacher.surname || "",
        username: teacher.username || "",
        password: teacher.password || "",
        phone: teacher.phone || "",
        phone2: teacher.phone2 || "",
        subject_ids: teacher.subject_ids || [],
        certificate: teacher.certificate || "",
        age: teacher.age || 0,
        has_experience: teacher.has_experience || false,
        experience_years: teacher.experience_years || 0,
        experience_place: teacher.experience_place || "",
        available_times: teacher.available_times || "",
        work_days_hours: teacher.work_days_hours || "",
      });
    }
  }, [teacher, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value) }));
  };

  const handleSubjectChange = (selectedIds) => {
    setFormData(prev => ({ ...prev, subject_ids: selectedIds }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(teacher.id, formData);
  };

  if (!isOpen || !teacher) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={editModalStyle}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <PencilIcon className="h-6 w-6 mr-2 text-[#A60E07]" />
            O'qituvchini Tahrirlash
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[500px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ism *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Familiya *</label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon raqami *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qo'shimcha telefon</label>
              <input
                type="tel"
                name="phone2"
                value={formData.phone2}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yoshi</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
              />
            </div>
            <div>
              <label className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  name="has_experience"
                  checked={formData.has_experience}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#A60E07] focus:ring-[#A60E07]"
                />
                <span className="text-sm font-medium text-gray-700">Tajriba bor</span>
              </label>
            </div>
          </div>

          {formData.has_experience && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tajriba yillari</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tajriba joyi</label>
                <input
                  type="text"
                  name="experience_place"
                  value={formData.experience_place}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fanlar *</label>
            {subjectsLoading ? (
              <div className="text-sm text-gray-500">Fanlar yuklanmoqda...</div>
            ) : (
              <SubjectsSelect
                value={formData.subject_ids}
                onChange={handleSubjectChange}
                subjects={subjects}
                multiple={true}
                placeholder="Fanlarni tanlang"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sertifikat</label>
            <textarea
              name="certificate"
              value={formData.certificate}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mavjud vaqtlar</label>
            <input
              type="text"
              name="available_times"
              value={formData.available_times}
              onChange={handleChange}
              placeholder="Masalan: 09:00-18:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ish kunlari va soatlari</label>
            <textarea
              name="work_days_hours"
              value={formData.work_days_hours}
              onChange={handleChange}
              rows={3}
              placeholder="Masalan: Dushanba-Juma: 09:00-18:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-lg font-medium text-white bg-[#A60E07] hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

function TeacherCard({ teacher, onEdit, onDelete, onStatusChange }) {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "Faol":
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Ishdan boshatilgan":
      case "terminated":
        return "bg-red-100 text-red-800 border-red-200";
      case "Dam olishda":
      case "on_leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Faol";
      case "terminated":
        return "Ishdan boshatilgan";
      case "on_leave":
        return "Dam olishda";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Belgilanmagan";
    return new Date(dateString).toLocaleDateString('uz-UZ');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {teacher.name} {teacher.surname}
            </h3>
            <p className="text-sm text-gray-600">ID: {teacher.id}</p>
          </div>
        </div>
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
            teacher.status
          )}`}
        >
          {getStatusText(teacher.status)}
        </span>
      </div>

      <div className="space-y-3">
        {/* Fanlar */}
        <div className="flex items-start space-x-2">
          <AcademicCapIcon className="h-4 w-4 text-blue-500 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700 block">Fanlar: {teacher.subjects_list}</span>

          </div>
        </div>

        {/* Telefon */}
        <div className="flex items-center space-x-2">
          <PhoneIcon className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Telefon:</span>
          <span className="text-sm text-gray-900">{teacher.phone}</span>
        </div>

        {/* Yoshi */}
        <div className="flex items-center space-x-2">
          <UserIcon className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">Yoshi:</span>
          <span className="text-sm text-gray-900">{teacher.age} yosh</span>
        </div>

        {/* Ish boshlanish sanasi */}
        <div className="flex items-center space-x-2">
          <CalendarDaysIcon className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-700">Ish boshlanish:</span>
          <span className="text-sm text-gray-900">{formatDate(teacher.startDate)}</span>
        </div>

        {/* Gruplar soni */}
        <div className="flex items-center space-x-2">
          <BriefcaseIcon className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-medium text-gray-700">Guruhlar soni:</span>
          <span className="text-sm text-gray-900 font-semibold">{teacher.groupCount || 0} ta</span>
        </div>

        {/* Mavjud vaqt */}
        {teacher.availableTimes && (
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700">Mavjud vaqt:</span>
            <span className="text-sm text-gray-900">{teacher.availableTimes}</span>
          </div>
        )}

        {/* Tajriba */}
        {teacher.hasExperience && (
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Tajriba:</span>
            <span className="text-sm text-gray-900">
              {teacher.experienceYears} yil - {teacher.experiencePlace}
            </span>
          </div>
        )}

        {/* Sertifikat */}
        {teacher.certificate && (
          <div className="bg-gray-50 rounded-lg p-3 mt-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sertifikat</span>
            <p className="text-sm text-gray-700 mt-1">{teacher.certificate}</p>
          </div>
        )}

        {/* Ish vaqtlari */}
        {teacher.workDaysHours && (
          <div className="bg-blue-50 rounded-lg p-3 mt-3">
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Ish jadvali</span>
            <p className="text-sm text-gray-700 mt-1">{teacher.workDaysHours}</p>
          </div>
        )}
      </div>

      {/* Action tugmalari */}
      <div className="mt-4 pt-4 border-t border-gray-100 relative">
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-4 items-center text-xs text-gray-500">
            <span>Ro'yxatga olingan: {formatDate(teacher.registrationDate)}</span>
            {teacher.terminationDate && (
              <span className="text-red-500">Ishdan bo'shatilgan: {formatDate(teacher.terminationDate)}</span>
            )}
          </div>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Actions"
            >
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
            </button>

            {showActions && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <button
                    onClick={() => {
                      onEdit(teacher);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-3" />
                    Tahrirlash
                  </button>

                  {teacher.status === "active" && (
                    <>
                      <button
                        onClick={() => {
                          onStatusChange(teacher.id, 'leave');
                          setShowActions(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                      >
                        <PauseIcon className="h-4 w-4 mr-3" />
                        Dam olishga chiqarish
                      </button>

                      <button
                        onClick={() => {
                          onStatusChange(teacher.id, 'terminate');
                          setShowActions(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                      >
                        <StopIcon className="h-4 w-4 mr-3" />
                        Ishdan boshatish
                      </button>
                    </>
                  )}

                  {(teacher.status === "on_leave" || teacher.status === "terminated") && (
                    <button
                      onClick={() => {
                        onStatusChange(teacher.id, 'reactivate');
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    >
                      <PlayIcon className="h-4 w-4 mr-3" />
                      Qayta faollashtirish
                    </button>
                  )}

                  <hr className="my-2" />

                  <button
                    onClick={() => {
                      onDelete(teacher.id);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4 mr-3" />
                    Butunlay o'chirish
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeachersPage() {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null
  });
  const notify = useGetNotify();

  // API hooks
  const { data: teachersData, isLoading, error } = usegetTeachers(selectedSubject, selectedStatus);
  const deleteTeacherMutation = useDeleteTeacher();
  const putOnLeaveMutation = usePutTeacherOnLeave();
  const terminateMutation = useTerminateTeacher();
  const reactivateMutation = useReactivateTeacher();
  const updateTeacherMutation = useUpdateTeacherFull();

  const teachers = teachersData?.teachers || [];

  // Handler functions
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
  };

  const handleUpdate = (teacherId, updateData) => {
    updateTeacherMutation.mutate({
      teacherId,
      teacherData: updateData
    }, {
      onSuccess: () => {
        notify("O'qituvchi ma'lumotlari yangilandi", "success");
        setEditingTeacher(null);
      },
      onError: (error) => {
        notify("Xatolik yuz berdi: " + (error?.response?.data?.message || error.message), "error");
      }
    });
  };

  const handleDelete = (teacherId) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: "O'qituvchini o'chirish",
      message: "Haqiqatan ham bu o'qituvchini butunlay o'chirmoqchimisiz? Bu amal bekor qilib bo'lmaydi.",
      confirmText: "O'chirish",
      onConfirm: () => {
        deleteTeacherMutation.mutate(teacherId, {
          onSuccess: (data) => {
            notify('ok', data?.message);
            setConfirmModal({ ...confirmModal, isOpen: false });
          },
          onError: (error) => {
            notify('err', error?.response?.data?.message);
            setConfirmModal({ ...confirmModal, isOpen: false });
          }
        });
      }
    });
  };

  const handleStatusChange = (teacherId, action) => {
    const actions = {
      leave: {
        mutation: putOnLeaveMutation,
        title: "Dam olishga chiqarish",
        message: "Haqiqatan ham bu o'qituvchini dam olishga chiqarmoqchimisiz?",
        confirmText: "Dam olishga chiqarish",
        successMessage: "O'qituvchi dam olishga chiqarildi",
        type: "warning"
      },
      terminate: {
        mutation: terminateMutation,
        title: "Ishdan boshatish",
        message: "Haqiqatan ham bu o'qituvchini ishdan boshatmoqchimisiz?",
        confirmText: "Ishdan boshatish",
        successMessage: "O'qituvchi ishdan boshatildi",
        type: "danger"
      },
      reactivate: {
        mutation: reactivateMutation,
        title: "Qayta faollashtirish",
        message: "Haqiqatan ham bu o'qituvchini qayta faollashtirmoqchimisiz?",
        confirmText: "Qayta faollashtirish",
        successMessage: "O'qituvchi qayta faollashtirildi",
        type: "info"
      }
    };

    const actionConfig = actions[action];
    if (!actionConfig) return;

    setConfirmModal({
      isOpen: true,
      type: actionConfig.type,
      title: actionConfig.title,
      message: actionConfig.message,
      confirmText: actionConfig.confirmText,
      onConfirm: () => {
        actionConfig.mutation.mutate(teacherId, {
          onSuccess: (data) => {
            notify('ok', data?.message);
            setConfirmModal({ ...confirmModal, isOpen: false });
          },
          onError: (error) => {
            console.log(error)
            notify("err", error?.response?.data?.message);
            setConfirmModal({ ...confirmModal, isOpen: false });
          }
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A60E07] mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-600">O'qituvchilar yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4 text-xl">❌ Xatolik yuz berdi</div>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }


  return (
    <div className="min-h-full p-8 bg-gray-50 pb-36">
      <div className="">
        {/* Header + Add Button */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">O'qituvchilar Boshqaruvi</h1>
          <AddTeacherModal>
            <button className="flex items-center px-4 py-2 bg-[#A60E07] text-white rounded-lg hover:opacity-90 transition font-semibold shadow-md text-sm">
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Yangi O'qituvchi Qo'shish
            </button>
          </AddTeacherModal>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-8">
          <FunnelIcon className="h-5 w-5 text-[#A60E07]" />

          <SubjectsSelect
            value={selectedSubject}
            onChange={setSelectedSubject}
            placeholder="Fan bo'yicha filterlash"
            className="w-[200px] px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A60E07] focus:border-transparent text-sm"
          />

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-[180px] px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#A60E07] focus:border-transparent text-sm"
          >
            <option value="all">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="on_leave">Dam olishda</option>
            <option value="terminated">Ishdan boshatilgan</option>
          </select>

          {(selectedSubject !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedStatus('all');
              }}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Tozalash
            </button>
          )}
        </div>

        {/* Teachers Grid */}
        {teachers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">O'qituvchilar topilmadi</h3>
            <p className="text-gray-500 mb-6">
              {selectedSubject === 'all'
                ? "Hali hech qanday o'qituvchi ro'yxatdan o'tmagan."
                : "Tanlangan fan bo'yicha o'qituvchilar topilmadi."}
            </p>
            <AddTeacherModal>
              <button className="inline-flex items-center px-4 py-2 bg-[#A60E07] text-white rounded-lg hover:opacity-90 transition duration-200">
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Birinchi O'qituvchini Qo'shish
              </button>
            </AddTeacherModal>
          </div>
        )}

        {/* Edit Teacher Modal */}
        <EditTeacherModal
          isOpen={!!editingTeacher}
          onClose={() => setEditingTeacher(null)}
          teacher={editingTeacher}
          onUpdate={handleUpdate}
          isLoading={updateTeacherMutation.isLoading}
        />

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          type={confirmModal.type}
          isLoading={
            deleteTeacherMutation.isLoading ||
            putOnLeaveMutation.isLoading ||
            terminateMutation.isLoading ||
            reactivateMutation.isLoading
          }
        />
      </div>
    </div>
  );
}
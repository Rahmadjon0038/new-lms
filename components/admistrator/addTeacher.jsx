"use client";

import React, { useState } from "react";
import {
    XMarkIcon,
    UserIcon,
    PhoneIcon,
    ClockIcon,
    CalendarDaysIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    CheckIcon,
} from "@heroicons/react/24/outline";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useRegisterTeacher } from "../../hooks/teacher";
import { useGetNotify } from "../../hooks/notify";
import SubjectsSelect from "../SubjectsSelect";
import { useGetAllSubjects } from "../../hooks/subjects";

const MAIN_COLOR = "#A60E07";

// Fanlar tanlash komponenti
const SubjectSelectionSection = ({ formData, onSubjectChange, onChange }) => {
    const { data: subjectsData } = useGetAllSubjects();
    const subjects = subjectsData?.subjects || [];

    const selectedSubjects = subjects.filter(subject =>
        formData.subject_ids.includes(subject.id)
    );

    const removeSubject = (subjectId) => {
        onSubjectChange(subjectId); // Bu funksiya toggle vazifasini bajaradi
    };

    return (
        <div className="bg-yellow-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2" style={{ color: MAIN_COLOR }} />
                O'quv Ma'lumotlari
            </h3>

            {/* Fan tanlash */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                    Fanlarni tanlang *
                </label>
                <SubjectsSelect
                    value=""
                    onChange={onSubjectChange}
                    placeholder="Fan qo'shish uchun tanlang"
                    showAll={false}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
            </div>

            {/* Tanlangan fanlar */}
            {selectedSubjects.length > 0 && (
                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                        Tanlangan fanlar:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {selectedSubjects.map(subject => (
                            <span
                                key={subject.id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                                {subject.name}
                                <button
                                    type="button"
                                    onClick={() => removeSubject(subject.id)}
                                    className="ml-2 hover:text-blue-600"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Sertifikat */}
            <div>
                <input
                    type="text"
                    name="certificate"
                    placeholder="Sertifikat/Diplom"
                    value={formData.certificate}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
            </div>
        </div>
    );
};

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "95%",
    maxWidth: "700px",
    bgcolor: "background.paper",
    borderRadius: "20px",
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    p: { xs: 3, sm: 4 },
    outline: "none",
    border: "none",
    maxHeight: "90vh",
    overflowY: "auto",
};

export default function AddTeacherModal({ children, onClose }) {
    const notify = useGetNotify();
    const registerTeacherMutation = useRegisterTeacher();
    const [isOpen, setIsOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        username: "",
        password: "",
        phone: "",
        phone2: "",
        subject_ids: [],
        startDate: "",
        certificate: "",
        age: "",
        has_experience: false,
        experience_years: "",
        experience_place: "",
        available_times: "",
        work_days_hours: "",
    });

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => {
        setIsOpen(false);
        setFormData({
            name: "",
            surname: "",
            username: "",
            password: "",
            phone: "",
            phone2: "",
            subject_ids: [],
            startDate: "",
            certificate: "",
            age: "",
            has_experience: false,
            experience_years: "",
            experience_place: "",
            available_times: "",
            work_days_hours: "",
        });
        if (onClose) onClose();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubjectChange = (value) => {
        if (value === 'all' || value === '') return;

        const subjectId = parseInt(value);
        setFormData(prev => {
            const isAlreadySelected = prev.subject_ids.includes(subjectId);

            if (isAlreadySelected) {
                // Agar tanlangan bo'lsa, o'chirib tashlash
                const newSubjectIds = prev.subject_ids.filter(id => id !== subjectId);
                return {
                    ...prev,
                    subject_ids: newSubjectIds
                };
            } else {
                // Yangi fan qo'shish
                const newSubjectIds = [...prev.subject_ids, subjectId];
                return {
                    ...prev,
                    subject_ids: newSubjectIds
                };
            }
        });
    };

    const getErrorMessage = (error) => {
        const apiData = error?.response?.data;
        if (typeof apiData?.message === "string" && apiData.message.trim()) return apiData.message;

        if (Array.isArray(apiData?.errors) && apiData.errors.length > 0) {
            const firstError = apiData.errors[0];
            if (typeof firstError === "string") return firstError;
            if (typeof firstError?.message === "string") return firstError.message;
        }

        if (apiData?.errors && typeof apiData.errors === "object") {
            const firstKey = Object.keys(apiData.errors)[0];
            const firstValue = apiData.errors[firstKey];
            if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0]);
            if (typeof firstValue === "string") return firstValue;
        }

        return error?.message || "Noma'lum xatolik yuz berdi";
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.subject_ids.length === 0) {
            notify("err", "Kamida bitta fan biriktirilishi shart");
            return;
        }

        // Validation
        if (!formData.name || !formData.surname || !formData.username ||
            !formData.password || !formData.phone ||
            !formData.startDate || !formData.age) {
            notify("err", "Iltimos, barcha majburiy maydonlarni to'ldiring");
            return;
        }

        const submitData = {
            ...formData,
            age: parseInt(formData.age),
            subject_ids: formData.subject_ids,
            experience_years: formData.experience_years ? parseInt(formData.experience_years) : 0,
        };

        console.log("Submitting data:", submitData);

        registerTeacherMutation.mutate(submitData, {
            onSuccess: (data) => {
                notify('ok', data?.message || "O'qituvchi muvaffaqiyatli qo'shildi",);
                handleClose();
            },
            onError: (error) => {
                notify("err", getErrorMessage(error));
            }
        });
    };

    return (
        <>
            <div onClick={handleOpen}>
                {children}
            </div>

            <Modal open={isOpen} onClose={handleClose}>
                <Box sx={modalStyle}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <UserIcon className="h-8 w-8 mr-3" style={{ color: MAIN_COLOR }} />
                            Yangi O'qituvchi Qo'shish
                        </h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
                        >
                            <XMarkIcon className="h-6 w-6 text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Shaxsiy ma'lumotlar */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <UserIcon className="h-5 w-5 mr-2" style={{ color: MAIN_COLOR }} />
                                Shaxsiy Ma'lumotlar
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Ism *"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                                <input
                                    type="text"
                                    name="surname"
                                    placeholder="Familiya *"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Yoshi *"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    />
                                    <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600">
                                        Ish boshlanish sanasi *
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Hisobga kirish ma'lumotlari */}
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <AcademicCapIcon className="h-5 w-5 mr-2" style={{ color: MAIN_COLOR }} />
                                Hisobga Kirish Ma'lumotlari
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Foydalanuvchi nomi *"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Parol *"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Aloqa ma'lumotlari */}
                        <div className="bg-green-50 p-4 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <PhoneIcon className="h-5 w-5 mr-2" style={{ color: MAIN_COLOR }} />
                                Aloqa Ma'lumotlari
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Telefon raqami *"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phone2"
                                    placeholder="Ikkinchi telefon raqami"
                                    value={formData.phone2}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* O'quv ma'lumotlari */}
                        <SubjectSelectionSection
                            formData={formData}
                            onSubjectChange={handleSubjectChange}
                            onChange={handleChange}
                        />

                        {/* Ish tajribasi */}
                        <div className="bg-purple-50 p-4 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <BriefcaseIcon className="h-5 w-5 mr-2" style={{ color: MAIN_COLOR }} />
                                Ish Tajribasi
                            </h3>
                            <div className="mb-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="has_experience"
                                        checked={formData.has_experience}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Ish tajribasi bor</span>
                                </label>
                            </div>
                            {formData.has_experience && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        name="experience_years"
                                        placeholder="Tajriba yillari"
                                        value={formData.experience_years}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        name="experience_place"
                                        placeholder="Ish joyi"
                                        value={formData.experience_place}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Ish vaqti */}
                        <div className="bg-indigo-50 p-4 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <ClockIcon className="h-5 w-5 mr-2" style={{ color: MAIN_COLOR }} />
                                Ish Vaqti
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <input
                                    type="text"
                                    name="available_times"
                                    placeholder="Mavjud vaqtlar (masalan: 09:00-18:00)"
                                    value={formData.available_times}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                <textarea
                                    name="work_days_hours"
                                    placeholder="Ish kunlari va soatlari (masalan: Dushanba-Juma: 09:00-18:00)"
                                    value={formData.work_days_hours}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Tugmalar */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 py-3 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition duration-150"
                            >
                                Bekor qilish
                            </button>
                            <button
                                type="submit"
                                disabled={registerTeacherMutation.isLoading}
                                className="flex-1 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition duration-150 disabled:opacity-50"
                                style={{ backgroundColor: MAIN_COLOR }}
                            >
                                {registerTeacherMutation.isLoading ? "Qo'shilmoqda..." : "O'qituvchi Qo'shish"}
                            </button>
                        </div>
                    </form>
                </Box>
            </Modal>
        </>
    );
}

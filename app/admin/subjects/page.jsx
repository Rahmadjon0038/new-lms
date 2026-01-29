"use client";
import React, { useState } from "react";
import {
    BookOpenIcon,
    PlusCircleIcon,
    UsersIcon,
    AcademicCapIcon,
    EyeIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    CheckIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { useGetAllSubjects, useGetSubjectStats, useCreateSubject, useUpdateSubject, useDeleteSubject } from "../../../hooks/subjects";
import { useGetNotify } from "../../../hooks/notify";

// Stats Modal Component
const StatsModal = ({ isOpen, onClose, subjectId }) => {
    const { data: statsData, isLoading } = useGetSubjectStats(subjectId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Fan statistikasi</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A60E07] mx-auto"></div>
                        <p className="mt-2 text-gray-500">Yuklanmoqda...</p>
                    </div>
                ) : statsData?.success ? (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-lg text-gray-800 mb-2">{statsData.subject.name}</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <BookOpenIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-blue-600">{statsData.stats.total_groups}</p>
                                <p className="text-sm text-gray-600">Jami guruhlar</p>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <UsersIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-600">{statsData.stats.total_students}</p>
                                <p className="text-sm text-gray-600">Jami talabalar</p>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-lg text-center">
                                <AcademicCapIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-purple-600">{statsData.stats.total_teachers}</p>
                                <p className="text-sm text-gray-600">Jami o'qituvchilar</p>
                            </div>
                            
                            <div className="bg-orange-50 p-4 rounded-lg text-center">
                                <CheckIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-orange-600">{statsData.stats.active_groups}</p>
                                <p className="text-sm text-gray-600">Faol guruhlar</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                <p className="text-lg font-bold text-yellow-600">{statsData.stats.draft_groups}</p>
                                <p className="text-xs text-gray-600">Tayyorgarlik</p>
                            </div>
                            
                            <div className="bg-red-50 p-3 rounded-lg text-center">
                                <p className="text-lg font-bold text-red-600">{statsData.stats.blocked_groups}</p>
                                <p className="text-xs text-gray-600">Bloklangan</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-red-500">Ma'lumotlarni yuklashda xatolik</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, subjectName, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
                <div className="flex justify-center mb-4">
                    <ExclamationTriangleIcon className="h-14 w-14 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
                    Fanni o'chirish
                </h3>
                <p className="text-gray-500 text-center text-sm mb-6">
                    Haqiqatan ham "<span className="font-semibold">{subjectName}</span>" fanini o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                    >
                        Bekor qilish
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {isLoading ? "O'chirilmoqda..." : "Ha, o'chirish"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Create/Edit Modal
const SubjectFormModal = ({ isOpen, onClose, editData = null }) => {
    const [name, setName] = useState("");
    const createSubjectMutation = useCreateSubject();
    const updateSubjectMutation = useUpdateSubject();
    const notify = useGetNotify();

    const isEditing = !!editData;
    const isLoading = createSubjectMutation.isPending || updateSubjectMutation.isPending;

    // Update form when editData changes
    React.useEffect(() => {
        if (editData) {
            setName(editData.name || "");
        } else {
            setName("");
        }
    }, [editData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const onSuccess = (data) => {
            setName("");
            onClose();
            notify("ok", data.message || (isEditing ? "Fan muvaffaqiyatli yangilandi" : "Fan muvaffaqiyatli yaratildi"));
        };

        const onError = (error) => {
            notify("err", error.response?.data?.message || "Xatolik yuz berdi");
        };

        if (isEditing) {
            updateSubjectMutation.mutate({
                id: editData.id,
                subjectData: { name: name.trim() },
                onSuccess,
                onError
            });
        } else {
            createSubjectMutation.mutate({
                name: name.trim(),
                onSuccess,
                onError
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEditing ? "Fanni tahrirlash" : "Yangi fan yaratish"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fan nomi
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
                            placeholder="Fan nomini kiriting"
                            required
                        />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="flex-1 py-2.5 rounded-xl font-bold text-white bg-[#A60E07] hover:opacity-90 transition disabled:opacity-50"
                        >
                            {isLoading ? "Saqlanmoqda..." : isEditing ? "Yangilash" : "Yaratish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Subjects Page Component
export default function SubjectsPage() {
    const { data: subjectsData, isLoading } = useGetAllSubjects();
    const deleteSubjectMutation = useDeleteSubject();
    const notify = useGetNotify();

    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [editingSubject, setEditingSubject] = useState(null);

    const handleViewStats = (subject) => {
        setSelectedSubject(subject);
        setShowStatsModal(true);
    };

    const handleDelete = (subject) => {
        setSelectedSubject(subject);
        setShowDeleteModal(true);
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setShowFormModal(true);
    };

    const confirmDelete = () => {
        if (selectedSubject) {
            deleteSubjectMutation.mutate(selectedSubject.id, {
                onSuccess: (data) => {
                    setShowDeleteModal(false);
                    setSelectedSubject(null);
                    notify("ok", data.message || "Fan muvaffaqiyatli o'chirildi");
                },
                onError: (error) => {
                    notify("err", error.response?.data?.message || "Xatolik yuz berdi");
                }
            });
        }
    };

    const closeModals = () => {
        setShowStatsModal(false);
        setShowDeleteModal(false);
        setShowFormModal(false);
        setSelectedSubject(null);
        setEditingSubject(null);
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-8 bg-gray-50">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A60E07] mx-auto"></div>
                    <p className="mt-4 text-gray-500">Fanlar yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    const subjects = subjectsData?.subjects || [];

    return (
        <div className="flex-1 p-8 bg-gray-50">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                            <BookOpenIcon className="h-8 w-8 mr-3 text-[#A60E07]" />
                            Fanlar
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Barcha fanlar va ularning statistikasini boshqaring
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFormModal(true)}
                        className="flex items-center px-6 py-3 bg-[#A60E07] text-white font-semibold rounded-xl hover:opacity-90 transition duration-150 shadow-lg"
                    >
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        Yangi fan yaratish
                    </button>
                </div>
            </div>

            {/* Subjects List */}
            {subjects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Fanlar topilmadi</h3>
                    <p className="text-gray-500 mb-6">Hozircha hech qanday fan yaratilmagan</p>
                    <button
                        onClick={() => setShowFormModal(true)}
                        className="inline-flex items-center px-6 py-3 bg-[#A60E07] text-white font-semibold rounded-xl hover:opacity-90 transition"
                    >
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        Birinchi fanni yaratish
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {subjects.map((subject) => (
                        <div key={subject.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition duration-150">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{subject.name}</h3>
                                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <BookOpenIcon className="h-4 w-4 mr-1 text-blue-500" />
                                            <span>{subject.groups_count} guruh</span>
                                        </div>
                                        <div className="flex items-center">
                                            <UsersIcon className="h-4 w-4 mr-1 text-green-500" />
                                            <span>{subject.students_count} talaba</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    {/* <button
                                        onClick={() => handleViewStats(subject)}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition"
                                    >
                                        <EyeIcon className="h-4 w-4 mr-1 inline" />
                                        Batafsil
                                    </button> */}
                                    
                                    <button
                                        onClick={() => handleEdit(subject)}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    >
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDelete(subject)}
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <StatsModal
                isOpen={showStatsModal}
                onClose={closeModals}
                subjectId={selectedSubject?.id}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={closeModals}
                onConfirm={confirmDelete}
                subjectName={selectedSubject?.name}
                isLoading={deleteSubjectMutation.isPending}
            />

            <SubjectFormModal
                isOpen={showFormModal}
                onClose={closeModals}
                editData={editingSubject}
            />
        </div>
    );
}
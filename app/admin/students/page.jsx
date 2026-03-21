'use client'
import React, { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';
import { FiUserPlus, FiFilter } from 'react-icons/fi';
import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon, InformationCircleIcon, KeyIcon } from '@heroicons/react/24/outline';
import {
    User, Phone, MapPin, Calendar, GraduationCap,
    CheckCircle, XCircle, Clock, BookOpen, Users,
    Home, UserCheck, AlertCircle, PlayCircle, PauseCircle, MoreVertical,
    Shield, ShieldBan, Award, UserX, Trash2, Settings, Building2, ChevronDown, ChevronUp, Pencil, X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { useGetAllStudents, useUpdateStudentStatus, useUpdateStudentInfo, useDeleteStudent } from '../../../hooks/students';
import { usegetTeachers } from '../../../hooks/teacher';
import { useGetAllSubjects } from '../../../hooks/subjects';
import { usegetProfile } from '../../../hooks/user';
import { useGetNotify } from '../../../hooks/notify';
import { getAllStatusOptions, getStatusInfo } from '../../../utils/studentStatus';
import AddGroup from '../../../components/admistrator/AddGroup';

// --- Tahrirlash Holatida Input Komponenti ---
const EditableCellComponent = ({ name, value, onChange, type = 'text', placeholder = '' }) => (
    <input
        className="p-2 border border-[#A60E07] rounded w-full text-sm outline-none mb-1 transition duration-200 focus:ring-1 focus:ring-[#A60E07]"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
    />
);

const EditableCell = memo(EditableCellComponent);

const StudentEditModal = ({ isOpen, onClose, student, formData, onChange, onSubmit, isLoading }) => {
    if (!isOpen || !student) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Talaba ma'lumotlarini yangilash</h3>
                        <p className="text-xs text-gray-500">
                            ID: #{student.id} {student.group_name ? `• ${student.group_name}` : ''}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
                        aria-label="Modalni yopish"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="text-sm font-medium text-gray-700">
                            Ism
                            <input
                                name="name"
                                value={formData.name}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
                                required
                            />
                        </label>

                        <label className="text-sm font-medium text-gray-700">
                            Familiya
                            <input
                                name="surname"
                                value={formData.surname}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
                                required
                            />
                        </label>

                        <label className="text-sm font-medium text-gray-700">
                            Telefon
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
                            />
                        </label>

                        <label className="text-sm font-medium text-gray-700">
                            Qo'shimcha telefon
                            <input
                                name="phone2"
                                value={formData.phone2}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
                            />
                        </label>

                        <label className="text-sm font-medium text-gray-700">
                            Otasining ismi
                            <input
                                name="father_name"
                                value={formData.father_name}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
                            />
                        </label>

                        <label className="text-sm font-medium text-gray-700">
                            Otasining telefoni
                            <input
                                name="father_phone"
                                value={formData.father_phone}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
                            />
                        </label>

                        <label className="text-sm font-medium text-gray-700">
                            Yoshi
                            <input
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
                            />
                        </label>

                        <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                            Manzil
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={onChange}
                                rows={3}
                                className="mt-1 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
                            />
                        </label>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                        >
                            {isLoading ? "Saqlanmoqda..." : "Saqlash"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StudentDeleteModal = ({ isOpen, onClose, student, onConfirm, isLoading }) => {
    if (!isOpen || !student) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900">Talabani o'chirish</h3>
                    <p className="mt-1 text-xs text-gray-500">
                        {student.surname} {student.name} • ID: #{student.id}
                    </p>
                </div>
                <div className="space-y-3 p-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        Agar studentni o'chirsangiz unga tegishli barcha ma'lumotlar o'chib ketadi va qayta tiklab bo'lmaydi.
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                            {isLoading ? "O'chirilmoqda..." : "O'chirish"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getTeacherIdFromProfile = (profile) => {
    const payload = profile?.data || profile;
    return (
        payload?.teacher_id ||
        payload?.id ||
        payload?.user_id ||
        ''
    );
};

const getTeacherSubjectIdFromProfile = (profile) => {
    const payload = profile?.data || profile || {};
    const nestedTeacher = payload?.teacher || {};

    return (
        payload?.subject_id ||
        payload?.primary_subject_id ||
        nestedTeacher?.subject_id ||
        nestedTeacher?.primary_subject_id ||
        payload?.subjects?.[0]?.id ||
        payload?.subject_ids?.[0] ||
        nestedTeacher?.subjects?.[0]?.id ||
        nestedTeacher?.subject_ids?.[0] ||
        ''
    );
};

const getTeacherSubjectIdFromTeacherRecord = (teacher = {}) => {
    const nestedTeacher = teacher?.teacher || {};
    return (
        teacher?.subject_id ||
        teacher?.primary_subject_id ||
        teacher?.subjects?.[0]?.id ||
        teacher?.subject_ids?.[0] ||
        nestedTeacher?.subject_id ||
        nestedTeacher?.primary_subject_id ||
        nestedTeacher?.subjects?.[0]?.id ||
        nestedTeacher?.subject_ids?.[0] ||
        ''
    );
};

const getStudentUsername = (student) => (
    student?.username ||
    student?.user_name ||
    student?.user?.username ||
    student?.user?.user_name ||
    ''
);

const StudentsPage = () => {
    const pathname = usePathname();
    const isTeacherRoute = pathname?.startsWith('/teacher');
    const basePath = isTeacherRoute ? '/teacher' : '/admin';
    // Filter state'lari
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showUnassigned, setShowUnassigned] = useState(false);
    const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
    const [showDesktopFilterClear, setShowDesktopFilterClear] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(null); // Status dropdown state
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const filtersDropdownRef = useRef(null);
    const desktopFilterRef = useRef(null);

    // Filter options uchun data
    const { data: teachersData } = usegetTeachers();
    const { data: subjectsData } = useGetAllSubjects();
    const { data: profileData } = usegetProfile();
    const teacherId = String(getTeacherIdFromProfile(profileData) || '');
    const teacherFromList = useMemo(() => {
        if (!isTeacherRoute || !teacherId) return null;
        const list = teachersData?.teachers || [];
        return list.find((teacher) => String(teacher?.id || teacher?.teacher_id || teacher?.user_id || '') === teacherId) || null;
    }, [isTeacherRoute, teacherId, teachersData]);
    const teacherSubjectId = String(
        getTeacherSubjectIdFromProfile(profileData) || getTeacherSubjectIdFromTeacherRecord(teacherFromList) || ''
    );
    const teacherScopedBySubject = isTeacherRoute && Boolean(teacherSubjectId);

    // Filterlarni backend uchun tayyorlash
    const filters = {
        teacher_id: isTeacherRoute
            ? (teacherScopedBySubject ? undefined : teacherId)
            : selectedTeacher,
        subject_id: isTeacherRoute
            ? (teacherScopedBySubject ? teacherSubjectId : undefined)
            : selectedSubject,
        group_status: selectedStatus,
        unassigned: showUnassigned ? 'true' : undefined,
        search: searchTerm?.trim() || undefined,
        page,
        limit
    };

    // Backenddan ma'lumotlarni olish
    const { data: backendData, isLoading, isFetching, error, refetch } = useGetAllStudents(filters, {
        enabled: isTeacherRoute ? Boolean(teacherSubjectId || teacherId) : true,
        keepPreviousData: true
    });
    const hasLoadedStudents = Boolean(backendData?.success);
    const showStudentsLoading = ((!hasLoadedStudents && !error) || isFetching);
    const pagination = backendData?.pagination || backendData?.data?.pagination || {};
    const currentPage = Number(pagination.page || page || 1);
    const pageLimit = Number(pagination.limit || limit || 20);
    const totalItems = Number(pagination.total || 0);
    const totalPages = Number(
        pagination.total_pages || (pageLimit ? Math.ceil(totalItems / pageLimit) : 1)
    ) || 1;
    // Student status o'zgartirish hook
    const updateStatusMutation = useUpdateStudentStatus();
    const updateStudentMutation = useUpdateStudentInfo();
    const deleteStudentMutation = useDeleteStudent();
    const notify = useGetNotify();

    // Backenddan ma'lumotlarni boshqarish uchun lokal state
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [stats, setStats] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [visibleRecoveryKeys, setVisibleRecoveryKeys] = useState({});
    const [copiedRecoveryRow, setCopiedRecoveryRow] = useState(null);
    const [mobileExpandedRows, setMobileExpandedRows] = useState({});
    const [studentEditModal, setStudentEditModal] = useState({ open: false, student: null });
    const [studentDeleteModal, setStudentDeleteModal] = useState({ open: false, student: null });
    const [studentEditForm, setStudentEditForm] = useState({
        name: '',
        surname: '',
        phone: '',
        phone2: '',
        father_name: '',
        father_phone: '',
        address: '',
        age: '',
    });
    const loadMoreRef = useRef(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * pageLimit + 1;
    const pageEnd = totalItems === 0 ? 0 : Math.min(currentPage * pageLimit, totalItems);
    const isInitialLoading = showStudentsLoading && allStudents.length === 0;
    const showEmptyState = !showStudentsLoading && hasLoadedStudents && allStudents.length === 0;

    // Ma'lumot kelganda state-ni yangilash
    useEffect(() => {
        if (backendData?.success) {
            // Har bir guruh uchun alohida qator yaratish
            const expandedStudents = [];
            backendData.students?.forEach(student => {
                if (student.groups && student.groups.length > 0) {
                    // Har bir guruh uchun alohida qator
                    student.groups.forEach(group => {
                        expandedStudents.push({
                            ...student,
                            group_id: group.group_id,
                            group_name: group.group_name,
                            group_status: group.group_status,
                            group_admin_status: group.group_admin_status,
                            group_class_status: group.group_class_status,
                            teacher_name: group.teacher_name,
                            subject_name: group.subject_name,
                            room_number: group.room_number,
                            room_capacity: group.room_capacity,
                            has_projector: group.has_projector,
                            group_joined_at: group.group_joined_at,
                            group_left_at: group.group_left_at,
                            price: group.price,
                            class_start_date: group.class_start_date,
                            started_at: group.started_at
                        });
                    });
                } else {
                    // Guruhsiz studentlar
                    expandedStudents.push({
                        ...student,
                        group_id: null,
                        group_name: 'Guruhga biriktirilmagan',
                        group_status: null
                    });
                }
            });
            setStudents(expandedStudents);
            setStats(backendData.stats);
            setAllStudents((prev) => {
                if (currentPage <= 1) return expandedStudents;
                const seen = new Set(prev.map((s) => `${s.id}-${s.group_id ?? 'none'}`));
                const merged = [...prev];
                expandedStudents.forEach((s) => {
                    const key = `${s.id}-${s.group_id ?? 'none'}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        merged.push(s);
                    }
                });
                return merged;
            });
        }
    }, [backendData, currentPage]);

    useEffect(() => {
        if (isLoading) return;
        if (students.length === 0 && currentPage > 1) {
            setPage((prev) => Math.max(1, prev - 1));
        }
    }, [isLoading, students.length, currentPage]);

    useEffect(() => {
        const node = loadMoreRef.current;
        if (!node) return;
        if (currentPage >= totalPages) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0]?.isIntersecting) return;
                if (isFetching || isLoading) return;
                setPage((prev) => Math.min(totalPages, prev + 1));
            },
            { rootMargin: "200px" }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [currentPage, totalPages, isFetching, isLoading]);

    // Status dropdown yopish uchun click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.status-dropdown')) {
                setStatusDropdownOpen(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const onScroll = () => {
            setShowScrollTop(window.scrollY > 600);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!showFiltersDropdown && !showDesktopFilterClear) return undefined;

        const handleOutsideClick = (event) => {
            if (filtersDropdownRef.current && !filtersDropdownRef.current.contains(event.target)) {
                setShowFiltersDropdown(false);
            }
            if (desktopFilterRef.current && !desktopFilterRef.current.contains(event.target)) {
                setShowDesktopFilterClear(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowFiltersDropdown(false);
                setShowDesktopFilterClear(false);
            }
        };

        document.addEventListener('pointerdown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('pointerdown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showFiltersDropdown, showDesktopFilterClear]);

    useEffect(() => {
        setPage(1);
        setAllStudents([]);
    }, [searchTerm, selectedTeacher, selectedSubject, selectedStatus, showUnassigned, teacherId, teacherSubjectId, isTeacherRoute]);

    const filteredStudents = allStudents || [];

    const handleEditChange = useCallback((e) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' && value !== '' ? value : value;
        setEditData(prev => ({ ...prev, [name]: newValue }));
    }, []);

    const handleEditClick = (student, index) => {
        // ID, Group ID va Index birikmasi orqali unique key yaratamiz
        setEditingId(`${student.id}-${student.group_id}-${index}`);
        setEditData({
            name: student.name,
            surname: student.surname,
            registration_date: student.registration_date?.split('T')[0],
            group_name: student.group_name || '',
            phone: student.phone,
            phone2: student.phone2,
            father_name: student.father_name || '',
            father_phone: student.father_phone || '',
            address: student.address || '',
            age: student.age || '',
            status: student.group_status,
            course_status: student.course_status,
        });
    };

    const handleGroupActionClick = (student) => {
        // Bu function artiq kerak emas, AddGroup komponenti o'zi modal ochadi
    };

    const handleModalSuccess = () => {
        refetch(); // Ma'lumotlarni qayta yuklash
    };

    // Status o'zgartirish function
    const handleStatusChange = async (studentId, newStatus, groupId) => {
        if (!groupId) {
            notify('err', 'Guruh IDsi talab qilinadi.');
            return;
        }

        notify('load');
        try {
            await updateStatusMutation.mutateAsync({
                studentId: studentId,
                groupId: groupId,
                status: newStatus,
                onSuccess: () => {
                    notify('dismiss');
                    notify('ok', 'Talaba guruh holati muvaffaqiyatli o\'zgartirildi');
                    refetch();
                    setStatusDropdownOpen(null);
                },
                onError: (error) => {
                    notify('dismiss');
                    const errorMessage = error?.response?.data?.message || 'Status o\'zgartirishda xatolik yuz berdi';
                    notify('err', errorMessage);
                }
            });
        } catch (error) {
            notify('dismiss');
            const errorMessage = error?.response?.data?.message || 'Nomalum xatolik yuz berdi';
            notify('err', errorMessage);
        }
    };

    // Barcha filterlarni tozalash
    const clearAllFilters = () => {
        if (!isTeacherRoute) {
            setSelectedTeacher('all');
            setSelectedSubject('all');
        }
        setSelectedStatus('all');
        setShowUnassigned(false);
        setSearchTerm('');
        setShowDesktopFilterClear(false);
        setShowFiltersDropdown(false);
    };

    const hasActiveFilters = (isTeacherRoute ? false : (selectedTeacher !== 'all' || selectedSubject !== 'all')) || selectedStatus !== 'all' || showUnassigned || searchTerm;

    const handleSave = (uniqueId) => {
        setStudents(prevStudents =>
            prevStudents.map((s, idx) =>
                `${s.id}-${s.group_id}-${idx}` === uniqueId
                    ? {
                        ...s,
                        name: String(editData.name).trim(),
                        surname: String(editData.surname).trim(),
                        registration_date: editData.registration_date,
                        group_name: String(editData.group_name).trim() || 'Guruhga biriktirilmagan',
                        phone: String(editData.phone).trim(),
                        phone2: String(editData.phone2).trim(),
                        father_name: String(editData.father_name).trim(),
                        father_phone: String(editData.father_phone).trim(),
                        address: String(editData.address).trim(),
                        age: editData.age,
                        group_status: editData.status,
                        course_status: editData.course_status
                    }
                    : s
            )
        );
        setEditingId(null);
        setEditData({});
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };

    const openStudentEditModal = useCallback((student) => {
        setStudentEditModal({ open: true, student });
        setStudentEditForm({
            name: student?.name || '',
            surname: student?.surname || '',
            phone: student?.phone || '',
            phone2: student?.phone2 || '',
            father_name: student?.father_name || '',
            father_phone: student?.father_phone || '',
            address: student?.address || '',
            age: student?.age ?? '',
        });
    }, []);

    const closeStudentEditModal = useCallback(() => {
        setStudentEditModal({ open: false, student: null });
        setStudentEditForm({
            name: '',
            surname: '',
            phone: '',
            phone2: '',
            father_name: '',
            father_phone: '',
            address: '',
            age: '',
        });
    }, []);

    const openStudentDeleteModal = useCallback((student) => {
        setStudentDeleteModal({ open: true, student });
    }, []);

    const closeStudentDeleteModal = useCallback(() => {
        setStudentDeleteModal({ open: false, student: null });
    }, []);

    const handleStudentDelete = useCallback(() => {
        if (!studentDeleteModal.student) return;
        deleteStudentMutation.mutate(studentDeleteModal.student.id, {
            onSuccess: (data) => {
                notify('ok', data?.message || "Talaba o'chirildi");
                closeStudentDeleteModal();
                refetch();
            },
            onError: (err) => {
                notify('err', err?.response?.data?.message || "Talabani o'chirishda xatolik");
            }
        });
    }, [studentDeleteModal.student, deleteStudentMutation, notify, closeStudentDeleteModal, refetch]);

    const handleStudentEditChange = useCallback((event) => {
        const { name, value } = event.target;
        setStudentEditForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleStudentEditSubmit = async (event) => {
        event.preventDefault();
        if (!studentEditModal.student) return;

        const name = String(studentEditForm.name || '').trim();
        const surname = String(studentEditForm.surname || '').trim();
        if (!name || !surname) {
            notify('err', "Ism va familiya majburiy.");
            return;
        }

        let ageValue;
        if (studentEditForm.age !== '' && studentEditForm.age !== null && studentEditForm.age !== undefined) {
            ageValue = Number(studentEditForm.age);
            if (!Number.isInteger(ageValue)) {
                notify('err', "Yosh butun son bo'lishi kerak.");
                return;
            }
        }

        const payload = {
            name,
            surname,
            phone: String(studentEditForm.phone || '').trim() || undefined,
            phone2: String(studentEditForm.phone2 || '').trim() || undefined,
            father_name: String(studentEditForm.father_name || '').trim() || undefined,
            father_phone: String(studentEditForm.father_phone || '').trim() || undefined,
            address: String(studentEditForm.address || '').trim() || undefined,
            age: ageValue
        };

        const loadingToast = notify('load');
        try {
            await updateStudentMutation.mutateAsync({
                studentId: studentEditModal.student.id,
                data: payload,
                onSuccess: () => {
                    notify('dismiss');
                    notify('ok', "Talaba ma'lumotlari yangilandi");
                    closeStudentEditModal();
                    refetch();
                },
                onError: (error) => {
                    notify('dismiss');
                    const message = error?.response?.data?.message || "Yangilashda xatolik yuz berdi";
                    notify('err', message);
                }
            });
        } catch (error) {
            notify('dismiss');
            const message = error?.response?.data?.message || "Yangilashda xatolik yuz berdi";
            notify('err', message);
        }
    };

    const toggleRecoveryKey = (rowKey) => {
        setVisibleRecoveryKeys((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
    };

    const copyRecoveryKey = async (rowKey, value) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopiedRecoveryRow(rowKey);
            notify('ok', "Recovery key nusxalandi");
            setTimeout(() => setCopiedRecoveryRow(null), 1500);
        } catch {
            notify('err', "Recovery key ni nusxalab bo'lmadi");
        }
    };

    const toggleMobileCard = (rowKey) => {
        setMobileExpandedRows((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
    };

    const getStudentSubjectName = (student) => {
        const isUnassigned = !student?.group_id;
        if (isUnassigned) {
            return student?.registered_subject_name || student?.subject_name || '-';
        }
        return student?.subject_name || student?.registered_subject_name || '-';
    };

    return (
        <div className="mx-auto min-h-screen bg-gray-50 p-2 font-sans sm:p-4 md:p-6">
            {/* <h1 className="mb-4 text-xl font-bold text-gray-800 sm:mb-6 sm:text-3xl">Talabalar Ro'yxati (Admin)</h1> */}

            <div className="mb-5 rounded-lg bg-white p-3 shadow-md sm:mb-6 sm:p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 md:flex-wrap lg:flex-nowrap">
                        <div className="flex flex-1 items-center rounded-lg border border-gray-300 bg-gray-50 px-2 py-1.5 sm:px-3 sm:py-2 focus-within:border-[#A60E07] md:order-1 md:w-full md:max-w-none md:flex-none lg:order-none lg:w-auto lg:max-w-md lg:flex-1">
                            <input
                                type="text"
                                placeholder="Ism, telefon bo'yicha qidiruv..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-grow border-none bg-transparent py-1 text-sm outline-none"
                            />
                        </div>

                        {!isTeacherRoute ? (
                            <select
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                className="hidden h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#A60E07] md:order-2 md:block lg:order-none"
                            >
                                <option value="all">Barcha o'qituvchilar</option>
                                {teachersData?.teachers?.map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.surname} {teacher.name}
                                    </option>
                                ))}
                            </select>
                        ) : null}

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="hidden h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#A60E07] md:order-2 md:block lg:order-none"
                        >
                            <option value="all">Barcha holatlar</option>
                            <option value="active">Faol</option>
                            <option value="stopped">To'xtatilgan</option>
                            <option value="finished">Bitirgan</option>
                        </select>

                        <button
                            type="button"
                            onClick={() => setShowUnassigned(!showUnassigned)}
                            className={`hidden h-10 shrink-0 items-center rounded-lg px-3 text-sm font-medium transition duration-200 md:order-2 md:inline-flex lg:order-none ${showUnassigned
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Users className="mr-1 inline h-4 w-4" />
                            {showUnassigned ? 'Hammasi' : 'Guruhlanmaganlar'}
                        </button>

                        <div className="relative hidden shrink-0 md:order-2 md:block lg:order-none" ref={desktopFilterRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    if (hasActiveFilters) {
                                        setShowDesktopFilterClear((prev) => !prev);
                                    }
                                }}
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                                    showDesktopFilterClear
                                        ? 'border-[#A60E07] bg-red-100 text-[#A60E07]'
                                        : 'border-gray-300 bg-white text-gray-700'
                                } ${hasActiveFilters ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default opacity-70'}`}
                                aria-label="Filtrlarni ochish"
                            >
                                <FiFilter size={16} />
                                {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-[#A60E07]" />}
                            </button>

                            {hasActiveFilters && showDesktopFilterClear ? (
                                <div className="absolute right-0 z-30 mt-2 w-max rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                                    <button
                                        onClick={clearAllFilters}
                                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                                    >
                                        <XCircle className="mr-1 inline h-4 w-4" />
                                        Filtrni tozalash
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        <div className="relative z-30 shrink-0 md:hidden" ref={filtersDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setShowFiltersDropdown((prev) => !prev)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                aria-label="Filtrlarni ochish"
                            >
                                <FiFilter size={16} />
                                {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-[#A60E07]" />}
                            </button>

                            {showFiltersDropdown ? (
                                <div className="absolute right-0 z-50 mt-2 w-[300px] max-w-[88vw] rounded-xl border border-gray-200 bg-white p-3 shadow-xl sm:w-[380px]">
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setShowUnassigned(!showUnassigned)}
                                            className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition duration-200 md:hidden ${showUnassigned
                                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Users className="mr-1 inline h-4 w-4" />
                                            {showUnassigned ? 'Hammasi' : 'Guruhlanmaganlar'}
                                        </button>

                                        {!isTeacherRoute ? (
                                            <select
                                                value={selectedTeacher}
                                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-[#A60E07] md:hidden"
                                            >
                                                <option value="all">Barcha o'qituvchilar</option>
                                                {teachersData?.teachers?.map(teacher => (
                                                    <option key={teacher.id} value={teacher.id}>
                                                        {teacher.surname} {teacher.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : null}

                                        {!isTeacherRoute ? (
                                            <select
                                                value={selectedSubject}
                                                onChange={(e) => setSelectedSubject(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-[#A60E07] md:hidden"
                                            >
                                                <option value="all">Barcha fanlar</option>
                                                {subjectsData?.subjects?.map(subject => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : null}

                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm outline-none focus:border-[#A60E07] md:hidden"
                                        >
                                            <option value="all">Barcha holatlar</option>
                                            <option value="active">Faol</option>
                                            <option value="stopped">To'xtatilgan</option>
                                            <option value="finished">Bitirgan</option>
                                        </select>

                                        {hasActiveFilters ? (
                                            <button
                                                onClick={clearAllFilters}
                                                className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                                            >
                                                <XCircle className="mr-1 inline h-4 w-4" />
                                                Filtrlarni tozalash
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <Link href={`${basePath}/students/new`} className="md:hidden">
                            <button
                                aria-label="Yangi talaba qo'shish"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#A60E07] text-white shadow-md transition duration-200 hover:opacity-90"
                            >
                                <FiUserPlus size={18} />
                            </button>
                        </Link>

                        <Link href={`${basePath}/students/new`} className="hidden md:order-2 md:block lg:order-none">
                            <button
                                className="flex h-10 items-center justify-center gap-1 rounded-lg bg-[#A60E07] px-3 sm:px-4 text-sm font-semibold text-white shadow-md transition duration-200 hover:opacity-90">
                                <FiUserPlus size={18} />
                                Yangi Talaba
                            </button>
                        </Link>
                    </div>

                    {!isTeacherRoute ? (
                        <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedSubject('all')}
                                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                                    selectedSubject === 'all'
                                        ? 'border-[#A60E07] bg-[#A60E07] text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Barcha fanlar
                            </button>

                            {subjectsData?.subjects?.map((subject) => {
                                const subjectValue = String(subject.id);
                                return (
                                    <button
                                        key={subject.id}
                                        type="button"
                                        onClick={() => setSelectedSubject(subjectValue)}
                                        className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                                            selectedSubject === subjectValue
                                                ? 'border-[#A60E07] bg-[#A60E07] text-white'
                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {subject.name}
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}

                </div>
            </div>

            {/* Statistika bo'limi */}
            {/* {stats && stats.group_memberships && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 Statistika</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-700">{stats.total_students || 0}</div>
                            <div className="text-sm text-blue-600">Jami talabalar</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-700">{stats.group_memberships.active || 0}</div>
                            <div className="text-sm text-green-600">Faol</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="text-2xl font-bold text-orange-700">{stats.group_memberships.stopped || 0}</div>
                            <div className="text-sm text-orange-600">To'xtatilgan</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="text-2xl font-bold text-purple-700">{stats.group_memberships.finished || 0}</div>
                            <div className="text-sm text-purple-600">Bitirgan</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-2xl font-bold text-gray-700">{stats.unassigned_students || 0}</div>
                            <div className="text-sm text-gray-600">Guruhsiz</div>
                        </div>
                    </div>
                </div>
            )} */}

            <div className="space-y-3 md:hidden">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => {
                        const rowKey = `${student.id}-${student.group_id}-${index}`;
                        const statusInfo = getStatusInfo(student.group_status);
                        const isExpanded = !!mobileExpandedRows[rowKey];
                        const isNotInGroup = !student.group_name || student.group_name === 'Guruhga biriktirilmagan';
                        return (
                            <div
                                key={rowKey}
                                className={`rounded-xl border p-3 shadow-sm ${
                                    isNotInGroup ? 'border-orange-400 bg-orange-100' : 'border-gray-200 bg-white'
                                }`}
                            >
                                <div className="mb-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">{student.surname} {student.name}</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs text-gray-700">
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3 text-green-500" />
                                        <span><span className="font-medium text-gray-500">Telefon:</span> {student.phone || '-'}</span>
                                    </div>
                                    <p><span className="font-medium text-gray-500">Fan:</span> {getStudentSubjectName(student)}</p>
                                    <p><span className="font-medium text-gray-500">O'qituvchi:</span> {student.teacher_name?.trim() || '-'}</p>
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <AddGroup student={student} onSuccess={handleModalSuccess}>
                                        <div className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-white ${student.group_id ? 'bg-blue-500 hover:bg-blue-600' : 'bg-[#A60E07] hover:opacity-90'}`}>
                                            <FiUserPlus size={14} />
                                            {student.group_id ? "Guruhni yangilash" : "Guruhga qo'shish"}
                                        </div>
                                    </AddGroup>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openStudentEditModal(student)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                                            aria-label="Talaba ma'lumotlarini yangilash"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openStudentDeleteModal(student)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                                            aria-label="Talabani o'chirish"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleMobileCard(rowKey)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600"
                                            aria-label={isExpanded ? "Qo'shimcha ma'lumotlarni yopish" : "Qo'shimcha ma'lumotlarni ochish"}
                                        >
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded ? (
                                    <div className="mt-2 space-y-1.5 rounded-lg border border-gray-100 bg-white p-2 text-xs text-gray-700">
                                        {student.phone2 ? (
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3 text-green-400" />
                                                <span><span className="font-medium text-gray-500">Qo'shimcha:</span> {student.phone2}</span>
                                            </div>
                                        ) : null}

                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3 text-purple-500" />
                                            <span>
                                                <span className="font-medium text-gray-500">Otasi / Onasi / yaqini:</span> {student.father_name || '-'} {student.father_phone ? `(${student.father_phone})` : ''}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-orange-500" />
                                            <span><span className="font-medium text-gray-500">Yoshi:</span> {student.age || '-'}</span>
                                        </div>

                                        {student.address ? (
                                            <div className="flex items-start gap-1">
                                                <Home className="mt-0.5 h-3 w-3 text-indigo-500" />
                                                <span className="break-words"><span className="font-medium text-gray-500">Manzil:</span> {student.address}</span>
                                            </div>
                                        ) : null}

                                        {getStudentUsername(student) ? (
                                            <div className="flex items-start gap-1">
                                                <UserCheck className="mt-0.5 h-3 w-3 text-blue-500" />
                                                <span className="break-words"><span className="font-medium text-gray-500">Foydalanuvchi nomi:</span> {getStudentUsername(student)}</span>
                                            </div>
                                        ) : null}

                                        <p><span className="font-medium text-gray-500">Ro'yxatdan sana:</span> {student.registration_date?.split('T')[0] || '-'}</p>

                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium text-gray-500">Guruh:</span>
                                            {student.group_id && student.group_name ? (
                                                <Link href={`${basePath}/groups/${student.group_id}`} className="truncate font-bold text-[#A60E07] underline">
                                                    {student.group_name}
                                                </Link>
                                            ) : (
                                                <span className="rounded-md bg-orange-50 px-2 py-0.5 text-orange-700">Guruhga biriktirilmagan</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Building2 className="h-3 w-3 text-amber-600" />
                                            {student.room_number ? (
                                                <span>
                                                    <span className="font-medium text-gray-500">Xona:</span> {student.room_number}
                                                    {student.room_capacity ? ` (${student.room_capacity} o'rinlik)` : ''}
                                                    {student.has_projector ? ' • Proyektor ✓' : ''}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500"><span className="font-medium">Xona:</span> belgilanmagan</span>
                                            )}
                                        </div>

                                        {student.class_start_date ? (
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <Clock className="h-3 w-3" />
                                                <span>Dars boshlangan: {student.class_start_date.slice(0, 10)}</span>
                                            </div>
                                        ) : null}

                                        <div className="pt-1">
                                            {student.group_admin_status === 'blocked' ? (
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                                    ❌ Guruh bloklangan
                                                </span>
                                            ) : student.group_status === 'finished' ? (
                                                <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                                    Guruhni bitirgan {student.group_left_at ? `(${student.group_left_at.slice(0, 10)})` : ''}
                                                </span>
                                            ) : student.group_status === 'stopped' ? (
                                                <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                                    Guruhni to'xtatgan {student.group_left_at ? `(${student.group_left_at.slice(0, 10)})` : ''}
                                                </span>
                                            ) : student.group_class_status === 'not_started' ? (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                                    ⏳ Dars hali boshlanmagan
                                                </span>
                                            ) : student.group_status === 'active' && student.group_class_status === 'started' ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                    Darslar davom etmoqda
                                                </span>
                                            ) : null}
                                        </div>

                                        {student.recovery_key ? (
                                            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRecoveryKey(rowKey)}
                                                        className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-amber-800"
                                                    >
                                                        <KeyIcon className="h-3.5 w-3.5" />
                                                        Recovery key
                                                    </button>
                                                    {visibleRecoveryKeys[rowKey] ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => copyRecoveryKey(rowKey, student.recovery_key)}
                                                            className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-gray-700"
                                                        >
                                                            {copiedRecoveryRow === rowKey ? (
                                                                <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 text-green-600" />
                                                            ) : (
                                                                <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                                                            )}
                                                            {copiedRecoveryRow === rowKey ? "Nusxalandi" : "Nusxa olish"}
                                                        </button>
                                                    ) : null}
                                                </div>
                                                {visibleRecoveryKeys[rowKey] ? (
                                                    <p className="mt-2 break-all rounded-md bg-white px-2 py-1.5 text-[11px] font-bold text-amber-900">
                                                        {student.recovery_key}
                                                    </p>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })
                ) : isInitialLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={`sk-m-${index}`} className="rounded-xl border border-gray-200 bg-white p-3 animate-pulse">
                                <div className="mb-2">
                                    <div className="h-4 w-40 rounded bg-gray-200"></div>
                                </div>
                                <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-2">
                                    <div className="h-3 w-44 rounded bg-gray-200"></div>
                                    <div className="h-3 w-36 rounded bg-gray-200"></div>
                                    <div className="h-3 w-40 rounded bg-gray-200"></div>
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <div className="h-9 w-28 rounded bg-gray-200"></div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded bg-gray-200"></div>
                                        <div className="h-8 w-8 rounded bg-gray-200"></div>
                                        <div className="h-8 w-8 rounded bg-gray-200"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : showEmptyState ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                        Talaba topilmadi
                    </div>
                ) : null}
            </div>

            <div className="hidden rounded-lg border border-gray-300 bg-white shadow-lg overflow-x-auto md:block">
                <table className="min-w-[1200px] w-full divide-y divide-gray-300 border-collapse">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-400">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[220px] border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Student ma'lumotlari</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[250px] border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Guruh / Kurs ma'lumotlari</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Ro'yxatdan sana</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider border-r border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">Talaba holati</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => {
                                const rowKey = `${student.id}-${student.group_id}-${index}`;
                                const isEditing = editingId === rowKey;
                                const isNotInGroup = !student.group_name || student.group_name === 'Guruhga biriktirilmagan';

                                return (
                                    <tr key={rowKey} className={`${isEditing ? 'bg-blue-50 border-l-4 border-blue-400' :
                                            isNotInGroup ? 'bg-orange-100 border-l-4 border-orange-400' :
                                                (index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100')
                                        } transition duration-150 border-b border-gray-200`}>
                                        <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1">
                                                    <EditableCell name="name" value={editData.name} onChange={handleEditChange} placeholder="Ism" />
                                                    <EditableCell name="surname" value={editData.surname} onChange={handleEditChange} placeholder="Familiya" />
                                                    <EditableCell name="phone" value={editData.phone} onChange={handleEditChange} placeholder="Telefon" />
                                                    <EditableCell name="phone2" value={editData.phone2} onChange={handleEditChange} placeholder="Qo'shimcha telefon" />
                                                    <EditableCell name="father_name" value={editData.father_name} onChange={handleEditChange} placeholder="Otasining ismi" />
                                                    <EditableCell name="father_phone" value={editData.father_phone} onChange={handleEditChange} placeholder="Otasining telefoni" />
                                                    <EditableCell name="address" value={editData.address} onChange={handleEditChange} placeholder="Manzil" />
                                                    <EditableCell name="age" type="number" value={editData.age} onChange={handleEditChange} placeholder="Yoshi" />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className='text-lg font-bold text-red-500'>#{student.id}</span>
                                                        <User className="h-4 w-4 text-blue-500" />
                                                        <span className="font-semibold text-gray-900">{student.surname} {student.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => openStudentEditModal(student)}
                                                            className="ml-auto inline-flex items-center justify-center rounded-lg border border-gray-200 p-1.5 text-gray-600 transition hover:bg-gray-50"
                                                            aria-label="Talaba ma'lumotlarini yangilash"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openStudentDeleteModal(student)}
                                                            className="inline-flex items-center justify-center rounded-lg border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
                                                            aria-label="Talabani o'chirish"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Phone className="h-3 w-3 text-green-500" />
                                                            <span>{student.phone}</span>
                                                        </div>

                                                        {student.phone2 && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                <Phone className="h-3 w-3 text-green-400" />
                                                                <span>{student.phone2}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <User className="h-3 w-3 text-purple-500" />
                                                            <span><strong>Otasi / Onasi / yaqini:</strong> {student.father_name} ({student.father_phone})</span>
                                                        </div>

                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Calendar className="h-3 w-3 text-orange-500" />
                                                            <span><strong>Yoshi:</strong> {student.age}</span>
                                                        </div>

                                                        {student.address && (
                                                            <div className="flex items-start gap-1 text-xs text-gray-600">
                                                                <Home className="h-3 w-3 text-indigo-500 mt-0.5" />
                                                                <span className="break-words" title={student.address}><strong>Manzil:</strong> {student.address}</span>
                                                            </div>
                                                        )}

                                                        {getStudentUsername(student) && (
                                                            <div className="flex items-start gap-1 text-xs text-gray-600">
                                                                <UserCheck className="h-3 w-3 text-blue-500 mt-0.5" />
                                                                <span className="break-words"><strong>Foydalanuvchi nomi:</strong> {getStudentUsername(student)}</span>
                                                            </div>
                                                        )}

                                                        {student.recovery_key ? (
                                                            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleRecoveryKey(rowKey)}
                                                                        className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100"
                                                                    >
                                                                        <KeyIcon className="h-3.5 w-3.5" />
                                                                        Recovery key
                                                                    </button>
                                                                    {visibleRecoveryKeys[rowKey] ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => copyRecoveryKey(rowKey, student.recovery_key)}
                                                                            className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                                                                        >
                                                                            {copiedRecoveryRow === rowKey ? (
                                                                                <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 text-green-600" />
                                                                            ) : (
                                                                                <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                                                                            )}
                                                                            {copiedRecoveryRow === rowKey ? "Nusxalandi" : "Nusxa olish"}
                                                                        </button>
                                                                    ) : null}
                                                                </div>
                                                                {visibleRecoveryKeys[rowKey] ? (
                                                                    <p className="mt-2 break-all rounded-md bg-white px-2 py-1.5 text-[11px] font-bold text-amber-900">
                                                                        {student.recovery_key}
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                            {isEditing ? (
                                                <div className="flex flex-col">
                                                    <EditableCell name="group_name" value={editData.group_name} onChange={handleEditChange} placeholder="Guruh nomi..." />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    {/* Guruh nomi va tahrirlash tugmasi */}
                                                    <div className="flex items-center gap-2">
                                                        {student.group_id && student.group_name ? (
                                                            <Link href={`${basePath}/groups/${student.group_id}`} className="font-bold text-[#A60E07] text-sm hover:underline">
                                                                {student.group_name}
                                                            </Link>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                                                                <AlertCircle className="h-3 w-3 text-orange-500" />
                                                                <span className="text-xs text-orange-700 font-medium">Guruhga biriktirilmagan</span>
                                                            </div>
                                                        )}
                                                        <AddGroup student={student} onSuccess={handleModalSuccess}>
                                                            <div className={`p-1.5 rounded-lg text-white transition duration-200 flex-shrink-0 cursor-pointer ${student.group_id ? 'bg-blue-500 hover:bg-blue-600' : 'bg-[#A60E07] hover:opacity-90'}`}>
                                                                <FiUserPlus size={14} />
                                                            </div>
                                                        </AddGroup>
                                                    </div>

                                                    {/* Guruhga biriktirilgan studentlar uchun ma'lumotlar */}
                                                    {student.group_id ? (
                                                        <div className="space-y-1.5 mt-2">
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <GraduationCap className="h-3 w-3 text-blue-600" />
                                                                <span className="font-medium text-gray-700">O'qituvchi:</span>
                                                                <span className="text-gray-900">{student.teacher_name?.trim() || 'Tayinlanmagan'}</span>
                                                            </div>

                                                            <div className="flex items-center gap-1 text-xs">
                                                                <BookOpen className="h-3 w-3 text-green-600" />
                                                                <span className="font-medium text-gray-700">Fan:</span>
                                                                <span className="text-gray-900">{getStudentSubjectName(student)}</span>
                                                            </div>

                                                            <div className="flex items-center gap-1 text-xs">
                                                                <Building2 className="h-3 w-3 text-amber-600" />
                                                                <span className="font-medium text-gray-700">Xona:</span>
                                                                {student.room_number ? (
                                                                    <span className="text-gray-900">
                                                                        {student.room_number}
                                                                        {student.room_capacity && ` (${student.room_capacity} o'rinlik)`}
                                                                        {student.has_projector && <span className="text-green-600 text-xs"> • Proyektor ✓</span>}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-500 italic">Xonasi hali belgilanmagan</span>
                                                                )}
                                                            </div>

                                                            {/* {student.group_joined_at && (
                                                                <div className="flex items-center gap-1 text-xs">
                                                                    <Calendar className="h-3 w-3 text-purple-600" />
                                                                    <span className="font-medium text-gray-700">Guruhga qo'shilgan:</span>
                                                                    <span className="text-gray-900">{student.class_start_date?.slice(0, 10)}</span>
                                                                </div>
                                                            )} */}

                                                            {/* Dars boshlangan sana */}
                                                            {student.class_start_date && (
                                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>Dars boshlangan: <span>
                                                                        {student.class_start_date.slice(0, 10)}
                                                                    </span></span>
                                                                </div>
                                                            )}

                                                            {/* Guruh va dars holatlari */}
                                                            <div className="flex items-center gap-1 mt-2">
                                                                {(() => {
                                                                    // 1. Guruh bloklangan
                                                                    if (student.group_admin_status === 'blocked') {
                                                                        return (
                                                                            <>
                                                                                <ShieldBan className="h-3 w-3 text-red-500" />
                                                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-700">
                                                                                    ❌ Guruh bloklangan
                                                                                </span>
                                                                            </>
                                                                        );
                                                                    }

                                                                    // 2. Talaba bu guruhni tugatgan
                                                                    if (student.group_status === 'finished') {
                                                                        return (
                                                                            <>
                                                                                <Award className="h-3 w-3 text-purple-500" />
                                                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-purple-100 text-purple-700">
                                                                                     Guruhni bitirgan                                                                                    {student.group_left_at && (
                                                                                        <span className="ml-1">
                                                                                            ({student.group_left_at.slice(0, 10)})
                                                                                        </span>
                                                                                    )}                                                                                </span>
                                                                            </>
                                                                        );
                                                                    }

                                                                    // 3. Talaba guruhni to'xtatgan
                                                                    if (student.group_status === 'stopped') {
                                                                        return (
                                                                            <>
                                                                                <PauseCircle className="h-3 w-3 text-orange-500" />
                                                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-orange-100 text-orange-700">
                                                                                    Guruhni to'xtatgan
                                                                                    {student.group_left_at && (
                                                                                        <span className="ml-1">
                                                                                            ({student.group_left_at.slice(0, 10)})
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                            </>
                                                                        );
                                                                    }

                                                                    // 4. Dars hali boshlanmagan
                                                                    if (student.group_class_status === 'not_started') {
                                                                        return (
                                                                            <>
                                                                                <AlertCircle className="h-3 w-3 text-gray-500" />
                                                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-gray-100 text-gray-700">
                                                                                    ⏳ Dars hali boshlanmagan
                                                                                </span>
                                                                            </>
                                                                        );
                                                                    }

                                                                    // 5. Faol va dars davom etmoqda
                                                                    if (student.group_status === 'active' && student.group_class_status === 'started') {
                                                                        return (
                                                                            <>
                                                                                <PlayCircle className="h-3 w-3 text-green-500" />
                                                                                <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-green-100 text-green-700">
                                                                                    Darslar davom etmoqda
                                                                                </span>
                                                                            </>
                                                                        );
                                                                    }

                                                                    return null;
                                                                })()}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2 flex items-center gap-1 text-xs">
                                                            <BookOpen className="h-3 w-3 text-green-600" />
                                                            <span className="font-medium text-gray-700">Qabuldagi fan:</span>
                                                            <span className="text-gray-900">{getStudentSubjectName(student)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                            {isEditing ? (
                                                <EditableCell name="registration_date" type="date" value={editData.registration_date} onChange={handleEditChange} />
                                            ) : (student.registration_date?.split('T')[0])}
                                        </td>

                                        <td className="px-4 py-3 border-r border-gray-200 text-sm">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-2">
                                                    <select
                                                        name="status"
                                                        value={editData.status}
                                                        onChange={handleEditChange}
                                                        className="p-2 border border-[#A60E07] rounded w-full text-sm outline-none transition duration-200 focus:ring-1 focus:ring-[#A60E07]"
                                                    >
                                                        <option value="active"> Faol</option>
                                                        <option value="stopped"> To'xtatilgan</option>
                                                        <option value="finished"> Bitirgan</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {student.group_id ? (
                                                        /* Custom Status select for students with groups */
                                                        <div className="relative status-dropdown">
                                                            <div
                                                                onClick={() => setStatusDropdownOpen(statusDropdownOpen === `${student.id}-${student.group_id}` ? null : `${student.id}-${student.group_id}`)}
                                                                className={`w-full p-2 pr-8 border border-gray-300 rounded-lg text-sm cursor-pointer hover:border-gray-400 transition-colors ${student.group_status === 'active' ? 'bg-green-50 text-green-800 border-green-300' :
                                                                        student.group_status === 'stopped' ? 'bg-orange-50 text-orange-800 border-orange-300' :
                                                                            student.group_status === 'finished' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                                                                                'bg-gray-50 text-gray-800 border-gray-300'
                                                                    } ${updateStatusMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {React.createElement(getStatusInfo(student.group_status).icon, {
                                                                        className: `h-4 w-4 ${getStatusInfo(student.group_status).iconColor}`
                                                                    })}
                                                                    <span className="font-medium">{getStatusInfo(student.group_status).label}</span>
                                                                </div>
                                                            </div>

                                                            {/* Dropdown arrow */}
                                                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </div>

                                                            {/* Custom dropdown menu */}
                                                            {statusDropdownOpen === `${student.id}-${student.group_id}` && (
                                                                <div className="absolute left-0 top-full mt-1 z-20 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-y-auto">
                                                                    {getAllStatusOptions().map((statusOption) => {
                                                                        const Icon = statusOption.icon;
                                                                        const isSelected = student.group_status === statusOption.value;
                                                                        return (
                                                                            <div
                                                                                key={statusOption.value}
                                                                                onClick={() => {
                                                                                    if (!updateStatusMutation.isLoading) {
                                                                                        handleStatusChange(student.id, statusOption.value, student.group_id);
                                                                                    }
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors ${statusOption.value === 'active' ? 'hover:bg-green-50 text-green-800' :
                                                                                        statusOption.value === 'stopped' ? 'hover:bg-orange-50 text-orange-800' :
                                                                                            statusOption.value === 'finished' ? 'hover:bg-purple-50 text-purple-800' :
                                                                                                'hover:bg-gray-50 text-gray-800'
                                                                                    } ${isSelected ?
                                                                                        statusOption.value === 'active' ? 'bg-green-100 text-green-900' :
                                                                                            statusOption.value === 'stopped' ? 'bg-orange-100 text-orange-900' :
                                                                                                statusOption.value === 'finished' ? 'bg-purple-100 text-purple-900' :
                                                                                                    'bg-gray-100 text-gray-900'
                                                                                        : ''
                                                                                    } ${updateStatusMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                            >
                                                                                <Icon className={`h-4 w-4 ${statusOption.iconColor}`} />
                                                                                <span className="font-medium">{statusOption.label}</span>
                                                                                {isSelected && (
                                                                                    <CheckCircle className="h-3 w-3 ml-auto text-current" />
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        /* Display for unassigned students */
                                                        <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                                                            <AlertCircle className="h-3 w-3 text-orange-500" />
                                                            <span className="text-xs text-orange-700 font-medium">Guruhga biriktirilmagan</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                    </tr>
                                );
                            })
                        ) : isInitialLoading ? (
                            <>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <tr key={`sk-d-${index}`} className="bg-white animate-pulse">
                                        <td className="px-4 py-3 border-r border-gray-200">
                                            <div className="space-y-2">
                                                <div className="h-4 w-40 rounded bg-gray-200"></div>
                                                <div className="h-3 w-28 rounded bg-gray-200"></div>
                                                <div className="h-3 w-32 rounded bg-gray-200"></div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 border-r border-gray-200">
                                            <div className="space-y-2">
                                                <div className="h-4 w-36 rounded bg-gray-200"></div>
                                                <div className="h-3 w-28 rounded bg-gray-200"></div>
                                                <div className="h-3 w-32 rounded bg-gray-200"></div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 border-r border-gray-200">
                                            <div className="h-3 w-24 rounded bg-gray-200"></div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="h-6 w-28 rounded-full bg-gray-200"></div>
                                        </td>
                                    </tr>
                                ))}
                            </>
                        ) : showEmptyState ? (
                            <tr className="bg-white">
                                <td colSpan="4" className="px-4 py-12 text-center text-gray-500 border-b border-gray-200">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                            <User className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div className="text-lg font-medium">Talaba topilmadi</div>
                                        <p className="text-sm text-gray-400 max-w-md text-center">
                                            Qidiruv shartlaringizga mos talaba mavjud emas. Filterlarni o'zgartirib ko'ring.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            {(totalPages > 1 && currentPage < totalPages) && (
                <div ref={loadMoreRef} className="mt-3 flex items-center justify-center text-xs text-gray-500">
                    {isFetching ? "Yuklanmoqda..." : "Yana yuklash uchun pastga tushing"}
                </div>
            )}

            <StudentEditModal
                isOpen={studentEditModal.open}
                onClose={closeStudentEditModal}
                student={studentEditModal.student}
                formData={studentEditForm}
                onChange={handleStudentEditChange}
                onSubmit={handleStudentEditSubmit}
                isLoading={updateStudentMutation.isLoading}
            />
            <StudentDeleteModal
                isOpen={studentDeleteModal.open}
                onClose={closeStudentDeleteModal}
                student={studentDeleteModal.student}
                onConfirm={handleStudentDelete}
                isLoading={deleteStudentMutation.isLoading}
            />

            {showScrollTop && (
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#A60E07] text-white shadow-lg transition hover:opacity-90"
                    aria-label="Yuqoriga chiqish"
                >
                    <ChevronUp className="h-5 w-5" />
                </button>
            )}

        </div>
    );
};

export default StudentsPage;

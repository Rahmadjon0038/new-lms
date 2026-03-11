'use client'
import React, { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
    XMarkIcon,
    UserGroupIcon,
    TrashIcon,
    UserMinusIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import {
    useBulkChangeStudentsGroup,
    useBulkJoinStudentsToGroup,
    useBulkRemoveStudentsFromGroup,
    useChangeStudentGroup,
    useRemoveStudentFromGroup,
    usegetAllgroups
} from '../../hooks/groups';
import { useGetAllStudents, useJoinStudentToGroup } from '../../hooks/students';
import { usegetProfile } from '../../hooks/user';
import { toast } from 'react-hot-toast';

const getTeacherIdFromProfile = (profile) => {
    const payload = profile?.data || profile;
    return (
        payload?.teacher_id ||
        payload?.id ||
        payload?.user_id ||
        ''
    );
};

const AddGroup = ({ children, student, onSuccess, isInGroup = false }) => {
    const pathname = usePathname();
    const isTeacherRoute = pathname?.startsWith('/teacher');
    const { data: profileData } = usegetProfile();
    const teacherId = String(getTeacherIdFromProfile(profileData) || '');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'

    // Single action states
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [actionType, setActionType] = useState('join'); // 'join' | 'change' | 'remove'

    // Bulk action states
    const [bulkSearchTerm, setBulkSearchTerm] = useState('');
    const [bulkSelectedIds, setBulkSelectedIds] = useState([]);
    const [bulkActionType, setBulkActionType] = useState('join'); // 'join' | 'change' | 'remove'
    const [bulkSourceGroupId, setBulkSourceGroupId] = useState('');
    const [bulkTargetGroupId, setBulkTargetGroupId] = useState('');
    const [bulkSubjectFilter, setBulkSubjectFilter] = useState('all');
    const [bulkOnlyUnassigned, setBulkOnlyUnassigned] = useState(true);

    const { data: groupsData, isLoading: groupsLoading } = usegetAllgroups(
        undefined,
        isTeacherRoute ? teacherId : undefined,
        undefined,
        { enabled: !isTeacherRoute || Boolean(teacherId) }
    );
    const { data: allStudentsData, isLoading: studentsLoading } = useGetAllStudents(
        isTeacherRoute ? { teacher_id: teacherId } : {},
        { enabled: isModalOpen && activeTab === 'bulk' && (!isTeacherRoute || Boolean(teacherId)) }
    );

    const joinStudentMutation = useJoinStudentToGroup();
    const changeGroupMutation = useChangeStudentGroup();
    const removeStudentMutation = useRemoveStudentFromGroup();

    const bulkJoinMutation = useBulkJoinStudentsToGroup();
    const bulkChangeMutation = useBulkChangeStudentsGroup();
    const bulkRemoveMutation = useBulkRemoveStudentsFromGroup();

    const hasGroup = student?.group_name && student.group_name !== 'Guruh biriktirilmagan';
    const isSingleLoading = joinStudentMutation.isLoading || changeGroupMutation.isLoading || removeStudentMutation.isLoading;
    const isBulkLoading = bulkJoinMutation.isLoading || bulkChangeMutation.isLoading || bulkRemoveMutation.isLoading;

    const availableGroups = useMemo(
        () => groupsData?.groups?.filter((group) => group.status !== 'blocked') || [],
        [groupsData]
    );

    const availableGroupsMap = useMemo(
        () => new Map(availableGroups.map((group) => [Number(group.id), group])),
        [availableGroups]
    );

    const getScheduleText = (group) => {
        const schedule = group?.schedule;

        if (typeof schedule === 'string' && schedule.trim()) return schedule;
        if (schedule && typeof schedule === 'object') {
            const days = Array.isArray(schedule.days) ? schedule.days.join(', ') : schedule.days;
            const time = schedule.time || group?.time || '';
            return [days, time].filter(Boolean).join(' ');
        }

        return group?.time || group?.class_time || '';
    };

    const getGroupOptionLabel = (group) => {
        const groupName = group?.name || group?.group_name || `Guruh #${group?.id || '-'}`;
        const subjectName = group?.subject_name || group?.subject?.name || group?.subject || '-';
        const teacherName = group?.teacher_name || group?.teacher || "Noma'lum";
        const scheduleText = getScheduleText(group) || '-';

        return `${groupName} | Fan: ${subjectName} | Jadval: ${scheduleText} | O'qituvchi: ${teacherName}`;
    };

    const bulkStudents = useMemo(() => {
        const list = allStudentsData?.students || [];
        return list.map((item) => {
            const groups = Array.isArray(item.groups) ? item.groups : [];
            const currentSubjects = Array.from(
                new Set(
                    groups
                        .map((group) => group.subject_name)
                        .filter(Boolean)
                )
            );
            const plannedSubject = item.registered_subject_name || item.subject_name || null;
            const subjectNames = Array.from(
                new Set([plannedSubject, ...currentSubjects].filter(Boolean))
            );

            return {
                id: Number(item.id),
                name: item.name || '',
                surname: item.surname || '',
                phone: item.phone || '',
                groups,
                currentSubjects,
                plannedSubject,
                subjectNames
            };
        });
    }, [allStudentsData]);

    const filteredBulkStudents = useMemo(() => {
        return bulkStudents.filter((item) => {
            if (bulkOnlyUnassigned && item.groups.length > 0) return false;
            if (bulkSubjectFilter !== 'all' && !item.subjectNames.includes(bulkSubjectFilter)) return false;

            if (!bulkSearchTerm.trim()) return true;
            const search = bulkSearchTerm.trim().toLowerCase();
            const fullName = `${item.name} ${item.surname}`.trim().toLowerCase();
            return (
                fullName.includes(search) ||
                String(item.id).includes(search) ||
                (item.phone || '').replace(/\s/g, '').includes(search.replace(/\s/g, ''))
            );
        });
    }, [bulkOnlyUnassigned, bulkSearchTerm, bulkStudents, bulkSubjectFilter]);

    const subjectFilterOptions = useMemo(() => (
        Array.from(
            new Set(
                bulkStudents
                    .flatMap((item) => item.subjectNames)
                    .filter(Boolean)
            )
        )
    ), [bulkStudents]);

    const allVisibleSelected = filteredBulkStudents.length > 0 &&
        filteredBulkStudents.every((item) => bulkSelectedIds.includes(item.id));

    const someVisibleSelected = filteredBulkStudents.some((item) => bulkSelectedIds.includes(item.id));

    const sourceGroupOptions = useMemo(() => {
        if (!bulkSelectedIds.length) return [];
        const selectedSet = new Set(bulkSelectedIds);
        const unique = new Map();

        bulkStudents.forEach((item) => {
            if (!selectedSet.has(item.id)) return;
            item.groups.forEach((group) => {
                const groupId = Number(group.group_id);
                if (groupId && !unique.has(groupId)) {
                    unique.set(groupId, {
                        id: groupId,
                        group_name: group.group_name || `Guruh #${groupId}`,
                        subject_name: group.subject_name,
                        teacher_name: group.teacher_name,
                        schedule: group.schedule,
                        time: group.time
                    });
                }
            });
        });

        return Array.from(unique.entries()).map(([id, group]) => ({ id, group }));
    }, [bulkSelectedIds, bulkStudents]);

    const handleModalClose = React.useCallback(() => {
        setIsModalOpen(false);
        setSelectedGroupId('');
        setActionType('join');
        setBulkSearchTerm('');
        setBulkSelectedIds([]);
        setBulkSourceGroupId('');
        setBulkTargetGroupId('');
        setBulkActionType('join');
        setBulkSubjectFilter('all');
        setBulkOnlyUnassigned(true);
        setActiveTab('single');
    }, []);

    const handleSingleSubmit = (e) => {
        e.preventDefault();

        if (actionType === 'remove') {
            if (!student?.group_id) {
                toast.error('Talabaning guruhi topilmadi');
                return;
            }
            removeStudentMutation.mutate(
                {
                    group_id: Number(student.group_id),
                    student_id: Number(student.id)
                },
                {
                    onSuccess: () => {
                        toast.success('Talaba guruhdan chiqarildi');
                        onSuccess?.();
                        handleModalClose();
                    },
                    onError: (error) => {
                        toast.error(error?.response?.data?.message || 'Guruhdan chiqarishda xatolik');
                    }
                }
            );
            return;
        }

        if (!selectedGroupId) {
            toast.error('Guruhni tanlang');
            return;
        }

        if (actionType === 'change') {
            changeGroupMutation.mutate(
                {
                    student_id: Number(student.id),
                    new_group_id: Number(selectedGroupId)
                },
                {
                    onSuccess: () => {
                        toast.success("Talaba guruhi o'zgartirildi");
                        onSuccess?.();
                        handleModalClose();
                    },
                    onError: (error) => {
                        toast.error(error?.response?.data?.message || "Guruhni o'zgartirishda xatolik");
                    }
                }
            );
            return;
        }

        joinStudentMutation.mutate(
            {
                student_id: Number(student.id),
                group_id: Number(selectedGroupId)
            },
            {
                onSuccess: () => {
                    toast.success("Talaba guruhga qo'shildi");
                    onSuccess?.();
                    handleModalClose();
                },
                onError: (error) => {
                    toast.error(error?.response?.data?.message || "Guruhga qo'shishda xatolik");
                }
            }
        );
    };

    const handleToggleSelectAll = () => {
        if (!filteredBulkStudents.length) return;
        if (allVisibleSelected) {
            const visibleIds = new Set(filteredBulkStudents.map((item) => item.id));
            setBulkSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
            return;
        }
        const merged = new Set(bulkSelectedIds);
        filteredBulkStudents.forEach((item) => merged.add(item.id));
        setBulkSelectedIds(Array.from(merged));
    };

    const handleToggleStudent = (id) => {
        setBulkSelectedIds((prev) => (
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        ));
    };

    const handleBulkAction = async () => {
        if (!bulkSelectedIds.length) {
            toast.error('Kamida bitta talaba tanlang');
            return;
        }

        if ((bulkActionType === 'join' || bulkActionType === 'change') && !bulkTargetGroupId) {
            toast.error('Target guruhni tanlang');
            return;
        }

        try {
            let response;
            if (bulkActionType === 'join') {
                response = await bulkJoinMutation.mutateAsync({
                    group_id: Number(bulkTargetGroupId),
                    student_ids: bulkSelectedIds
                });
            } else if (bulkActionType === 'remove') {
                const selectedSet = new Set(bulkSelectedIds);
                const groupStudentMap = new Map();

                bulkStudents.forEach((item) => {
                    if (!selectedSet.has(item.id)) return;

                    item.groups.forEach((group) => {
                        const groupId = Number(group.group_id);
                        if (!groupId) return;
                        if (bulkSourceGroupId && Number(bulkSourceGroupId) !== groupId) return;

                        if (!groupStudentMap.has(groupId)) {
                            groupStudentMap.set(groupId, new Set());
                        }
                        groupStudentMap.get(groupId).add(item.id);
                    });
                });

                if (!groupStudentMap.size) {
                    toast.error("Tanlangan talabalar uchun chiqariladigan guruh topilmadi");
                    return;
                }

                let removed = 0;
                let skipped = 0;
                let failed = 0;

                for (const [groupId, studentSet] of groupStudentMap.entries()) {
                    const removeResult = await bulkRemoveMutation.mutateAsync({
                        group_id: groupId,
                        student_ids: Array.from(studentSet)
                    });
                    const summary = removeResult?.summary || {};
                    removed += Number(summary.removed || 0);
                    skipped += Number(summary.skipped || 0);
                    failed += Number(summary.failed || 0);
                }

                response = {
                    summary: {
                        requested: bulkSelectedIds.length,
                        removed,
                        skipped,
                        failed
                    }
                };
            } else {
                response = await bulkChangeMutation.mutateAsync({
                    from_group_id: bulkSourceGroupId ? Number(bulkSourceGroupId) : undefined,
                    new_group_id: Number(bulkTargetGroupId),
                    student_ids: bulkSelectedIds
                });
            }

            toast.success('Ommaviy amal bajarildi');
            setBulkSelectedIds([]);
            onSuccess?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Ommaviy amalda xatolik');
        }
    };

    const handleActionTypeChange = (type) => {
        setActionType(type);
        setSelectedGroupId('');
    };

    const handleOpenModal = () => {
        const currentHasGroup = student?.group_name && student.group_name !== 'Guruh biriktirilmagan';
        setActiveTab('single');
        setActionType(isInGroup ? (currentHasGroup ? 'change' : 'remove') : (currentHasGroup ? 'change' : 'join'));
        setIsModalOpen(true);
    };

    return (
        <>
            <div onClick={handleOpenModal}>
                {children}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
                    <div className="w-full max-h-[94vh] overflow-y-auto rounded-t-2xl bg-white p-4 sm:mx-4 sm:max-w-5xl sm:rounded-lg sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center text-lg font-semibold text-gray-800 sm:text-xl">
                                <UserGroupIcon className="mr-2 h-5 w-5 text-[#A60E07] sm:h-6 sm:w-6" />
                                Talaba guruh boshqaruvi
                            </h3>
                            <button
                                onClick={handleModalClose}
                                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mb-5 flex gap-2 border-b border-gray-200 pb-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab('single')}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                    activeTab === 'single'
                                        ? 'bg-[#A60E07] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Bitta talaba
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('bulk')}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                    activeTab === 'bulk'
                                        ? 'bg-[#A60E07] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Ommaviy qo&apos;shish
                            </button>
                        </div>

                        {activeTab === 'single' ? (
                            <>
                                <div className="mb-4 rounded-lg bg-gray-50 p-3 sm:mb-6 sm:p-4">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-base font-medium text-gray-800 sm:text-lg">
                                                {student?.name} {student?.surname}
                                            </p>
                                        </div>
                                        <div className="sm:text-right">
                                            {hasGroup ? (
                                                <div>
                                                    <p className="text-sm font-medium text-blue-600">
                                                        Hozirgi guruh: {student?.group_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        O&apos;qituvchi: {student?.teacher_name || 'Noma&apos;lum'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-orange-600">Guruh biriktirilmagan</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4 sm:mb-6">
                                    <h4 className="mb-3 text-sm font-medium text-gray-700">Amalni tanlang:</h4>
                                    <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3">
                                        {!isInGroup && (
                                            <button
                                                type="button"
                                                onClick={() => handleActionTypeChange('join')}
                                                disabled={isSingleLoading}
                                                className={`rounded-lg border-2 p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:p-4 sm:text-center ${
                                                    actionType === 'join'
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                <UserGroupIcon className="mb-1 h-5 w-5 sm:mx-auto sm:mb-2 sm:h-6 sm:w-6" />
                                                <p className="text-sm font-medium">Guruhga qo&apos;shish</p>
                                                <p className="text-xs opacity-75">Yangi guruhga biriktirish</p>
                                            </button>
                                        )}

                                        {hasGroup && (
                                            <button
                                                type="button"
                                                onClick={() => handleActionTypeChange('change')}
                                                disabled={isSingleLoading}
                                                className={`rounded-lg border-2 p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:p-4 sm:text-center ${
                                                    actionType === 'change'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                <ArrowRightOnRectangleIcon className="mb-1 h-5 w-5 sm:mx-auto sm:mb-2 sm:h-6 sm:w-6" />
                                                <p className="text-sm font-medium">Guruhni o&apos;zgartirish</p>
                                                <p className="text-xs opacity-75">Boshqa guruhga ko&apos;chirish</p>
                                            </button>
                                        )}

                                        {hasGroup && (
                                            <button
                                                type="button"
                                                onClick={() => handleActionTypeChange('remove')}
                                                disabled={isSingleLoading}
                                                className={`rounded-lg border-2 p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:p-4 sm:text-center ${
                                                    actionType === 'remove'
                                                        ? 'border-red-500 bg-red-50 text-red-700'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                <UserMinusIcon className="mb-1 h-5 w-5 sm:mx-auto sm:mb-2 sm:h-6 sm:w-6" />
                                                <p className="text-sm font-medium">Guruhdan chiqarish</p>
                                                <p className="text-xs opacity-75">Hozirgi guruhdan olib tashlash</p>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <form onSubmit={handleSingleSubmit}>
                                    {actionType !== 'remove' && (
                                        <div className="mb-4 sm:mb-6">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                {actionType === 'change' ? 'Yangi guruhni tanlang' : 'Guruhni tanlang'} *
                                            </label>
                                            <select
                                                value={selectedGroupId}
                                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#A60E07]"
                                                disabled={groupsLoading || isSingleLoading}
                                                required
                                            >
                                                <option value="">Guruhni tanlang...</option>
                                                {availableGroups.map((group) => (
                                                    <option key={group.id} value={group.id}>
                                                        {getGroupOptionLabel(group)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {actionType === 'remove' && (
                                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 sm:mb-6 sm:p-4">
                                            <div className="flex items-start">
                                                <TrashIcon className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="truncate text-sm font-medium text-red-800">
                                                        Talabani guruhdan chiqarish
                                                    </h4>
                                                    <p className="mt-1 text-sm text-red-700">
                                                        Talaba <strong>{student?.group_name}</strong> guruhidan chiqariladi.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                                        <button
                                            type="button"
                                            onClick={handleModalClose}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                            Bekor qilish
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSingleLoading || (actionType !== 'remove' && !selectedGroupId)}
                                            className={`flex w-full items-center justify-center rounded-lg px-4 py-2 text-white transition-colors disabled:opacity-50 ${
                                                actionType === 'remove'
                                                    ? 'bg-red-600 hover:bg-red-700'
                                                    : actionType === 'change'
                                                        ? 'bg-blue-600 hover:bg-blue-700'
                                                        : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                        >
                                            {isSingleLoading ? 'Bajarilmoqda...' : (
                                                actionType === 'remove'
                                                    ? 'Guruhdan chiqarish'
                                                    : actionType === 'change'
                                                        ? 'Guruhni o&apos;zgartirish'
                                                        : 'Guruhga qo&apos;shish'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <div className="grid gap-2 md:grid-cols-3">
                                        <button
                                            type="button"
                                            onClick={() => setBulkActionType('join')}
                                            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                                                bulkActionType === 'join'
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-300 bg-white text-gray-700'
                                            }`}
                                        >
                                            Guruhga qo&apos;shish
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBulkActionType('change')}
                                            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                                                bulkActionType === 'change'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 bg-white text-gray-700'
                                            }`}
                                        >
                                            Guruhni almashtirish
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBulkActionType('remove')}
                                            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                                                bulkActionType === 'remove'
                                                    ? 'border-red-500 bg-red-50 text-red-700'
                                                    : 'border-gray-300 bg-white text-gray-700'
                                            }`}
                                        >
                                            Guruhdan chiqarish
                                        </button>
                                    </div>

                                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                                        {(bulkActionType === 'remove' || bulkActionType === 'change') ? (
                                            <select
                                                value={bulkSourceGroupId}
                                                onChange={(e) => setBulkSourceGroupId(e.target.value)}
                                                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#A60E07]"
                                            >
                                                <option value="">
                                                    {bulkActionType === 'remove' ? 'Source guruh (ixtiyoriy)' : 'Source guruh (ixtiyoriy)'}
                                                </option>
                                                {sourceGroupOptions.map((group) => (
                                                    <option key={group.id} value={group.id}>
                                                        {getGroupOptionLabel(availableGroupsMap.get(group.id) || group.group)}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : null}

                                        {(bulkActionType === 'join' || bulkActionType === 'change') ? (
                                            <select
                                                value={bulkTargetGroupId}
                                                onChange={(e) => setBulkTargetGroupId(e.target.value)}
                                                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#A60E07]"
                                            >
                                                <option value="">Target guruhni tanlang *</option>
                                                {availableGroups.map((group) => (
                                                    <option key={group.id} value={group.id}>
                                                        {getGroupOptionLabel(group)}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : null}
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setBulkOnlyUnassigned((prev) => !prev)}
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                                bulkOnlyUnassigned
                                                    ? 'border-[#A60E07] bg-[#A60E07] text-white'
                                                    : 'border-gray-300 bg-white text-gray-700'
                                            }`}
                                        >
                                            Guruhsizlar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBulkSubjectFilter('all')}
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                                bulkSubjectFilter === 'all'
                                                    ? 'border-[#A60E07] bg-[#A60E07] text-white'
                                                    : 'border-gray-300 bg-white text-gray-700'
                                            }`}
                                        >
                                            Barcha fanlar
                                        </button>
                                        {subjectFilterOptions.map((subject) => (
                                            <button
                                                key={subject}
                                                type="button"
                                                onClick={() => setBulkSubjectFilter(subject)}
                                                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                                    bulkSubjectFilter === subject
                                                        ? 'border-[#A60E07] bg-[#A60E07] text-white'
                                                        : 'border-gray-300 bg-white text-gray-700'
                                                }`}
                                            >
                                                {subject}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <input
                                            type="text"
                                            value={bulkSearchTerm}
                                            onChange={(e) => setBulkSearchTerm(e.target.value)}
                                            placeholder="Qidiruv: ID, ism, telefon"
                                            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#A60E07] sm:max-w-xs"
                                        />
                                        <div className="text-sm text-gray-600">
                                            Ko'rinayotgan: <strong>{filteredBulkStudents.length}</strong> ta | Tanlangan: <strong>{bulkSelectedIds.length}</strong> ta
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <div className="max-h-[44vh] overflow-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="sticky top-0 bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={allVisibleSelected}
                                                            ref={(el) => {
                                                                if (el) {
                                                                    el.indeterminate = someVisibleSelected && !allVisibleSelected;
                                                                }
                                                            }}
                                                            onChange={handleToggleSelectAll}
                                                            className="h-4 w-4 rounded border-gray-300 text-[#A60E07] focus:ring-[#A60E07]"
                                                        />
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">ID</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">Talaba</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">Telefon</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">Fan</th>
                                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-700">Hozirgi guruhlar</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {studentsLoading ? (
                                                    <tr>
                                                        <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan="6">
                                                            Talabalar yuklanmoqda...
                                                        </td>
                                                    </tr>
                                                ) : filteredBulkStudents.length ? (
                                                    filteredBulkStudents.map((item) => (
                                                        <tr
                                                            key={item.id}
                                                            className={`${
                                                                item.groups.length === 0
                                                                    ? 'bg-orange-50 hover:bg-orange-100'
                                                                    : 'hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={bulkSelectedIds.includes(item.id)}
                                                                    onChange={() => handleToggleStudent(item.id)}
                                                                    className="h-4 w-4 rounded border-gray-300 text-[#A60E07] focus:ring-[#A60E07]"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2 text-sm text-gray-700">#{item.id}</td>
                                                            <td className="px-3 py-2 text-sm font-medium text-gray-800">
                                                                {item.name} {item.surname}
                                                            </td>
                                                            <td className="px-3 py-2 text-sm text-gray-700">{item.phone || '-'}</td>
                                                            <td className="px-3 py-2 text-sm text-gray-700">
                                                                {item.groups.length > 0 ? (
                                                                    <p className="font-medium text-green-700">
                                                                        {item.currentSubjects.join(', ') || '-'}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-xs text-blue-700">
                                                                        {item.plannedSubject || '-'}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 text-sm text-gray-600">
                                                                {item.groups.length
                                                                    ? item.groups.map((group) => group.group_name).join(', ')
                                                                    : 'Guruhsiz'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan="6">
                                                            Talaba topilmadi
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                                    <button
                                        type="button"
                                        onClick={handleModalClose}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleBulkAction}
                                        disabled={isBulkLoading}
                                        className="w-full rounded-lg bg-[#A60E07] px-4 py-2 text-white transition-colors hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isBulkLoading ? 'Bajarilmoqda...' : 'Ommaviy amalni bajarish'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AddGroup;

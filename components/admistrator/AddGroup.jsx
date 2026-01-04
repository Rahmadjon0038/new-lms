'use client'
import React, { useState } from 'react';
import { XMarkIcon, UserGroupIcon, TrashIcon, UserMinusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { usegetAllgroups } from '../../hooks/groups';
import { useJoinStudentToGroup } from '../../hooks/students';
import { useChangeStudentGroup, useRemoveStudentFromGroup } from '../../hooks/groups';
import { toast } from 'react-hot-toast';

const AddGroup = ({ children, student, onSuccess }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [actionType, setActionType] = useState('join'); // 'join', 'change', 'remove'
    
    const { data: groupsData, isLoading: groupsLoading } = usegetAllgroups(true);
    const joinStudentMutation = useJoinStudentToGroup();
    const changeGroupMutation = useChangeStudentGroup();
    const removeStudentMutation = useRemoveStudentFromGroup();
    
    // Modal ochilganda to'g'ri actionType'ni o'rnatish
    React.useEffect(() => {
        if (isModalOpen) {
            const hasGroup = student?.group_name && student.group_name !== 'Guruh biriktirilmagan';
            setActionType(hasGroup ? 'change' : 'join');
        }
    }, [isModalOpen, student]);
    
    // Mutation result'larni kuzatish
    React.useEffect(() => {
        if (removeStudentMutation.isSuccess) {
            toast.success('Student muvaffaqiyatli guruhdan chiqarildi!');
            setIsModalOpen(false);
            setSelectedGroupId('');
            setActionType('join');
            onSuccess();
            removeStudentMutation.reset();
        }
        if (removeStudentMutation.isError) {
            toast.error(removeStudentMutation.error?.response?.data?.message || 'Guruhdan chiqarishda xatolik!');
            removeStudentMutation.reset();
        }
    }, [removeStudentMutation.isSuccess, removeStudentMutation.isError]);
    
    React.useEffect(() => {
        if (changeGroupMutation.isSuccess) {
            toast.success('Student guruhi muvaffaqiyatli o\'zgartirildi!');
            setIsModalOpen(false);
            setSelectedGroupId('');
            setActionType('join');
            onSuccess();
            changeGroupMutation.reset();
        }
        if (changeGroupMutation.isError) {
            toast.error(changeGroupMutation.error?.response?.data?.message || 'Guruhni o\'zgartirishda xatolik!');
            changeGroupMutation.reset();
        }
    }, [changeGroupMutation.isSuccess, changeGroupMutation.isError]);
    
    React.useEffect(() => {
        if (joinStudentMutation.isSuccess) {
            toast.success('Student muvaffaqiyatli guruhga qo\'shildi!');
            setIsModalOpen(false);
            setSelectedGroupId('');
            setActionType('join');
            onSuccess();
            joinStudentMutation.reset();
        }
        if (joinStudentMutation.isError) {
            toast.error(joinStudentMutation.error?.response?.data?.message || 'Guruhga qo\'shishda xatolik!');
            joinStudentMutation.reset();
        }
    }, [joinStudentMutation.isSuccess, joinStudentMutation.isError]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (actionType === 'remove') {
            // Guruhdan chiqarish
            if (!student.group_id) {
                toast.error('Student guruh ma\'lumoti topilmadi!');
                return;
            }
            
            removeStudentMutation.mutate({
                group_id: student.group_id,
                student_id: student.id
            });
            return;
        }
        
        if (!selectedGroupId) {
            toast.error('Iltimos, guruhni tanlang!');
            return;
        }
        
        if (actionType === 'change') {
            // Guruhni o'zgartirish
            changeGroupMutation.mutate({
                student_id: student.id,
                new_group_id: parseInt(selectedGroupId)
            });
        } else {
            // Yangi guruhga qo'shish
            joinStudentMutation.mutate({
                student_id: student.id,
                group_id: parseInt(selectedGroupId)
            });
        }
    };
    
    const hasGroup = student?.group_name && student.group_name !== 'Guruh biriktirilmagan';
    const isLoading = joinStudentMutation.isLoading || changeGroupMutation.isLoading || removeStudentMutation.isLoading;
    
    const handleActionTypeChange = (type) => {
        setActionType(type);
        setSelectedGroupId('');
    };
    
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedGroupId('');
        setActionType('join');
    };
    
    return (
        <>
            <button onClick={() => setIsModalOpen(true)}>
                {children}
            </button>
            
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto break-words"
                         style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                <UserGroupIcon className="h-6 w-6 mr-2 text-[#A60E07]" />
                                Student Guruh Boshqaruvi
                            </h3>
                            <button
                                onClick={handleModalClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        {/* Student info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-medium text-gray-800">
                                        {student?.name} {student?.surname}
                                    </p>
                                    <p className="text-sm text-gray-600">ID: {student?.id}</p>
                                </div>
                                <div className="text-right">
                                    {hasGroup ? (
                                        <div>
                                            <p className="text-sm text-blue-600 font-medium">
                                                Hozirgi guruh: {student?.group_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                O'qituvchi: {student?.teacher_name || 'Noma\'lum'}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-orange-600">
                                            Guruh biriktirilmagan
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Type Selection */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Amalni tanlang:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Join Group */}
                                <button
                                    type="button"
                                    onClick={() => handleActionTypeChange('join')}
                                    disabled={isLoading}
                                    className={`p-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                        actionType === 'join'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <UserGroupIcon className="h-6 w-6 mx-auto mb-2" />
                                    <p className="text-sm font-medium">Guruhga Qo'shish</p>
                                    <p className="text-xs opacity-75">Yangi guruhga biriktirish</p>
                                </button>
                                
                                {/* Change Group */}
                                {hasGroup && (
                                    <button
                                        type="button"
                                        onClick={() => handleActionTypeChange('change')}
                                        disabled={isLoading}
                                        className={`p-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                            actionType === 'change'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        <ArrowRightOnRectangleIcon className="h-6 w-6 mx-auto mb-2" />
                                        <p className="text-sm font-medium">Guruhni O'zgartirish</p>
                                        <p className="text-xs opacity-75">Boshqa guruhga ko'chirish</p>
                                    </button>
                                )}
                                
                                {/* Remove from Group */}
                                {hasGroup && (
                                    <button
                                        type="button"
                                        onClick={() => handleActionTypeChange('remove')}
                                        disabled={isLoading}
                                        className={`p-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                            actionType === 'remove'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        <UserMinusIcon className="h-6 w-6 mx-auto mb-2" />
                                        <p className="text-sm font-medium">Guruhdan Chiqarish</p>
                                        <p className="text-xs opacity-75">Hozirgi guruhdan olib tashlash</p>
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            {actionType !== 'remove' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {actionType === 'change' ? 'Yangi guruhni tanlang' : 'Guruhni tanlang'} *
                                    </label>
                                    <select
                                        value={selectedGroupId}
                                        onChange={(e) => setSelectedGroupId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A60E07] focus:border-transparent"
                                        disabled={groupsLoading || isLoading}
                                        required
                                    >
                                        <option value="">Guruhni tanlang...</option>
                                        {groupsData?.groups?.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name} - {group.teacher_name || 'O\'qituvchisiz'} - {Number(group.price).toLocaleString()} so'm
                                            </option>
                                        ))}
                                    </select>
                                    {groupsLoading && (
                                        <p className="text-sm text-gray-500 mt-1">Guruhlar yuklanmoqda...</p>
                                    )}
                                </div>
                            )}
                            
                            {actionType === 'remove' && (
                                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex">
                                        <TrashIcon className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-red-800">
                                                Studentni guruhdan chiqarish
                                            </h4>
                                            <p className="text-sm text-red-700 mt-1 break-words">
                                                Bu student <strong className="break-words">{student?.group_name}</strong> guruhidan butunlay chiqarib tashlanadi. 
                                                Bu amalni bekor qilish mumkin emas.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || (actionType !== 'remove' && !selectedGroupId)}
                                    className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors flex items-center justify-center ${
                                        actionType === 'remove'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : actionType === 'change'
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-green-600 hover:bg-green-700'
                                    } disabled:opacity-50`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {actionType === 'remove' ? 'Chiqarmoqda...' : actionType === 'change' ? 'O\'zgartirmoqda...' : 'Qo\'shmoqda...'}
                                        </>
                                    ) : (
                                        actionType === 'remove' ? 'Guruhdan Chiqarish' : actionType === 'change' ? 'Guruhni O\'zgartirish' : 'Guruhga Qo\'shish'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
export default AddGroup;
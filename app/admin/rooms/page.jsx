'use client'
import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    XMarkIcon,
    CheckIcon,
    CalendarDaysIcon,
    ClockIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { Building2, Sofa, Zap, Calendar } from 'lucide-react';
import { useGetAllRooms, useCreateRoom, useDeleteRoom, useUpdateRoom, useGetRoomSchedule } from '../../../hooks/rooms';
import { useGetNotify } from '../../../hooks/notify';

const MAIN_COLOR = "#A60E07";

// Modal komponenti - yangi xona qo'shish
const AddRoomModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        room_number: '',
        capacity: '',
        description: '',
        has_projector: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            room_number: '',
            capacity: '',
            description: '',
            has_projector: false,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white max-w-2xl p-6 rounded-2xl shadow-2xl w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Yangi Xona Qo'shish</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Xona Raqami *
                        </label>
                        <input
                            type="text"
                            name="room_number"
                            value={formData.room_number}
                            onChange={handleChange}
                            placeholder="101"
                            required
                            className="w-full p-2 border border-[#A60E07] rounded-lg outline-none focus:ring-1 focus:ring-[#A60E07]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sig'imi (o'rinlik) *
                        </label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            placeholder="20"
                            required
                            className="w-full p-2 border border-[#A60E07] rounded-lg outline-none focus:ring-1 focus:ring-[#A60E07]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tavsif
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Xona tavsifi..."
                            rows="3"
                            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#A60E07] resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="has_projector"
                            checked={formData.has_projector}
                            onChange={handleChange}
                            id="has_projector"
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <label htmlFor="has_projector" className="text-sm font-medium text-gray-700">
                            Proyektor mavjud
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2.5 rounded-xl font-bold text-white transition disabled:opacity-50"
                            style={{ backgroundColor: MAIN_COLOR }}
                        >
                            {isLoading ? 'Saqlanmoqda...' : 'Qo\'shish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Dars jadvali modali
const ScheduleModal = ({ isOpen, onClose, roomId }) => {
    const { data: scheduleData, isLoading } = useGetRoomSchedule(roomId);

    if (!isOpen) return null;

    const room = scheduleData?.room;
    const groups = scheduleData?.groups || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            Xona {room?.room_number} - Dars Jadvali
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {scheduleData?.groups_count || 0} ta guruh
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin">
                            <div className="h-8 w-8 border-4 rounded-full" style={{ borderColor: MAIN_COLOR, borderTopColor: 'transparent' }}></div>
                        </div>
                        <p className="text-gray-600 mt-4">Yuklanmoqda...</p>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-12">
                        <CalendarDaysIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Bu xonada hozircha darslar yo'q</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groups.slice().sort((a, b) => {
                            const timeA = a.schedule?.time || '';
                            const timeB = b.schedule?.time || '';
                            return timeA.localeCompare(timeB);
                        }).map((group) => (
                            <div 
                                key={group.id} 
                                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                                            {group.name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {group.subject_name}
                                        </p>
                                    </div>
                                    <span className="text-lg font-bold" style={{ color: MAIN_COLOR }}>
                                        {parseFloat(group.price).toLocaleString()} so'm
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <UsersIcon className="h-4 w-4 text-blue-500" />
                                        <span className="text-gray-700">
                                            <strong>O'qituvchi:</strong> {group.teacher_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <UsersIcon className="h-4 w-4 text-green-500" />
                                        <span className="text-gray-700">
                                            <strong>Talabalar:</strong> {group.student_count} ta
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm bg-white p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CalendarDaysIcon className="h-4 w-4" style={{ color: MAIN_COLOR }} />
                                        <span className="font-medium text-gray-700">
                                            {group.schedule?.days?.join(', ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="h-4 w-4" style={{ color: MAIN_COLOR }} />
                                        <span className="font-medium text-gray-700">
                                            {group.schedule?.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Xona kartasi komponenti
const RoomCard = ({ room, onDelete, onEdit, onViewSchedule }) => {
    const handleDeleteClick = () => {
        if (window.confirm(`Xona ${room.room_number} ni o'chirishni xohlaysizmi?`)) {
            onDelete(room.id);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: MAIN_COLOR + '15' }}
                    >
                        <Building2 className="h-6 w-6" style={{ color: MAIN_COLOR }} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            Xona {room.room_number}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {room.building && `Bino: ${room.building}`}
                            {room.building && room.floor && ' • '}
                            {room.floor && `Qavat: ${room.floor}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {room.description && (
                <p className="text-sm text-gray-600 mb-3">{room.description}</p>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <Sofa className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700 font-medium">{room.capacity} o'rinlik</span>
                    </div>
                    {room.has_projector && (
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                            <Zap className="h-4 w-4" />
                            Proyektor
                        </div>
                    )}
                </div>
                
                <button
                    onClick={onViewSchedule}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg transition text-white hover:opacity-90"
                    style={{ backgroundColor: MAIN_COLOR }}
                >
                    <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
                    Dars jadvali
                </button>
            </div>
        </div>
    );
};

const RoomsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const { data: roomsData, isLoading, refetch } = useGetAllRooms();
    const createRoomMutation = useCreateRoom();
    const deleteRoomMutation = useDeleteRoom();
    const notify = useGetNotify();

    const rooms = roomsData?.rooms || [];

    const handleViewSchedule = (roomId) => {
        setSelectedRoomId(roomId);
        setScheduleModalOpen(true);
    };

    const handleAddRoom = async (formData) => {
        notify('load');
        
        createRoomMutation.mutate(formData, {
            onSuccess: (data) => {
                notify('dismiss');
                if (data.success) {
                    notify('ok', 'Xona muvaffaqiyatli qo\'shildi');
                    setIsModalOpen(false);
                } else {
                    notify('err', data.message || 'Xona qo\'shishda xatolik yuz berdi');
                }
            },
            onError: (error) => {
                notify('dismiss');
                const errorMessage = error?.response?.data?.message || 'Xona qo\'shishda xatolik yuz berdi';
                notify('err', errorMessage);
            }
        });
    };

    const handleDeleteRoom = async (roomId) => {
        notify('load');
        
        deleteRoomMutation.mutate(roomId, {
            onSuccess: (data) => {
                notify('dismiss');
                notify('ok', 'Xona muvaffaqiyatli o\'chirildi');
            },
            onError: (error) => {
                notify('dismiss');
                const errorMessage = error?.response?.data?.message || 'Xona o\'chirishda xatolik yuz berdi';
                notify('err', errorMessage);
            }
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Xonalar Boshqarish</h1>
                        <p className="text-gray-600 mt-1">Barcha xonalarni boshqaring va yangi xonalar qo'shing</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border-2 hover:shadow-md transition font-bold text-white"
                        style={{ borderColor: MAIN_COLOR, backgroundColor: MAIN_COLOR }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        Xona Qo'shish
                    </button>
                </div>

                {/* Modal */}
                <AddRoomModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddRoom}
                    isLoading={createRoomMutation.isPending}
                />

                {/* Schedule Modal */}
                <ScheduleModal
                    isOpen={scheduleModalOpen}
                    onClose={() => {
                        setScheduleModalOpen(false);
                        setSelectedRoomId(null);
                    }}
                    roomId={selectedRoomId}
                />

                {/* Rooms Grid */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin">
                            <div className="h-8 w-8 border-4 rounded-full" style={{ borderColor: MAIN_COLOR, borderTopColor: 'transparent' }}></div>
                        </div>
                        <p className="text-gray-600 mt-4">Xonalar yuklangan...</p>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-6">Xonalar mavjud emas</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-2 rounded-lg font-bold text-white transition"
                            style={{ backgroundColor: MAIN_COLOR }}
                        >
                            Birinchi Xonani Qo'shish
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map(room => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                onDelete={handleDeleteRoom}
                                onEdit={() => console.log('Edit room', room)}
                                onViewSchedule={() => handleViewSchedule(room.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomsPage;

'use client'
import React, { useState, useEffect } from 'react';
import { useGetAllRooms } from '../../hooks/rooms';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const RoomsSelect = ({ value, onChange, placeholder = "Xona tanlang..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { data: roomsData, isLoading } = useGetAllRooms();

    const rooms = roomsData?.rooms || [];
    
    const filteredRooms = rooms.filter(room =>
        room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedRoom = rooms.find(r => r.id === value);

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 border border-[#A60E07] rounded-lg bg-white text-left flex justify-between items-center hover:bg-gray-50 transition outline-none"
            >
                <span className={selectedRoom ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedRoom
                        ? `Xona ${selectedRoom.room_number} (${selectedRoom.capacity} o'rinlik)`
                        : placeholder}
                </span>
                <ChevronDownIcon
                    className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-[#A60E07] rounded-lg shadow-lg">
                    <input
                        type="text"
                        placeholder="Xona raqamini qidiring..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border-b border-gray-200 outline-none focus:ring-1 focus:ring-[#A60E07]"
                    />

                    <div className="max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-3 text-center text-gray-500">Yuklangan...</div>
                        ) : filteredRooms.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">Xona topilmadi</div>
                        ) : (
                            filteredRooms.map(room => (
                                <button
                                    type="button"
                                    key={room.id}
                                    onClick={() => {
                                        onChange(room.id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`w-full text-left p-3 hover:bg-gray-100 transition border-b border-gray-100 last:border-b-0 ${
                                        value === room.id ? 'bg-orange-50 border-l-4 border-l-[#A60E07]' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Xona {room.room_number}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {room.description || 'Tavsif yo\'q'}
                                            </p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="text-gray-700">{room.capacity} o'rinlik</p>
                                            {room.has_projector && (
                                                <p className="text-green-600 text-xs">Proyektor mavjud</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomsSelect;

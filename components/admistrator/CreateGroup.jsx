"use client";

import React, { useState } from "react";
import {
  XMarkIcon,
  UsersIcon,
  ClockIcon,
  UserIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useCreateGroup } from "../../hooks/groups";
import { useGetNotify } from "../../hooks/notify";
import TeacherSelect from "../teacher/Select";
import SubjectsSelect from "../SubjectsSelect";
import RoomsSelect from "./RoomsSelect";

const MAIN_COLOR = "#A60E07";

const WEEK_DAYS = [
  { id: "Dushanba", label: "Dushanba" },
  { id: "Seshanba", label: "Seshanba" },
  { id: "Chorshanba", label: "Chorshanba" },
  { id: "Payshanba", label: "Payshanba" },
  { id: "Juma", label: "Juma" },
  { id: "Shanba", label: "Shanba" },
];

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "94%",
  maxWidth: "520px",
  bgcolor: "background.paper",
  borderRadius: "16px",
  boxShadow: "0 16px 24px -6px rgb(0 0 0 / 0.12)",
  p: { xs: 1.5, sm: 3 },
  outline: "none",
  border: "none",
  maxHeight: "90vh",
  overflowY: "auto",
};

export default function AdminNewGroupModal({ children, onSuccess }) {
  const notify = useGetNotify();
  // ------------ crate group hook ---------
  const createGroupMutation = useCreateGroup()
  const [isOpen, setIsOpen] = useState(false);

  const [groupData, setGroupData] = useState({
    subject_id: "",
    name: "",
    teacher_id: "",
    room_id: "",
    selectedDays: [],
    startTime: "18:00",
    endTime: "20:00",
    start_date: "",
    price: "",
  });
  const isSubjectSelected = !!groupData.subject_id;

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setGroupData({
      subject_id: "",
      name: "",
      teacher_id: "",
      room_id: "",
      selectedDays: [],
      startTime: "18:00",
      endTime: "20:00",
      start_date: "",
      price: "",
    });
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const slug = value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
      setGroupData(prev => ({ ...prev, name: value, unique_code: slug }));
    } else if (name === "start_date") {
      setGroupData(prev => ({ ...prev, start_date: value || null }));
    } else {
      setGroupData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Hafta kunini tanlash funksiyasi
  const toggleDay = (dayId) => {
    setGroupData(prev => {
      const isSelected = prev.selectedDays.includes(dayId);
      const newDays = isSelected
        ? prev.selectedDays.filter(d => d !== dayId)
        : [...prev.selectedDays, dayId];
      return { ...prev, selectedDays: newDays };
    });
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();

    // Backend kutayotgan format (sizning berilgan struktura bo'yicha)
    const groupdata = {
      name: groupData.name,
      subject_id: groupData.subject_id ? Number(groupData.subject_id) : null,
      teacher_id: groupData.teacher_id ? Number(groupData.teacher_id) : null,
      room_id: groupData.room_id ? Number(groupData.room_id) : null,
      start_date: groupData.start_date ? groupData.start_date : null,
      schedule: {
        days: groupData.selectedDays, // Array formatida: ["Dush", "Chor", "Jum"]
        time: `${groupData.startTime}-${groupData.endTime}`
      },
      price: groupData.price ? Number(groupData.price) : null,
      status: "draft" // default status
    };
    console.log(groupdata)

    createGroupMutation.mutate({
      groupdata,
      onSuccess: (data) => {
        console.log(data)
        if(data.success){
        notify('ok','Gurux yaratildi')
        // Parent component'dagi onSuccess callback'ni chaqirish
        if (onSuccess) {
          onSuccess(data);
        }
        }
        setIsOpen(false);
      },
      onError: (err) => {
        console.log(err)
        notify('err',err.response.data.message)
      }
    })
  };

  return (
    <>
      {children && <div onClick={handleOpen} className="cursor-pointer">{children}</div>}

      <Modal open={isOpen} onClose={handleClose}>
        <Box sx={modalStyle}>
          <div className="relative w-full">
            <button onClick={handleClose} className="absolute -top-1 -right-1 text-gray-400 hover:text-[#A60E07] p-1">
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100 flex items-center uppercase tracking-tight sm:text-xl sm:mb-6 sm:pb-4">
              <UsersIcon className="h-5 w-5 mr-2 text-[#A60E07] sm:h-6 sm:w-6 sm:mr-3" />
              Yangi Guruh Ochish
            </h3>

            <form className="space-y-3.5 sm:space-y-5" onSubmit={handleCreateGroup}>
              {/* 1. Fan tanlash */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  Fan *
                </label>
                <SubjectsSelect
                  value={groupData.subject_id}
                  onChange={(subjectId) => setGroupData(prev => ({ ...prev, subject_id: subjectId }))}
                  placeholder="Fanni tanlang"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none text-sm font-semibold sm:px-4 sm:py-2.5 sm:rounded-xl"
                  showAll={false}
                />
              </div>

              {/* 2. Guruh Nomi */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Guruh Nomi *</label>
                <input
                  type="text"
                  name="name"
                  value={groupData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingliz tili beginner"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none text-sm font-semibold sm:px-4 sm:py-2.5 sm:rounded-xl"
                />
              </div>

              {/* 3. Narxi */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Guruh narxi (so'm) *</label>
                <input
                  type="number"
                  name="price"
                  value={groupData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none text-sm font-semibold sm:px-4 sm:py-2.5 sm:rounded-xl"
                  placeholder="Masalan: 1000000"
                  min="0"
                  required
                />
              </div>

              {/* 4. O'qituvchi */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 flex items-center">
                  <UserIcon className="h-3 w-3 mr-1" /> O'qituvchi
                </label>

               <TeacherSelect
                 value={groupData.teacher_id}
                 onChange={(teacherId) => setGroupData(prev => ({ ...prev, teacher_id: teacherId }))}
                 showAll={false}
               />

              </div>

              {/* 4.5 Xona */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 flex items-center">
                  🏛️ Xona
                </label>
                <RoomsSelect
                  value={groupData.room_id ? Number(groupData.room_id) : ""}
                  onChange={(roomId) => setGroupData(prev => ({ ...prev, room_id: roomId ? String(roomId) : "" }))}
                  placeholder="Xona tanlang"
                />
              </div>


              {/* 5. Hafta kunlari (Tugmachalar) */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Dars Kunlari *</label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {WEEK_DAYS.map((day) => {
                    const isSelected = groupData.selectedDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border sm:px-3 sm:py-2 sm:text-xs ${isSelected
                          ? "bg-[#A60E07] text-white border-[#A60E07] shadow-md shadow-red-900/20"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-[#A60E07]"
                          }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Vaqt */}
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Boshlanish *</label>
                  <div className="flex gap-1">
                    <select
                      value={groupData.startTime.split(':')[0] || '08'}
                      onChange={(e) => {
                        const hour = e.target.value;
                        const minute = groupData.startTime.split(':')[1] || '00';
                        setGroupData(prev => ({ ...prev, startTime: `${hour}:${minute}` }));
                      }}
                      className="flex-1 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#A60E07] text-sm font-semibold sm:px-2 sm:py-2.5 sm:rounded-xl"
                      required
                    >
                      {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(hour => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>
                    <span className="py-2 px-1 text-gray-400 sm:py-2.5">:</span>
                    <select
                      value={groupData.startTime.split(':')[1] || '00'}
                      onChange={(e) => {
                        const hour = groupData.startTime.split(':')[0] || '08';
                        const minute = e.target.value;
                        setGroupData(prev => ({ ...prev, startTime: `${hour}:${minute}` }));
                      }}
                      className="flex-1 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#A60E07] text-sm font-semibold sm:px-2 sm:py-2.5 sm:rounded-xl"
                      required
                    >
                      {['00', '15', '30', '45'].map(minute => (
                        <option key={minute} value={minute}>{minute}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Tugash *</label>
                  <div className="flex gap-1">
                    <select
                      value={groupData.endTime.split(':')[0] || '10'}
                      onChange={(e) => {
                        const hour = e.target.value;
                        const minute = groupData.endTime.split(':')[1] || '00';
                        setGroupData(prev => ({ ...prev, endTime: `${hour}:${minute}` }));
                      }}
                      className="flex-1 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#A60E07] text-sm font-semibold sm:px-2 sm:py-2.5 sm:rounded-xl"
                      required
                    >
                      {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(hour => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>
                    <span className="py-2 px-1 text-gray-400 sm:py-2.5">:</span>
                    <select
                      value={groupData.endTime.split(':')[1] || '00'}
                      onChange={(e) => {
                        const hour = groupData.endTime.split(':')[0] || '10';
                        const minute = e.target.value;
                        setGroupData(prev => ({ ...prev, endTime: `${hour}:${minute}` }));
                      }}
                      className="flex-1 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#A60E07] text-sm font-semibold sm:px-2 sm:py-2.5 sm:rounded-xl"
                      required
                    >
                      {['00', '15', '30', '45'].map(minute => (
                        <option key={minute} value={minute}>{minute}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 7. Dars boshlanish sanasi */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Dars boshlanish sanasi</label>
                <input
                  type="date"
                  name="start_date"
                  value={groupData.start_date || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none text-sm font-semibold sm:py-2.5 sm:rounded-xl"
                  placeholder="Belgilanmagan"
                />
                {groupData.start_date === null || groupData.start_date === "" ? (
                  <span className="text-xs text-gray-400">Belgilanmagan</span>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={!groupData.subject_id || !groupData.name || groupData.selectedDays.length === 0 || !groupData.price || !groupData.startTime || !groupData.endTime}
                className="w-full py-3 mt-1.5 rounded-lg text-sm font-black text-white transition-all shadow-md uppercase tracking-widest hover:opacity-90 active:scale-95 bg-[#A60E07] disabled:opacity-50 disabled:cursor-not-allowed sm:py-4 sm:mt-2 sm:rounded-xl sm:shadow-lg"
              >
                Guruhni Yaratish
              </button>
            </form>
          </div>
        </Box>
      </Modal>

      <style jsx>{`
        input:focus, select:focus {
          border-color: ${MAIN_COLOR} !important;
        }
      `}</style>
    </>
  );
}

"use client";
import { zonedTimeToUtc, toZonedTime, format } from "date-fns-tz";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  UsersIcon, 
  UserIcon,
} from "@heroicons/react/24/outline";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useUpdateGroup } from "../../hooks/groups";
import { useGetNotify } from "../../hooks/notify";
import TeacherSelect from "../teacher/Select";
import SubjectsSelect from "../SubjectsSelect";
import RoomsSelect from "./RoomsSelect";

const MAIN_COLOR = "#A60E07";

const WEEK_DAYS = [
  { id: "Dushanba", short: "Dush", label: "Dushanba" },
  { id: "Seshanba", short: "Sesh", label: "Seshanba" },
  { id: "Chorshanba", short: "Chor", label: "Chorshanba" },
  { id: "Payshanba", short: "Pay", label: "Payshanba" },
  { id: "Juma", short: "Jum", label: "Juma" },
  { id: "Shanba", short: "Shan", label: "Shanba" },
];

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "500px",
  bgcolor: "background.paper",
  borderRadius: "20px",
  boxShadow: 24,
  p: 4,
  outline: "none",
  maxHeight: "90vh",
  overflowY: "auto"
};

export default function AdminUpdateGroupModal({ children, initialData }) {
  const [isOpen, setIsOpen] = useState(false);
  const updateGroupMutation = useUpdateGroup();
  const notify = useGetNotify()

  const [groupData, setGroupData] = useState({
    name: "",
    subject_id: "",
    teacher_id: "",
    room_id: "",
    start_date: "2025-01-10",
    price: "",
    schedule: {
      days: [],
      time: "18:00-20:00"
    }
  });

  useEffect(() => {
    if (isOpen && initialData) {
      let startDateValue = "";
      if (initialData.start_date) {
        // Convert UTC date to Asia/Tashkent and format as yyyy-MM-dd
        try {
          const tz = "Asia/Tashkent";
          const zoned = toZonedTime(initialData.start_date, tz);
          startDateValue = format(zoned, "yyyy-MM-dd", { timeZone: tz });
        } catch (e) {
          startDateValue = initialData.start_date.split("T")[0];
        }
      }
      setGroupData({
        name: initialData.name || "",
        subject_id: initialData.subject_id ? String(initialData.subject_id) : "",
        teacher_id: initialData.teacher_id ? String(initialData.teacher_id) : "",
        room_id: initialData.room_id ? String(initialData.room_id) : "",
        start_date: startDateValue,
        price: initialData.price ? String(initialData.price) : "",
        schedule: {
          days: initialData.schedule?.days || [],
          time: initialData.schedule?.time || "18:00-20:00"
        }
      });
    }
  }, [isOpen, initialData]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayId) => {
    setGroupData(prev => {
      // Find both full and short names for the day
      const dayObj = WEEK_DAYS.find(d => d.id === dayId || d.short === dayId);
      if (!dayObj) return prev;
      const { id, short } = dayObj;
      // Remove both forms if present
      const filtered = prev.schedule.days.filter(d => d !== id && d !== short);
      const isSelected = prev.schedule.days.includes(id) || prev.schedule.days.includes(short);
      const newDays = isSelected ? filtered : [...filtered, id];
      return {
        ...prev,
        schedule: { ...prev.schedule, days: newDays }
      };
    });
  };

  const handleTimeUpdate = (type, value) => {
    const [start, end] = groupData.schedule.time.split("-");
    const newTime = type === "start" ? `${value}-${end}` : `${start}-${value}`;
    setGroupData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, time: newTime }
    }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    const finalData = {
      is_active: true,
      teacher_id: groupData.teacher_id ? Number(groupData.teacher_id) : null,
      name: groupData.name,
      room_id: groupData.room_id ? Number(groupData.room_id) : null,
      subject_id: groupData.subject_id ? Number(groupData.subject_id) : null,
      price: groupData.price ? Number(groupData.price) : null,
      schedule: {
        days: groupData.schedule.days,
        time: groupData.schedule.time
      },
      start_date: groupData.start_date
    };

    if (!initialData?.id) {
      // console.error("Guruh ID topilmadi!");
      return;
    }

    updateGroupMutation.mutate({
      id: initialData.id,
      groupdata: finalData,
      onSuccess: (data) => {
        notify('ok','Guruh muvaffaqiyatli yangilandi')
        handleClose();
      },
      onError: (err) => {
        notify('err',err?.response?.data?.message)
      }
    });
  };

  const [startTime, endTime] = groupData.schedule.time.split("-");

  return (
    <>
      {children && <div onClick={handleOpen} className="cursor-pointer">{children}</div>}

      <Modal open={isOpen} onClose={handleClose}>
        <Box sx={modalStyle}>
          <div className="relative">
            <button onClick={handleClose} className="absolute -top-2 -right-2 text-gray-400 hover:text-[#A60E07] p-1">
              <XMarkIcon className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b flex items-center">
              <UsersIcon className="h-6 w-6 mr-3 text-[#A60E07]" />
              Guruhni Tahrirlash
            </h3>

            <form className="space-y-4" onSubmit={handleUpdate}>
              {/* Fan tanlash */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  Fan *
                </label>
                <SubjectsSelect
                  value={groupData.subject_id}
                  onChange={(subjectId) => setGroupData(prev => ({ ...prev, subject_id: subjectId }))}
                  placeholder="Fanni tanlang"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                  showAll={false}
                />
              </div>

              {/* Guruh Nomi */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Guruh Nomi *</label>
                <input
                  type="text"
                  name="name"
                  value={groupData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                />
              </div>

              {/* O'qituvchi */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 flex items-center">
                  <UserIcon className="h-3 w-3 mr-1" /> O'qituvchi (ixtiyoriy)
                </label>
                <TeacherSelect
                  value={groupData.teacher_id}
                  onChange={(teacherId) => setGroupData(prev => ({ ...prev, teacher_id: teacherId }))}
                  showAll={false}
                />
              </div>

              {/* Xona */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 flex items-center">
                  🏛️ Xona (ixtiyoriy)
                </label>
                <RoomsSelect
                  value={groupData.room_id ? Number(groupData.room_id) : ""}
                  onChange={(roomId) => setGroupData(prev => ({ ...prev, room_id: String(roomId) }))}
                  placeholder="Xona tanlang"
                />
              </div>

              {/* Narxi */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Guruh narxi (so‘m)</label>
                <input
                  type="number"
                  name="price"
                  value={groupData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                  placeholder="Masalan: 300000"
                  min="0"
                />
              </div>

              {/* Dars boshlanish sanasi */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Dars boshlanish sanasi</label>
                  <input
                    type="date"
                    name="start_date"
                    value={groupData.start_date || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none text-sm font-semibold"
                    placeholder="Belgilanmagan"
                  />
                  {!groupData.start_date && (
                    <span className="text-xs text-gray-400">Belgilanmagan</span>
                  )}
                </div>
              </div>

              {/* Dars Kunlari (Tugmachalar) */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Dars Kunlari *</label>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => {
                    // Normalize for both short and full names
                    const isSelected = groupData.schedule.days.includes(day.id) || groupData.schedule.days.includes(day.short);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleDayToggle(day.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${isSelected
                          ? "bg-[#A60E07] text-white border-[#A60E07] shadow-md shadow-red-900/20"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-[#A60E07]"}`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vaqt */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 text-gray-400">Boshlanish *</label>
                  <div className="flex gap-1">
                    <select
                      value={startTime.split(':')[0] || '08'}
                      onChange={(e) => {
                        const hour = e.target.value;
                        const minute = startTime.split(':')[1] || '00';
                        handleTimeUpdate("start", `${hour}:${minute}`);
                      }}
                      className="flex-1 px-2 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                      required
                    >
                      {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(hour => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>
                    <span className="py-2.5 px-1 text-gray-400">:</span>
                    <select
                      value={startTime.split(':')[1] || '00'}
                      onChange={(e) => {
                        const hour = startTime.split(':')[0] || '08';
                        const minute = e.target.value;
                        handleTimeUpdate("start", `${hour}:${minute}`);
                      }}
                      className="flex-1 px-2 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                      required
                    >
                      {['00', '15', '30', '45'].map(minute => (
                        <option key={minute} value={minute}>{minute}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 text-gray-400">Tugash *</label>
                  <div className="flex gap-1">
                    <select
                      value={endTime.split(':')[0] || '10'}
                      onChange={(e) => {
                        const hour = e.target.value;
                        const minute = endTime.split(':')[1] || '00';
                        handleTimeUpdate("end", `${hour}:${minute}`);
                      }}
                      className="flex-1 px-2 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                      required
                    >
                      {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(hour => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>
                    <span className="py-2.5 px-1 text-gray-400">:</span>
                    <select
                      value={endTime.split(':')[1] || '00'}
                      onChange={(e) => {
                        const hour = endTime.split(':')[0] || '10';
                        const minute = e.target.value;
                        handleTimeUpdate("end", `${hour}:${minute}`);
                      }}
                      className="flex-1 px-2 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                      required
                    >
                      {['00', '15', '30', '45'].map(minute => (
                        <option key={minute} value={minute}>{minute}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!groupData.subject_id || !groupData.name || !startTime || !endTime || groupData.schedule.days.length === 0}
                className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg uppercase tracking-widest hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: MAIN_COLOR }}
              >
                Saqlash
              </button>
            </form>
          </div>
        </Box>
      </Modal>
    </>
  );
}
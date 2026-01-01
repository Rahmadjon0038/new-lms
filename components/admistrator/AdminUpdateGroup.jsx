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

const MAIN_COLOR = "#A60E07";

const MOCK_TEACHERS = [
    { id: 1, name: "Jasur Raximov" },
    { id: 2, name: "Alijon Vohidov" },
    { id: 3, name: "Nigora Qosimova" },
    { id: 4, name: "Umid Karimov" },
];

const WEEK_DAYS = [
  { id: "Dushanba", short: "Dush" },
  { id: "Seshanba", short: "Sesh" },
  { id: "Chorshanba", short: "Chor" },
  { id: "Payshanba", short: "Pay" },
  { id: "Juma", short: "Jum" },
  { id: "Shanba", short: "Shan" },
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
    teacher_id: "",
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
        teacher_id: initialData.teacher_id ? String(initialData.teacher_id) : "",
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
      teacher_id: groupData.teacher_id ? Number(groupData.teacher_id) : 1,
      name: groupData.name,
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
        console.error("Xatolik:", err);
        notify('err',`Guruhni yangilab bo'lmadi`)
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
                  <UserIcon className="h-3 w-3 mr-1" /> O'qituvchi
                </label>
                <select
                  name="teacher_id"
                  value={groupData.teacher_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#A60E07] text-sm font-semibold cursor-pointer"
                >
                  <option value="">Tayinlanmagan</option>
                  {MOCK_TEACHERS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
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
                        {day.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vaqt */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 text-gray-400">Boshlanish</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => handleTimeUpdate("start", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 text-gray-400">Tugash</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => handleTimeUpdate("end", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg uppercase tracking-widest hover:opacity-90 active:scale-95"
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
"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  UsersIcon, 
  CalendarDaysIcon, 
  ClockIcon, 
  ArrowUpOnSquareIcon, 
  UserIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

const MAIN_COLOR = "#A60E07";

const MOCK_TEACHERS = [
    { id: 1, name: "Jasur Raximov" },
    { id: 2, name: "Alijon Vohidov" },
    { id: 3, name: "Nigora Qosimova" },
    { id: 4, name: "Umid Karimov" },
];

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "450px", 
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
  
  const [groupData, setGroupData] = useState({
    name: "",
    teacher_name: "",
    created_at: "", // Только дата (YYYY-MM-DD)
    schedule: {
      days: [],
      time: ""
    }
  });

  useEffect(() => {
    if (isOpen && initialData) {
      // Извлекаем только дату (YYYY-MM-DD)
      const formattedDate = initialData.created_at ? initialData.created_at.substring(0, 10) : "";
      
      setGroupData({
        id: initialData.id,
        name: initialData.name || "",
        teacher_name: initialData.teacher_name || "",
        created_at: formattedDate,
        schedule: {
          days: initialData.schedule?.days || [],
          time: initialData.schedule?.time || "09:00-11:00"
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

  const handleDaysChange = (e) => {
    const daysArray = e.target.value.split(",").map(day => day.trim());
    setGroupData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, days: daysArray }
    }));
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
    
    // Собираем объект в оригинальном формате для бэкенда
    const finalData = {
      ...groupData,
      // Превращаем дату обратно в ISO формат (начало дня) для корректности ключа created_at
      created_at: groupData.created_at ? new Date(groupData.created_at).toISOString() : null
    };

    console.log("%c🔥 ДАННЫЕ ДЛЯ БЭКЕНДА (ГОТОВО):", "color: #A60E07; font-weight: bold;");
    console.log(finalData); 

    handleClose();
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
              {/* key: name */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Guruh Nomi (name)</label>
                <input
                  type="text"
                  name="name"
                  value={groupData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                />
              </div>
              
              {/* key: teacher_name */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">O'qituvchi (teacher_name)</label>
                <select
                  name="teacher_name"
                  value={groupData.teacher_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                >
                  <option value="">Tayinlanmagan</option> 
                  {MOCK_TEACHERS.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* key: created_at (Sana faqat) */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" /> Yaratilgan sana (created_at)
                </label>
                <input
                  type="date"
                  name="created_at"
                  value={groupData.created_at}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold outline-none"
                />
              </div>

              {/* key: schedule.days */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Dars Kunlari (days)</label>
                <input
                  type="text"
                  value={groupData.schedule.days.join(", ")}
                  onChange={handleDaysChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                />
              </div>

              {/* key: schedule.time */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 text-gray-400">Vaqt (start)</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => handleTimeUpdate("start", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A60E07] text-sm font-semibold"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 text-gray-400">Vaqt (end)</label>
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
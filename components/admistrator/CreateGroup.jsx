// components/teacher/AdminNewGroupModal.jsx (yoki o'z joyiga qarab nom bering)

"use client";

import React, { useState } from "react";
// Heroicons ikonkalari
import {
  XMarkIcon,
  UsersIcon, // Guruh ikonka
  CalendarDaysIcon, // Kunlar
  ClockIcon, // Soat
  PlusCircleIcon, // Yaratish
  UserIcon, // Teacher ikonka
} from "@heroicons/react/24/outline";

// Material-UI importlari
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

// --- MOCK TEACHER DATA ---
const MOCK_TEACHERS = [
    { id: 1, name: "Jasur Raximov" },
    { id: 2, name: "Alijon Vohidov" },
    { id: 3, name: "Nigora Qosimova" },
    { id: 4, name: "Umid Karimov" },
];

// --- MUI Style Objekti ---
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450, 
  bgcolor: "background.paper",
  borderRadius: "16px",
  boxShadow: 24,
  p: 4,
  outline: "none",
};

// --- YENGI GURUH YARATISH KOMPONENTI ---
export default function AdminNewGroupModal({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  // Yangi guruh ma'lumotlari uchun boshlang'ich holat
  const [groupData, setGroupData] = useState({
    groupName: "",
    teacherName: "", 
    scheduleDays: "",
    // O'ZGARISH: Boshlang'ich vaqt qiymatlari matn sifatida
    startTime: "18:00", // Default qiymat HH:MM
    endTime: "20:00",  // Default qiymat HH:MM
  });

  const handleOpen = () => setIsOpen(true);

  // Yopishda ma'lumotlarni tozalash
  const handleClose = () => {
    setGroupData({
      groupName: "",
      teacherName: "",
      scheduleDays: "",
      startTime: "18:00",
      endTime: "20:00",
    });
    setIsOpen(false);
  };

  // Input qiymatlari o'zgarganda holatni yangilash
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // GURUH YARATISH FUNKSIYASI
  const handleCreateGroup = (e) => {
    e.preventDefault();

    // Ma'lumotlarni tekshirish
    if (!groupData.groupName || !groupData.scheduleDays || !groupData.teacherName) {
      alert("Guruh nomi, O'qituvchi va Dars kunlari majburiy!");
      return;
    }
    
    if (groupData.teacherName === "") {
        alert("Iltimos, o'qituvchini tanlang!");
        return;
    }

    // Guruh kodi bu yerda backendda yaratiladi/0 ga tenglashtiriladi
    const newGroupCode = `G-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`; 

    console.log("-----------------------------------------");
    console.log("🚀 Yangi Guruh Yaratish So'rovi:");
    console.log(`[AVTOMATIK KOD]: ${newGroupCode}`);
    console.log(`Nomi: ${groupData.groupName}`);
    console.log(`O'qituvchi: ${groupData.teacherName}`); 
    console.log(`Dars Kunlari: ${groupData.scheduleDays}`);
    console.log(`Boshlanish Soati: ${groupData.startTime}`);
    console.log(`Tugash Soati: ${groupData.endTime}`);
    console.log("-----------------------------------------");

    // Haqiqiy ilovada bu joyda POST API chaqiruvi bo'ladi

    handleClose(); 
  };

  // Foydalanuvchi blokini bosish uchun trigger
  const trigger = children && (
    <div onClick={handleOpen} className="cursor-pointer">
      {children}
    </div>
  );

  return (
    <>
      {trigger}

      {/* MUI Modal Komponenti */}
      <Modal
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="new-group-modal-title"
      >
        <Box sx={modalStyle}>
          {/* Modal Kontent Bloki (Toza dizayn) */}
          <div className="relative">
            {/* Yopish tugmasi */}
            <button
              onClick={handleClose}
              className="absolute top-0 right-0 text-gray-400 hover:text-red-600 transition duration-150 p-1 rounded-full hover:bg-gray-100"
              title="Yopish"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Modal Sarlavhasi */}
            <h3
              id="new-group-modal-title"
              className="text-2xl font-extrabold text-blue-700 mb-6 pb-3 flex items-center border-b border-blue-100"
            >
              <UsersIcon className="h-7 w-7 mr-3 text-blue-600" />
              Yangi Guruh Qo'shish (Admin)
            </h3>

            {/* Forma kontenti */}
            <form className="space-y-5" onSubmit={handleCreateGroup}>
              {/* 1. Guruh Nomi (Input) */}
              <div className="flex flex-col">
                <label
                  htmlFor="groupName"
                  className="text-sm font-semibold text-gray-700 mb-1"
                >
                  Guruh Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="groupName"
                  name="groupName"
                  value={groupData.groupName}
                  onChange={handleInputChange}
                  placeholder="Misol: Frontend Dasturlash 101"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white shadow-sm"
                />
              </div>
              
              {/* 2. O'qituvchini Tanlash (Select) */}
              <div className="flex flex-col relative">
                <label
                  htmlFor="teacherName"
                  className="text-sm font-semibold text-gray-700 mb-1 flex items-center"
                >
                  <UserIcon className="h-4 w-4 mr-2 text-blue-500" />{" "}
                  O'qituvchi <span className="text-red-500">*</span>
                </label>
                <select
                  id="teacherName"
                  name="teacherName"
                  value={groupData.teacherName}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white shadow-sm appearance-none pr-8"
                >
                  <option value="" disabled>--- O'qituvchini tanlang ---</option> 
                  
                  {MOCK_TEACHERS.map((teacher) => (
                    <option key={teacher.id} value={teacher.name}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-6">
                    {/* Select uchun o'ng tomondagi pastga qaragan o'q */}
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l-.707.707L15 20.001l6-6-1.414-1.414L10 17.586l-4.586-4.586z"/></svg>
                </div>
              </div>


              {/* 3. Dars Kunlari (Input) */}
              <div className="flex flex-col">
                <label
                  htmlFor="scheduleDays"
                  className="text-sm font-semibold text-gray-700 mb-1 flex items-center"
                >
                  <CalendarDaysIcon className="h-4 w-4 mr-2 text-blue-500" />{" "}
                  Dars Kunlari <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="scheduleDays"
                  name="scheduleDays"
                  value={groupData.scheduleDays}
                  onChange={handleInputChange}
                  placeholder="Masalan: Dush, Chor, Juma"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white shadow-sm"
                />
              </div>

              {/* 4. Dars Soatlari (Split Input) --- O'ZGARISH AMALGA OSHIRILDI --- */}
              <div className="flex space-x-4">
                <div className="flex flex-col flex-1">
                  <label
                    htmlFor="startTime"
                    className="text-sm font-semibold text-gray-700 mb-1 flex items-center"
                  >
                    <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />{" "}
                    Boshlanish Soati
                  </label>
                  <input
                    // type="time" o'rniga type="text"
                    type="text"
                    id="startTime"
                    name="startTime"
                    value={groupData.startTime}
                    onChange={handleInputChange}
                    placeholder="Masalan: 18:00"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white shadow-sm"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label
                    htmlFor="endTime"
                    className="text-sm font-semibold text-gray-700 mb-1"
                  >
                    Tugash Soati
                  </label>
                  <input
                    // type="time" o'rniga type="text"
                    type="text"
                    id="endTime"
                    name="endTime"
                    value={groupData.endTime}
                    onChange={handleInputChange}
                    placeholder="Masalan: 20:00"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white shadow-sm"
                  />
                </div>
              </div>

              {/* Guruh Yaratish Tugmasi */}
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-3 mt-6 rounded-lg text-lg font-bold text-white bg-green-600 hover:bg-green-700 transition duration-200 shadow-lg shadow-green-200/50"
              >
                <PlusCircleIcon className="h-6 w-6 mr-2" />
                Guruhni Yaratish
              </button>
            </form>
          </div>
        </Box>
      </Modal>
    </>
  );
}
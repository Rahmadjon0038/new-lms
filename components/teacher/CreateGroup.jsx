"use client";

import React, { useState } from "react";
// Heroicons ikonkalari
import {
  XMarkIcon,
  UsersIcon, // Guruh ikonka
  CalendarDaysIcon, // Kunlar
  ClockIcon, // Soat
  PlusCircleIcon, // Yaratish
} from "@heroicons/react/24/outline";

// Material-UI importlari
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

// --- MUI Style Objekti ---
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450, // Yanada ixchamroq
  bgcolor: "background.paper",
  borderRadius: "16px",
  boxShadow: 24,
  p: 4,
  outline: "none",
};

// --- YENGI GURUH YARATISH KOMPONENTI ---
export default function NewGroupModal({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  // Yangi guruh ma'lumotlari uchun boshlang'ich holat
  const [groupData, setGroupData] = useState({
    groupName: "",
    scheduleDays: "",
    startTime: "09:00",
    endTime: "11:00",
  });

  const handleOpen = () => setIsOpen(true);

  // Yopishda ma'lumotlarni tozalash
  const handleClose = () => {
    setGroupData({
      groupName: "",
      scheduleDays: "",
      startTime: "09:00",
      endTime: "11:00",
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
    if (!groupData.groupName || !groupData.scheduleDays) {
      alert("Guruh nomi va Dars kunlari majburiy!");
      return;
    }

    // Guruh kodi va Talabalar soni bu yerda backendda yaratiladi/0 ga tenglashtiriladi
    const newGroupCode = `G-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`; // Kodni yaratish logikasi (console uchun)

    console.log("-----------------------------------------");
    console.log("🚀 Yangi Guruh Yaratish So'rovi:");
    console.log(`[AVTOMATIK KOD]: ${newGroupCode}`);
    console.log(`Nomi: ${groupData.groupName}`);
    console.log(`Dars Kunlari: ${groupData.scheduleDays}`);
    console.log(`Boshlanish Soati: ${groupData.startTime}`);
    console.log(`Tugash Soati: ${groupData.endTime}`);
    console.log("-----------------------------------------");

    // Haqiqiy ilovada bu joyda POST API chaqiruvi bo'ladi

    handleClose(); // Muvaffaqiyatli yaratilgandan keyin modalni yopish
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
              Yangi Guruh Qo'shish
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

              {/* 2. Dars Kunlari (Input) */}
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

              {/* 3. Dars Soatlari (Split Input) */}
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
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={groupData.startTime}
                    onChange={handleInputChange}
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
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={groupData.endTime}
                    onChange={handleInputChange}
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

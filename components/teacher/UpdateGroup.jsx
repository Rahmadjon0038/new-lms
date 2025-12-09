// components/teacher/UpdateGroupModal.jsx (yoki o'z joyiga qarab nom bering)

"use client";

import React, { useState, useEffect } from "react";
// Heroicons ikonkalari
import {
  XMarkIcon,
  UsersIcon, // Guruh ikonka
  CalendarDaysIcon, // Kunlar
  ClockIcon, // Soat
  ArrowUpOnSquareIcon, // Saqlash ikonka
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

// --- GURUHNI YANGILASH KOMPONENTI ---
// `initialData`: tahrirlanadigan guruhning mavjud ma'lumotlari.
export default function UpdateGroupModal({ children, initialData }) {
  const [isOpen, setIsOpen] = useState(false);

  // Ma'lumotlarni boshlang'ich holatga yuklash
  const [groupData, setGroupData] = useState(initialData);

  // Modal ochilganda ma'lumotlarni yangilash
  useEffect(() => {
    if (isOpen) {
      setGroupData(initialData);
    }
  }, [isOpen, initialData]);

  const handleOpen = () => setIsOpen(true);

  // Yopish
  const handleClose = () => {
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

  // GURUHNI YANGILASH FUNKSIYASI
  const handleUpdateGroup = (e) => {
    e.preventDefault();

    // Ma'lumotlarni tekshirish
    if (!groupData.name || !groupData.schedule) {
      alert("Guruh nomi va Dars kunlari majburiy!");
      return;
    }

    // Saqlash logikasi (Consolega chiqarish)
    console.log("-----------------------------------------");
    console.log(`✅ Guruh Yangilandi (ID: ${groupData.id})`);

    // Maxsus kodni yuborish (lekin modalda ko'rsatmaslik talab qilingan)
    console.log(
      `Maxsus KOD (Yashirin): ${
        initialData.groupCode || "Mavjud emas / Avtomatik"
      }`
    );

    console.log("--- Yangi Ma'lumotlar ---");
    console.log(`Nomi: ${groupData.name}`);
    console.log(`Jadval: ${groupData.schedule}`);
    console.log(`Dars Vaqti: ${groupData.time}`); // time maydoni endi vaqtni o'z ichiga oladi
    console.log("-----------------------------------------");

    // Haqiqiy ilovada bu joyda PUT API chaqiruvi bo'ladi

    handleClose(); // Muvaffaqiyatli yangilangandan keyin modalni yopish
  };

  // Foydalanuvchi blokini bosish uchun trigger
  const trigger = children && (
    <div onClick={handleOpen} className="cursor-pointer">
      {children}
    </div>
  );

  // Dars vaqtini boshlanish va tugashga ajratish (agar mock data faqat string bo'lsa)
  const [startTime, endTime] = groupData.time
    ? groupData.time.split(" - ")
    : ["09:00", "11:00"];

  const handleTimeChange = (name, value) => {
    let newTime;
    if (name === "startTime") {
      newTime = `${value} - ${endTime}`;
    } else {
      // endTime
      newTime = `${startTime} - ${value}`;
    }
    setGroupData((prev) => ({ ...prev, time: newTime }));
  };

  return (
    <>
      {trigger}

      {/* MUI Modal Komponenti */}
      <Modal
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="update-group-modal-title"
      >
        <Box sx={modalStyle}>
          {/* Modal Kontent Bloki */}
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
              id="update-group-modal-title"
              className="text-2xl font-extrabold text-green-700 mb-6 pb-3 flex items-center border-b border-green-100"
            >
              <UsersIcon className="h-7 w-7 mr-3 text-green-600" />
              Guruhni Yangilash
            </h3>
            {/* <p className="text-sm text-gray-500 mb-4">
              Guruh kodi:{" "}
              <span className="font-mono font-semibold text-gray-700">
                {initialData.groupCode || "Yaratilmagan"}
              </span>
            </p> */}

            {/* Forma kontenti */}
            <form className="space-y-5" onSubmit={handleUpdateGroup}>
              {/* 1. Guruh Nomi (Input) */}
              <div className="flex flex-col">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-gray-700 mb-1"
                >
                  Guruh Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={groupData.name}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-green-500 focus:border-green-500 transition duration-150 bg-white shadow-sm"
                />
              </div>

              {/* 2. Dars Kunlari (Input) */}
              <div className="flex flex-col">
                <label
                  htmlFor="schedule"
                  className="text-sm font-semibold text-gray-700 mb-1 flex items-center"
                >
                  <CalendarDaysIcon className="h-4 w-4 mr-2 text-green-500" />{" "}
                  Dars Kunlari <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="schedule"
                  name="schedule"
                  value={groupData.schedule}
                  onChange={handleInputChange}
                  placeholder="Masalan: Dush, Chor, Juma"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-green-500 focus:border-green-500 transition duration-150 bg-white shadow-sm"
                />
              </div>

              {/* 3. Dars Soatlari (Split Input) */}
              <div className="flex space-x-4">
                <div className="flex flex-col flex-1">
                  <label
                    htmlFor="startTime"
                    className="text-sm font-semibold text-gray-700 mb-1 flex items-center"
                  >
                    <ClockIcon className="h-4 w-4 mr-2 text-green-500" />{" "}
                    Boshlanish Soati
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={startTime}
                    onChange={(e) =>
                      handleTimeChange("startTime", e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-green-500 focus:border-green-500 transition duration-150 bg-white shadow-sm"
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
                    value={endTime}
                    onChange={(e) =>
                      handleTimeChange("endTime", e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-green-500 focus:border-green-500 transition duration-150 bg-white shadow-sm"
                  />
                </div>
              </div>

              {/* Guruhni Yangilash Tugmasi */}
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-3 mt-6 rounded-lg text-lg font-bold text-white bg-green-600 hover:bg-green-700 transition duration-200 shadow-lg shadow-green-200/50"
              >
                <ArrowUpOnSquareIcon className="h-6 w-6 mr-2" />
                Guruhni Yangilash
              </button>
            </form>
          </div>
        </Box>
      </Modal>
    </>
  );
}

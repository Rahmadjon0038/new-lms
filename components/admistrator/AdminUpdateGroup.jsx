// components/teacher/AdminUpdateGroupModal.jsx (yoki o'z joyiga qarab nom bering)

"use client";

import React, { useState, useEffect } from "react";
// Heroicons ikonkalari
import {
  XMarkIcon,
  UsersIcon, 
  CalendarDaysIcon, 
  ClockIcon, 
  ArrowUpOnSquareIcon, 
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
    // Agar guruhga hech kim biriktirilmagan bo'lsa, tanlash imkoniyati
    { id: 0, name: "— O'qituvchi tanlash —" }, 
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

// --- GURUHNI YANGILASH KOMPONENTI ---
export default function AdminUpdateGroupModal({ children, initialData }) {
  const [isOpen, setIsOpen] = useState(false);

  // Ma'lumotlarni boshlang'ich holatga yuklash (teacher maydoni mavjud)
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
    if (!groupData.name || !groupData.schedule || groupData.teacher === "— O'qituvchi tanlash —") {
      alert("Guruh nomi, Dars kunlari va O'qituvchini tanlash majburiy!");
      return;
    }

    // Saqlash logikasi (Consolega chiqarish)
    console.log("-----------------------------------------");
    console.log(`✅ ADMIN Tomonidan Guruh Yangilandi (ID: ${groupData.id})`);
    console.log(`Maxsus KOD (Yashirin): ${initialData.groupCode || "Mavjud emas / Avtomatik"}`);

    console.log("--- Yangi Ma'lumotlar ---");
    console.log(`Nomi: ${groupData.name}`);
    console.log(`Yangi O'qituvchi: ${groupData.teacher}`); // Yangi qo'shilgan maydon
    console.log(`Jadval: ${groupData.schedule}`);
    console.log(`Dars Vaqti: ${groupData.time}`);
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

  // Dars vaqtini boshlanish va tugashga ajratish
  const [startTime, endTime] = groupData?.time
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
              Guruhni Yangilash (Admin)
            </h3>

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
              
              {/* 2. O'qituvchini Tanlash (Select) --- YANGI QO'SHILDI --- */}
              <div className="flex flex-col">
                <label
                  htmlFor="teacher"
                  className="text-sm font-semibold text-gray-700 mb-1 flex items-center"
                >
                  <UserIcon className="h-4 w-4 mr-2 text-green-500" />{" "}
                  O'qituvchi <span className="text-red-500">*</span>
                </label>
                <select
                  id="teacher"
                  name="teacher"
                  value={groupData.teacher}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-green-500 focus:border-green-500 transition duration-150 bg-white shadow-sm appearance-none"
                >
                  {/* Agar hozirgi o'qituvchi MOCK_TEACHERS ichida bo'lmasa, uni birinchi variant sifatida qo'yish kerak, lekin bizning mock datamiz mos keladi deb hisoblaymiz */}
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

              {/* 4. Dars Soatlari (Split Input) */}
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
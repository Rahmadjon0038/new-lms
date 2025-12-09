"use client";

import React, { useState } from "react";
// Heroicons ikonkalari
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  AcademicCapIcon, // Rol uchun ikonka
  PencilSquareIcon, // Tahrirlash ikonka
  ArrowUpOnSquareIcon, // Saqlash ikonka
} from "@heroicons/react/24/outline";

// Material-UI importlari
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

// --- MOCK DATA (YANGILANDI: role qo'shildi) ---
const mockUserProfile = {
  id: 1,
  firstName: "Rahmadjon",
  lastName: "Abdullayev",
  phone: "+998 90 123 45 67",
  role: "O'qituvchi", // Yangi: Rol
};

// --- MUI Style Objekti ---
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: "12px",
  boxShadow: 24,
  p: 3,
  outline: "none",
  maxHeight: "90vh",
  overflowY: "auto",
};

// --- PROFILE MODAL KOMPONENTI ---
export default function ProfileModal({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  // Tahrirlanadigan ma'lumotlar uchun holat (state)
  const [profileData, setProfileData] = useState({
    firstName: mockUserProfile.firstName,
    lastName: mockUserProfile.lastName,
    phone: mockUserProfile.phone,
    // Rolni statega kiritmaymiz, chunki u tahrirlanmaydi
  });

  const [isEditing, setIsEditing] = useState(false);

  // Modalni ochish/yopish funksiyalari
  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setIsEditing(false);
    setIsOpen(false);
  };

  // Foydalanuvchi blokini bosish uchun trigger
  const trigger = children && (
    <div onClick={handleOpen} className="cursor-pointer">
      {children}
    </div>
  );

  // Input qiymatlari o'zgarganda holatni yangilash
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SAQLASH FUNKSIYASI
  const handleSave = () => {
    console.log("-----------------------------------------");
    console.log("✅ Profil Ma'lumotlari Yangilandi:");
    console.log(`Ism: ${profileData.firstName}`);
    console.log(`Familiya: ${profileData.lastName}`);
    console.log(`Telefon: ${profileData.phone}`);
    console.log("-----------------------------------------");

    // Tahrirlash holatini yopish
    setIsEditing(false);
  };

  return (
    <>
      {trigger}

      {/* MUI Modal Komponenti */}
      <Modal
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="profile-modal-title"
        aria-describedby="profile-modal-description"
      >
        <Box sx={modalStyle}>
          {/* Modal Kontent Bloki (Ichki Tailwind sinflari saqlanadi) */}
          <div className="relative">
            {/* Yopish tugmasi */}
            <button
              onClick={handleClose}
              className="absolute top-0 right-0 text-gray-400 hover:text-red-600 transition duration-150 p-1 rounded-full hover:bg-gray-100"
              title="Yopish"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Tahrirlash/Saqlash Tugmasi */}
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`absolute top-0 right-10 text-white p-2 rounded-full transition duration-150 shadow-md ${
                isEditing
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              title={
                isEditing ? "Ma'lumotlarni Saqlash" : "Tahrirlashni Boshlash"
              }
            >
              {isEditing ? (
                <ArrowUpOnSquareIcon className="h-5 w-5" />
              ) : (
                <PencilSquareIcon className="h-5 w-5" />
              )}
            </button>

            {/* Modal Sarlavhasi */}
            <h3
              id="profile-modal-title"
              className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3 flex items-center"
            >
              <UserIcon className="h-7 w-7 mr-3 text-blue-600" />
              Profil Ma'lumotlari
            </h3>

            {/* Forma kontenti */}
            <form className="space-y-5">
              {/* 1. Rol (Disabled/O'chirilgan) */}
              <div className="flex flex-col">
                <label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-600 mb-1 flex items-center"
                >
                  <AcademicCapIcon className="h-4 w-4 mr-1 text-gray-500" /> Rol
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={mockUserProfile.role}
                  disabled={true} // ROL UCHUN QAT'IY O'CHIRILGAN
                  className="px-4 py-2 border rounded-lg text-gray-800 bg-gray-100 border-gray-200 cursor-not-allowed font-semibold"
                />
              </div>

              {/* 2. Ism (Input) */}
              <div className="flex flex-col">
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-600 mb-1"
                >
                  Ism
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`px-4 py-2 border rounded-lg text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 
                    ${
                      isEditing
                        ? "bg-white border-gray-300"
                        : "bg-gray-50 border-gray-200 cursor-not-allowed"
                    }`}
                />
              </div>

              {/* 3. Familiya (Input) */}
              <div className="flex flex-col">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-600 mb-1"
                >
                  Familiya
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`px-4 py-2 border rounded-lg text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 
                    ${
                      isEditing
                        ? "bg-white border-gray-300"
                        : "bg-gray-50 border-gray-200 cursor-not-allowed"
                    }`}
                />
              </div>

              {/* 4. Telefon Raqami (Input) */}
              <div className="flex flex-col">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-600 mb-1"
                >
                  Telefon Raqami
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`pl-10 pr-4 py-2 border rounded-lg w-full text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 
                      ${
                        isEditing
                          ? "bg-white border-gray-300"
                          : "bg-gray-50 border-gray-200 cursor-not-allowed"
                      }`}
                  />
                </div>
              </div>

              {/* Saqlash Tugmasi */}
              {isEditing && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full flex items-center justify-center px-4 py-2 mt-6 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition duration-200 shadow-md"
                >
                  <ArrowUpOnSquareIcon className="h-5 w-5 mr-2" />
                  Yangilash va Saqlash
                </button>
              )}
            </form>
          </div>
        </Box>
      </Modal>
    </>
  );
}

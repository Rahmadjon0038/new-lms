"use client";

import React, { useState } from "react";
import {
  XMarkIcon,
  UserIcon,
  AcademicCapIcon,
  ArrowUpOnSquareIcon,
  BookOpenIcon, // Fan uchun ikonka
  UsersIcon, // Tanlangan foydalanuvchi uchun ikonka
} from "@heroicons/react/24/outline";

// Material-UI importlari (Sizning uslubingizga mos bo'lishi uchun saqlanadi)
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

// --- MOCK DATA: Tizimdagi Barcha Potentsial Foydalanuvchilar ---
// Bu ro'yxatdan kimni o'qituvchi qilishni tanlaymiz
const allUsers = [
  { id: "u1", name: "Alisher Vohidov (ID: 101)", role: "Operator" },
  { id: "u2", name: "Diyora Saidova (ID: 102)", role: "Menejer" },
  { id: "u3", name: "Sanjar Karimxo'jayev (ID: 103)", role: "Talaba" },
  { id: "u4", name: "Lola Rahmatullayeva (ID: 104)", role: "Talaba" },
  { id: "u5", name: "Behruz Anvarov (ID: 105)", role: "Talaba" },
];

// --- MUI Style Objekti (o'zgarishsiz) ---
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 650, // Modal hajmini biroz kattalashtirdik
  bgcolor: "background.paper",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4, // Padding oshirildi
  outline: "none",
  maxHeight: "90vh",
  overflowY: "auto",
};

// --- Yordamchi Komponent: Qidiruvli Selectni Simulyatsiya qilish ---
const SearchableSelect = ({ options, value, onChange, label, icon: Icon }) => {
  const [searchText, setSearchText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Qidiruv natijalari
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Tanlangan optionning nomini topish
  const selectedName =
    options.find((opt) => opt.id === value)?.name || "Tanlanmagan";

  return (
    <div className="flex flex-col relative">
      <label className="text-sm font-medium text-gray-600 mb-1 flex items-center">
        <Icon className="h-4 w-4 mr-1 text-gray-500" /> {label}
      </label>

      {/* Input va Tanlangan Qiymat */}
      <div
        className="relative border border-gray-300 rounded-lg bg-white shadow-sm cursor-pointer"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        <input
          type="text"
          placeholder={selectedName}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full px-4 py-2 border-none rounded-lg text-gray-800 focus:ring-0"
        />
      </div>

      {/* Dropdown Ro'yxati */}
      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-12 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className="px-4 py-2 text-gray-800 hover:bg-blue-50 cursor-pointer text-sm"
                onClick={() => {
                  onChange(option.id);
                  setIsDropdownOpen(false);
                  setSearchText(option.name); // Inputda tanlangan ism turishi uchun
                }}
              >
                {option.name}{" "}
                <span className="text-gray-400">({option.role})</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm italic">
              Natija topilmadi.
            </div>
          )}
        </div>
      )}
      {/* Tanlangan nomi ekranda yashirincha turishi */}
      <input type="hidden" value={value} readOnly />
    </div>
  );
};

// --- ASOSIY KOMPONENT: O'qituvchi Qo'shish Modali ---
export default function AddTeacherModal({ isOpen, handleClose, children }) {
  // Forma ma'lumotlari holati
  const [formData, setFormData] = useState({
    userId: "", // SearchableSelect orqali tanlanadi
    subjects: "", // O'qitadigan fanlar (vergul bilan ajratilgan)
  });

  // Xatolik holati
  const [error, setError] = useState("");

  // Select va Input qiymatlari o'zgarganda
  const handleSelectChange = (userId) => {
    setFormData((prev) => ({ ...prev, userId }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // SAQLASH / QO'SHISH FUNKSIYASI
  const handleAddTeacher = () => {
    setError(""); // Avvalgi xatolarni tozalash

    if (!formData.userId || !formData.subjects.trim()) {
      setError(
        "Iltimos, foydalanuvchini tanlang va o'qitish fanlarini kiriting."
      );
      return;
    }

    const selectedUser = allUsers.find((u) => u.id === formData.userId);

    console.log("-----------------------------------------");
    console.log("✅ Yangi O'qituvchi Qo'shildi:");
    console.log(
      `Tanlangan Foydalanuvchi: ${selectedUser ? selectedUser.name : "Xato"}`
    );
    console.log(
      `O'qitadigan Fanlar: ${formData.subjects
        .split(",")
        .map((s) => s.trim())
        .join(", ")}`
    );
    console.log("-----------------------------------------");

    // Formani tozalash va modalni yopish
    setFormData({ userId: "", subjects: "" });
    handleClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="add-teacher-modal-title"
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
            id="add-teacher-modal-title"
            className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3 flex items-center"
          >
            <AcademicCapIcon className="h-7 w-7 mr-3 text-green-600" />
            Yangi O'qituvchi Qo'shish
          </h3>

          {/* Forma kontenti */}
          <form className="space-y-6">
            {/* 1. QIDIRUVLI FOYDALANUVCHI TANLASH (YANGI) */}
            <SearchableSelect
              options={allUsers}
              value={formData.userId}
              onChange={handleSelectChange}
              label="Tizimdan Foydalanuvchini Tanlang"
              icon={UsersIcon}
            />

            {/* 2. O'QITADIGAN FANLAR (INPUT) */}
            <div className="flex flex-col">
              <label
                htmlFor="subjects"
                className="text-sm font-medium text-gray-600 mb-1 flex items-center"
              >
                <BookOpenIcon className="h-4 w-4 mr-1 text-gray-500" />{" "}
                O'qitadigan Fanlar (Vergul bilan ajrating)
              </label>
              <input
                type="text"
                id="subjects"
                name="subjects"
                value={formData.subjects}
                onChange={handleInputChange}
                placeholder="Misol: Web Dasturlash, Python, UX/UI"
                className={`px-4 py-2 border rounded-lg w-full text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 border-gray-300`}
              />
            </div>

            {/* Xatolik xabari */}
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Qo'shish Tugmasi */}
            <button
              type="button"
              onClick={handleAddTeacher}
              className="w-full flex items-center justify-center px-4 py-3 mt-6 rounded-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 transition duration-200 shadow-lg"
            >
              <ArrowUpOnSquareIcon className="h-5 w-5 mr-2" />
              O'qituvchi Sifatida Qo'shish
            </button>
          </form>
        </div>
      </Box>
    </Modal>
  );
}

"use client";

import React, { useState } from "react";
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  AtSymbolIcon,
  AcademicCapIcon,
  PencilSquareIcon,
  CheckIcon,
  CalendarDaysIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { usegetProfile, useUpdateProfile } from "../../hooks/user";
import { useGetNotify } from "../../hooks/notify";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 550 },
  bgcolor: "white",
  borderRadius: "16px",
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  p: 0,
  outline: "none",
  overflow: "hidden",
};

export default function ProfileModal({ children, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user, isLoading } = usegetProfile();
  const updateProfileMutation = useUpdateProfile();
  const notify = useGetNotify();
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    username: "",
    name: "",
    surname: "",
    phone: "",
    phone2: "",
  });

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const nextData = {
      username: profileData.username.trim(),
      name: profileData.name.trim(),
      surname: profileData.surname.trim(),
      phone: profileData.phone.trim(),
      phone2: profileData.phone2.trim(),
    };

    if (!nextData.username) {
      notify("err", "Username bo'sh bo'lmasligi kerak");
      return;
    }

    const currentData = {
      username: (user?.username || "").trim(),
      name: (user?.name || "").trim(),
      surname: (user?.surname || "").trim(),
      phone: (user?.phone || "").trim(),
      phone2: (user?.phone2 || "").trim(),
    };

    const payload = {};
    Object.keys(nextData).forEach((key) => {
      if (nextData[key] !== currentData[key]) payload[key] = nextData[key];
    });

    if (Object.keys(payload).length === 0) {
      notify("err", "Yangilash uchun kamida bitta maydonni o'zgartiring");
      return;
    }

    updateProfileMutation.mutate({
      ...payload,
      onSuccess: (data) => {
        notify("ok", data?.message || "Profil muvaffaqiyatli yangilandi");
        setProfileData((prev) => ({ ...prev, ...nextData }));
        setIsEditing(false);
      },
      onError: (err) => {
        notify("err", err?.response?.data?.message || err?.message || "Profilni yangilashda xatolik");
      },
    });
  };

  const startEditing = () => {
    setProfileData({
      username: user?.username || "",
      name: user?.name || "",
      surname: user?.surname || "",
      phone: user?.phone || "",
      phone2: user?.phone2 || "",
    });
    setIsEditing(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) return children;

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer">{children}</div>

      <Modal open={isOpen} onClose={handleClose}>
        <Box sx={modalStyle}>
          {/* MODAL HEADER - #A60E07 Rangida */}
          <div className="p-6 text-white relative" style={{ backgroundColor: '#A60E07' }}>
            <button onClick={handleClose} className="absolute top-4 right-4 text-red-200 hover:text-white transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-2xl shadow-inner border border-white/20">
                <UserIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Profil Sozlamalari</h3>
                <p className="text-red-100 text-sm font-medium opacity-80">@{user?.username}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50">
            <form className="space-y-5">
              {/* TOP INFO CARDS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-1">
                    <AcademicCapIcon className="h-3 w-3 mr-1" style={{ color: '#A60E07' }} /> Rol
                  </label>
                  <p className="text-sm font-bold text-gray-800 capitalize">{user?.role}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-1">
                    <CalendarDaysIcon className="h-3 w-3 mr-1" style={{ color: '#A60E07' }} /> Qo&apos;shilgan
                  </label>
                  <p className="text-sm font-semibold text-gray-700">{formatDate(user?.created_at)}</p>
                </div>
              </div>

              <div className="flex flex-col bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-1">
                  <AtSymbolIcon className="h-3 w-3 mr-1" style={{ color: '#A60E07' }} /> Foydalanuvchi nomi
                </label>
                <input
                  name="username"
                  value={isEditing ? profileData.username : user?.username || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                    isEditing
                      ? "bg-white shadow-lg text-gray-900 outline-none"
                      : "bg-gray-100 border-transparent text-gray-600 cursor-not-allowed"
                  } font-medium text-sm`}
                  style={isEditing ? { borderColor: '#A60E07', boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                />
              </div>

              {/* INPUTS GROUP */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-500 ml-1 mb-1">Ism</label>
                    <input
                      name="name"
                      value={isEditing ? profileData.name : user?.name || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                        isEditing 
                        ? "bg-white shadow-lg text-gray-900 outline-none" 
                        : "bg-gray-100 border-transparent text-gray-600 cursor-not-allowed"
                      } font-medium text-sm`}
                      style={isEditing ? { borderColor: '#A60E07', boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-500 ml-1 mb-1">Familiya</label>
                    <input
                      name="surname"
                      value={isEditing ? profileData.surname : user?.surname || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                        isEditing 
                        ? "bg-white shadow-lg text-gray-900 outline-none" 
                        : "bg-gray-100 border-transparent text-gray-600 cursor-not-allowed"
                      } font-medium text-sm`}
                      style={isEditing ? { borderColor: '#A60E07', boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 ml-1 mb-1">Asosiy telefon</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors" style={{ color: isEditing ? '#A60E07' : '#9CA3AF' }} />
                    <input
                      name="phone"
                      value={isEditing ? profileData.phone : user?.phone || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 pr-4 py-2.5 w-full rounded-xl border transition-all duration-300 ${
                        isEditing 
                        ? "bg-white shadow-lg text-gray-900 outline-none" 
                        : "bg-gray-100 border-transparent text-gray-600"
                      } font-medium text-sm`}
                      style={isEditing ? { borderColor: '#A60E07', boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 ml-1 mb-1">Qo&apos;shimcha telefon</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors" style={{ color: isEditing ? '#A60E07' : '#9CA3AF' }} />
                    <input
                      name="phone2"
                      value={isEditing ? profileData.phone2 : user?.phone2 || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`pl-10 pr-4 py-2.5 w-full rounded-xl border transition-all duration-300 ${
                        isEditing 
                        ? "bg-white shadow-lg text-gray-900 outline-none" 
                        : "bg-gray-100 border-transparent text-gray-600"
                      } font-medium text-sm`}
                      style={isEditing ? { borderColor: '#A60E07', boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4">
                {!isEditing ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={startEditing}
                      className="w-full flex items-center justify-center space-x-2 py-3 text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] hover:opacity-90"
                      style={{ backgroundColor: '#A60E07', shadowColor: 'rgba(166, 14, 7, 0.2)' }}
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                      <span>Ma&apos;lumotlarni tahrirlash</span>
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="md:hidden w-full flex items-center justify-center space-x-2 py-3 bg-gray-900 text-white rounded-xl font-bold transition-all hover:bg-black"
                    >
                      <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
                      <span>Chiqish</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center justify-center space-x-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-60"
                    >
                      <CheckIcon className="h-5 w-5" />
                      <span>{updateProfileMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}</span>
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </Box>
      </Modal>
    </>
  );
}

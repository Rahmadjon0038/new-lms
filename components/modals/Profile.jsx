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
import { formatDateYMD } from "../../utils/date";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "92%", sm: 550 },
  maxHeight: { xs: "88vh", sm: "92vh" },
  bgcolor: "white",
  borderRadius: { xs: "4px", sm: "16px" },
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  p: 0,
  outline: "none",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
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

  if (isLoading) return children;

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer">{children}</div>

      <Modal open={isOpen} onClose={handleClose}>
        <Box sx={modalStyle}>
          {/* MODAL HEADER - #A60E07 Rangida */}
          <div className="relative p-3 text-white sm:p-6" style={{ backgroundColor: '#A60E07' }}>
            <button onClick={handleClose} className="absolute right-3 top-3 text-red-200 transition-colors hover:text-white sm:right-4 sm:top-4">
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            
            <div className="flex items-center gap-2.5 pr-7 sm:gap-4">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-2 shadow-inner sm:p-3">
                <UserIcon className="h-7 w-7 text-white sm:h-10 sm:w-10" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight sm:text-xl">Profil Sozlamalari</h3>
                <p className="text-[11px] font-medium text-red-100 opacity-80 sm:text-sm">@{user?.username}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-2.5 sm:p-6">
            <form className="space-y-3 sm:hidden">
              <div>
                <label className="mb-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  <AtSymbolIcon className="h-3 w-3" style={{ color: '#A60E07' }} />
                  Foydalanuvchi nomi
                </label>
                <input
                  name="username"
                  value={isEditing ? profileData.username : user?.username || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`h-10 w-full rounded-xl border px-3 text-sm font-medium transition-all duration-300 ${
                    isEditing
                      ? "border-[#A60E07] bg-white text-gray-900 outline-none"
                      : "border-transparent bg-gray-100 text-gray-600 cursor-not-allowed"
                  }`}
                  style={isEditing ? { boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-gray-500">Ism</label>
                  <input
                    name="name"
                    value={isEditing ? profileData.name : user?.name || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`h-10 w-full rounded-xl border px-3 text-sm font-medium transition-all duration-300 ${
                      isEditing
                        ? "border-[#A60E07] bg-white text-gray-900 outline-none"
                        : "border-transparent bg-gray-100 text-gray-600 cursor-not-allowed"
                    }`}
                    style={isEditing ? { boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-gray-500">Familiya</label>
                  <input
                    name="surname"
                    value={isEditing ? profileData.surname : user?.surname || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`h-10 w-full rounded-xl border px-3 text-sm font-medium transition-all duration-300 ${
                      isEditing
                        ? "border-[#A60E07] bg-white text-gray-900 outline-none"
                        : "border-transparent bg-gray-100 text-gray-600 cursor-not-allowed"
                    }`}
                    style={isEditing ? { boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-gray-500">Asosiy telefon</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: isEditing ? '#A60E07' : '#9CA3AF' }} />
                    <input
                      name="phone"
                      value={isEditing ? profileData.phone : user?.phone || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`h-10 w-full rounded-xl border py-2 pl-9 pr-3 text-sm font-medium transition-all duration-300 ${
                        isEditing
                          ? "border-[#A60E07] bg-white text-gray-900 outline-none"
                          : "border-transparent bg-gray-100 text-gray-600"
                      }`}
                      style={isEditing ? { boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-gray-500">Qo&apos;shimcha telefon</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: isEditing ? '#A60E07' : '#9CA3AF' }} />
                    <input
                      name="phone2"
                      value={isEditing ? profileData.phone2 : user?.phone2 || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`h-10 w-full rounded-xl border py-2 pl-9 pr-3 text-sm font-medium transition-all duration-300 ${
                        isEditing
                          ? "border-[#A60E07] bg-white text-gray-900 outline-none"
                          : "border-transparent bg-gray-100 text-gray-600"
                      }`}
                      style={isEditing ? { boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                    />
                  </div>
                </div>
              </div>

              <p className="pt-1 text-[10px] font-medium tracking-wide text-gray-400">
                Qo&apos;shilgan: {formatDateYMD(user?.created_at)}
              </p>

              <div className="space-y-2 pt-1">
                {!isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={startEditing}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#A60E07] text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      <span>Ma&apos;lumotlarni tahrirlash</span>
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-all hover:bg-black"
                    >
                      <ArrowRightEndOnRectangleIcon className="h-4 w-4" />
                      <span>Chiqish</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="h-11 rounded-xl bg-gray-200 text-sm font-bold text-gray-700 transition-all hover:bg-gray-300"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-green-600 text-sm font-bold text-white shadow-lg transition-all hover:bg-green-700 disabled:opacity-60"
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span>{updateProfileMutation.isPending ? "..." : "Saqlash"}</span>
                    </button>
                  </div>
                )}
              </div>
            </form>

            <form className="hidden space-y-4 sm:block sm:space-y-5">
              {/* TOP INFO CARDS */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4">
                <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm sm:p-3">
                  <label className="mb-1 flex items-center text-[9px] font-bold uppercase tracking-widest text-gray-400 sm:text-[10px]">
                    <AcademicCapIcon className="h-3 w-3 mr-1" style={{ color: '#A60E07' }} /> Rol
                  </label>
                  <p className="text-sm font-bold capitalize text-gray-800">{user?.role}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm sm:p-3">
                  <label className="mb-1 flex items-center text-[9px] font-bold uppercase tracking-widest text-gray-400 sm:text-[10px]">
                    <CalendarDaysIcon className="h-3 w-3 mr-1" style={{ color: '#A60E07' }} /> Qo&apos;shilgan
                  </label>
                  <p className="text-sm font-semibold text-gray-700">{formatDateYMD(user?.created_at)}</p>
                </div>
              </div>

              <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm sm:p-3">
                <label className="mb-1 flex items-center text-[9px] font-bold uppercase tracking-widest text-gray-400 sm:text-[10px]">
                  <AtSymbolIcon className="h-3 w-3 mr-1" style={{ color: '#A60E07' }} /> Foydalanuvchi nomi
                </label>
                <input
                  name="username"
                  value={isEditing ? profileData.username : user?.username || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`rounded-xl border px-3 py-2 text-sm transition-all duration-300 sm:px-4 sm:py-2.5 ${
                    isEditing
                      ? "bg-white shadow-lg text-gray-900 outline-none"
                      : "bg-gray-100 border-transparent text-gray-600 cursor-not-allowed"
                  } font-medium`}
                  style={isEditing ? { borderColor: '#A60E07', boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                />
              </div>

              {/* INPUTS GROUP */}
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1 ml-1 text-[11px] font-bold text-gray-500">Ism</label>
                    <input
                      name="name"
                      value={isEditing ? profileData.name : user?.name || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`rounded-xl border px-3 py-2 text-sm transition-all duration-300 sm:px-4 sm:py-2.5 ${
                        isEditing 
                        ? "bg-white shadow-lg text-gray-900 outline-none" 
                        : "bg-gray-100 border-transparent text-gray-600 cursor-not-allowed"
                      } font-medium`}
                      style={isEditing ? { borderColor: '#A60E07', boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 ml-1 text-[11px] font-bold text-gray-500">Familiya</label>
                    <input
                      name="surname"
                      value={isEditing ? profileData.surname : user?.surname || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`rounded-xl border px-3 py-2 text-sm transition-all duration-300 sm:px-4 sm:py-2.5 ${
                        isEditing 
                        ? "bg-white shadow-lg text-gray-900 outline-none" 
                        : "bg-gray-100 border-transparent text-gray-600 cursor-not-allowed"
                      } font-medium`}
                      style={isEditing ? { borderColor: '#A60E07', boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 ml-1 text-[11px] font-bold text-gray-500">Asosiy telefon</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors" style={{ color: isEditing ? '#A60E07' : '#9CA3AF' }} />
                    <input
                      name="phone"
                      value={isEditing ? profileData.phone : user?.phone || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full rounded-xl border py-2 pl-10 pr-4 text-sm transition-all duration-300 sm:py-2.5 ${
                        isEditing 
                        ? "bg-white shadow-lg text-gray-900 outline-none" 
                        : "bg-gray-100 border-transparent text-gray-600"
                      } font-medium`}
                      style={isEditing ? { borderColor: '#A60E07', boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 ml-1 text-[11px] font-bold text-gray-500">Qo&apos;shimcha telefon</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors" style={{ color: isEditing ? '#A60E07' : '#9CA3AF' }} />
                    <input
                      name="phone2"
                      value={isEditing ? profileData.phone2 : user?.phone2 || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full rounded-xl border py-2 pl-10 pr-4 text-sm transition-all duration-300 sm:py-2.5 ${
                        isEditing 
                        ? "bg-white shadow-lg text-gray-900 outline-none" 
                        : "bg-gray-100 border-transparent text-gray-600"
                      } font-medium`}
                      style={isEditing ? { borderColor: '#A60E07', boxShadow: '0 0 0 4px rgba(166, 14, 7, 0.1)' } : {}}
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 sm:pt-4">
                {!isEditing ? (
                  <div className="space-y-2.5 sm:space-y-3">
                    <button
                      type="button"
                      onClick={startEditing}
                      className="flex w-full items-center justify-center space-x-2 rounded-xl py-2.5 font-bold text-white transition-all shadow-lg active:scale-[0.98] hover:opacity-90 sm:py-3"
                      style={{ backgroundColor: '#A60E07', shadowColor: 'rgba(166, 14, 7, 0.2)' }}
                    >
                      <PencilSquareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Ma&apos;lumotlarni tahrirlash</span>
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="md:hidden flex w-full items-center justify-center space-x-2 rounded-xl bg-gray-900 py-2.5 font-bold text-white transition-all hover:bg-black sm:py-3"
                    >
                      <ArrowRightEndOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Chiqish</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl bg-gray-200 py-2.5 font-bold text-gray-700 transition-all hover:bg-gray-300 sm:py-3"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center justify-center space-x-2 rounded-xl bg-green-600 py-2.5 font-bold text-white transition-all shadow-lg disabled:opacity-60 hover:bg-green-700 sm:py-3"
                    >
                      <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
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

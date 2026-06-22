"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAddUser } from "../../hooks/user";
import { useGetNotify } from "../../hooks/notify";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const addUserMutation = useAddUser();
  const notify = useGetNotify()
  const navigate = useRouter()
  const roleRouteMap = {
    teacher: "/teacher/attendance",
    admin: "/admin/attendance",
    super_admin: "/super_admin",
    student: "/student",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const logindata = { username, password }
    addUserMutation.mutate({
      logindata,
      onSuccess: (data) => {
        const role = data?.user?.role;
        navigate.push(roleRouteMap[role] || `/${role}`);
        notify('ok', 'Tizimga kirish mofaqqiyatli');
        Cookies.set('accessToken', data.accessToken);
        Cookies.set('refreshToken', data.refreshToken);
        Cookies.set('role', data.user.role);
      },
      onError: (err) => {
        notify('err', err.response?.data?.message || 'Server xatosi');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#A60E07] p-4 relative overflow-hidden">
      {/* - max-w-[550px] saqlandi (katta ekranda o'zgarmaydi)
          - p-6 (mobil) -> sm:p-12 (katta ekran) qilib o'zgartirildi
          - rounded-2xl (mobil) -> sm:rounded-3xl (katta ekran)
      */}
      <div className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-3xl shadow-2xl w-full max-w-[550px] z-10 mx-auto">

        {/* Logotip qismi - mobil o'lchamlari moslandi */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center mb-4 relative border-2 border-[#A60E07] rounded-full bg-white transition-all">
            <Image
              src="/logo1.png"
              alt="Logo"
              width={100}
              height={100}
              className="w-16 sm:w-24 h-auto"
            />
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-800 tracking-tight">TARAQQIYOT</h2>
          <p className="text-gray-400 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mt-1">Teaching Center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase ml-1">Foydalanuvchi nomi</label>
            <input
              type="text"
              placeholder="Foydalanuvchi nomi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-[#A60E07]/20 focus:border-[#A60E07] outline-none transition-all text-gray-700 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase ml-1">Parol</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="•••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-4 pr-11 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-[#A60E07]/20 focus:border-[#A60E07] outline-none transition-all text-gray-700 text-sm sm:text-base"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 sm:py-4 bg-[#A60E07] hover:bg-[#8B0C06] text-white font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-[#A60E07]/30 active:scale-[0.98] transition-all text-sm sm:text-base"
          >
            KIRISH
          </button>
        </form>

        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={() => {
              setShowForgot((prev) => !prev);
            }}
            className="text-xs sm:text-sm font-semibold text-[#A60E07] hover:underline"
          >
            Parolni unutdingizmi?
          </button>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-gray-400 text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] uppercase italic">
            Bilim kelajak poydevori
          </p>
        </div>
      </div>

      {showForgot ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800">Parolni tiklash</h3>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                Yopish
              </button>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              Parolni esdan chiqardim degan bo&apos;lsangiz, adminga murojaat qiling.
              Recovery key orqali tiklash endi ishlatilmaydi.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Login;

"use client";
import React, { useState } from "react";
import Image from "next/image";
import Snowfall from "react-snowfall";
import { useAddUser, useResetPasswordWithKey } from "../../hooks/user";
import { useGetNotify } from "../../hooks/notify";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotForm, setForgotForm] = useState({
    username: "",
    recovery_key: "",
    new_password: "",
  });
  const [newRecoveryKey, setNewRecoveryKey] = useState("");
  const addUserMutation = useAddUser();
  const resetPasswordMutation = useResetPasswordWithKey();
  const notify = useGetNotify()
  const navigate = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault();
    const logindata = { username, password }
    addUserMutation.mutate({
      logindata,
      onSuccess: (data) => {
        navigate.push(`/${data?.user?.role}`)
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

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotForm.username || !forgotForm.recovery_key || !forgotForm.new_password) {
      notify("err", "Barcha maydonlarni to'ldiring");
      return;
    }

    resetPasswordMutation.mutate({
      username: forgotForm.username.trim(),
      recovery_key: forgotForm.recovery_key.trim(),
      new_password: forgotForm.new_password,
      onSuccess: (data) => {
        const key = data?.data?.recovery_key || "";
        setNewRecoveryKey(key);
        notify("ok", data?.message || "Parol muvaffaqiyatli tiklandi");
      },
      onError: (err) => {
        notify("err", err?.response?.data?.message || "Parolni tiklashda xatolik");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#A60E07] p-4 relative overflow-hidden">
      <Snowfall snowflakeCount={100} color="white" />

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
            <input
              type="password"
              placeholder="•••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-[#A60E07]/20 focus:border-[#A60E07] outline-none transition-all text-gray-700 text-sm sm:text-base"
            />
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
              setNewRecoveryKey("");
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
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Foydalanuvchi nomi"
                value={forgotForm.username}
                onChange={(e) => setForgotForm((p) => ({ ...p, username: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#A60E07]"
              />
              <input
                type="text"
                placeholder="Recovery key"
                value={forgotForm.recovery_key}
                onChange={(e) => setForgotForm((p) => ({ ...p, recovery_key: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#A60E07]"
              />
              <input
                type="password"
                placeholder="Yangi parol"
                value={forgotForm.new_password}
                onChange={(e) => setForgotForm((p) => ({ ...p, new_password: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#A60E07]"
              />
              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full rounded-xl bg-[#A60E07] py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {resetPasswordMutation.isPending ? "Yuklanmoqda..." : "Parolni tiklash"}
              </button>
            </form>
            {newRecoveryKey ? (
              <div className="mt-3 rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Yangi recovery key (saqlab qo&apos;ying):</p>
                <p className="text-sm font-bold text-[#A60E07] break-all">{newRecoveryKey}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Login;

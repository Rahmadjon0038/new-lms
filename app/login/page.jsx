"use client";
import React, { useState } from "react";
import Image from "next/image";
import Snowfall from "react-snowfall";
import { useAddUser } from "../../hooks/user";
import { useGetNotify } from "../../hooks/notify";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const addUserMutation = useAddUser();
  const notify = useGetNotify()
  const navigate = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault();
    const logindata = { username, password }
    addUserMutation.mutate( {
      logindata,
      onSuccess: (data) => {
      navigate.push(data?.user?.role)
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
      {/* Qor yog'ishi effekti saqlab qolindi */}
      <Snowfall snowflakeCount={100} color="white" />

      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl w-full max-w-[550px] z-10">

        {/* Logotip qismi */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-4 relative border-2 border-[#A60E07] rounded-full p-2 bg-white">
            <Image
              src='/logo.png'
              alt="Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">TARAQQIYOT</h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mt-1">O'quv Markazi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Username</label>
            <input
              type="text"
              placeholder="Foydalanuvchi nomi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A60E07]/20 focus:border-[#A60E07] outline-none transition-all text-gray-700"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Parol</label>
            <input
              type="password"
              placeholder="•••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A60E07]/20 focus:border-[#A60E07] outline-none transition-all text-gray-700"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-4 bg-[#A60E07] hover:bg-[#8B0C06] text-white font-bold rounded-2xl shadow-lg shadow-[#A60E07]/30 active:scale-[0.98] transition-all"
          >
            KIRISH
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase italic">
            Bilim kelajak poydevori
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
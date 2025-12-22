"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Image from "next/image";
import Snowfall from "react-snowfall";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    let role = "";
    const token = "secure_token_123";

    if (username === "superadmin") role = "super-admin";
    else if (username === "admin") role = "admin";
    else if (username === "teacher") role = "teacher";
    else if (username === "student") role = "student";

    setTimeout(() => {
      if (role && password === "123456") {
        Cookies.set("token", token, { expires: 1 });
        Cookies.set("role", role, { expires: 1 });
        window.location.href = `/${role}`;
      } else {
        alert("Username yoki parol xato! \n(Test: admin / 123456)");
        setLoading(false);
      }
    }, 1200);
  };

  return (
    // bg-[#5578e1] -> bg-[#A60E07] ga o'zgardi
    <div className="min-h-screen flex items-center justify-center bg-[#A60E07] p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      <Snowfall
        snowflakeCount={100}
        color="white"
      />
      {/* Orqa fondagi dekorativ elementlar */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-12 -right-12 sm:-top-24 sm:-right-24 w-48 h-48 sm:w-96 sm:h-96 bg-white/10 rounded-full opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 sm:-bottom-24 sm:-left-24 w-48 h-48 sm:w-96 sm:h-96 bg-white/10 rounded-full opacity-50"></div>
      </div>

      <div className="bg-white p-6 sm:p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-[600px] z-10 border border-gray-100 transition-all duration-300">

        {/* Logotip qismi */}
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 relative">
            {/* Border rangi #A60E07 ga o'zgardi */}
            <div className="absolute inset-0 border-2 border-[#A60E07] rounded-full flex items-center justify-center p-2 overflow-hidden bg-white">
              <Image
                src='/logo.png'
                alt="Taraqqiyot Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight text-center">TARAQQIYOT</h2>
          <p className="text-gray-400 text-[10px] sm:text-xs mt-1 uppercase tracking-[0.2em]">O'quv Markazi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase ml-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Foydalanuvchi nomi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                // Focus ring va border ranglari #A60E07 ga moslandi
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A60E07]/20 focus:border-[#A60E07] outline-none transition-all text-gray-700 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase ml-1">Parol</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                placeholder="•••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                // Focus ring va border ranglari #A60E07 ga moslandi
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A60E07]/20 focus:border-[#A60E07] outline-none transition-all text-gray-700 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Login Button */}
          {/* bg-[#1448E5] -> bg-[#A60E07] va shadow ranglari o'zgardi */}
          <button
            type="submit"
            disabled={loading}
            className="w-full group relative flex justify-center py-3.5 sm:py-4 px-4 border border-transparent rounded-2xl text-white font-bold bg-[#A60E07] hover:bg-[#8B0C06] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A60E07] transition-all overflow-hidden shadow-lg shadow-[#A60E07]/20"
          >
            <span className="relative z-10 flex items-center text-sm sm:text-base">
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "KIRILMOQDA..." : "KIRISH"}
            </span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-[10px] sm:text-xs tracking-[0.2em] uppercase italic">
            Bilim kelajak poydevori
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
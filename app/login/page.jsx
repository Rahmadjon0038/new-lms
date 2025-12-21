"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Yo'naltirish uchun

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Yuklanish holati
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Konsolga ma'lumotlarni chiqarish
    console.log("--- Kirishga urinish ---");
    console.log("Email:", email);
    console.log("Parol:", password);

    // 2. SUN'IY TEKSHIRUV (Haqiqiy API bo'lguncha shunday turadi)
    if (email === "admin@example.com" && password === "123456") {
      
      // Cookie-ga token saqlash (bu middleware ishlashi uchun shart)
      // Haqiqiy loyihada 'auth-token' o'rniga backenddan kelgan JWT token qo'yiladi
      document.cookie = `auth-token=true; path=/; max-age=${60 * 60 * 24};`; // 1 kunlik

      // 3. Asosiy sahifaga yo'naltirish
      router.push("/"); 
      router.refresh(); // Middleware o'zgarishni sezishi uchun
    } else {
      alert("Email yoki parol xato! (Test: admin@example.com / 123456)");
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 text-gray-900">
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg w-full max-w-xl">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-1">
          O'quv Markazi
        </h2>
        <p className="text-gray-500 text-center mb-8">Tizimga kirish</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Parol
            </label>
            <input
              type="password"
              id="password"
              placeholder="parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 ease-in-out mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
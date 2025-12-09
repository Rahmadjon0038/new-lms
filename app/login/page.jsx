"use client";
import React, { useState } from "react";

function Login() {
  // State Hook'lari orqali input qiymatlarini saqlash
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Formani yuborish (submit) hodisasini boshqaruvchi funksiya
  const handleSubmit = (e) => {
    // Standart formani yuborish harakatini to'xtatish
    e.preventDefault();

    // Talab qilinganidek, email va parolni konsolga chiqarish
    console.log("--- Tizimga kirish ma'lumotlari ---");
    console.log("Email:", email);
    console.log("Parol:", password);
    console.log(email, password);

    // Haqiqiy ilovada bu yerda API chaqiruvi bo'ladi
    // signIn(email, password);
  };

  return (
    // Sahifa konteyneri: To'liq ekran, ochiq fon, markazga joylashish
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Kartochka (Card) komponenti: Oq fon, soya, yumaloq burchaklar, maksimal kenglik */}
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg w-full max-w-xl">
        {/* Sarlavha qismi */}
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-1">
          O'quv Markazi
        </h2>
        <p className="text-gray-500 text-center mb-8">Tizimga kirish</p>

        {/* Form elementini va handleSubmit funksiyasini biriktirish */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email maydoni */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              // Input uslublari: To'liq kenglik, padding, chegara, fokus effekti
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Parol maydoni */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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

          {/* Kirish tugmasi */}
          <button
            type="submit"
            // Tugma uslublari: To'liq kenglik, ko'k fon, hover effekti, padding
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 ease-in-out mt-4"
          >
            Kirish
          </button>
        </form>

        {/* Test hisoblari qismi */}
        {/* <div className="mt-6 pt-4 border-t border-gray-200 text-left text-xs text-gray-600 leading-relaxed">
          <p className="font-semibold mb-1 text-sm">Test hisoblar:</p>
          <p>
            <span className="font-bold text-gray-800">Super Admin:</span>{" "}
            super-admin@example.com / 123456
          </p>
          <p>
            <span className="font-bold text-gray-800">Manager:</span>{" "}
            manager@example.com / 123456
          </p>
          <p>
            <span className="font-bold text-gray-800">O'qituvchi:</span>{" "}
            teacher@example.com / 123456
          </p>
          <p>
            <span className="font-bold text-gray-800">Talaba:</span>{" "}
            student@example.com / 123456
          </p>
        </div> */}
      </div>
    </div>
  );
}

export default Login;

"use client";
import React, { useState } from "react";
import {
  UserIcon,
  LockClosedIcon,
  PhoneIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// Mock ma'lumotlar
const MOCK_SUBJECTS = ["Web Dasturlash", "Python AI", "Ingliz Tili (B1)", "Grafik Dizayn", "SMM", "Matematika"];
const MOCK_GROUPS = {
  "Web Dasturlash": [
    { groupName: "Web Pro 201", teacher: "Jasur Raximov" },
    { groupName: "Web Pro 202", teacher: "Jasur Raximov" },
  ],
  "Python AI": [
    { groupName: "Python 301", teacher: "Shahnoza Qodirova" },
    { groupName: "Python 302", teacher: "Shahnoza Qodirova" },
  ],
  "Ingliz Tili (B1)": [
    { groupName: "English B1 N1", teacher: "Raxmadjon Abdullaev" },
    { groupName: "English B1 N2", teacher: "Raxmadjon Abdullaev" },
  ],
  "Grafik Dizayn": [{ groupName: "Grafika B1", teacher: "Shoxrux Tursunov" }],
  "SMM": [{ groupName: "SMM Master", teacher: "Shoxrux Tursunov" }],
  "Matematika": [{ groupName: "Matematika K2", teacher: "Umid Karimov" }],
  default: [{ groupName: "Yangi Guruh", teacher: "Noma'lum O'qituvchi" }],
};

const Page = () => {
  const [step, setStep] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");

  // 1-qadam: Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 2-qadam: Shaxsiy ma'lumotlar
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [subject, setSubject] = useState("");

  // Xatolar
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    if (!username.trim() || !password.trim()) {
      setErrors({ step1: "Username va parol majburiy!" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = () => {
    const err = {};
    if (!name.trim()) err.name = "Ism majburiy";
    if (!surname.trim()) err.surname = "Familiya majburiy";

    // Faqat raqamlarni hisoblaymiz, kamida 9 ta raqam bo'lishi kerak
    const digitsOnly = phone1.replace(/\D/g, "");
    if (digitsOnly.length < 9) {
      err.phone1 = "Telefon raqamida kamida 9 ta raqam bo'lishi kerak";
    }

    if (!subject) err.subject = "Fan tanlash majburiy";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setSuccessMessage("Login muvaffaqiyatli yaratildi!");
      setTimeout(() => {
        setSuccessMessage("");
        setStep(2);
      }, 1500);
    }
  };

  const handleSaveStudent = () => {
    if (!validateStep2()) return;

    const newStudent = {
      id: Date.now(),
      name,
      surname,
      phone: phone1.trim(),
      phone2: phone2.trim() || null,
      subject,
      group: null,
      teacher: null,
      status: "Qo'shilmagan",
      registrationDate: new Date().toISOString().split("T")[0],
      username,
    };

    console.log("Yangi talaba saqlandi:", newStudent);
    alert("Talaba muvaffaqiyatli qo'shildi! Status: Qo'shilmagan");
  };

  const availableGroups = subject ? MOCK_GROUPS[subject] || MOCK_GROUPS.default : [];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Yangi Talaba Qabul Qilish
        </h1>

        {/* Qadamlar ko'rsatkichi — 2 ta */}
        <div className="flex justify-center mb-10">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  step >= i ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                {i}
              </div>
              {i < 2 && <div className="w-48 h-1 bg-gray-300 mx-2" />}
            </div>
          ))}
        </div>

        {/* Muvaffaqiyat habari */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-center font-medium">
            {successMessage}
          </div>
        )}

        {/* 1-QADAM: Login */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <LockClosedIcon className="h-6 w-6 text-blue-600" />
              Login yaratish
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="masalan: alijon2005"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Kamida 6 belgidan iborat"
                />
              </div>
              {errors.step1 && <p className="text-red-600 text-sm">{errors.step1}</p>}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNextFromStep1}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition"
              >
                Keyingi qadam
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* 2-QADAM: Shaxsiy ma'lumotlar */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-blue-600" />
              Shaxsiy ma'lumotlar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ism *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Familiya *</label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.surname && <p className="text-red-600 text-xs mt-1">{errors.surname}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon 1 (majburiy) *
                </label>
                <input
                  type="text"
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+998 90 123 45 67"
                />
                {errors.phone1 && <p className="text-red-600 text-xs mt-1">{errors.phone1}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon 2</label>
                <input
                  type="text"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+998 99 999 99 99"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fan tanlang *</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Fan tanlang --</option>
                  {MOCK_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.subject && <p className="text-red-600 text-xs mt-1">{errors.subject}</p>}
              </div>
            </div>

            {/* Guruhga qo'shish tugmasi — faqat tugma (keyinchalik modal uchun) */}
            {subject && availableGroups.length > 0 && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => {
                    console.log("Guruhga qo'shish tugmasi bosildi — modal ochiladi");
                  }}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition flex items-center gap-3 mx-auto"
                >
                  <UserGroupIcon className="h-6 w-6" />
                  Guruhga qo'shish (ixtiyoriy)
                </button>
              </div>
            )}

            {subject && availableGroups.length === 0 && (
              <p className="mt-8 text-center text-gray-500">Bu fan uchun guruhlar mavjud emas.</p>
            )}

            <div className="mt-12 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Oldingi
              </button>

              <button
                onClick={handleSaveStudent}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg transition"
              >
                Saqlash
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
"use client";
import React, { useState } from "react";
import {
  BookOpenIcon,
  ClockIcon,
  UsersIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  PlusCircleIcon, // Qo'shilish formasi uchun yangi ikonka
} from "@heroicons/react/24/outline";
import Link from "next/link"; // Guruhni ko'rish tugmasi uchun

// --- Mock Data (Guruhlar haqida ma'lumotlar) ---
const mockGroupsData = [
  {
    id: 1,
    name: "Web Dasturlash (Fullstack) 1-guruh",
    uniqueCode: "WD-FS-101",
    teacher: "Jasur Raximov",
    schedule: "Dush / Chor / Jum - 18:00",
    studentsCount: 15,
    status: "Faol",
  },
  {
    id: 2,
    name: "Python / Data Science 2-guruh",
    uniqueCode: "PY-DS-202",
    teacher: "Madina To'rayeva",
    schedule: "Seshanba / Payshanba - 14:00",
    studentsCount: 12,
    status: "Faol",
  },
  {
    id: 3,
    name: "Mobile Development (Flutter) 3-guruh",
    uniqueCode: "MB-FL-303",
    teacher: "Javlon Saidov",
    schedule: "Shanba - ertalab",
    studentsCount: 8,
    status: "Yopilgan",
  },
];

// --- Guruh Kartochkasi Komponenti (Dizayni Yaxshilangan) ---
const GroupCard = ({ group }) => {
  const isStatusActive = group.status === "Faol";
  const [copied, setCopied] = useState(false);

  const copyCodeToClipboard = () => {
    // Agar brauzerda clipboard API mavjud bo'lmasa, ogohlantirish berish
    if (typeof navigator.clipboard === "undefined") {
      alert(
        "Nusxalash funksiyasi brauzeringiz tomonidan qo'llab-quvvatlanmaydi."
      );
      return;
    }

    navigator.clipboard.writeText(group.uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // Hover effekti yanada kuchliroq qilindi
    <div className="flex flex-col bg-white p-6 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:translate-y-[-2px] border-t-4 border-blue-600">
      {/* 1. Yuqori Qism: Nomi va Status */}
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 leading-tight">
            <span className="text-blue-600 mr-2">
              <BookOpenIcon className="h-6 w-6 inline" />
            </span>
            {group.name}
          </h3>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
              isStatusActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {group.status}
          </span>
        </div>

        {/* 2. Asosiy Ma'lumotlar */}
        <div className="space-y-3 text-sm text-gray-700 mt-5 mb-8">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-3 text-gray-500" />
            <span className="font-semibold">O'qituvchi:</span>{" "}
            <span className="ml-1 text-gray-800">{group.teacher}</span>
          </div>

          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-3 text-gray-500" />
            <span className="font-semibold">Jadval:</span>{" "}
            <span className="ml-1 text-gray-800">{group.schedule}</span>
          </div>

          <div className="flex items-center">
            <UsersIcon className="h-5 w-5 mr-3 text-gray-500" />
            <span className="font-semibold">Talabalar soni:</span>{" "}
            <span className="ml-1 text-blue-600 font-bold">
              {group.studentsCount} ta
            </span>
          </div>
        </div>
      </div>

      {/* 3. PASTKI QISM: Tugma va Kod bloki */}
      <div className="flex-none mt-4 space-y-3 pt-4 border-t border-gray-100">
        {/* Guruhni ko'rish asosiy tugmasi */}
        <Link
          href={`/students/groups/${group.id}`} // Haqiqiy yo'lga almashtiring
          className="block text-center w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition duration-150 ease-in-out text-base shadow-md"
        >
          Guruhni ko'rish
        </Link>

        {/* Unikal Kod va Nusxalash Tugmasi */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-mono text-gray-800 text-sm tracking-widest">
            {group.uniqueCode}
          </span>
          {/* Nusxalash tugmasi: Ikkilamchi rang va effekt */}
          <button
            onClick={copyCodeToClipboard}
            className={`flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg transition duration-150 shadow-sm
                    ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
            title="Guruh kodini nusxalash"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
            {copied ? "Nusxalandi" : "Kod"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Asosiy Komponent (Qo'shilish Formasi bilan) ---
function StudetGroup() {
  const [joinCode, setJoinCode] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      console.log("--- Guruhga qo'shilish so'rovi ---");
      console.log("Kiritilgan kod:", joinCode);
      setJoinCode("");
      alert(`Kod: ${joinCode} konsolga chiqarildi!`);
    } else {
      alert("Iltimos, guruh kodini kiriting.");
    }
  };

  return (
    <div className="min-h-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Mening Guruhlarim
      </h1>
      <p className="text-base text-gray-500 mb-8">
        Siz ro'yxatdan o'tgan barcha faol va tugatilgan guruhlar.
      </p>

      {/* 1. YANGI: Guruhga qo'shilish formasi (Dizayni yaxshilangan) */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 mb-10 max-w-2xl">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
          <PlusCircleIcon className="h-6 w-6 mr-2" />
          Yangi Guruhga Qo'shilish
        </h2>
        <form onSubmit={handleJoin} className="flex space-x-3 items-end">
          <div className="flex-grow">
            <label
              htmlFor="joinCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Guruhning Noyob KODI
            </label>
            <input
              type="text"
              id="joinCode"
              placeholder="Masalan: PY-DS-202"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-base shadow-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="flex-none bg-green-600 text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-green-700 transition duration-150 ease-in-out text-base shadow-md h-[46px]" // Balandlik inputga moslashtirildi
          >
            Qo'shilish
          </button>
        </form>
      </div>

      {/* 2. Guruh kartochkalari ro'yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {mockGroupsData.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>

      {mockGroupsData.length === 0 && (
        <div className="text-center py-10 bg-blue-50 rounded-xl shadow-inner mt-8 border-t-2 border-blue-200">
          <p className="text-lg text-gray-600 font-medium">
            Siz hali birorta guruhga a'zo emassiz.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Yuqoridagi maydonga kodni kiritib, yangi guruhga qo'shiling.
          </p>
        </div>
      )}
    </div>
  );
}

export default StudetGroup;

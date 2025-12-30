"use client";
import React, { useState } from "react";
import {
  BookOpenIcon,
  ClockIcon,
  UsersIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

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

// --- Guruh Kartochkasi Komponenti ---
const GroupCard = ({ group }) => {
  const isStatusActive = group.status === "Faol";
  const [copied, setCopied] = useState(false);

  const copyCodeToClipboard = () => {
    if (typeof navigator.clipboard === "undefined") {
      alert("Nusxalash funksiyasi brauzeringiz tomonidan qo'llab-quvvatlanmaydi.");
      return;
    }
    navigator.clipboard.writeText(group.uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="flex flex-col bg-white p-6 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:translate-y-[-2px] border-t-4"
      style={{ borderTopColor: '#A60E07' }} // Dinamik border rangi
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 leading-tight">
            <span className="mr-2" style={{ color: '#A60E07' }}>
              <BookOpenIcon className="h-6 w-6 inline" />
            </span>
            {group.name}
          </h3>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
              isStatusActive
                ? "bg-green-100 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {group.status}
          </span>
        </div>

        <div className="space-y-3 text-sm text-gray-700 mt-5 mb-8">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-3 text-gray-400" />
            <span className="font-semibold">O'qituvchi:</span>{" "}
            <span className="ml-1 text-gray-800">{group.teacher}</span>
          </div>

          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
            <span className="font-semibold">Jadval:</span>{" "}
            <span className="ml-1 text-gray-800">{group.schedule}</span>
          </div>

          <div className="flex items-center">
            <UsersIcon className="h-5 w-5 mr-3 text-gray-400" />
            <span className="font-semibold">Talabalar soni:</span>{" "}
            <span className="ml-1 font-bold" style={{ color: '#A60E07' }}>
              {group.studentsCount} ta
            </span>
          </div>
        </div>
      </div>

      <div className="flex-none mt-4 space-y-3 pt-4 border-t border-gray-100">
        <Link
          href={`/students/groups/${group.id}`}
          className="block text-center w-full text-white py-2.5 rounded-xl font-bold transition duration-150 ease-in-out text-base shadow-md hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#A60E07' }} // Asosiy tugma rangi
        >
          Guruhni ko'rish
        </Link>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-mono text-gray-800 text-sm tracking-widest font-semibold">
            {group.uniqueCode}
          </span>
          <button
            onClick={copyCodeToClipboard}
            className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg transition duration-150 shadow-sm
                    ${
                      copied
                        ? "bg-green-600 text-white"
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

// --- Asosiy Komponent ---
function StudetGroup() {
  const [joinCode, setJoinCode] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      console.log("Kiritilgan kod:", joinCode);
      setJoinCode("");
      alert(`Kod: ${joinCode} kiritildi!`);
    } else {
      alert("Iltimos, guruh kodini kiriting.");
    }
  };

  return (
    <div className="min-h-full">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
        Mening Guruhlarim
      </h1>
      <p className="text-base text-gray-500 mb-8">
        Siz ro'yxatdan o'tgan barcha faol va tugatilgan guruhlar.
      </p>

      {/* Guruhga qo'shilish formasi */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-10 max-w-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center" style={{ color: '#A60E07' }}>
          <PlusCircleIcon className="h-6 w-6 mr-2" />
          Yangi Guruhga Qo'shilish
        </h2>
        <form onSubmit={handleJoin} className="flex space-x-3 items-end">
          <div className="flex-grow">
            <label
              htmlFor="joinCode"
              className="block text-sm font-bold text-gray-600 mb-1 ml-1"
            >
              Guruhning Noyob KODI
            </label>
            <input
              type="text"
              id="joinCode"
              placeholder="Masalan: PY-DS-202"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none transition-all placeholder-gray-400 text-base shadow-sm"
              style={{ 
                borderWidth: '1px',
                borderColor: joinCode ? '#A60E07' : '#D1D5DB' // Fokus bo'lmasa ham kod yozilsa rang o'zgaradi
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="flex-none text-white py-2.5 px-8 rounded-lg font-bold hover:opacity-90 transition duration-150 ease-in-out text-base shadow-lg h-[46px]"
            style={{ backgroundColor: '#A60E07' }}
          >
            Qo'shilish
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {mockGroupsData.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>

      {mockGroupsData.length === 0 && (
        <div className="text-center py-12 rounded-2xl shadow-inner mt-8 border-t-2" style={{ backgroundColor: '#FDF2F2', borderColor: '#F8D7DA' }}>
          <p className="text-lg font-bold" style={{ color: '#A60E07' }}>
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
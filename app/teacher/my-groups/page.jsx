"use client";
import React, { useState } from "react";
import {
  BookOpenIcon,
  PlusCircleIcon,
  UsersIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon, // Nusxalash ikonka
  CheckIcon, // Nusxalandi holati uchun ikonka
} from "@heroicons/react/24/outline";
import Link from "next/link";
// Komponentlar importi (Sizning loyihangizdagi yo'llar)
import NewGroupModal from "../../../components/teacher/CreateGroup";
import UpdateGroupModal from "../../../components/teacher/UpdateGroup"; // Tahrirlash Modali

// --- Mock Data ---
const mockGroupsData = [
  {
    id: 1,
    name: "Web Dasturlash (Fullstack) 1-guruh",
    teacher: "Jasur Raximov",
    schedule: "Dush, Chor, Jum",
    time: "18:00 - 20:00",
    studentsCount: 15,
    groupCode: "WD-FS-101", // Maxsus kod
  },
  {
    id: 2,
    name: "Python va AI asoslari",
    teacher: "Alijon Vohidov",
    schedule: "Seshanba, Pay",
    time: "10:00 - 12:00",
    studentsCount: 8,
    groupCode: "PAI-7G1Q-25", // Maxsus kod
  },
];

// --- Guruh Kartochkasi ---
const GroupCard = ({ group }) => {
  const [isCopied, setIsCopied] = useState(false);

  // Kodni nusxalash funksiyasi
  const handleCopy = () => {
    // Agar loyihangizda HTTPS bo'lmasa, nusxalash ishlamasligi mumkin
    navigator.clipboard.writeText(group.groupCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // 2 soniyadan keyin holatni qaytarish
  };

  const timeInfo = group.time ? ` (${group.time})` : "";

  return (
    <div className="flex flex-col justify-between bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600 transition duration-150 hover:shadow-xl">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
          <BookOpenIcon className="h-6 w-6 mr-2 text-blue-600" />
          {group.name}
        </h3>

        {/* Guruh KODI va Nusxalash */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
          <span className="text-sm font-semibold text-gray-700">
            Kod:{" "}
            <span className="font-mono text-blue-700 ml-1">
              {group.groupCode}
            </span>
          </span>
          <button
            onClick={handleCopy}
            className={`p-1 rounded transition duration-150 ${
              isCopied
                ? "bg-green-100 text-green-600"
                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
            }`}
            title={isCopied ? "Nusxalandi!" : "Kodni nusxalash"}
          >
            {isCopied ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <DocumentDuplicateIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <p className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2 text-gray-500" />
            Talabalar soni:{" "}
            <span className="ml-1 font-semibold text-blue-700">
              {group.studentsCount} ta
            </span>
          </p>
          <p className="flex items-center">
            <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-500" />
            Jadval: <span className="ml-1 font-semibold">{group.schedule}</span>
            {/* Vaqtni Jadvalga qo'shish */}
            <span className="ml-1 font-medium text-gray-600">{timeInfo}</span>
          </p>
        </div>
      </div>

      {/* Tugmalar Bloki (Tekislangan - items-stretch bilan) */}
      <div className="mt-4 flex space-x-3 items-stretch">
        <Link
          href={`/teacher/my-groups/${group.id}`}
          className="flex-1 flex items-center justify-center py-2.5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition duration-150 shadow-md h-full"
        >
          <ArrowRightIcon className="h-5 w-5 mr-2" />
          Guruhga Kirish
        </Link>

        <UpdateGroupModal initialData={group}>
          <button
            className=" p-2.5 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 transition duration-150 shadow-md h-full"
            title="Guruhni yangilash"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
        </UpdateGroupModal>
      </div>
    </div>
  );
};

// --- Asosiy Komponent ---
function TeacherGroups() {
  return (
    <div className="min-h-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Mening Guruhlarim
      </h1>
      <p className="text-lg text-gray-500 mb-8">
        Faoliyat yuritayotgan guruhlar ro'yxati
      </p>

      {/* YANGI GURUH YARATISH TUGMASI */}
      <NewGroupModal>
        <button className="flex items-center justify-center w-full md:w-auto px-6 py-3 mb-8 rounded-xl shadow-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition duration-150">
          <PlusCircleIcon className="h-6 w-6 mr-2" />
          Yangi Guruh Yaratish
        </button>
      </NewGroupModal>

      {/* Guruhlar Ro'yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockGroupsData.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>

      {mockGroupsData.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl shadow-inner mt-8">
          <p className="text-xl text-gray-600 font-medium">
            Hozirda faol guruhlaringiz mavjud emas.
          </p>
        </div>
      )}
    </div>
  );
}

// Sahifani eksport qilish
function page() {
  return <TeacherGroups />;
}

export default page;

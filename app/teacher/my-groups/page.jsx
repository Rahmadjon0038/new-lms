import React from "react";
import {
  BookOpenIcon,
  PlusCircleIcon,
  UsersIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// --- Mock Data (Boshlang'ich Guruh) ---
const mockGroupsData = [
  {
    id: 1,
    name: "Web Dasturlash (Fullstack) 1-guruh",
    teacher: "Jasur Raximov",
    schedule: "Dush, Chor, Jum",
    time: "18:00 - 20:00",
    studentsCount: 15,
  },
];

// --- Guruh Kartochkasi ---
const GroupCard = ({ group }) => (
  <div className="flex flex-col bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600 transition duration-150 hover:shadow-xl">
    <div className="flex-grow mb-4">
      <h3 className="text-xl font-bold text-gray-800 flex items-center">
        <BookOpenIcon className="h-6 w-6 mr-2 text-blue-600" />
        {group.name}
      </h3>

      <div className="space-y-2 text-sm text-gray-700 mt-4">
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
        </p>
      </div>
    </div>

    <Link
      href={`/teacher/my-groups/${group.id}`} // Guruh detallari sahifasiga yo'naltirish
      className="mt-4 flex items-center justify-center py-2.5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition duration-150 shadow-md"
    >
      Guruhga Kirish
      <ArrowRightIcon className="h-5 w-5 ml-2" />
    </Link>
  </div>
);

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
      <Link
        href="/teacher/groups/create"
        className="flex items-center justify-center w-full md:w-auto px-6 py-3 mb-8 rounded-xl shadow-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition duration-150"
      >
        <PlusCircleIcon className="h-6 w-6 mr-2" />
        Yangi Guruh Yaratish
      </Link>

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

// Sahifani eksport qilish (Sizning talabingiz bo'yicha)
function page() {
  return <TeacherGroups />;
}

export default page;

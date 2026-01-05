'use client'

import { usegetTeachers } from "../../hooks/teacher"

const TeacherSelect = ({ value, onChange }) => {
    const { data, isLoading, error } = usegetTeachers()
    
    if (isLoading) {
        return (
            <select 
                disabled 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none text-sm font-semibold bg-gray-50"
            >
                <option>Yuklanmoqda...</option>
            </select>
        )
    }
    
    if (error) {
        return (
            <select 
                disabled 
                className="w-full px-4 py-2.5 border border-red-200 rounded-xl focus:outline-none text-sm font-semibold bg-red-50 text-red-500"
            >
                <option>Xatolik yuz berdi</option>
            </select>
        )
    }
    
    const teachers = data?.teachers || []
    
    return (
        <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none text-sm font-semibold bg-white"
        >
            <option value="">O'qituvchini tanlang</option>
            <option value="all">Barcha O'qituvchilar</option>
            {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                    {teacher.name} {teacher.surname} {teacher.subject !== "Belgilanmagan" ? `- ${teacher.subject}` : ""}
                </option>
            ))}
        </select>
    )
}

export default TeacherSelect
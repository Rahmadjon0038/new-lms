import React from "react";
import { useGetAllSubjects } from "../hooks/subjects";

const SubjectsSelect = ({ 
    value, 
    onChange, 
    placeholder = "Fanni tanlang", 
    className = "",
    showAll = true,
    disabled = false 
}) => {
    const { data: subjectsData, isLoading } = useGetAllSubjects();
    const subjects = subjectsData?.subjects || [];

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A60E07] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        >
            <option value="">{isLoading ? "Yuklanmoqda..." : placeholder}</option>
            {showAll && <option value="all">Barcha fanlar</option>}
            {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                    {subject.name}
                </option>
            ))}
        </select>
    );
};

export default SubjectsSelect;
'use client'
import React, { useState, useMemo, useCallback, memo } from 'react';
import { FiEdit, FiSave, FiX, FiUserPlus, FiSearch } from 'react-icons/fi'; 
import { TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; 
import Link from 'next/link';

// --- Yagona Mock Data ---
const INITIAL_STUDENTS_DATA = [
    { id: 1001, name: "Alijon", surname: "Murodov", group: null, subject: "Web Dasturlash", teacher: null, status: "Qo'shilmagan", paymentAmount: 0, requiredAmount: 1000, registrationDate: "2025-12-10", phone: "+998 90 123 45 67" },
    { id: 1003, name: "Rustam", surname: "Tursunov", group: null, subject: "Python AI", teacher: null, status: "Qo'shilmagan", paymentAmount: 0, requiredAmount: 1000, registrationDate: "2025-12-10", phone: "+998 99 555 11 22" },
    { id: 1004, name: "Lola", surname: "Saidova", group: null, subject: "Ingliz Tili (B1)", teacher: null, status: "Qo'shilmagan", paymentAmount: 0, requiredAmount: 800, registrationDate: "2025-12-05", phone: "+998 90 111 22 33" },
    { id: 1002, name: "Feruza", surname: "Sobirova", group: "Grafika B1", subject: "Grafik Dizayn", teacher: "Shoxrux Tursunov", status: "O'qiyapti", paymentAmount: 1000, requiredAmount: 1000, registrationDate: "2025-12-10", phone: "+998 91 987 65 43" },
    { id: 1007, name: "Diyora", surname: "Valiyeva", group: "SMM Master", subject: "SMM", teacher: "Shoxrux Tursunov", status: "O'qiyapti", paymentAmount: 800, requiredAmount: 1000, registrationDate: "2025-12-09", phone: "+998 97 123 45 67" },
    { id: 1005, name: "Sherzod", surname: "Nazarov", group: "Matematika K2", subject: "Matematika", teacher: "Umid Karimov", status: "O'qiyapti", paymentAmount: 1000, requiredAmount: 1000, registrationDate: "2025-12-04", phone: "+998 94 444 55 66" },
    { id: 1006, name: "Zuhra", surname: "Rustamova", group: "Web Pro B1", subject: "Web Dasturlash", teacher: "Jasur Raximov", status: "O'qiyapti", paymentAmount: 700, requiredAmount: 1000, registrationDate: "2025-11-01", phone: "+998 93 777 88 99" },
];

const months = [
    { value: 'all', label: "Barcha Oylar" }, { value: '12', label: "Dekabr" }, { value: '11', label: "Noyabr" },
    { value: '01', label: "Yanvar" }, { value: '02', label: "Fevral" }, { value: '03', label: "Mart" },
];

const subjects = [
    { value: 'all', label: "Barcha Fanlar" },
    { value: 'NoGroup', label: "Guruhlanmaganlar" },
    { value: 'Web Dasturlash', label: "Web Dasturlash" },
    { value: 'Grafik Dizayn', label: "Grafik Dizayn" },
    { value: 'Python AI', label: "Python AI" },
    { value: 'SMM', label: "SMM" },
    { value: 'Ingliz Tili (B1)', label: "Ingliz Tili (B1)" },
];


// --- Tahrirlash Holatida Input Komponenti (Memo bilan fokus muammosi hal qilingan) ---
const EditableCellComponent = ({ name, value, onChange, type = 'text', placeholder = '' }) => (
    <input
        className="p-2 border border-blue-400 rounded w-full text-sm outline-none mb-1 transition duration-200 focus:border-blue-600"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
    />
);

const EditableCell = memo(EditableCellComponent);


const StudentsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [students, setStudents] = useState(INITIAL_STUDENTS_DATA);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // --- MANTIQLAR (Filter va Qidiruv) ---
    const filteredStudents = useMemo(() => {
        let currentList = students;

        if (selectedMonth !== 'all') {
            currentList = currentList.filter(student => student.registrationDate?.substring(5, 7) === selectedMonth); 
        }
        if (selectedSubject === 'NoGroup') {
             currentList = currentList.filter(student => !student.group);
        } else if (selectedSubject !== 'all') {
            currentList = currentList.filter(student => student.subject === selectedSubject);
        }
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            currentList = currentList.filter(student =>
                `${student.name} ${student.surname}`.toLowerCase().includes(lowerCaseSearch) || 
                student.phone.replace(/[\s\+]/g, '').includes(searchTerm.replace(/[\s\+]/g, '')) ||
                (student.group && student.group.toLowerCase().includes(lowerCaseSearch))
            );
        }
        return currentList;
    }, [selectedMonth, selectedSubject, searchTerm, students]);

    // --- EDIT FUNKSIYALARI ---

    const handleEditChange = useCallback((e) => {
        const { name, value, type } = e.target;
        // Raqam turlarini to'g'ri ishlash
        const newValue = type === 'number' && value !== '' ? value : value;

        setEditData(prev => ({
            ...prev,
            [name]: newValue
        }));
    }, []); 

    const handleEditClick = (student) => {
        setEditingId(student.id);
        setEditData({
            name: student.name,
            surname: student.surname,
            registrationDate: student.registrationDate,
            group: student.group || '',
            paymentAmount: student.paymentAmount,
            requiredAmount: student.requiredAmount, 
        });
    };

    /**
     * Guruhni almashtirish / qo'shish uchun alohida funksiya.
     * FAKAT ALERT CHIQARADI, umumiy tahrirlash rejimiga O'TKAZMAYDI.
     */
    const handleGroupActionClick = (student) => {
        if (student.group) {
            alert(`Talaba ${student.name} ${student.surname} hozirda "${student.group}" guruhida. Guruhni almashtirish funksiyasi chaqirildi!`);
        } else {
            alert(`Talaba ${student.name} ${student.surname} ni guruhga qo'shish funksiyasi chaqirildi!`);
        }
    };

    const handleSave = (studentId) => {
        const newPaymentAmount = Number(editData.paymentAmount) || 0;
        const newRequiredAmount = Number(editData.requiredAmount) || 0;

        if (newPaymentAmount < 0 || newRequiredAmount < 0) {
            alert("Iltimos, musbat raqamli to'lov va talab miqdorini kiriting.");
            return;
        }

        setStudents(prevStudents => 
            prevStudents.map(s => 
                s.id === studentId 
                    ? { 
                        ...s, 
                        name: String(editData.name).trim(), 
                        surname: String(editData.surname).trim(),
                        registrationDate: editData.registrationDate, 
                        group: String(editData.group).trim() || null, 
                        paymentAmount: newPaymentAmount,
                        requiredAmount: newRequiredAmount
                    } 
                    : s
            )
        );
        setEditingId(null); 
        setEditData({});
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };
    
    const handleDeleteStudent = (id) => {
        if (window.confirm(`ID ${id} bo'lgan talabani ro'yxatdan o'chirishga ishonchingiz komilmi?`)) {
            setStudents(prevStudents => prevStudents.filter(s => s.id !== id));
        }
    };

    return (
        <div className="p-4 md:p-8  mx-auto font-sans bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">🎓 Talabalar Ro'yxati (Admin)</h1>

            {/* --- Filtrlar va Qidiruv Bloki --- */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-md">
                <div className="flex items-center flex-grow min-w-[300px] border border-gray-300 rounded-lg bg-gray-50 p-2">
                    <FiSearch className="text-gray-400 mr-2" size={20} />
                    <input
                        type="text"
                        placeholder="Ism, guruh yoki telefon bo'yicha qidiruv..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-none p-1 flex-grow outline-none bg-transparent text-sm"
                    />
                </div>
                <select 
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value)} 
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer outline-none"
                >
                    {subjects.map(sub => (<option key={sub.value} value={sub.value}>{sub.label}</option>))}
                </select>
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)} 
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer outline-none"
                >
                    {months.map(month => (<option key={month.value} value={month.value}>{month.label}</option>))}
                </select>
                
                <Link 
                    href="/admin/students/new" 
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
                    title="Yangi talaba qo'shish"
                >
                    <FiUserPlus size={18}/>
                    Yangi Talaba
                </Link>
            </div>
            
            {/* --- Talabalar Jadvali --- */}
            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">Ism / Telefon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[220px]">Guruh / Fan / O'qituvchi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ro'yxatdan sana</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To'lov (Talab / To'langan)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">Amallar</th> 
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => {
                                const isEditing = editingId === student.id;
                                const isDebt = student.requiredAmount - student.paymentAmount > 0;
                                
                                return (
                                    <tr 
                                        key={student.id} 
                                        className={`${isEditing ? 'bg-yellow-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')} hover:bg-gray-100 transition duration-150`}
                                    >
                                        {/* 1. Ism va Telefon */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1">
                                                    <EditableCell name="name" value={editData.name} onChange={handleEditChange} placeholder="Ism"/>
                                                    <EditableCell name="surname" value={editData.surname} onChange={handleEditChange} placeholder="Familiya"/>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="font-semibold text-gray-900">{student.name} {student.surname}</span>
                                                    <div className="text-xs text-gray-500 mt-0.5">{student.phone}</div>
                                                </div>
                                            )}
                                        </td>

                                        {/* 2. Guruh / Fan / O'qituvchi (YANGILANGAN QISM) */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {isEditing ? (
                                                <div className="flex flex-col">
                                                    <EditableCell 
                                                        name="group" 
                                                        value={editData.group} 
                                                        onChange={handleEditChange} 
                                                        placeholder="Guruh nomi..."
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    {/* Guruh nomi va uning tugmasi bir qatorda */}
                                                    <div className="flex items-center gap-2"> 
                                                        
                                                        {student.group ? (
                                                            <span className="font-bold text-green-600">{student.group}</span>
                                                        ) : (
                                                            <span className="italic text-gray-400 text-xs">Guruhlanmagan</span>
                                                        )}
                                                        
                                                        {/* --- GURUH AMALIYOTI TUGMASI (Nom yonida) --- */}
                                                        <button 
                                                            className={`p-1.5 rounded-lg text-white transition duration-200 flex-shrink-0 ${student.group ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                                                            title={student.group ? "Guruhni almashtirish" : "Guruhga qo'shish"} 
                                                            onClick={() => handleGroupActionClick(student)}
                                                        >
                                                            {student.group ? <FiEdit size={14}/> : <FiUserPlus size={14}/>}
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Fan va O'qituvchi ma'lumotlari pastki qatorlarda */}
                                                    <div className='text-xs text-gray-500'>
                                                        Fan: {student.subject}
                                                    </div>
                                                    {student.group && (
                                                        <div className="text-xs text-gray-500 mt-0.5">O'qituvchi: {student.teacher || 'Aniqlanmagan'}</div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        
                                        {/* 3. Ro'yxatdan o'tgan sana */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {isEditing ? (
                                                <div className="flex flex-col">
                                                    <EditableCell name="registrationDate" type="date" value={editData.registrationDate} onChange={handleEditChange} />
                                                </div>
                                            ) : (
                                                student.registrationDate
                                            )}
                                        </td>
                                        
                                        {/* 4. To'lov Ma'lumoti */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1">
                                                    {/* Birinchi TALAB (requiredAmount) */}
                                                    <label className="text-xs text-gray-600">Talab (UZS):</label>
                                                    <EditableCell 
                                                        name="requiredAmount" 
                                                        type="number" 
                                                        value={editData.requiredAmount} 
                                                        onChange={handleEditChange} 
                                                        placeholder="Talab miqdori"
                                                    />
                                                    
                                                    {/* Ikkinchi TO'LANGAN (paymentAmount) */}
                                                    <label className="text-xs text-gray-600">To'langan (UZS):</label>
                                                    <EditableCell 
                                                        name="paymentAmount" 
                                                        type="number" 
                                                        value={editData.paymentAmount} 
                                                        onChange={handleEditChange} 
                                                        placeholder="To'langan miqdor"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">{student.requiredAmount} / {student.paymentAmount}</span> <span className="text-xs text-gray-500">UZS</span>
                                                    <div className={`text-xs font-semibold mt-1 ${isDebt ? 'text-red-500' : 'text-green-600'}`}>
                                                        {isDebt ? `Qarzdor: ${student.requiredAmount - student.paymentAmount}` : "To'liq to'langan"}
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* 5. Amallar */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={() => handleSave(student.id)} className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition duration-200" title="Saqlash"><FiSave size={16}/></button> 
                                                        <button onClick={handleCancel} className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition duration-200" title="Bekor qilish"><FiX size={16}/></button> 
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEditClick(student)} className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition duration-200" title="Umumiy tahrirlash"><FiEdit size={16}/></button>
                                                    </>
                                                )}
                                                
                                                <Link
                                                    href={`/admin/students/${student.id}`}
                                                    className="p-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition duration-200"
                                                    title="Batafsil ma'lumot"
                                                >
                                                    <InformationCircleIcon className="h-4 w-4" />
                                                </Link>

                                                <button 
                                                    onClick={() => handleDeleteStudent(student.id)} 
                                                    className="p-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition duration-200" 
                                                    title="Talabani o'chirish"
                                                >
                                                    <TrashIcon className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500 text-base">
                                    😕 Filtrlar bo'yicha talaba topilmadi.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentsPage;
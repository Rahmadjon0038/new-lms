'use client'
import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { FiEdit, FiSave, FiX, FiUserPlus, FiSearch } from 'react-icons/fi'; 
import { TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; 
import Link from 'next/link';
import { useGetAllStudents } from '../../../hooks/students';

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

// --- Tahrirlash Holatida Input Komponenti ---
const EditableCellComponent = ({ name, value, onChange, type = 'text', placeholder = '' }) => (
    <input
        className="p-2 border border-[#A60E07] rounded w-full text-sm outline-none mb-1 transition duration-200 focus:ring-1 focus:ring-[#A60E07]"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
    />
);

const EditableCell = memo(EditableCellComponent);

const StudentsPage = () => {
    // Backenddan ma'lumotlarni olish
    const { data: backendData, isLoading, error } = useGetAllStudents();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    
    // Backenddan kelgan ma'lumotlarni boshqarish uchun lokal state
    const [students, setStudents] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Ma'lumot kelganda state-ni yangilash
    useEffect(() => {
        if (backendData) {
            setStudents(backendData);
        }
    }, [backendData]);

    // --- MANTIQLAR (Filter va Qidiruv) ---
    const filteredStudents = useMemo(() => {
        let currentList = students || [];

        if (selectedMonth !== 'all') {
            currentList = currentList.filter(student => student.registration_date?.substring(5, 7) === selectedMonth); 
        }
        if (selectedSubject === 'NoGroup') {
             currentList = currentList.filter(student => !student.group_name);
        } else if (selectedSubject !== 'all') {
            currentList = currentList.filter(student => student.subject_name === selectedSubject);
        }
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            currentList = currentList.filter(student =>
                `${student.name} ${student.surname}`.toLowerCase().includes(lowerCaseSearch) || 
                (student.phone && student.phone.replace(/[\s\+]/g, '').includes(searchTerm.replace(/[\s\+]/g, ''))) ||
                (student.group_name && student.group_name.toLowerCase().includes(lowerCaseSearch))
            );
        }
        return currentList;
    }, [selectedMonth, selectedSubject, searchTerm, students]);

    const handleEditChange = useCallback((e) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' && value !== '' ? value : value;
        setEditData(prev => ({ ...prev, [name]: newValue }));
    }, []); 

    const handleEditClick = (student, index) => {
        // ID va Index birikmasi orqali unique key yaratamiz (agar IDlar bir xil kelsa)
        setEditingId(`${student.id}-${index}`);
        setEditData({
            name: student.name,
            surname: student.surname,
            registration_date: student.registration_date?.split('T')[0],
            group_name: student.group_name || '',
            paid_amount: student.paid_amount,
            required_amount: student.required_amount, 
        });
    };

    const handleGroupActionClick = (student) => {
        if (student.group_name) {
            alert(`Talaba ${student.name} ${student.surname} hozirda "${student.group_name}" guruhida.`);
        } else {
            alert(`Talaba ${student.name} ${student.surname} ni guruhga qo'shish chaqirildi!`);
        }
    };

    const handleSave = (uniqueId) => {
        const newPaidAmount = Number(editData.paid_amount) || 0;
        const newRequiredAmount = Number(editData.required_amount) || 0;

        setStudents(prevStudents => 
            prevStudents.map((s, idx) => 
                `${s.id}-${idx}` === uniqueId 
                    ? { 
                        ...s, 
                        name: String(editData.name).trim(), 
                        surname: String(editData.surname).trim(),
                        registration_date: editData.registration_date, 
                        group_name: String(editData.group_name).trim() || null, 
                        paid_amount: newPaidAmount,
                        required_amount: newRequiredAmount
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
    
    const handleDeleteStudent = (id, index) => {
        if (window.confirm(`Talabani o'chirishga ishonchingiz komilmi?`)) {
            setStudents(prevStudents => prevStudents.filter((s, idx) => `${s.id}-${idx}` !== `${id}-${index}`));
        }
    };

    if (isLoading) return <div className="p-8 text-center">Yuklanmoqda...</div>;

    return (
        <div className="p-4 md:p-8 mx-auto font-sans bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">🎓 Talabalar Ro'yxati (Admin)</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-md">
                <div className="flex items-center flex-grow min-w-[300px] border border-gray-300 rounded-lg bg-gray-50 p-2 focus-within:border-[#A60E07]">
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
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#A60E07]"
                >
                    {subjects.map(sub => (<option key={sub.value} value={sub.value}>{sub.label}</option>))}
                </select>
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)} 
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#A60E07]"
                >
                    {months.map(month => (<option key={month.value} value={month.value}>{month.label}</option>))}
                </select>
                
                <Link 
                    href="/admin/students/new" 
                    className="flex items-center gap-1 bg-[#A60E07] hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm shadow-md"
                >
                    <FiUserPlus size={18}/>
                    Yangi Talaba
                </Link>
            </div>
            
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
                                const rowKey = `${student.id}-${index}`;
                                const isEditing = editingId === rowKey;
                                const reqAmount = Number(student.required_amount) || 0;
                                const paidAmount = Number(student.paid_amount) || 0;
                                const isDebt = reqAmount - paidAmount > 0;
                                
                                return (
                                    <tr key={rowKey} className={`${isEditing ? 'bg-red-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')} hover:bg-gray-100 transition duration-150`}>
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
                                                    <div className="text-xs text-gray-500 mt-0.5">{student.phone2}</div>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {isEditing ? (
                                                <div className="flex flex-col">
                                                    <EditableCell name="group_name" value={editData.group_name} onChange={handleEditChange} placeholder="Guruh nomi..."/>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2"> 
                                                        {student.group_name ? (
                                                            <span className="font-bold text-[#A60E07]">{student.group_name}</span>
                                                        ) : (
                                                            <span className="italic text-gray-400 text-xs">Guruhlanmagan</span>
                                                        )}
                                                        <button 
                                                            className={`p-1.5 rounded-lg text-white transition duration-200 flex-shrink-0 ${student.group_name ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#A60E07] hover:opacity-90'}`}
                                                            onClick={() => handleGroupActionClick(student)}
                                                        >
                                                            {student.group_name ? <FiEdit size={14}/> : <FiUserPlus size={14}/>}
                                                        </button>
                                                    </div>
                                                    <div className='text-xs text-gray-500'>Fan: {student.subject_name || 'Yo\'q'}</div>
                                                    {student.group_name && <div className="text-xs text-gray-500 mt-0.5">O'qituvchi: {student.teacher_name || 'Aniqlanmagan'}</div>}
                                                </div>
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {isEditing ? (
                                                <EditableCell name="registration_date" type="date" value={editData.registration_date} onChange={handleEditChange} />
                                            ) : ( student.registration_date?.split('T')[0] )}
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs text-gray-600 font-bold">Talab:</label>
                                                    <EditableCell name="required_amount" type="number" value={editData.required_amount} onChange={handleEditChange} />
                                                    <label className="text-xs text-gray-600 font-bold">To'langan:</label>
                                                    <EditableCell name="paid_amount" type="number" value={editData.paid_amount} onChange={handleEditChange} />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">{reqAmount} / {paidAmount}</span>
                                                    <div className={`text-xs font-semibold mt-1 ${isDebt ? 'text-[#A60E07]' : 'text-green-600'}`}>
                                                        {isDebt ? `Qarzdor: ${reqAmount - paidAmount}` : "To'liq to'langan"}
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={() => handleSave(rowKey)} className="p-2 rounded-lg bg-[#A60E07] hover:opacity-90 text-white transition duration-200"><FiSave size={16}/></button> 
                                                        <button onClick={handleCancel} className="p-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition duration-200"><FiX size={16}/></button> 
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleEditClick(student, index)} className="p-2 rounded-lg bg-[#A60E07] hover:opacity-90 text-white transition duration-200"><FiEdit size={16}/></button>
                                                )}
                                                <Link href={`/admin/students/${student.id}`} className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition duration-200">
                                                    <InformationCircleIcon className="h-4 w-4" />
                                                </Link>
                                                <button onClick={() => handleDeleteStudent(student.id, index)} className="p-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition duration-200">
                                                    <TrashIcon className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">😕 Talaba topilmadi.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentsPage;
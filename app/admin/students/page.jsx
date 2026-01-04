'use client'
import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { FiEdit, FiSave, FiX, FiUserPlus, FiSearch } from 'react-icons/fi';
import { TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useGetAllStudents } from '../../../hooks/students';
import AddGroup from '../../../components/admistrator/AddGroup';

const months = [
    { value: 'all', label: "Barcha Oylar" }, { value: '12', label: "Dekabr" }, { value: '11', label: "Noyabr" },
    { value: '01', label: "Yanvar" }, { value: '02', label: "Fevral" }, { value: '03', label: "Mart" },
];

const groupFilters = [
    { value: 'all', label: "Barcha Guruhlar" },
    { value: 'NoGroup', label: "Guruhlanmaganlar" },
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
    const { data: backendData, isLoading, error, refetch } = useGetAllStudents();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedGroup, setSelectedGroup] = useState('all');

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
        if (selectedGroup === 'NoGroup') {
            currentList = currentList.filter(student => !student.group_name);
        } else if (selectedGroup !== 'all') {
            currentList = currentList.filter(student => student.group_name === selectedGroup);
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
    }, [selectedMonth, selectedGroup, searchTerm, students]);

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
            phone: student.phone,
            phone2: student.phone2,
            status: student.status,
        });
    };

    const handleGroupActionClick = (student) => {
        // Bu function artiq kerak emas, AddGroup komponenti o'zi modal ochadi
    };

    const handleModalSuccess = () => {
        refetch(); // Ma'lumotlarni qayta yuklash
    };

    const handleSave = (uniqueId) => {
        setStudents(prevStudents =>
            prevStudents.map((s, idx) =>
                `${s.id}-${idx}` === uniqueId
                    ? {
                        ...s,
                        name: String(editData.name).trim(),
                        surname: String(editData.surname).trim(),
                        registration_date: editData.registration_date,
                        group_name: String(editData.group_name).trim() || 'Guruh biriktirilmagan',
                        phone: String(editData.phone).trim(),
                        phone2: String(editData.phone2).trim(),
                        status: editData.status
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
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#A60E07]"
                >
                    {groupFilters.map(group => (<option key={group.value} value={group.value}>{group.label}</option>))}
                </select>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#A60E07]"
                >
                    {months.map(month => (<option key={month.value} value={month.value}>{month.label}</option>))}
                </select>

                <Link href="/admin/students/new">
                    <button
                        className="flex items-center gap-1 bg-[#A60E07] hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm shadow-md">
                        <FiUserPlus size={18} />
                        Yangi Talaba
                    </button>
                </Link>

            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">Ism / Telefon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[220px]">Guruh / O'qituvchi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ro'yxatdan sana</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holat</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => {
                                const rowKey = `${student.id}-${index}`;
                                const isEditing = editingId === rowKey;

                                return (
                                    <tr key={rowKey} className={`${isEditing ? 'bg-red-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')} hover:bg-gray-100 transition duration-150`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1">
                                                    <EditableCell name="name" value={editData.name} onChange={handleEditChange} placeholder="Ism" />
                                                    <EditableCell name="surname" value={editData.surname} onChange={handleEditChange} placeholder="Familiya" />
                                                    <EditableCell name="phone" value={editData.phone} onChange={handleEditChange} placeholder="Telefon 1" />
                                                    <EditableCell name="phone2" value={editData.phone2} onChange={handleEditChange} placeholder="Telefon 2" />
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className='mr-2 text-xl font-bold  text-red-500'> {student.id}</span>
                                                    <span className="font-semibold text-gray-900">{student.name} {student.surname}</span>
                                                    <div className="text-xs text-gray-500 mt-0.5">{student.phone}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{student.phone2}</div>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {isEditing ? (
                                                <div className="flex flex-col">
                                                    <EditableCell name="group_name" value={editData.group_name} onChange={handleEditChange} placeholder="Guruh nomi..." />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        {student.group_name && student.group_name !== 'Guruh biriktirilmagan' ? (
                                                            <span className="font-bold text-[#A60E07] text-sm">{student.group_name}</span>
                                                        ) : (
                                                            <span className="italic text-gray-400 text-xs">Guruhlanmagan</span>
                                                        )}
                                                        <AddGroup student={student} onSuccess={handleModalSuccess}>
                                                            <div className={`p-1.5 rounded-lg text-white transition duration-200 flex-shrink-0 cursor-pointer ${student.group_name && student.group_name !== 'Guruh biriktirilmagan' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#A60E07] hover:opacity-90'}`}>
                                                                {student.group_name && student.group_name !== 'Guruh biriktirilmagan' ? <FiEdit size={14} /> : <FiUserPlus size={14} />}
                                                            </div>
                                                        </AddGroup>
                                                    </div>
                                                    {student.group_name && student.group_name !== 'Guruh biriktirilmagan' && (
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            <span className="font-medium">O'qituvchi:</span> {student.teacher_name?.trim() || 'Aniqlanmagan'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {isEditing ? (
                                                <EditableCell name="registration_date" type="date" value={editData.registration_date} onChange={handleEditChange} />
                                            ) : (student.registration_date?.split('T')[0])}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {isEditing ? (
                                                <select
                                                    name="status"
                                                    value={editData.status}
                                                    onChange={handleEditChange}
                                                    className="p-2 border border-[#A60E07] rounded w-full text-sm outline-none transition duration-200 focus:ring-1 focus:ring-[#A60E07]"
                                                >
                                                    <option value="active">Faol</option>
                                                    <option value="inactive">Nofaol</option>
                                                    <option value="graduated">Bitirgan</option>
                                                </select>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {student.status === 'active' ? 'Faol' :
                                                            student.status === 'inactive' ? 'Nofaol' : 'Bitirgan'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={() => handleSave(rowKey)} className="p-2 rounded-lg bg-[#A60E07] hover:opacity-90 text-white transition duration-200"><FiSave size={16} /></button>
                                                        <button onClick={handleCancel} className="p-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition duration-200"><FiX size={16} /></button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleEditClick(student, index)} className="p-2 rounded-lg bg-[#A60E07] hover:opacity-90 text-white transition duration-200"><FiEdit size={16} /></button>
                                                )}
                                                <Link href={`/admin/students/${student.id}`} className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition duration-200">
                                                    <InformationCircleIcon className="h-4 w-4" />
                                                </Link>
                                                <button onClick={() => handleDeleteStudent(student.id, index)} className="p-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition duration-200">
                                                    <TrashIcon className="h-4 w-4" />
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
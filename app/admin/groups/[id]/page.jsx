'use client'
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { FiCalendar, FiClock, FiUser, FiUsers, FiDollarSign, FiPhone, FiCopy, FiCheck } from 'react-icons/fi';
import { useGetGroupById } from '../../../../hooks/groups';

const GroupDetailPage = () => {
    const params = useParams();
    const groupId = params.id;
    const [copied, setCopied] = useState(false);

    const { data: groupData, isLoading, error } = useGetGroupById(groupId);

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Yuklanmoqda...</div>;

    if (error) return (
        <div className="p-8 text-center">
            <div className="text-red-500 mb-4">❌ Xatolik yuz berdi</div>
            <p className="text-gray-600">{error.message}</p>
        </div>
    );

    if (!groupData?.success || !groupData?.group) return (
        <div className="p-8 text-center">
            <div className="text-yellow-500 mb-4">⚠️ Guruh topilmadi</div>
        </div>
    );

    const group = groupData.group;
    const students = groupData.students || [];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-4 md:p-8 mx-auto font-sans bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Guruh Tafsilotlari</h1>

            {/* Guruh Asosiy Ma'lumotlari */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="border-b border-gray-200 pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-[#A60E07] mb-2">{group.name}</h2>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-800">
                            Kod: {group.unique_code}
                        </span>
                        <button
                            onClick={() => copyToClipboard(group.unique_code)}
                            className="p-1.5 rounded-lg bg-[#A60E07] hover:opacity-90 text-white transition duration-200 flex items-center gap-1"
                            title="Kodni nusxalash"
                        >
                            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* O'qituvchi */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <FiUser className="h-8 w-8 text-[#A60E07]" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">O'qituvchi</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {group.teacher_name || 'Aniqlanmagan'}
                            </p>
                        </div>
                    </div>

                    {/* Narx */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <FiDollarSign className="h-8 w-8 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Kurs narxi</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {parseFloat(group.price).toLocaleString()} so'm
                            </p>
                        </div>
                    </div>

                    {/* Boshlanish sanasi */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <FiCalendar className="h-8 w-8 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Boshlanish sanasi</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {formatDate(group.start_date)}
                            </p>
                        </div>
                    </div>

                    {/* Dars jadvali */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <FiClock className="h-8 w-8 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Dars vaqti</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {group.schedule?.time || 'Aniqlanmagan'}
                            </p>
                        </div>
                    </div>

                    {/* Dars kunlari */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <FiCalendar className="h-8 w-8 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Dars kunlari</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {group.schedule?.days?.join(', ') || 'Aniqlanmagan'}
                            </p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <FiUsers className="h-8 w-8 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Holat</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                group.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {group.is_active ? 'Faol' : 'Nofaol'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Yaratilgan: {formatDateTime(group.created_at)}
                    </p>
                </div>
            </div>

            {/* Talabalar Ro'yxati */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <FiUsers className="mr-2 text-[#A60E07]" />
                            Talabalar Ro'yxati
                        </h3>
                        <span className="px-3 py-1 text-sm bg-[#A60E07] text-white rounded-lg font-medium">
                            {students.length} ta talaba
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {students.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Talaba
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Telefon
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Holat
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Qo'shilgan sana
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map((student, index) => (
                                    <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {student.name} {student.surname}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {student.id}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <FiPhone className="mr-1" />
                                                {student.phone}
                                            </div>
                                            {student.phone2 && (
                                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                                    <FiPhone className="mr-1" />
                                                    {student.phone2}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                student.status === 'active' ? 'bg-green-100 text-green-800' :
                                                student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {student.status === 'active' ? 'Faol' : 
                                                 student.status === 'inactive' ? 'Nofaol' : 'Bitirgan'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDateTime(student.joined_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            <FiUsers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-sm font-medium text-gray-900 mb-1">Talabalar yo'q</h3>
                            <p className="text-sm text-gray-500">Bu guruhda hali talabalar yo'q.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupDetailPage;

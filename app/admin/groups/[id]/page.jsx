'use client'
import React from 'react';
import { useParams } from 'next/navigation';
import { 
    UsersIcon, 
    ClockIcon, 
    UserIcon, 
    CurrencyDollarIcon, 
    CalendarDaysIcon, 
    PhoneIcon,
    BookOpenIcon,
    ArchiveBoxXMarkIcon
} from '@heroicons/react/24/outline';
import { useGetGroupById } from '../../../../hooks/groups';

const GroupDetailPage = () => {
    const params = useParams();
    const groupId = params.id;

    const { data: groupData, isLoading, error } = useGetGroupById(groupId);

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
        <div className="min-h-full p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Guruh Tafsilotlari</h1>
                    <p className="text-lg text-gray-500">Guruh ma'lumotlari va talabalar ro'yxati</p>
                </div>

                {/* Guruh Asosiy Ma'lumotlari */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="border-b border-gray-100 pb-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-3">
                                    {group.status === 'active' ? (
                                        <BookOpenIcon className="h-7 w-7 mr-3 text-[#A60E07]" />
                                    ) : (
                                        <ArchiveBoxXMarkIcon className="h-7 w-7 mr-3 text-gray-500" />
                                    )}
                                    {group.name}
                                    {group.status === 'draft' && (
                                        <span className="ml-3 text-sm font-medium text-yellow-600 px-2 py-1 bg-yellow-100 rounded-lg">
                                            Darsi boshlanmagan
                                        </span>
                                    )}
                                    {group.status === 'blocked' && (
                                        <span className="ml-3 text-sm font-medium text-gray-400 px-2 py-1 bg-gray-100 rounded-lg">
                                            Yopilgan
                                        </span>
                                    )}
                                </h2>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-extrabold text-[#A60E07] mb-1">
                                    {parseFloat(group.price).toLocaleString()} so'm
                                </div>
                                <div className="text-sm font-medium text-gray-500">Kurs narxi</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* O'qituvchi */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <UserIcon className="h-6 w-6 text-[#A60E07]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">O'qituvchi</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {group.teacher_name || 'Tayinlanmagan'}
                                    </p>
                                    {group.teacher_phone && (
                                        <div className="flex items-center mt-1 text-xs text-gray-600">
                                            <PhoneIcon className="h-3 w-3 mr-1" />
                                            {group.teacher_phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fan */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <BookOpenIcon className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fan</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {group.subject_name || 'Belgilanmagan'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Boshlanish sanasi */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Boshlanish sanasi</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {formatDate(group.start_date)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dars vaqti */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <ClockIcon className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dars vaqti</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {group.schedule?.time || 'Belgilanmagan'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Holat */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <UsersIcon className="h-6 w-6 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Holat</p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-lg ${
                                        group.status === 'active' ? 'bg-green-100 text-green-800' : 
                                        group.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {group.status === 'active' ? 'Faol' : 
                                         group.status === 'draft' ? 'Darsi boshlanmagan' : 'Yopilgan'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dars kunlari (alohida qator) */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                            <CalendarDaysIcon className="h-5 w-5 text-orange-500" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dars kunlari</p>
                                <div className="flex flex-wrap gap-2">
                                    {group.schedule?.days?.map((day, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 text-xs font-bold bg-[#A60E07] text-white rounded-lg"
                                        >
                                            {day}
                                        </span>
                                    )) || (
                                        <span className="text-sm text-gray-500">Belgilanmagan</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Yaratilgan: {formatDateTime(group.created_at)}
                        </p>
                    </div>
                </div>

                {/* Talabalar Ro'yxati */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center uppercase tracking-tight">
                                <UsersIcon className="h-6 w-6 mr-3 text-[#A60E07]" />
                                Talabalar Ro'yxati
                            </h3>
                            <span className="px-4 py-2 text-sm bg-[#A60E07] text-white rounded-xl font-bold shadow-md">
                                {students.length} ta talaba
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {students.length > 0 ? (
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Talaba Ma'lumotlari
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Telefon Raqamlari
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Holat
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Qo'shilgan Sana
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map((student, index) => (
                                        <tr key={student.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-red-50 transition duration-150`}>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-bold text-gray-800">
                                                        {student.name} {student.surname}
                                                    </div>
                                                    <div className="text-xs font-medium text-gray-400">
                                                        ID: #{student.id}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-semibold text-gray-700 flex items-center">
                                                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                        {student.phone}
                                                    </div>
                                                    {student.phone2 && (
                                                        <div className="text-sm font-medium text-gray-500 flex items-center">
                                                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                            {student.phone2}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg ${
                                                    student.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {student.status === 'active' ? 'Faol' : 
                                                     student.status === 'inactive' ? 'Nofaol' : 'Bitirgan'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-600">
                                                    {formatDateTime(student.joined_at)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <UsersIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Talabalar yo'q</h3>
                                <p className="text-sm text-gray-500 max-w-md mx-auto">
                                    Bu guruhda hali hech qanday talaba ro'yxatdan o'tmagan. 
                                    Talabalar guruh kodidan foydalanib qo'shilishlari mumkin.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailPage;

"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { UsersIcon, ChevronLeftIcon, AcademicCapIcon, BookOpenIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useGetGroupView } from "../../../../hooks/groups";

// Status ranglarini aniqlash
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-red-100 text-red-800';
    case 'stopped': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatLessonDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date);
};

const formatLessonTime = (startTime, endTime) => {
  const left = String(startTime || '').slice(0, 5);
  const right = String(endTime || '').slice(0, 5);
  if (left && right) return `${left}-${right}`;
  return left || right || '-';
};

const getFeedbackTone = (feedback) => {
  const value = String(feedback || '').toUpperCase();
  if (value === 'PERFECT') {
    return {
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      header: 'bg-blue-50/80',
    };
  }
  if (value === 'GOOD') {
    return {
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      header: 'bg-emerald-50/80',
    };
  }
  return {
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700 border-red-200',
    header: 'bg-red-50/80',
  };
};

// --- Asosiy Komponent ---
function GroupDetails() {
  const params = useParams();
  const groupId = params.id;
  const { data: groupData, isLoading, error } = useGetGroupView(groupId);
  const [expandedReportId, setExpandedReportId] = useState(null);

  if (isLoading) {
    return (
      <div className="min-h-full p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-[#A60E07] text-xl font-bold">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-xl font-bold">❌ Xatolik yuz berdi</div>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!groupData?.success || !groupData?.data) {
    return (
      <div className="min-h-full p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 mb-4 text-xl font-bold">⚠️ Guruh topilmadi</div>
        </div>
      </div>
    );
  }

  const groupDetails = groupData.data.group_details;
  const subject = groupData.data.subject;
  const teacher = groupData.data.teacher;
  const groupmates = groupData.data.groupmates || [];
  const lessonReports = groupData.data.lesson_reports || [];
  const scheduleDays = Array.isArray(groupDetails.schedule?.days) ? groupDetails.schedule.days.join(', ') : '-';

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-4 pb-6 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        {/* Orqaga Qaytish Tugmasi */}
        <a
          href="/student"
          className="mb-4 inline-flex items-center text-[#A60E07] hover:opacity-80 font-bold transition duration-150 text-xs sm:mb-6 sm:text-sm"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
          Orqaga qaytish
        </a>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center sm:mb-2 sm:text-3xl">
              <BookOpenIcon className="h-6 w-6 mr-2 text-[#A60E07] sm:h-8 sm:w-8 sm:mr-3" />
              {groupDetails.name}
            </h1>
            <p className="text-xs text-gray-700 sm:text-sm">Fan: {subject.name}</p>
            <p className="hidden text-lg text-gray-500 sm:block">Guruh tafsilotlari va a'zolar ro'yxati</p>
          </div>
          
          {/* Guruh Holati - Header ning o'ng tomonida */}
          {/* <div className="bg-white px-5 py-4 rounded-xl shadow-lg border border-gray-100 min-w-[180px]">
            <div className="text-center">
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Guruh Holati</h3>
              <span className={`inline-flex px-4 py-1.5 text-xs font-bold rounded-full ${
                groupDetails.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {groupDetails.status === 'active' ? 'Faol' : 'Nofaol'}
              </span>
              {groupDetails.class_status && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">Dars holati</div>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    groupDetails.class_status === 'started' ? 'bg-blue-100 text-blue-800' :
                    groupDetails.class_status === 'not_started' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {groupDetails.class_status === 'started' ? 'Boshlangan' :
                     groupDetails.class_status === 'not_started' ? 'Boshlanmagan' :
                     groupDetails.class_status}
                  </span>
                </div>
              )}
            </div>
          </div> */}
        </div>

        {/* 1. Asosiy Ma'lumotlar Bloki */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:gap-6 mb-6 sm:mb-8">
          {/* O'qituvchi Ma'lumotlari */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-t-4 border-orange-500">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
              <AcademicCapIcon className="h-4 w-4 mr-2 text-orange-500" />
              O'qituvchi
            </h3>
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              {teacher.name || 'Tayinlanmagan'}
            </p>
            <p className="text-xs mt-1 font-bold text-gray-800">
              {teacher.phone || 'Mavjud emas'}
            </p>
          </div>

          {/* Guruh Narxi */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-t-4 border-[#A60E07]">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Guruh Narxi
            </h3>
            <div className="text-lg sm:text-xl font-bold text-[#A60E07]">
              {groupDetails.price.toLocaleString()} so'm
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Oylik to'lov miqdori
            </div>
          </div>

          {/* Guruh Statistikasi */}
          {/* <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-green-500">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
              <UsersIcon className="h-4 w-4 mr-2 text-green-500" />
              Statistika
            </h3>
            <div className="space-y-1">
              <p className="text-2xl font-extrabold text-gray-900">
                {stats.total_members} ta
              </p>
              <p className="text-xs text-gray-500">
                Jami: {stats.total_members}, Faol: {stats.active_members}
              </p>
            </div>
          </div> */}
        </div>

        {/* 2. Kunlik reportlar */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-[#A60E07]" />
                Kunlik reportlar
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Teacher yuborgan darsma-dars hisobotlar shu yerda ko‘rinadi.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-[#A60E07]/10 px-3 py-1 text-xs font-bold text-[#A60E07]">
              {lessonReports.length} ta
            </span>
          </div>

          <div className="space-y-3">
            {lessonReports.length > 0 ? (
              lessonReports.map((report) => {
                const tone = getFeedbackTone(report.feedback);
                const isExpanded = expandedReportId === report.lesson_id;
                return (
                  <div
                    key={report.id}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ${tone.border}`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedReportId(isExpanded ? null : report.lesson_id)}
                      className={`flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-5 ${tone.header}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-base font-bold text-gray-900 sm:text-lg">
                          {formatLessonDate(report.lesson_date)}
                        </div>
                        <div className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
                          <div>
                            <span className="font-semibold text-gray-800">Teacher:</span>{' '}
                            <span className="font-medium text-gray-700">{report.teacher_name || teacher.name || 'Tayinlanmagan'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">Guruh:</span>{' '}
                            <span className="font-medium text-gray-700">{report.group_name || groupDetails.name}</span>{' '}
                            <span className="text-gray-400">•</span>{' '}
                            <span className="font-semibold text-gray-800">Fan:</span>{' '}
                            <span className="font-medium text-gray-700">{report.subject_name || subject.name}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>
                              <span className="font-semibold text-gray-800">Vaqt:</span>{' '}
                              <span className="font-medium text-gray-700">{formatLessonTime(report.lesson_start_time, report.lesson_end_time)}</span>
                            </span>
                            <span>
                              <span className="font-semibold text-gray-800">Dars kunlari:</span>{' '}
                              <span className="font-medium text-gray-700">{scheduleDays}</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500">
                            Report yuborildi: {report.created_at_label || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${tone.badge}`}>
                          {String(report.feedback || '-').toUpperCase()}
                        </span>
                        <span className="text-[11px] font-medium text-gray-500">
                          {isExpanded ? 'Yopish' : "Ko'rish"}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-white px-4 py-4 sm:px-5">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                          {[
                            { label: 'Homework', value: report.homework },
                            { label: 'Vocabulary', value: report.vocabulary },
                            { label: 'Attendance', value: report.attendance },
                            { label: 'Participation', value: report.participation },
                            { label: 'Total', value: report.total },
                            { label: 'Percent', value: `${report.percent}%` },
                          ].map((item) => (
                            <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center">
                              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                                {item.label}
                              </div>
                              <div className="mt-1 text-sm font-bold text-gray-900 sm:text-base">
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>

                        {Array.isArray(report.rows) && report.rows.length > 0 ? (
                          <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">Talaba</th>
                                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">HW</th>
                                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">VOC</th>
                                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">ATT</th>
                                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">PART</th>
                                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">TOTAL</th>
                                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">PCT</th>
                                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">FB</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {report.rows.map((row, index) => {
                                  const rowTone = getFeedbackTone(row.feedback);
                                  return (
                                    <tr key={`${report.id}-${row.student_id}-${index}`} className="hover:bg-gray-50/70">
                                      <td className="px-4 py-3">
                                        <div className="max-w-[220px]">
                                          <div className="truncate font-semibold text-gray-900">{row.student_name || '-'}</div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-center font-bold text-gray-800">{row.homework}</td>
                                      <td className="px-4 py-3 text-center font-bold text-gray-800">{row.vocabulary}</td>
                                      <td className="px-4 py-3 text-center font-bold text-gray-800">{row.attendance}</td>
                                      <td className="px-4 py-3 text-center font-bold text-gray-800">{row.participation}</td>
                                      <td className="px-4 py-3 text-center font-bold text-gray-900">{row.total}</td>
                                      <td className="px-4 py-3 text-center font-bold text-gray-900">{row.percent}%</td>
                                      <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${rowTone.badge}`}>
                                          {String(row.feedback || '-').toUpperCase()}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                            Bu report uchun talaba tafsilotlari topilmadi.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
                Hozircha bu guruh uchun report topilmadi.
              </div>
            )}
          </div>
        </div>

        {/* 3. Guruhdoshlar Ro'yxati - TABLE FORMAT */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="hidden text-xl font-bold text-gray-800 sm:flex sm:items-center">
                <UsersIcon className="h-6 w-6 mr-3 text-[#A60E07]" />
                Guruhdoshlaringiz
              </h2>
              <span className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm bg-[#A60E07] text-white rounded-xl font-bold shadow-md">
                {groupmates.length} ta a'zo
              </span>
            </div>
          </div>
          <div className="overflow-x-auto hidden md:block">
            {groupmates.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-16">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      F.I.O
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Qo'shilgan Sana
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      Holati
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groupmates.map((member, index) => (
                    <tr key={member.id} className="hover:bg-red-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-bold text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-[#A60E07] flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">
                              {member.surname.charAt(0)}{member.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{member.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {member.join_date}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(member.status)}`}>
                          {member.status_description || 'Noma\'lum'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Hech kim yo'q</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Bu guruhda hozircha boshqa a'zolar yo'q.
                </p>
              </div>
            )}
          </div>
          <div className="md:hidden">
            {groupmates.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {groupmates.map((member, index) => (
                  <div key={member.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-[#A60E07] flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {member.surname.charAt(0)}{member.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {index + 1}. {member.full_name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-gray-500">
                          Qo'shilgan sana: {member.join_date}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(member.status)}`}>
                            {member.status_description || "Noma'lum"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <UsersIcon className="h-7 w-7 text-gray-400" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Hech kim yo'q</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Bu guruhda hozircha boshqa a'zolar yo'q.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupDetails;

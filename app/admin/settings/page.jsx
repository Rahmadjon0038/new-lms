'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useChangePassword, useResetAllStudentPasswordsToDefault, useResetAllTeacherPasswordsToDefault, usegetProfile } from '../../../hooks/user';
import { useGetNotify } from '../../../hooks/notify';

const AdminSettingsPage = () => {
  const { data: user } = usegetProfile();
  const notify = useGetNotify();
  const changePasswordMutation = useChangePassword();
  const resetAllStudentPasswordsMutation = useResetAllStudentPasswordsToDefault();
  const resetAllTeacherPasswordsMutation = useResetAllTeacherPasswordsToDefault();

  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.old_password || !form.new_password) {
      notify('err', "Barcha maydonlarni to'ldiring");
      return;
    }

    changePasswordMutation.mutate({
      username: user?.username,
      old_password: form.old_password,
      new_password: form.new_password,
      onSuccess: (data) => {
        notify('ok', data?.message || 'Parol muvaffaqiyatli yangilandi');
        setForm({ old_password: '', new_password: '' });
      },
      onError: (err) => {
        notify('err', err?.response?.data?.message || 'Parolni yangilashda xatolik');
      },
    });
  };

  const handleResetAllStudentPasswords = () => {
    const confirmed = window.confirm(
      "Haqiqatan barcha student parollarini 123456 ga o'zgartirishni xohlaysizmi?"
    );
    if (!confirmed) return;

    resetAllStudentPasswordsMutation.mutate();
  };

  const handleResetAllTeacherPasswords = () => {
    const confirmed = window.confirm(
      "Haqiqatan barcha o'qituvchilar parolini 777777 ga o'zgartirishni xohlaysizmi?"
    );
    if (!confirmed) return;

    resetAllTeacherPasswordsMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-[#A60E07]/10 p-2">
            <KeyIcon className="h-5 w-5 text-[#A60E07]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sozlamalar</h1>
            <p className="text-sm text-gray-600">Parolni almashtirish</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Foydalanuvchi nomi</label>
            <input value={user?.username || ''} disabled className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Eski parol</label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={form.old_password}
                onChange={(e) => setForm((p) => ({ ...p, old_password: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#A60E07]"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showOldPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Yangi parol</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={form.new_password}
                onChange={(e) => setForm((p) => ({ ...p, new_password: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#A60E07]"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="mt-2 w-full rounded-xl bg-[#A60E07] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {changePasswordMutation.isPending ? 'Yuklanmoqda...' : 'Parolni yangilash'}
          </button>
        </form>

        <div className="mt-6 space-y-3 border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={handleResetAllStudentPasswords}
            disabled={resetAllStudentPasswordsMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#A60E07]/20 bg-[#A60E07]/5 px-4 py-3 text-sm font-bold text-[#A60E07] transition hover:bg-[#A60E07]/10 disabled:opacity-60"
          >
            <KeyIcon className="h-5 w-5" />
            {resetAllStudentPasswordsMutation.isPending
              ? 'Parollar yangilanmoqda...'
              : "Barcha studentlar parolini 123456 qilish"}
          </button>

          <button
            type="button"
            onClick={handleResetAllTeacherPasswords}
            disabled={resetAllTeacherPasswordsMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60"
          >
            <KeyIcon className="h-5 w-5" />
            {resetAllTeacherPasswordsMutation.isPending
              ? 'Parollar yangilanmoqda...'
              : "Barcha o'qituvchilar parolini 777777 qilish"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminSettingsPage;

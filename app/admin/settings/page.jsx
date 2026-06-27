'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useChangePassword, usegetProfile } from '../../../hooks/user';
import { useDeleteUnassignedStudents } from '../../../hooks/students';
import { useGetNotify } from '../../../hooks/notify';

const AdminSettingsPage = () => {
  const { data: user } = usegetProfile();
  const notify = useGetNotify();
  const changePasswordMutation = useChangePassword();
  const deleteUnassignedMutation = useDeleteUnassignedStudents();

  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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

  const handleDeleteUnassigned = () => {
    deleteUnassignedMutation.mutate({
      onSuccess: (data) => {
        notify('ok', data?.message || "Guruhsiz talabalar o'chirildi");
        setConfirmDeleteOpen(false);
      },
      onError: (err) => {
        notify('err', err?.response?.data?.message || "Guruhsiz talabalarni o'chirishda xatolik");
      },
    });
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

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <h2 className="text-sm font-semibold text-red-800">Xavfli amallar</h2>
          <p className="mt-1 text-xs text-red-700">
            Bu tugma faqat guruhga biriktirilmagan studentlarni o&apos;chiradi. Guruhli studentlarga tegmaydi.
          </p>
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={deleteUnassignedMutation.isPending}
            className="mt-3 inline-flex items-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {deleteUnassignedMutation.isPending ? 'O\'chirilmoqda...' : 'Guruhsiz talabalarni o\'chirish'}
          </button>
        </div>

      </div>

      {confirmDeleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Tasdiqlash</h3>
            <p className="mt-2 text-sm text-gray-600">
              Faqat guruhga biriktirilmagan talabalar o&apos;chiriladi. Bu amal qaytarib bo&apos;lmaydi.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleDeleteUnassigned}
                disabled={deleteUnassignedMutation.isPending}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminSettingsPage;

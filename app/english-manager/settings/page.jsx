"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useMemo, useState } from "react";
import { EyeIcon, EyeSlashIcon, KeyIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useChangePassword, usegetProfile } from "../../../hooks/user";
import { useGetAllSubjects } from "../../../hooks/subjects";
import { findEnglishSubject } from "../../../utils/englishManager";
import { useGetNotify } from "../../../hooks/notify";

const MAIN_COLOR = "#A60E07";

export default function EnglishManagerSettingsPage() {
  const { data: user } = usegetProfile();
  const { data: subjectsData } = useGetAllSubjects();
  const englishSubject = useMemo(
    () => findEnglishSubject(subjectsData?.subjects || []),
    [subjectsData]
  );
  const notify = useGetNotify();
  const changePasswordMutation = useChangePassword();
  const [form, setForm] = useState({ old_password: "", new_password: "" });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.old_password || !form.new_password) {
      notify("err", "Barcha maydonlarni to'ldiring");
      return;
    }

    changePasswordMutation.mutate({
      username: user?.username,
      old_password: form.old_password,
      new_password: form.new_password,
      onSuccess: (data) => {
        notify("ok", data?.message || "Parol yangilandi");
        setForm({ old_password: "", new_password: "" });
      },
      onError: (error) => {
        notify("err", error?.response?.data?.message || "Parolni yangilashda xatolik");
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
            <ShieldCheckIcon className="h-6 w-6" style={{ color: MAIN_COLOR }} />
          </div>
          <div className="min-w-0">
            <div className="inline-flex rounded-full bg-[#A60E07]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#A60E07]">
              Settings
            </div>
            <h1 className="mt-3 text-3xl font-black text-gray-900">Sozlamalar</h1>
            <p className="mt-1 text-sm text-gray-500">
              English manager faqat English subject ma'lumotlarini ko'radi.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoBox label="Username" value={user?.username || "-"} />
          <InfoBox label="Role" value={user?.role || "-"} />
          <InfoBox label="English subject" value={englishSubject?.name || "Topilmadi"} />
        </div>
      </section>

      <section className="rounded-[2rem] border border-white bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50">
            <KeyIcon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Parolni yangilash</h2>
            <p className="text-sm text-gray-500">Login parolini o'zgartiring</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <PasswordInput
            label="Eski parol"
            value={form.old_password}
            visible={showOldPassword}
            onToggle={() => setShowOldPassword((prev) => !prev)}
            onChange={(value) => setForm((prev) => ({ ...prev, old_password: value }))}
          />
          <PasswordInput
            label="Yangi parol"
            value={form.new_password}
            visible={showNewPassword}
            onToggle={() => setShowNewPassword((prev) => !prev)}
            onChange={(value) => setForm((prev) => ({ ...prev, new_password: value }))}
          />
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="rounded-2xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2"
            style={{ backgroundColor: MAIN_COLOR }}
          >
            {changePasswordMutation.isPending ? "Saqlanmoqda..." : "Parolni saqlash"}
          </button>
        </form>
      </section>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{label}</div>
      <div className="mt-2 truncate text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function PasswordInput({ label, value, visible, onToggle, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-[#A60E07]"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {visible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

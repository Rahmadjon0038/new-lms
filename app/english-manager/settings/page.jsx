"use client";
/* eslint-disable react/no-unescaped-entities */

import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useChangePassword, usegetProfile } from "../../../hooks/user";
import { useGetNotify } from "../../../hooks/notify";

const MAIN_COLOR = "#A60E07";

export default function EnglishManagerSettingsPage() {
  const { data: user } = usegetProfile();
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
    <div className="mx-auto max-w-xl">
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

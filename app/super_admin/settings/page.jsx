"use client";

import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon, KeyIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useChangePassword, usegetProfile } from "../../../hooks/user";
import { useGetNotify } from "../../../hooks/notify";

const MAIN_COLOR = "#A60E07";

export default function SuperAdminSettingsPage() {
  const { data: user, isLoading } = usegetProfile();
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
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: MAIN_COLOR }}>
          Sozlamalar
        </h1>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-2">
            <UserCircleIcon className="h-6 w-6" style={{ color: MAIN_COLOR }} />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">
              {isLoading ? "Yuklanmoqda..." : `${user?.surname || ""} ${user?.name || ""}`.trim() || "-"}
            </p>
            <p className="text-sm text-gray-500">{user?.branch_name || "Filial aniqlanmadi"}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoBox label="Username" value={user?.username || "-"} />
          <InfoBox label="Role" value={user?.role || "-"} />
          <InfoBox label="Telefon" value={user?.phone || "-"} />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-2">
            <KeyIcon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
          </div>
          <h2 className="text-base font-bold text-gray-900">Parolni yangilash</h2>
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
            className="rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2"
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
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function PasswordInput({ label, value, visible, onToggle, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#A60E07]"
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

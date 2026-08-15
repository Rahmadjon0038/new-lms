"use client";

import React, { useState } from "react";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { useGetAppVersions, useUpdateAppVersion } from "../../hooks/appVersion";
import { useGetNotify } from "../../hooks/notify";

const MAIN_COLOR = "#A60E07";

const PLATFORM_LABELS = {
  android: "Android (Play Market)",
  ios: "iOS (App Store)",
};

const EMPTY_FORM = {
  latest_build_number: "",
  latest_version_name: "",
  min_supported_build_number: "",
  update_message: "",
  store_url: "",
};

export default function AppVersionSettings() {
  const { data, isLoading } = useGetAppVersions();
  const updateMutation = useUpdateAppVersion();
  const notify = useGetNotify();

  const versions = data?.data || [];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-red-50 p-2">
          <DevicePhoneMobileIcon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Ilova versiyasi</h2>
          <p className="text-xs text-gray-500">
            {"Yangi versiya chiqqanda shu yerdan boshqaring — foydalanuvchilar ilovani ochganda avtomatik yangilanish taklifini ko'radi."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Yuklanmoqda...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {["android", "ios"].map((platform) => {
            const version = versions.find((v) => v.platform === platform);
            return (
            <PlatformCard
              // Ma'lumot kelgach (yoki saqlangach) formani serverdagi
              // qiymatlar bilan qayta boshlash uchun remount qilinadi.
              key={version ? `${platform}-${version.updated_at}` : platform}
              platform={platform}
              version={version}
              onSave={(versionData) => {
                updateMutation.mutate(
                  { platform, versionData },
                  {
                    onSuccess: () => notify("ok", "Versiya sozlamalari saqlandi"),
                    onError: (error) =>
                      notify(
                        "err",
                        error?.response?.data?.message || "Saqlashda xatolik yuz berdi"
                      ),
                  }
                );
              }}
              saving={updateMutation.isPending}
            />
            );
          })}
        </div>
      )}
    </section>
  );
}

function PlatformCard({ platform, version, onSave, saving }) {
  // `version` kelgach yoki saqlangach parent komponent `key`ni o'zgartirib
  // bu komponentni remount qiladi — shu bilan forma har doim serverdagi
  // eng so'nggi qiymatlar bilan boshlanadi, alohida sinxronlash effekti kerak emas.
  const [form, setForm] = useState(() =>
    version
      ? {
          latest_build_number: version.latest_build_number ?? "",
          latest_version_name: version.latest_version_name ?? "",
          min_supported_build_number: version.min_supported_build_number ?? "",
          update_message: version.update_message ?? "",
          store_url: version.store_url ?? "",
        }
      : EMPTY_FORM
  );
  const [forceUpdate, setForceUpdate] = useState(
    () => version?.min_supported_build_number != null
  );

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const buildNumber = parseInt(form.latest_build_number, 10);
    if (!Number.isInteger(buildNumber) || buildNumber <= 0) {
      return;
    }

    let minSupported = null;
    if (forceUpdate) {
      const parsed = parseInt(form.min_supported_build_number, 10);
      minSupported = Number.isInteger(parsed) && parsed > 0 ? parsed : buildNumber;
    }

    onSave({
      latest_build_number: buildNumber,
      latest_version_name: form.latest_version_name.trim(),
      min_supported_build_number: minSupported,
      update_message: form.update_message.trim(),
      store_url: form.store_url.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3"
    >
      <p className="text-sm font-bold text-gray-900">{PLATFORM_LABELS[platform]}</p>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Eng so'nggi build raqami">
          <input
            type="number"
            min={1}
            required
            value={form.latest_build_number}
            onChange={handleChange("latest_build_number")}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
          />
        </Field>
        <Field label="Versiya nomi (masalan 1.0.1)">
          <input
            type="text"
            value={form.latest_version_name}
            onChange={handleChange("latest_version_name")}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
          />
        </Field>
      </div>

      <Field label="Do'kon havolasi (Play Market/App Store link)">
        <input
          type="url"
          value={form.store_url}
          onChange={handleChange("store_url")}
          placeholder="https://play.google.com/store/apps/details?id=..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
        />
      </Field>

      <Field label="Foydalanuvchiga ko'rinadigan xabar">
        <textarea
          rows={2}
          value={form.update_message}
          onChange={handleChange("update_message")}
          placeholder="Ilovaning yangi versiyasi chiqdi..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
        />
      </Field>

      <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
        <input
          type="checkbox"
          checked={forceUpdate}
          onChange={(event) => setForceUpdate(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        Majburiy yangilanish (foydalanuvchi dialogni yopa olmaydi)
      </label>

      {forceUpdate && (
        <Field label="Minimal qo'llab-quvvatlanadigan build raqami">
          <input
            type="number"
            min={1}
            value={form.min_supported_build_number}
            onChange={handleChange("min_supported_build_number")}
            placeholder={form.latest_build_number || "masalan 4"}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
          />
        </Field>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        style={{ backgroundColor: MAIN_COLOR }}
      >
        {saving ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}

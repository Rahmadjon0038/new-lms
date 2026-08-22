"use client";

import React, { useRef, useState } from "react";
import { ArrowUpTrayIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useDeleteAvatar, useGetAvatars, useUploadAvatar } from "../../../hooks/avatars";
import { useGetNotify } from "../../../hooks/notify";
import { normalizeAvatarUrl } from "../../../utils/avatar";

const MAIN_COLOR = "#A60E07";

export default function SuperAdminAvatarsPage() {
  const { data, isLoading } = useGetAvatars();
  const uploadMutation = useUploadAvatar();
  const deleteMutation = useDeleteAvatar();
  const notify = useGetNotify();

  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const avatars = data?.avatars || [];

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setPreviewFile(file);
  };

  const resetForm = () => {
    setName("");
    setPreviewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = (event) => {
    event.preventDefault();
    if (!previewFile) {
      notify("err", "Rasm tanlang");
      return;
    }

    uploadMutation.mutate(
      { name: name.trim(), imageFile: previewFile },
      {
        onSuccess: () => {
          notify("ok", "Avatar yuklandi");
          resetForm();
        },
        onError: (error) => {
          notify("err", error?.response?.data?.message || "Avatar yuklashda xatolik");
        },
      }
    );
  };

  const handleDelete = (avatar) => {
    if (deletingId) return;
    const confirmed = window.confirm(`"${avatar.name}" avatarini o'chirmoqchimisiz?`);
    if (!confirmed) return;

    setDeletingId(avatar.id);
    deleteMutation.mutate(avatar.id, {
      onSuccess: () => notify("ok", "Avatar o'chirildi"),
      onError: (error) => notify("err", error?.response?.data?.message || "O'chirishda xatolik"),
      onSettled: () => setDeletingId(null),
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: MAIN_COLOR }}>
          Avatarlar
        </h1>
        <p className="text-sm text-gray-500">
          {"Sayt va mobil ilovada foydalanuvchilar tanlaydigan avatarlarni shu yerdan boshqaring."}
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-2">
            <ArrowUpTrayIcon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
          </div>
          <h2 className="text-base font-bold text-gray-900">Yangi avatar yuklash</h2>
        </div>

        <form onSubmit={handleUpload} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Nomi (ixtiyoriy)</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="masalan: Sher"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Rasm</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={uploadMutation.isPending}
            className="rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: MAIN_COLOR }}
          >
            {uploadMutation.isPending ? "Yuklanmoqda..." : "Yuklash"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-gray-900">
          Mavjud avatarlar {avatars.length > 0 ? `(${avatars.length})` : ""}
        </h2>

        {isLoading ? (
          <p className="text-sm text-gray-500">Yuklanmoqda...</p>
        ) : avatars.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
            <UserCircleIcon className="h-10 w-10" />
            <p className="text-sm">Hali avatar yuklanmagan</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                className="group relative flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-3"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                  {avatar.image_url ? (
                    <img
                      src={normalizeAvatarUrl(avatar.image_url)}
                      alt={avatar.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-full w-full text-gray-300" />
                  )}
                </div>
                <p className="w-full truncate text-center text-xs font-medium text-gray-700">
                  {avatar.name}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(avatar)}
                  disabled={deletingId === avatar.id}
                  title="O'chirish"
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-1 text-gray-400 opacity-0 shadow ring-1 ring-gray-200 transition group-hover:opacity-100 hover:text-red-600 disabled:opacity-60"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

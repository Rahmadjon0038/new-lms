"use client";
import React, { useState } from "react";
import { XMarkIcon, StarIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useCreatePointEvent } from "../../hooks/groups";

// Tez tanlash qiymatlari — mobil ilova bilan bir xil
const QUICK_POINTS = [1, 2, 5, 10, -1, -5];

/**
 * O'quvchiga ball qo'yish modali (teacher).
 * Mobil ilovadagi _PointSheet bilan bir xil funksionallik:
 * tez tanlash chiplari, +/- stepper, sarlavha (majburiy), izoh (ixtiyoriy).
 */
const PointModal = ({ student, groupId, onClose, onSaved }) => {
  const [points, setPoints] = useState(5);
  const [title, setTitle] = useState("Darsdagi faollik");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const createPoint = useCreatePointEvent();

  const submit = async () => {
    if (!title.trim()) {
      setError("Sarlavha kiritilishi kerak");
      return;
    }
    if (points === 0) {
      setError("Ball 0 bo'lishi mumkin emas");
      return;
    }
    setError(null);
    try {
      await createPoint.mutateAsync({
        student_id: student.id,
        group_id: groupId,
        points,
        title: title.trim(),
        description,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Ball qo'shilmadi, qayta urinib ko'ring"
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sarlavha */}
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D32F2F] to-[#7C0A05]">
            <StarIcon className="h-5 w-5 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-black text-gray-900">
              Ball qo&apos;yish
            </h3>
            <p className="truncate text-xs sm:text-sm font-semibold text-gray-500">
              {student.full_name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Tez tanlash chiplari */}
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_POINTS.map((value) => {
            const selected = points === value;
            const negative = value < 0;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPoints(value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${
                  selected
                    ? negative
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-green-600 bg-green-600 text-white"
                    : negative
                      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                {value > 0 ? `+${value}` : value}
              </button>
            );
          })}
        </div>

        {/* Aniq qiymat: +/- stepper */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm font-extrabold text-gray-800">Ball:</span>
          <button
            type="button"
            onClick={() => setPoints((p) => p - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span
            className={`w-14 text-center text-lg font-black ${
              points >= 0 ? "text-green-700" : "text-red-600"
            }`}
          >
            {points > 0 ? `+${points}` : points}
          </span>
          <button
            type="button"
            onClick={() => setPoints((p) => p + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Sarlavha va izoh */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sarlavha (majburiy)"
          className="mb-2.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#A60E07]"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Izoh (ixtiyoriy)"
          rows={2}
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#A60E07]"
        />

        {error && (
          <p className="mt-2 text-xs font-bold text-red-600">{error}</p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={createPoint.isPending}
          className="mt-4 w-full rounded-xl bg-[#A60E07] py-3 text-sm font-extrabold text-white transition hover:bg-[#8b0c06] disabled:opacity-60"
        >
          {createPoint.isPending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
};

export default PointModal;

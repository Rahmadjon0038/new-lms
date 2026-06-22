'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useAdminCreateLevel,
  useAdminDeleteLevel,
  useAdminGuideLevels,
  useAdminUpdateLevel,
} from '../../../hooks/guides';
import LevelPath from '../../../components/guide/LevelPath';
import {
  GUIDE_ICONS,
  GUIDE_COLORS,
  LEVEL_PRESETS,
  getGuideIcon,
  getGuideColor,
  DEFAULT_ICON_KEY,
  DEFAULT_COLOR_KEY,
} from '../../../components/guide/guideIcons';

const MAIN_COLOR = '#A60E07';

const emptyForm = { title: '', icon: DEFAULT_ICON_KEY, color: DEFAULT_COLOR_KEY };

const LevelModal = ({ isOpen, mode, form, setForm, onClose, onSave, isLoading }) => {
  if (!isOpen) return null;

  const previewColor = getGuideColor(form.color);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'edit' ? 'Darajani tahrirlash' : 'Yangi daraja'}
          </h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100" type="button">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Tanlangan icon + rang ko'rinishi */}
        <div className="mb-5 flex items-center justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg"
            style={{ backgroundColor: previewColor, boxShadow: `0 6px 0 0 ${previewColor}55` }}
          >
            {React.createElement(getGuideIcon(form.icon), { className: 'h-9 w-9', strokeWidth: 2.4 })}
          </div>
        </div>

        {/* Tayyor darajalar — bosilganda nom + mos icon + rang tanlanadi */}
        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium text-gray-700">Tayyor darajalar</span>
          <div className="flex flex-wrap gap-2">
            {LEVEL_PRESETS.map((preset) => {
              const active = form.title === preset.title;
              return (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => setForm({ title: preset.title, icon: preset.icon, color: preset.color })}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active ? 'border-transparent text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  style={active ? { backgroundColor: getGuideColor(preset.color) } : undefined}
                >
                  {React.createElement(getGuideIcon(preset.icon), { className: 'h-4 w-4' })}
                  {preset.title}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">Daraja nomi *</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
            placeholder="Masalan: Beginner"
          />
        </label>

        <div className="mt-4">
          <span className="mb-2 block text-sm font-medium text-gray-700">Iconka</span>
          <div className="grid max-h-44 grid-cols-7 gap-2 overflow-y-auto rounded-xl border border-gray-200 p-2">
            {GUIDE_ICONS.map(({ key, Icon }) => {
              const active = form.icon === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, icon: key }))}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                    active ? 'border-transparent text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  style={active ? { backgroundColor: previewColor } : undefined}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <span className="mb-2 block text-sm font-medium text-gray-700">Rang</span>
          <div className="flex flex-wrap gap-2">
            {GUIDE_COLORS.map(({ key, hex }) => {
              const active = form.color === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, color: key }))}
                  className={`h-8 w-8 rounded-full transition ${active ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: hex }}
                  title={key}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700" type="button">
            Bekor qilish
          </button>
          <button
            disabled={isLoading}
            onClick={onSave}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: MAIN_COLOR }}
            type="button"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminGuidePage = () => {
  const router = useRouter();
  const { data: levels = [], isLoading, error } = useAdminGuideLevels();
  const createLevelMutation = useAdminCreateLevel();
  const updateLevelMutation = useAdminUpdateLevel();
  const deleteLevelMutation = useAdminDeleteLevel();

  const [modal, setModal] = useState({ open: false, mode: 'create', levelId: null });
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ open: true, mode: 'create', levelId: null });
  };

  const openEdit = (level) => {
    setForm({
      title: level.title || '',
      icon: level.icon || DEFAULT_ICON_KEY,
      color: level.color || DEFAULT_COLOR_KEY,
    });
    setModal({ open: true, mode: 'edit', levelId: level.id });
  };

  const closeModal = () => setModal({ open: false, mode: 'create', levelId: null });

  const handleSave = async () => {
    const title = String(form.title || '').trim();
    if (!title) {
      toast.error('Daraja nomini kiriting');
      return;
    }

    try {
      if (modal.mode === 'edit') {
        await updateLevelMutation.mutateAsync({
          levelId: modal.levelId,
          title,
          icon: form.icon,
          color: form.color,
        });
        toast.success('Daraja yangilandi');
      } else {
        await createLevelMutation.mutateAsync({ title, icon: form.icon, color: form.color });
        toast.success('Daraja qo‘shildi');
      }
      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Saqlashda xatolik');
    }
  };

  const handleDelete = async (levelId) => {
    if (!window.confirm('Ushbu darajani o‘chirmoqchimisiz?')) return;
    try {
      await deleteLevelMutation.mutateAsync(levelId);
      toast.success('Daraja o‘chirildi');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'O‘chirishda xatolik');
    }
  };

  const isSaving = createLevelMutation.isPending || updateLevelMutation.isPending;

  // API darajalarni yangidan eskiga (DESC) qaytaradi — eng oxirgi qo'shilgan o'ngda
  // turishi uchun teskari tartiblab beramiz (eski chapda, yangi o'ngda).
  const orderedLevels = [...levels].reverse();

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-gray-50">
      <button
        onClick={openCreate}
        className="absolute right-3 top-3 z-40 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
        style={{ backgroundColor: MAIN_COLOR }}
        type="button"
      >
        <Plus className="h-5 w-5" />
        Daraja qo&apos;shish
      </button>

      {isLoading ? (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2" style={{ borderColor: MAIN_COLOR }} />
          <p className="mt-3 text-gray-600">Yuklanmoqda...</p>
        </div>
      ) : null}

      {error ? (
        <div className="flex h-full items-center justify-center p-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">Xatolik</p>
            <p className="text-sm">Darajalarni yuklab bo&apos;lmadi.</p>
          </div>
        </div>
      ) : null}

      {!isLoading && !error ? (
        levels.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-600">
            <p className="mb-4">Hozircha daraja yo&apos;q</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: MAIN_COLOR }}
              type="button"
            >
              <Plus className="h-5 w-5" />
              Birinchi darajani qo&apos;shish
            </button>
          </div>
        ) : (
          <LevelPath
            levels={orderedLevels}
            onSelect={(level) => router.push(`/admin/guide/1/${level.id}`)}
            renderActions={(level) => (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(level);
                  }}
                  className="rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm hover:bg-gray-50"
                  title="Tahrirlash"
                >
                  <Pencil className="h-4 w-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(level.id);
                  }}
                  className="rounded-lg border border-red-100 bg-red-50 p-1.5 shadow-sm hover:bg-red-100"
                  title="O'chirish"
                >
                  <Trash2 className="h-4 w-4 text-red-700" />
                </button>
              </>
            )}
          />
        )
      ) : null}

      <LevelModal
        isOpen={modal.open}
        mode={modal.mode}
        form={form}
        setForm={setForm}
        onClose={closeModal}
        onSave={handleSave}
        isLoading={isSaving}
      />
    </div>
  );
};

export default AdminGuidePage;

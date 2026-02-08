'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AcademicCapIcon, ArrowRightIcon, PencilSquareIcon, PlusCircleIcon, TrashIcon, XMarkIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAdminCreateLevel, useAdminDeleteLevel, useAdminGuideLevels, useAdminUpdateLevel } from '../../../hooks/guides';

const MAIN_COLOR = '#A60E07';

const LevelModal = ({ isOpen, onClose, title, form, setForm, onSave, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Level title"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            rows={3}
            placeholder="Description"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Cancel
          </button>
          <button
            disabled={isLoading}
            onClick={onSave}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: MAIN_COLOR }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminGuidePage = () => {
  const { data: levels = [], isLoading, error } = useAdminGuideLevels();
  const createLevelMutation = useAdminCreateLevel();
  const updateLevelMutation = useAdminUpdateLevel();
  const deleteLevelMutation = useAdminDeleteLevel();

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, levelId: null });

  const [createForm, setCreateForm] = useState({ title: '', description: '' });
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  const openEditModal = (level) => {
    setEditForm({ title: level.title || '', description: level.description || '' });
    setEditModal({ open: true, levelId: level.id });
  };

  const handleCreateLevel = async () => {
    if (!createForm.title.trim() || !createForm.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      await createLevelMutation.mutateAsync({
        title: createForm.title.trim(),
        description: createForm.description.trim(),
      });
      toast.success('Level created');
      setCreateForm({ title: '', description: '' });
      setCreateModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create level');
    }
  };

  const handleUpdateLevel = async () => {
    if (!editForm.title.trim() || !editForm.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      await updateLevelMutation.mutateAsync({
        levelId: editModal.levelId,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
      });
      toast.success('Level updated');
      setEditModal({ open: false, levelId: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update level');
    }
  };

  const handleDeleteLevel = async (levelId) => {
    if (!window.confirm('Are you sure you want to delete this level?')) return;

    try {
      await deleteLevelMutation.mutateAsync(levelId);
      toast.success('Level deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete level');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-8 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Study Guides</h1>
          <p className="mt-2 text-slate-600">Level management for admin</p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: MAIN_COLOR }}
        >
          <PlusCircleIcon className="h-5 w-5" />
          Add level
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: MAIN_COLOR }} />
          <p className="text-gray-600 mt-3">Loading...</p>
        </div>
      ) : null}

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-semibold">Error</p>
          <p className="text-sm">Failed to load levels.</p>
        </div>
      ) : null}

      {!isLoading && !error ? (
        levels.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-md text-center text-gray-600">No levels found</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
            {levels.map((level) => (
              <div key={level.id} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-md transition duration-150 hover:shadow-lg" style={{ borderTop: `5px solid ${MAIN_COLOR}` }}>
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="h-6 w-6 text-[#A60E07]" />
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">{level.title}</h2>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(level)} className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50" title="Edit">
                      <PencilSquareIcon className="h-4 w-4 text-gray-700" />
                    </button>
                    <button onClick={() => handleDeleteLevel(level.id)} className="rounded-lg border border-red-100 bg-red-50 p-2 hover:bg-red-100" title="Delete">
                      <TrashIcon className="h-4 w-4 text-red-700" />
                    </button>
                  </div>
                </div>

                <p className="min-h-[80px] text-sm sm:text-base leading-relaxed text-slate-600">{level.description}</p>

                {Number(level.lesson_count) > 0 ? (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-[#A60E07]">
                      <BookOpenIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-base sm:text-lg font-bold">{level.lesson_count} lessons</span>
                    </div>
                  </div>
                ) : null}

                <Link
                  href={`/admin/guide/1/${level.id}`}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-lg py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: MAIN_COLOR }}
                >
                  View lessons
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            ))}
          </div>
        )
      ) : null}

      <LevelModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="New level"
        form={createForm}
        setForm={setCreateForm}
        onSave={handleCreateLevel}
        isLoading={createLevelMutation.isPending}
      />

      <LevelModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, levelId: null })}
        title="Update level"
        form={editForm}
        setForm={setEditForm}
        onSave={handleUpdateLevel}
        isLoading={updateLevelMutation.isPending}
      />
    </div>
  );
};

export default AdminGuidePage;

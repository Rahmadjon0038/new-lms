'use client';
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowsPointingOutIcon,
  ArrowRightIcon,
  ArrowUpTrayIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAdminCreateLevel, useAdminDeleteLevel, useAdminGuideLevels, useAdminUpdateLevel } from '../../../hooks/guides';
import { instance } from '../../../hooks/api';

const MAIN_COLOR = '#A60E07';

const renderPreview = ({ url, mimeType, title, className = '' }) => {
  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 text-sm font-semibold text-gray-500 ${className}`}>
        Preview yo&apos;q
      </div>
    );
  }

  if (mimeType === 'application/pdf') {
    return (
      <iframe
        title={title || 'PDF preview'}
        src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=page-width`}
        className={className}
      />
    );
  }

  return <img src={url} alt={title || 'Preview'} className={className} />;
};

const FileModal = ({
  isOpen,
  title,
  onClose,
  onSave,
  isLoading,
  form,
  setForm,
  previewUrl,
  previewMimeType,
  previewLabel,
  submitLabel,
  requireFile = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {previewLabel ? <p className="mt-1 text-sm text-gray-500">{previewLabel}</p> : null}
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100" type="button">
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Title *</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
              placeholder="Daraja nomi"
            />
          </label>

          <div className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Qo&apos;llanma PDF *</span>
            {form.file || previewUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-gray-300 bg-gray-50">
                {form.file ? (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, file: null }))}
                    className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-1 text-white"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                ) : null}
                {renderPreview({
                  url: previewUrl,
                  mimeType: previewMimeType,
                  title: form.title,
                  className: 'h-56 w-full object-cover',
                })}
              </div>
            ) : (
              <label className="flex h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#A60E07]/40 bg-white text-gray-600 hover:bg-gray-50">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="hidden"
                />
                <ArrowUpTrayIcon className="h-9 w-9 text-gray-400" />
                <p className="text-sm font-semibold">PDF yuklash</p>
                <p className="text-xs text-gray-500">Banner avtomatik PDF&apos;dan olinadi</p>
              </label>
            )}
            {!requireFile && !form.file ? (
              <p className="mt-2 text-xs text-gray-500">Agar faqat title o&apos;zgarsa, PDF qayta yuklash shart emas.</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700" type="button">
            Cancel
          </button>
          <button
            disabled={isLoading}
            onClick={onSave}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: MAIN_COLOR }}
            type="button"
          >
            {submitLabel}
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
  const [editModal, setEditModal] = useState({ open: false, levelId: null, bannerUrl: '', bannerMimeType: '', title: '' });
  const [bannerViewer, setBannerViewer] = useState({ open: false, url: '', mimeType: '', title: '' });
  const [createForm, setCreateForm] = useState({ title: '', file: null });
  const [editForm, setEditForm] = useState({ title: '', file: null });
  const [levelBanners, setLevelBanners] = useState({});

  const createPreviewUrl = useMemo(() => (createForm.file ? URL.createObjectURL(createForm.file) : ''), [createForm.file]);
  const createPreviewMimeType = createForm.file?.type || '';
  const editPreviewUrl = useMemo(() => (editForm.file ? URL.createObjectURL(editForm.file) : editModal.bannerUrl || ''), [editForm.file, editModal.bannerUrl]);
  const editPreviewMimeType = editForm.file?.type || editModal.bannerMimeType || '';

  useEffect(
    () => () => {
      if (createPreviewUrl) URL.revokeObjectURL(createPreviewUrl);
      if (editForm.file && editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
    },
    [createPreviewUrl, editPreviewUrl, editForm.file]
  );

  useEffect(() => {
    let active = true;
    const objectUrls = [];

    const loadBanners = async () => {
      if (!levels.length) {
        setLevelBanners({});
        return;
      }

      const entries = await Promise.all(
        levels.map(async (level) => {
          if (!level?.protected_banner_url) return [level.id, ''];
          try {
            const response = await instance.get(level.protected_banner_url, { responseType: 'blob' });
            const objectUrl = URL.createObjectURL(response.data);
            objectUrls.push(objectUrl);
            return [level.id, objectUrl];
          } catch {
            return [level.id, ''];
          }
        })
      );

      if (active) setLevelBanners(Object.fromEntries(entries));
    };

    loadBanners();
    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [levels]);

  const openEditModal = (level) => {
    setEditForm({ title: level.title || '', file: null });
    setEditModal({
      open: true,
      levelId: level.id,
      bannerUrl: levelBanners[level.id] || '',
      bannerMimeType: level.banner_mime_type || '',
      title: level.title || '',
    });
  };

  const handleCreateLevel = async () => {
    const title = String(createForm.title || '').trim();
    if (!title) {
      toast.error('Title kiritish kerak');
      return;
    }
    if (!createForm.file) {
      toast.error('PDF yuklash kerak');
      return;
    }

    try {
      await createLevelMutation.mutateAsync({
        title,
        banner: createForm.file,
      });
      toast.success('Level created');
      setCreateForm({ title: '', file: null });
      setCreateModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create level');
    }
  };

  const handleUpdateLevel = async () => {
    const title = String(editForm.title || '').trim();
    if (!title) {
      toast.error('Title kiritish kerak');
      return;
    }

    try {
      await updateLevelMutation.mutateAsync({
        levelId: editModal.levelId,
        title,
        banner: editForm.file || undefined,
      });
      toast.success('Level updated');
      setEditForm({ title: '', file: null });
      setEditModal({ open: false, levelId: null, bannerUrl: '', bannerMimeType: '', title: '' });
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
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button
          onClick={() => setCreateModal(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white sm:w-auto"
          style={{ backgroundColor: MAIN_COLOR }}
          type="button"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Add level
        </button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2" style={{ borderColor: MAIN_COLOR }} />
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Error</p>
          <p className="text-sm">Failed to load levels.</p>
        </div>
      ) : null}

      {!isLoading && !error ? (
        levels.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-md">No levels found</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {levels.map((level) => {
              const bannerUrl = levelBanners[level.id] || '';
              const bannerMimeType = level.banner_mime_type || '';

              return (
                <div
                  key={level.id}
                  className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-md transition duration-150 hover:shadow-lg sm:p-5"
                  style={{ borderTop: `5px solid ${MAIN_COLOR}` }}
                >
                  <div className="relative mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50">
                    <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                      <button
                        onClick={() => setBannerViewer({ open: true, url: bannerUrl, mimeType: bannerMimeType, title: level.title || '' })}
                        disabled={!bannerUrl}
                        className="rounded-lg border border-gray-200 bg-white/95 p-2 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        title="Full screen"
                        type="button"
                      >
                        <ArrowsPointingOutIcon className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => openEditModal(level)}
                        className="rounded-lg border border-gray-200 bg-white/95 p-2 hover:bg-white"
                        title="Edit"
                        type="button"
                      >
                        <PencilSquareIcon className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDeleteLevel(level.id)}
                        className="rounded-lg border border-red-100 bg-red-50/95 p-2 hover:bg-red-100"
                        title="Delete"
                        type="button"
                      >
                        <TrashIcon className="h-4 w-4 text-red-700" />
                      </button>
                    </div>

                    {renderPreview({
                      url: bannerUrl,
                      mimeType: bannerMimeType,
                      title: level.title || 'Level banner',
                      className: 'h-64 w-full object-cover sm:h-80 lg:h-96',
                    })}
                  </div>

                  <p className="text-base font-semibold text-gray-900">{level.title || 'Untitled Level'}</p>

                  <Link
                    href={`/admin/guide/1/${level.id}`}
                    className="mt-auto inline-flex w-full items-center justify-center rounded-lg bg-[#A60E07] py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
                  >
                    View lessons
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )
      ) : null}

      <FileModal
        isOpen={createModal}
        title="New level"
        onClose={() => setCreateModal(false)}
        onSave={handleCreateLevel}
        isLoading={createLevelMutation.isPending}
        form={createForm}
        setForm={setCreateForm}
        previewUrl={createPreviewUrl}
        previewMimeType={createPreviewMimeType}
        previewLabel="Title yozing va PDF yuklang"
        submitLabel="Save"
        requireFile
      />

      <FileModal
        isOpen={editModal.open}
        title="Update level"
        onClose={() => {
          setEditForm({ title: '', file: null });
          setEditModal({ open: false, levelId: null, bannerUrl: '', bannerMimeType: '', title: '' });
        }}
        onSave={handleUpdateLevel}
        isLoading={updateLevelMutation.isPending}
        form={editForm}
        setForm={setEditForm}
        previewUrl={editPreviewUrl}
        previewMimeType={editPreviewMimeType}
        previewLabel="Title yoki PDF yangilanishi mumkin"
        submitLabel="Save"
      />

      {bannerViewer.open ? (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 p-3 sm:p-6"
          onClick={() => setBannerViewer({ open: false, url: '', mimeType: '', title: '' })}
        >
          <div className="mb-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setBannerViewer({ open: false, url: '', mimeType: '', title: '' })}
              className="rounded-lg bg-white/15 p-2 text-white hover:bg-white/25"
              type="button"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div
            className="flex h-[calc(100%-52px)] items-center justify-center overflow-auto rounded-xl bg-black/40 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {renderPreview({
              url: bannerViewer.url,
              mimeType: bannerViewer.mimeType,
              title: bannerViewer.title || 'Banner',
              className: 'max-h-full w-full max-w-full object-contain',
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminGuidePage;

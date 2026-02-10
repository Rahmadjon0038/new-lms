'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowsPointingOutIcon, ArrowRightIcon, ArrowUpTrayIcon, PencilSquareIcon, PlusCircleIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAdminCreateLevel, useAdminDeleteLevel, useAdminGuideLevels, useAdminUpdateLevel } from '../../../hooks/guides';
import { instance } from '../../../hooks/api';

const MAIN_COLOR = '#A60E07';

const BannerModal = ({ isOpen, onClose, title, bannerFile, setBannerFile, onSave, isLoading, previewUrl }) => {
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

        {bannerFile ? (
          <div className="relative overflow-hidden rounded-xl border border-gray-300 bg-gray-50">
            <button onClick={() => setBannerFile(null)} className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-1 text-white">
              <XMarkIcon className="h-4 w-4" />
            </button>
            {previewUrl ? <img src={previewUrl} alt="Level banner preview" className="h-52 w-full object-cover" /> : null}
          </div>
        ) : (
          <label className="flex h-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#A60E07]/40 bg-white text-gray-600 hover:bg-gray-50">
            <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} className="hidden" />
            <ArrowUpTrayIcon className="h-9 w-9 text-gray-400" />
            <p className="text-sm font-semibold">Banner yuklash</p>
            <p className="text-xs text-gray-500">JPG, PNG, WEBP (max 10MB)</p>
          </label>
        )}

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
  const [bannerViewer, setBannerViewer] = useState({ open: false, url: '' });

  const [createBanner, setCreateBanner] = useState(null);
  const [editBanner, setEditBanner] = useState(null);
  const [levelBanners, setLevelBanners] = useState({});

  const createBannerPreviewUrl = useMemo(() => (createBanner ? URL.createObjectURL(createBanner) : ''), [createBanner]);
  const editBannerPreviewUrl = useMemo(() => (editBanner ? URL.createObjectURL(editBanner) : ''), [editBanner]);

  useEffect(
    () => () => {
      if (createBannerPreviewUrl) URL.revokeObjectURL(createBannerPreviewUrl);
      if (editBannerPreviewUrl) URL.revokeObjectURL(editBannerPreviewUrl);
    },
    [createBannerPreviewUrl, editBannerPreviewUrl]
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
    setEditBanner(null);
    setEditModal({ open: true, levelId: level.id });
  };

  const handleCreateLevel = async () => {
    if (!createBanner) {
      toast.error('Banner image is required');
      return;
    }

    try {
      await createLevelMutation.mutateAsync({
        banner: createBanner,
      });
      toast.success('Level created');
      setCreateBanner(null);
      setCreateModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create level');
    }
  };

  const handleUpdateLevel = async () => {
    if (!editBanner) {
      toast.error('Banner image is required');
      return;
    }

    try {
      await updateLevelMutation.mutateAsync({
        levelId: editModal.levelId,
        banner: editBanner,
      });
      toast.success('Level updated');
      setEditBanner(null);
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
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Study Guides</h1>
          <p className="mt-2 text-slate-600">Level management for admin</p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white sm:w-auto"
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
              <div
                key={level.id}
                className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-md transition duration-150 hover:shadow-lg"
                style={{ borderTop: `5px solid ${MAIN_COLOR}` }}
              >
                <div className="relative mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50">
                  <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                    <button
                      onClick={() => setBannerViewer({ open: true, url: levelBanners[level.id] || '' })}
                      disabled={!levelBanners[level.id]}
                      className="rounded-lg border border-gray-200 bg-white/95 p-2 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                      title="Full screen"
                    >
                      <ArrowsPointingOutIcon className="h-4 w-4 text-gray-700" />
                    </button>
                    <button onClick={() => openEditModal(level)} className="rounded-lg border border-gray-200 bg-white/95 p-2 hover:bg-white" title="Rename">
                      <PencilSquareIcon className="h-4 w-4 text-gray-700" />
                    </button>
                    <button onClick={() => handleDeleteLevel(level.id)} className="rounded-lg border border-red-100 bg-red-50/95 p-2 hover:bg-red-100" title="Delete">
                      <TrashIcon className="h-4 w-4 text-red-700" />
                    </button>
                  </div>
                  {levelBanners[level.id] ? (
                    <img src={levelBanners[level.id]} alt="Level banner" className="h-64 w-full object-contain bg-black/5 sm:h-80 lg:h-96" />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm font-semibold text-gray-500 sm:h-80 lg:h-96">Default banner</div>
                  )}
                </div>

                {level.description ? <p className="min-h-[80px] text-sm sm:text-base leading-relaxed text-slate-600">{level.description}</p> : null}

                <Link
                  href={`/admin/guide/1/${level.id}`}
                  className="mt-auto inline-flex w-full items-center justify-center rounded-lg py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
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

      <BannerModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="New level"
        bannerFile={createBanner}
        setBannerFile={setCreateBanner}
        previewUrl={createBannerPreviewUrl}
        onSave={handleCreateLevel}
        isLoading={createLevelMutation.isPending}
      />

      <BannerModal
        isOpen={editModal.open}
        onClose={() => {
          setEditBanner(null);
          setEditModal({ open: false, levelId: null });
        }}
        title="Update level"
        bannerFile={editBanner}
        setBannerFile={setEditBanner}
        previewUrl={editBannerPreviewUrl}
        onSave={handleUpdateLevel}
        isLoading={updateLevelMutation.isPending}
      />

      {bannerViewer.open ? (
        <div className="fixed inset-0 z-[9999] bg-black/90 p-3 sm:p-6">
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => setBannerViewer({ open: false, url: '' })}
              className="rounded-lg bg-white/15 p-2 text-white hover:bg-white/25"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex h-[calc(100%-52px)] items-center justify-center overflow-auto rounded-xl bg-black/40 p-4">
            {bannerViewer.url ? <img src={bannerViewer.url} alt="Banner full screen" className="max-h-full w-auto max-w-full object-contain" /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminGuidePage;

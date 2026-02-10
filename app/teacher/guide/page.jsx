'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowsPointingOutIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTeacherGuideLevels } from '../../../hooks/guides';
import { instance } from '../../../hooks/api';

const MAIN_COLOR = '#A60E07';

const TeacherGuidePage = () => {
  const { data: levels = [], isLoading, error } = useTeacherGuideLevels();
  const [levelBanners, setLevelBanners] = useState({});
  const [bannerViewer, setBannerViewer] = useState({ open: false, url: '' });

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

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Study Guides</h1>
          <p className="text-gray-600">Choose the level you need and explore the lesson plans</p>
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
            <p className="text-sm">Failed to load level information.</p>
          </div>
        ) : null}

        {!isLoading && !error ? (
          levels.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <p className="text-gray-600">No levels found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                    </div>
                    {levelBanners[level.id] ? (
                      <img src={levelBanners[level.id]} alt={level.title || 'Level banner'} className="h-64 w-full object-contain bg-black/5 sm:h-80 lg:h-96" />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-sm font-semibold text-gray-500 sm:h-80 lg:h-96">Default banner</div>
                    )}
                  </div>

                  {level.description ? <p className="min-h-[80px] text-sm sm:text-base leading-relaxed text-slate-600">{level.description}</p> : null}

                  <Link
                    href={`/teacher/guide/${level.course_id || level.courseId || 1}/${level.id}`}
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
      </div>

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

export default TeacherGuidePage;

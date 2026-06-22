'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTeacherGuideLevels } from '../../../hooks/guides';
import LevelPath from '../../../components/guide/LevelPath';

const MAIN_COLOR = '#A60E07';

const TeacherGuidePage = () => {
  const router = useRouter();
  const { data: levels = [], isLoading, error } = useTeacherGuideLevels();

  // Eng oxirgi qo'shilgan daraja o'ngda turishi uchun teskari tartib
  const orderedLevels = [...levels].reverse();

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-gray-50">
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
            <p className="text-sm">Daraja ma&apos;lumotlarini yuklab bo&apos;lmadi.</p>
          </div>
        </div>
      ) : null}

      {!isLoading && !error ? (
        levels.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-600">
            Hozircha daraja yo&apos;q
          </div>
        ) : (
          <LevelPath
            levels={orderedLevels}
            onSelect={(level) =>
              router.push(`/teacher/guide/${level.course_id || level.courseId || 1}/${level.id}`)
            }
          />
        )
      ) : null}
    </div>
  );
};

export default TeacherGuidePage;

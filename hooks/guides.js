import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { instance } from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

const normalizeLevels = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.levels)) return data.levels;
  return [];
};

// ============================
// Teacher API
// ============================
const getTeacherLevels = async () => {
  const response = await instance.get('/api/teacher/guides/levels');
  return normalizeLevels(unwrap(response));
};

const getTeacherLevelDetail = async (levelId) => {
  const response = await instance.get(`/api/teacher/guides/levels/${levelId}`);
  return unwrap(response);
};

const getTeacherLevelLessons = async (levelId) => {
  const response = await instance.get(`/api/teacher/guides/levels/${levelId}/lessons`);
  const data = unwrap(response);
  return Array.isArray(data) ? data : data?.lessons || [];
};

const getTeacherLessonDetail = async (lessonId) => {
  const response = await instance.get(`/api/teacher/guides/lessons/${lessonId}`);
  return unwrap(response);
};

const getTeacherLessonNotes = async (lessonId) => {
  const response = await instance.get(`/api/teacher/guides/lessons/${lessonId}/notes`);
  const data = unwrap(response);
  return Array.isArray(data) ? data : Array.isArray(data?.notes) ? data.notes : [];
};

export const useTeacherGuideLevels = () =>
  useQuery({
    queryKey: ['teacher-guide-levels'],
    queryFn: getTeacherLevels,
  });

export const useTeacherGuideLevelDetail = (levelId) =>
  useQuery({
    queryKey: ['teacher-guide-level-detail', levelId],
    queryFn: () => getTeacherLevelDetail(levelId),
    enabled: !!levelId,
  });

export const useTeacherGuideLevelLessons = (levelId) =>
  useQuery({
    queryKey: ['teacher-guide-level-lessons', levelId],
    queryFn: () => getTeacherLevelLessons(levelId),
    enabled: !!levelId,
  });

export const useTeacherGuideLessonDetail = (lessonId) =>
  useQuery({
    queryKey: ['teacher-guide-lesson-detail', lessonId],
    queryFn: () => getTeacherLessonDetail(lessonId),
    enabled: !!lessonId,
  });

export const useTeacherGuideLessonNotes = (lessonId) =>
  useQuery({
    queryKey: ['teacher-guide-lesson-notes', lessonId],
    queryFn: () => getTeacherLessonNotes(lessonId),
    enabled: !!lessonId,
    retry: false,
  });

// ============================
// Admin API
// ============================
const getAdminLevels = async () => {
  const response = await instance.get('/api/admin/guides/levels');
  return normalizeLevels(unwrap(response));
};

const createAdminLevel = async ({ title, description }) => {
  const response = await instance.post('/api/admin/guides/levels', { title, description });
  return unwrap(response);
};

const updateAdminLevel = async ({ levelId, title, description }) => {
  const response = await instance.patch(`/api/admin/guides/levels/${levelId}`, { title, description });
  return unwrap(response);
};

const deleteAdminLevel = async (levelId) => {
  const response = await instance.delete(`/api/admin/guides/levels/${levelId}`);
  return unwrap(response);
};

const getAdminLevelDetail = async (levelId) => {
  const response = await instance.get(`/api/admin/guides/levels/${levelId}`);
  return unwrap(response);
};

const getAdminLessonDetail = async (lessonId) => {
  const response = await instance.get(`/api/admin/guides/lessons/${lessonId}`);
  return unwrap(response);
};

const uploadAdminMainPdf = async ({ levelId, file }) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await instance.post(`/api/admin/guides/levels/${levelId}/main-pdf`, formData);
  return unwrap(response);
};

const deleteAdminMainPdf = async (levelId) => {
  const response = await instance.delete(`/api/admin/guides/levels/${levelId}/main-pdf`);
  return unwrap(response);
};

const createAdminLesson = async ({ levelId, topic_name }) => {
  const response = await instance.post(`/api/admin/guides/levels/${levelId}/lessons`, { topic_name: (topic_name || '').trim() });
  return unwrap(response);
};

const updateAdminLesson = async ({ lessonId, topic_name }) => {
  const response = await instance.patch(`/api/admin/guides/lessons/${lessonId}`, { topic_name: (topic_name || '').trim() });
  return unwrap(response);
};

const deleteAdminLesson = async (payload) => {
  const lessonId = typeof payload === 'object' ? payload?.lessonId : payload;
  const response = await instance.delete(`/api/admin/guides/lessons/${lessonId}`);
  return unwrap(response);
};

const reorderAdminLessons = async ({ levelId, lessons }) => {
  const response = await instance.patch(`/api/admin/guides/levels/${levelId}/lessons/reorder`, { lessons });
  return unwrap(response);
};

const createAdminNote = async ({ lessonId, content_markdown, color }) => {
  const response = await instance.post(`/api/admin/guides/lessons/${lessonId}/notes`, { content_markdown, color });
  return unwrap(response);
};

const updateAdminNote = async ({ lessonId, noteId, content_markdown, color }) => {
  const response = await instance.patch(`/api/admin/guides/lessons/${lessonId}/notes/${noteId}`, { content_markdown, color });
  return unwrap(response);
};

const deleteAdminNote = async ({ lessonId, noteId }) => {
  const response = await instance.delete(`/api/admin/guides/lessons/${lessonId}/notes/${noteId}`);
  return unwrap(response);
};

const uploadAdminLessonPdf = async ({ lessonId, title, file }) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);
  const response = await instance.post(`/api/admin/guides/lessons/${lessonId}/pdfs`, formData);
  return unwrap(response);
};

const deleteAdminLessonPdf = async ({ lessonId, pdfId }) => {
  const response = await instance.delete(`/api/admin/guides/lessons/${lessonId}/pdfs/${pdfId}`);
  return unwrap(response);
};

const createAdminAssignment = async ({ lessonId, assignment_text }) => {
  const response = await instance.post(`/api/admin/guides/lessons/${lessonId}/assignments`, { assignment_text: (assignment_text || '').trim() });
  return unwrap(response);
};

const updateAdminAssignment = async ({ lessonId, assignmentId, assignment_text }) => {
  const response = await instance.patch(`/api/admin/guides/lessons/${lessonId}/assignments/${assignmentId}`, {
    assignment_text: (assignment_text || '').trim(),
  });
  return unwrap(response);
};

const deleteAdminAssignment = async ({ lessonId, assignmentId }) => {
  const response = await instance.delete(`/api/admin/guides/lessons/${lessonId}/assignments/${assignmentId}`);
  return unwrap(response);
};

const createAdminVocabulary = async ({ lessonId, word, translation, example }) => {
  const response = await instance.post(`/api/admin/guides/lessons/${lessonId}/vocabulary`, { word, translation, example });
  return unwrap(response);
};

const updateAdminVocabulary = async ({ lessonId, vocabId, word, translation, example }) => {
  const response = await instance.patch(`/api/admin/guides/lessons/${lessonId}/vocabulary/${vocabId}`, { word, translation, example });
  return unwrap(response);
};

const deleteAdminVocabulary = async ({ lessonId, vocabId }) => {
  const response = await instance.delete(`/api/admin/guides/lessons/${lessonId}/vocabulary/${vocabId}`);
  return unwrap(response);
};

const uploadAdminVocabularyImage = async ({ lessonId, title, file }) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);
  const response = await instance.post(`/api/admin/guides/lessons/${lessonId}/vocabulary-images`, formData);
  return unwrap(response);
};

const deleteAdminVocabularyImage = async ({ lessonId, imageId }) => {
  const response = await instance.delete(`/api/admin/guides/lessons/${lessonId}/vocabulary-images/${imageId}`);
  return unwrap(response);
};

const createAdminVocabularyMarkdown = async ({ lessonId, content_markdown }) => {
  const response = await instance.post(`/api/admin/guides/lessons/${lessonId}/vocabulary-markdowns`, { content_markdown });
  return unwrap(response);
};

const updateAdminVocabularyMarkdown = async ({ lessonId, markdownId, content_markdown }) => {
  const response = await instance.patch(`/api/admin/guides/lessons/${lessonId}/vocabulary-markdowns/${markdownId}`, { content_markdown });
  return unwrap(response);
};

const deleteAdminVocabularyMarkdown = async ({ lessonId, markdownId }) => {
  const response = await instance.delete(`/api/admin/guides/lessons/${lessonId}/vocabulary-markdowns/${markdownId}`);
  return unwrap(response);
};

const createAdminVideo = async ({ lessonId, title, youtube_url }) => {
  const response = await instance.post(`/api/admin/guides/lessons/${lessonId}/videos`, { title, youtube_url });
  return unwrap(response);
};

const deleteAdminVideo = async ({ lessonId, videoId }) => {
  const response = await instance.delete(`/api/admin/guides/lessons/${lessonId}/videos/${videoId}`);
  return unwrap(response);
};

export const useAdminGuideLevels = () =>
  useQuery({
    queryKey: ['admin-guide-levels'],
    queryFn: getAdminLevels,
  });

export const useAdminGuideLevelDetail = (levelId) =>
  useQuery({
    queryKey: ['admin-guide-level-detail', levelId],
    queryFn: () => getAdminLevelDetail(levelId),
    enabled: !!levelId,
  });

export const useAdminGuideLessonDetail = (lessonId) =>
  useQuery({
    queryKey: ['admin-guide-lesson-detail', lessonId],
    queryFn: () => getAdminLessonDetail(lessonId),
    enabled: !!lessonId,
  });

export const useAdminCreateLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guide-levels'] });
    },
  });
};

export const useAdminUpdateLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminLevel,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-guide-levels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-guide-level-detail', vars.levelId] });
    },
  });
};

export const useAdminDeleteLevel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guide-levels'] });
    },
  });
};

export const useAdminUploadMainPdf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAdminMainPdf,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-guide-level-detail', vars.levelId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-detail', vars.levelId] });
      queryClient.invalidateQueries({ queryKey: ['admin-guide-levels'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-levels'] });
    },
  });
};

export const useAdminDeleteMainPdf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminMainPdf,
    onSuccess: (_, levelId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-guide-level-detail', levelId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-detail', levelId] });
      queryClient.invalidateQueries({ queryKey: ['admin-guide-levels'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-levels'] });
    },
  });
};

export const useAdminCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminLesson,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-guide-level-detail', vars.levelId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-detail', vars.levelId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-lessons', vars.levelId] });
    },
  });
};

export const useAdminUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminLesson,
    onSuccess: (_, vars) => {
      if (vars?.levelId) {
        queryClient.invalidateQueries({ queryKey: ['admin-guide-level-detail', vars.levelId] });
        queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-detail', vars.levelId] });
        queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-lessons', vars.levelId] });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['admin-guide-level-detail'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-detail'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-lessons'] });
    },
  });
};

export const useAdminDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminLesson,
    onSuccess: (_, vars) => {
      const levelId = typeof vars === 'object' ? vars?.levelId : undefined;
      if (levelId) {
        queryClient.invalidateQueries({ queryKey: ['admin-guide-level-detail', levelId] });
        queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-detail', levelId] });
        queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-lessons', levelId] });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['admin-guide-level-detail'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-detail'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-lessons'] });
    },
  });
};

export const useAdminReorderLessons = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderAdminLessons,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-guide-level-detail', vars.levelId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-detail', vars.levelId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-guide-level-lessons', vars.levelId] });
    },
  });
};

const invalidateLessonDetails = (queryClient, lessonId) => {
  queryClient.invalidateQueries({ queryKey: ['admin-guide-lesson-detail', lessonId] });
  queryClient.invalidateQueries({ queryKey: ['teacher-guide-lesson-detail', lessonId] });
};

export const useAdminCreateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminNote,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminUpdateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminNote,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminNote,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminUploadLessonPdf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAdminLessonPdf,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminDeleteLessonPdf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminLessonPdf,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminAssignment,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminUpdateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminAssignment,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminAssignment,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminCreateVocabulary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminVocabulary,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminUpdateVocabulary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminVocabulary,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminDeleteVocabulary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminVocabulary,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminUploadVocabularyImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAdminVocabularyImage,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminDeleteVocabularyImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminVocabularyImage,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminCreateVocabularyMarkdown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminVocabularyMarkdown,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminUpdateVocabularyMarkdown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminVocabularyMarkdown,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminDeleteVocabularyMarkdown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminVocabularyMarkdown,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminCreateVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminVideo,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

export const useAdminDeleteVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminVideo,
    onSuccess: (_, vars) => invalidateLessonDetails(queryClient, vars.lessonId),
  });
};

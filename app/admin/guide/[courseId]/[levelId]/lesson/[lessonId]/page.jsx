'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowUpTrayIcon, ArrowsPointingOutIcon, ArrowLeftIcon, DocumentIcon, PlayCircleIcon, SpeakerWaveIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-hot-toast';
import { instance } from '../../../../../../../hooks/api';
import {
  useAdminCreateAssignment,
  useAdminCreateVocabularyMarkdown,
  useAdminCreateNote,
  useAdminCreateVideo,
  useAdminCreateVocabulary,
  useAdminDeleteAssignment,
  useAdminDeleteLesson,
  useAdminDeleteLessonPdf,
  useAdminDeleteNote,
  useAdminDeleteVideo,
  useAdminDeleteVocabulary,
  useAdminDeleteVocabularyPdf,
  useAdminDeleteVocabularyImage,
  useAdminDeleteVocabularyMarkdown,
  useAdminGuideLessonDetail,
  useAdminGuideSpeechSettings,
  useAdminUpdateAssignment,
  useAdminUpdateGuideSpeechSettings,
  useAdminUpdateNote,
  useAdminUpdateVocabulary,
  useAdminUpdateVocabularyMarkdown,
  useAdminUploadLessonPdf,
  useAdminUploadVocabularyPdf,
  useAdminUploadVocabularyImage,
} from '../../../../../../../hooks/guides';

const COLOR_ITEMS = [
  { key: 'blue', cls: 'bg-blue-500' },
  { key: 'green', cls: 'bg-green-500' },
  { key: 'orange', cls: 'bg-orange-500' },
  { key: 'red', cls: 'bg-red-500' },
  { key: 'purple', cls: 'bg-purple-500' },
  { key: 'pink', cls: 'bg-pink-500' },
];

const NOTE_BORDER_COLOR = {
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f97316',
  red: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

const AdminGuideLessonPage = () => {
  const { courseId, levelId, lessonId } = useParams();
  const router = useRouter();

  const { data, isLoading, error } = useAdminGuideLessonDetail(lessonId);

  const deleteLessonMutation = useAdminDeleteLesson();
  const createNoteMutation = useAdminCreateNote();
  const updateNoteMutation = useAdminUpdateNote();
  const deleteNoteMutation = useAdminDeleteNote();
  const uploadPdfMutation = useAdminUploadLessonPdf();
  const deletePdfMutation = useAdminDeleteLessonPdf();
  const createAssignmentMutation = useAdminCreateAssignment();
  const updateAssignmentMutation = useAdminUpdateAssignment();
  const deleteAssignmentMutation = useAdminDeleteAssignment();
  const createVocabularyMutation = useAdminCreateVocabulary();
  const updateVocabularyMutation = useAdminUpdateVocabulary();
  const deleteVocabularyMutation = useAdminDeleteVocabulary();
  const uploadVocabularyImageMutation = useAdminUploadVocabularyImage();
  const deleteVocabularyImageMutation = useAdminDeleteVocabularyImage();
  const uploadVocabularyPdfMutation = useAdminUploadVocabularyPdf();
  const deleteVocabularyPdfMutation = useAdminDeleteVocabularyPdf();
  const createVocabularyMarkdownMutation = useAdminCreateVocabularyMarkdown();
  const updateVocabularyMarkdownMutation = useAdminUpdateVocabularyMarkdown();
  const deleteVocabularyMarkdownMutation = useAdminDeleteVocabularyMarkdown();
  const createVideoMutation = useAdminCreateVideo();
  const deleteVideoMutation = useAdminDeleteVideo();
  const { data: speechSettings } = useAdminGuideSpeechSettings();
  const updateSpeechSettingsMutation = useAdminUpdateGuideSpeechSettings();

  const lesson = data?.lesson || null;
  const notes = useMemo(() => (Array.isArray(data?.notes) ? data.notes : []), [data]);
  const pdfs = useMemo(() => (Array.isArray(data?.pdfs) ? data.pdfs : []), [data]);
  const assignments = useMemo(() => (Array.isArray(data?.assignments) ? data.assignments : []), [data]);
  const vocabulary = useMemo(() => (Array.isArray(data?.vocabulary) ? data.vocabulary : []), [data]);
  const vocabularyImages = useMemo(() => (Array.isArray(data?.vocabulary_images) ? data.vocabulary_images : []), [data]);
  const vocabularyPdfs = useMemo(() => (Array.isArray(data?.vocabulary_pdfs) ? data.vocabulary_pdfs : []), [data]);
  const vocabularyMarkdowns = useMemo(() => (Array.isArray(data?.vocabulary_markdowns) ? data.vocabulary_markdowns : []), [data]);
  const videos = useMemo(() => (Array.isArray(data?.videos) ? data.videos : []), [data]);
  const speechRate = Number(speechSettings?.speech_rate || data?.speech_settings?.speech_rate || 1);

  const [noteForm, setNoteForm] = useState({ id: null, content_markdown: '', color: 'blue' });
  const [pdfForm, setPdfForm] = useState({ title: '', file: null });
  const [assignmentForm, setAssignmentForm] = useState({ id: null, assignment_text: '' });
  const [vocabForm, setVocabForm] = useState({ id: null, word: '', translation: '', example: '' });
  const [vocabImageForm, setVocabImageForm] = useState({ title: '', file: null });
  const [vocabPdfForm, setVocabPdfForm] = useState({ title: '', file: null });
  const [vocabMarkdownForm, setVocabMarkdownForm] = useState({ id: null, content_markdown: '' });
  const [videoForm, setVideoForm] = useState({ title: '', youtube_url: '' });
  const [imageThumbs, setImageThumbs] = useState({});
  const [imageViewer, setImageViewer] = useState({ open: false, title: '', url: '', loading: false });
  const viewerRef = useRef(null);

  const openProtectedPdf = async (url) => {
    if (!url) {
      toast.error('PDF link not found');
      return;
    }
    try {
      const response = await instance.get(url, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(response.data);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to open PDF');
    }
  };

  const extractYoutubeVideoId = (raw = '') => {
    if (!raw) return '';
    const text = String(raw).trim();
    const match = text.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i
    );
    return match?.[1] || '';
  };

  const getVideoEmbedUrl = (video) => {
    if (video?.embed_url) return video.embed_url;
    const id = video?.youtube_video_id || extractYoutubeVideoId(video?.youtube_url);
    return id ? `https://www.youtube.com/embed/${id}` : '';
  };

  const speakWord = (rawText) => {
    const text = (rawText || '').trim();
    if (!text) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Speech is not supported in this browser');
      return;
    }
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = Math.min(2, Math.max(0.5, speechRate));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const updateSpeechRate = async (rateValue) => {
    const nextRate = Number(rateValue);
    if (!Number.isFinite(nextRate)) return;
    try {
      await updateSpeechSettingsMutation.mutateAsync({ speech_rate: nextRate });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update speech speed');
    }
  };

  const selectedImagePreviewUrl = useMemo(
    () => (vocabImageForm.file ? URL.createObjectURL(vocabImageForm.file) : ''),
    [vocabImageForm.file]
  );

  useEffect(
    () => () => {
      if (selectedImagePreviewUrl) URL.revokeObjectURL(selectedImagePreviewUrl);
    },
    [selectedImagePreviewUrl]
  );

  useEffect(() => {
    let active = true;
    const objectUrls = [];

    const loadThumbnails = async () => {
      if (!vocabularyImages.length) {
        setImageThumbs({});
        return;
      }
      const entries = await Promise.all(
        vocabularyImages.map(async (img) => {
          try {
            const response = await instance.get(img.protected_file_url, { responseType: 'blob' });
            const objectUrl = URL.createObjectURL(response.data);
            objectUrls.push(objectUrl);
            return [img.id, objectUrl];
          } catch {
            return [img.id, ''];
          }
        })
      );
      if (active) setImageThumbs(Object.fromEntries(entries));
    };

    loadThumbnails();

    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [vocabularyImages]);

  const openImageInViewer = async (item) => {
    setImageViewer({ open: true, title: item.title || 'Image', url: '', loading: true });
    try {
      const response = await instance.get(item.protected_file_url, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(response.data);
      setImageViewer({ open: true, title: item.title || 'Image', url: objectUrl, loading: false });
    } catch (err) {
      setImageViewer({ open: false, title: '', url: '', loading: false });
      toast.error(err?.response?.data?.message || 'Failed to open image');
    }
  };

  const closeImageViewer = () => {
    if (imageViewer.url) URL.revokeObjectURL(imageViewer.url);
    setImageViewer({ open: false, title: '', url: '', loading: false });
  };

  const openViewerFullscreen = async () => {
    try {
      if (viewerRef.current?.requestFullscreen) {
        await viewerRef.current.requestFullscreen();
      }
    } catch {
      toast.error('Failed to open full screen');
    }
  };

  const deleteLesson = async () => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await deleteLessonMutation.mutateAsync({ lessonId, levelId });
      toast.success('Lesson deleted');
      router.push(`/admin/guide/${courseId}/${levelId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const saveNote = async () => {
    if (!noteForm.content_markdown.trim()) {
      toast.error('Note content is required');
      return;
    }
    try {
      if (noteForm.id) {
        await updateNoteMutation.mutateAsync({
          lessonId,
          noteId: noteForm.id,
          content_markdown: noteForm.content_markdown.trim(),
          color: noteForm.color,
        });
        toast.success('Note updated');
      } else {
        await createNoteMutation.mutateAsync({
          lessonId,
          content_markdown: noteForm.content_markdown.trim(),
          color: noteForm.color,
        });
        toast.success('Note created');
      }
      setNoteForm({ id: null, content_markdown: '', color: 'blue' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save note');
    }
  };

  const savePdf = async () => {
    if (!pdfForm.title.trim() || !pdfForm.file) {
      toast.error('PDF title and file are required');
      return;
    }
    try {
      await uploadPdfMutation.mutateAsync({
        lessonId,
        title: pdfForm.title.trim(),
        file: pdfForm.file,
      });
      toast.success('PDF uploaded');
      setPdfForm({ title: '', file: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload PDF');
    }
  };

  const saveAssignment = async () => {
    if (!assignmentForm.assignment_text.trim()) {
      toast.error('Assignment text is required');
      return;
    }
    try {
      if (assignmentForm.id) {
        await updateAssignmentMutation.mutateAsync({
          lessonId,
          assignmentId: assignmentForm.id,
          assignment_text: assignmentForm.assignment_text.trim(),
        });
        toast.success('Assignment updated');
      } else {
        await createAssignmentMutation.mutateAsync({
          lessonId,
          assignment_text: assignmentForm.assignment_text.trim(),
        });
        toast.success('Assignment added');
      }
      setAssignmentForm({ id: null, assignment_text: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save assignment');
    }
  };

  const saveVocabulary = async () => {
    if (!vocabForm.word.trim() || !vocabForm.translation.trim()) {
      toast.error('Word and translation are required');
      return;
    }
    try {
      if (vocabForm.id) {
        await updateVocabularyMutation.mutateAsync({
          lessonId,
          vocabId: vocabForm.id,
          word: vocabForm.word.trim(),
          translation: vocabForm.translation.trim(),
          example: vocabForm.example.trim(),
        });
        toast.success('Word updated');
      } else {
        await createVocabularyMutation.mutateAsync({
          lessonId,
          word: vocabForm.word.trim(),
          translation: vocabForm.translation.trim(),
          example: vocabForm.example.trim(),
        });
        toast.success('Word added');
      }
      setVocabForm({ id: null, word: '', translation: '', example: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save word');
    }
  };

  const saveVocabularyImage = async () => {
    if (!vocabImageForm.title.trim() || !vocabImageForm.file) {
      toast.error('Vocabulary image title and file are required');
      return;
    }
    try {
      await uploadVocabularyImageMutation.mutateAsync({ lessonId, title: vocabImageForm.title.trim(), file: vocabImageForm.file });
      toast.success('Vocabulary image uploaded');
      setVocabImageForm({ title: '', file: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload vocabulary image');
    }
  };

  const saveVocabularyMarkdown = async () => {
    if (!vocabMarkdownForm.content_markdown.trim()) {
      toast.error('Markdown content is required');
      return;
    }
    try {
      if (vocabMarkdownForm.id) {
        await updateVocabularyMarkdownMutation.mutateAsync({
          lessonId,
          markdownId: vocabMarkdownForm.id,
          content_markdown: vocabMarkdownForm.content_markdown.trim(),
        });
        toast.success('Markdown updated');
      } else {
        await createVocabularyMarkdownMutation.mutateAsync({
          lessonId,
          content_markdown: vocabMarkdownForm.content_markdown.trim(),
        });
        toast.success('Markdown added');
      }
      setVocabMarkdownForm({ id: null, content_markdown: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save markdown');
    }
  };

  const saveVocabularyPdf = async () => {
    if (!vocabPdfForm.title.trim() || !vocabPdfForm.file) {
      toast.error('Vocabulary PDF title and file are required');
      return;
    }
    try {
      await uploadVocabularyPdfMutation.mutateAsync({
        lessonId,
        title: vocabPdfForm.title.trim(),
        file: vocabPdfForm.file,
      });
      toast.success('Vocabulary PDF uploaded');
      setVocabPdfForm({ title: '', file: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload vocabulary PDF');
    }
  };

  const saveVideo = async () => {
    if (!videoForm.title.trim() || !videoForm.youtube_url.trim()) {
      toast.error('Video title and YouTube link are required');
      return;
    }
    try {
      await createVideoMutation.mutateAsync({
        lessonId,
        title: videoForm.title.trim(),
        youtube_url: videoForm.youtube_url.trim(),
      });
      toast.success('Video added');
      setVideoForm({ title: '', youtube_url: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add video');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="py-10 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-[#A60E07]" />
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Error</p>
          <p className="text-sm">Failed to load lesson details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-md sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => router.push(`/admin/guide/${courseId}/${levelId}`)} className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200">
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">{lesson.topic_name || lesson.title}</h1>
              <p className="text-sm text-gray-600">{lesson.level_title}</p>
            </div>
          </div>
          <button onClick={deleteLesson} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 sm:w-auto">
            <TrashIcon className="h-5 w-5" />
            Delete lesson
          </button>
        </div>

        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Overview</h2>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {COLOR_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setNoteForm((p) => ({ ...p, color: item.key }))}
                    className={`h-7 w-7 rounded-full border-2 ${item.cls} ${
                      noteForm.color === item.key ? 'scale-110 border-slate-900 shadow-md' : 'border-white'
                    } transition`}
                    title={item.key}
                  />
                ))}
              </div>
              <div className="space-y-3">
                <textarea
                  value={noteForm.content_markdown}
                  onChange={(e) => setNoteForm((p) => ({ ...p, content_markdown: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20"
                  rows={8}
                  placeholder={'Example:\n# Lesson goals\n- Core rules\n- Practice tasks\n\nNote: ...'}
                />
                <div className="flex justify-end">
                  <button onClick={saveNote} className="rounded-xl bg-[#A60E07] px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90">
                    {noteForm.id ? 'Update note' : 'Add note'}
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    style={{ borderLeftWidth: 6, borderLeftColor: NOTE_BORDER_COLOR[n.color] || NOTE_BORDER_COLOR.blue }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase text-gray-500">{n.color || 'blue'}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setNoteForm({ id: n.id, content_markdown: n.content_markdown || '', color: n.color || 'blue' })}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteNoteMutation.mutateAsync({ lessonId, noteId: n.id }).catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete note'))}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{n.content_markdown || ''}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">PDF Materials</h2>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-red-50/60 to-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  value={pdfForm.title}
                  onChange={(e) => setPdfForm((p) => ({ ...p, title: e.target.value }))}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20"
                  placeholder="Example: Unit 3 Guide"
                />
                {pdfForm.file ? (
                  <div className="relative flex h-32 items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 px-4">
                    <button
                      onClick={() => setPdfForm((p) => ({ ...p, file: null }))}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    <DocumentIcon className="h-8 w-8 text-red-600" />
                    <p className="line-clamp-2 text-sm font-semibold text-gray-700">{pdfForm.file.name}</p>
                  </div>
                ) : (
                  <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#A60E07]/40 bg-white text-gray-600 hover:bg-gray-50">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setPdfForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                      className="hidden"
                    />
                    <ArrowUpTrayIcon className="h-8 w-8 text-gray-400" />
                    <p className="text-sm font-semibold">PDF yuklash</p>
                  </label>
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={savePdf} className="rounded-xl bg-[#A60E07] px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90">
                  PDF yuklash
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {pdfs.map((pdf) => (
                <div key={pdf.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-28 items-center justify-center rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50">
                    <DocumentIcon className="h-10 w-10 text-red-600" />
                  </div>
                  <div className="mb-4 flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-red-100 p-3">
                      <DocumentIcon className="h-7 w-7 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-slate-900">{pdf.title}</p>
                      <p className="text-xs text-gray-500">PDF file</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openProtectedPdf(pdf.protected_file_url || `/api/admin/guides/lessons/${lessonId}/pdfs/${pdf.id}/file`)}
                      className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => deletePdfMutation.mutateAsync({ lessonId, pdfId: pdf.id }).catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete PDF'))}
                      className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Assignments</h2>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50/60 to-white p-4 shadow-sm">
              <textarea
                value={assignmentForm.assignment_text}
                onChange={(e) => setAssignmentForm((p) => ({ ...p, assignment_text: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20"
                rows={7}
                placeholder={'Example:\n# Homework\n1. Write 10 sentences\n2. Create 5 questions'}
              />
              <div className="mt-3 flex justify-end">
                <button onClick={saveAssignment} className="rounded-xl bg-[#A60E07] px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90">
                  {assignmentForm.id ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {assignments.map((a) => {
                const text = a.assignment_text || a.text || a.description || '';
                return (
                  <div key={a.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-1 flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => setAssignmentForm({ id: a.id, assignment_text: text })}
                        className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAssignmentMutation.mutateAsync({ lessonId, assignmentId: a.id }).catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete assignment'))}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Vocabulary</h2>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-50/60 to-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-900">Words</p>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  Speech speed
                  <select
                    value={speechRate}
                    onChange={(e) => updateSpeechRate(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}x
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  value={vocabForm.word}
                  onChange={(e) => setVocabForm((p) => ({ ...p, word: e.target.value }))}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm"
                  placeholder="Word"
                />
                <input
                  value={vocabForm.translation}
                  onChange={(e) => setVocabForm((p) => ({ ...p, translation: e.target.value }))}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm"
                  placeholder="Translation"
                />
                <input
                  value={vocabForm.example}
                  onChange={(e) => setVocabForm((p) => ({ ...p, example: e.target.value }))}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm"
                  placeholder="Example sentence (optional)"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={saveVocabulary} className="rounded-xl bg-[#A60E07] px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90">
                  {vocabForm.id ? 'Update' : 'Add'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {vocabulary.map((v) => (
                <div key={v.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{v.word}</p>
                      <p className="text-sm text-[#A60E07]">{v.translation}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => speakWord(v.speak_text || v.word)}
                        className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                      >
                        <SpeakerWaveIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setVocabForm({ id: v.id, word: v.word || '', translation: v.translation || '', example: v.example || '' });
                        }}
                        className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteVocabularyMutation.mutateAsync({ lessonId, vocabId: v.id }).catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete vocabulary item'))}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {v.example ? <p className="text-sm italic text-gray-700">{v.example}</p> : null}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-amber-50/60 to-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-bold text-slate-900">Images</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  value={vocabImageForm.title}
                  onChange={(e) => setVocabImageForm((p) => ({ ...p, title: e.target.value }))}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm"
                  placeholder="Image title"
                />
                {vocabImageForm.file ? (
                  <div className="relative h-32 overflow-hidden rounded-xl border border-gray-300 bg-gray-50">
                    <button
                      onClick={() => setVocabImageForm((p) => ({ ...p, file: null }))}
                      className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-1 text-white"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    {selectedImagePreviewUrl ? <img src={selectedImagePreviewUrl} alt="Preview" className="h-full w-full object-cover" /> : null}
                  </div>
                ) : (
                  <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#A60E07]/40 bg-white text-gray-600 hover:bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setVocabImageForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                      className="hidden"
                    />
                    <ArrowUpTrayIcon className="h-8 w-8 text-gray-400" />
                    <p className="text-sm font-semibold">Rasm yuklash</p>
                  </label>
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={saveVocabularyImage} className="rounded-xl bg-[#A60E07] px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90">
                  Upload image
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-sky-50/60 to-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-bold text-slate-900">Vocabulary PDFs</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  value={vocabPdfForm.title}
                  onChange={(e) => setVocabPdfForm((p) => ({ ...p, title: e.target.value }))}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm"
                  placeholder="Vocabulary PDF title"
                />
                {vocabPdfForm.file ? (
                  <div className="relative flex h-32 items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 px-4">
                    <button
                      onClick={() => setVocabPdfForm((p) => ({ ...p, file: null }))}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    <DocumentIcon className="h-8 w-8 text-red-600" />
                    <p className="line-clamp-2 text-sm font-semibold text-gray-700">{vocabPdfForm.file.name}</p>
                  </div>
                ) : (
                  <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#A60E07]/40 bg-white text-gray-600 hover:bg-gray-50">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setVocabPdfForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                      className="hidden"
                    />
                    <ArrowUpTrayIcon className="h-8 w-8 text-gray-400" />
                    <p className="text-sm font-semibold">PDF yuklash</p>
                  </label>
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={saveVocabularyPdf} className="rounded-xl bg-[#A60E07] px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90">
                  Upload vocabulary PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {vocabularyPdfs.map((pdf) => (
                <div key={pdf.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex h-28 items-center justify-center rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50">
                    <DocumentIcon className="h-10 w-10 text-red-600" />
                  </div>
                  <div className="mb-4 flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-red-100 p-3">
                      <DocumentIcon className="h-7 w-7 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-slate-900">{pdf.title || 'Vocabulary PDF'}</p>
                      <p className="text-xs text-gray-500">PDF file</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        openProtectedPdf(pdf.protected_file_url || `/api/admin/guides/lessons/${lessonId}/vocabulary-pdfs/${pdf.id}/file`)
                      }
                      className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => deleteVocabularyPdfMutation.mutateAsync({ lessonId, pdfId: pdf.id }).catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete vocabulary PDF'))}
                      className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {vocabularyImages.map((img) => (
                <div key={img.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex min-w-0 items-start gap-3">
                    {imageThumbs[img.id] ? (
                      <img src={imageThumbs[img.id]} alt={img.title || 'Image'} className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                        <DocumentIcon className="h-6 w-6 text-red-600" />
                      </div>
                    )}
                    <p className="truncate font-semibold text-slate-900">{img.title || 'Vocabulary image'}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => openImageInViewer(img)} className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                      Open
                    </button>
                    <button
                      onClick={() => deleteVocabularyImageMutation.mutateAsync({ lessonId, imageId: img.id }).catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete vocabulary image'))}
                      className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-violet-50/60 to-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-bold text-slate-900">Markdown text</p>
              <textarea
                value={vocabMarkdownForm.content_markdown}
                onChange={(e) => setVocabMarkdownForm((p) => ({ ...p, content_markdown: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[#A60E07] focus:ring-2 focus:ring-[#A60E07]/20"
                rows={7}
                placeholder={'Example:\n# Vocabulary topic\n- apple: apple\n- book: book'}
              />
              <div className="mt-3 flex justify-end">
                <button onClick={saveVocabularyMarkdown} className="rounded-xl bg-[#A60E07] px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90">
                  {vocabMarkdownForm.id ? 'Update' : 'Add'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {vocabularyMarkdowns.map((md) => (
                <div key={md.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => setVocabMarkdownForm({ id: md.id, content_markdown: md.content_markdown || '' })}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteVocabularyMarkdownMutation.mutateAsync({ lessonId, markdownId: md.id }).catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete markdown'))}
                      className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{md.content_markdown || ''}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Videos</h2>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  value={videoForm.title}
                  onChange={(e) => setVideoForm((p) => ({ ...p, title: e.target.value }))}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Video title"
                />
                <input
                  value={videoForm.youtube_url}
                  onChange={(e) => setVideoForm((p) => ({ ...p, youtube_url: e.target.value }))}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="YouTube URL"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={saveVideo} className="rounded-lg bg-[#A60E07] px-4 py-2 text-sm font-semibold text-white">
                  Add video
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => (
                <div key={video.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <PlayCircleIcon className="h-5 w-5 shrink-0 text-red-600" />
                      <p className="truncate font-semibold text-slate-900">{video.title}</p>
                    </div>
                    <button
                      onClick={() => deleteVideoMutation.mutateAsync({ lessonId, videoId: video.id }).catch((err) => toast.error(err?.response?.data?.message || 'Failed to delete video'))}
                      className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="aspect-video overflow-hidden rounded-lg">
                    {getVideoEmbedUrl(video) ? (
                      <iframe title={video.title} src={getVideoEmbedUrl(video)} className="h-full w-full" allowFullScreen />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-500">Video link not found</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {imageViewer.open ? (
        <div className="fixed inset-0 z-[9999] bg-black/80 p-3 sm:p-6">
          <div ref={viewerRef} className="h-full w-full rounded-xl bg-black p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="truncate text-sm font-semibold text-white">{imageViewer.title}</p>
              <div className="flex items-center gap-2">
                <button onClick={openViewerFullscreen} className="rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25">
                  <ArrowsPointingOutIcon className="h-4 w-4" />
                </button>
                <button onClick={closeImageViewer} className="rounded-lg bg-white/15 p-2 text-white hover:bg-white/25">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-52px)] w-full overflow-auto">
              {imageViewer.loading ? (
                <div className="flex h-full items-center justify-center text-white">Loading...</div>
              ) : (
                <img src={imageViewer.url} alt={imageViewer.title} className="mx-auto h-full max-h-full w-auto max-w-full object-contain" />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminGuideLessonPage;

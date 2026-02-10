'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowsPointingOutIcon, ArrowLeftIcon, DocumentIcon, PlayCircleIcon, SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-hot-toast';
import { instance } from '../../../../../../../hooks/api';
import {
  useTeacherGuideLessonDetail,
  useTeacherGuideSpeechSettings,
  useTeacherUpdateGuideSpeechSettings,
} from '../../../../../../../hooks/guides';

const NOTE_COLOR_MAP = {
  blue: 'from-blue-50 to-white border-blue-300',
  green: 'from-green-50 to-white border-green-300',
  orange: 'from-orange-50 to-white border-orange-300',
  red: 'from-red-50 to-white border-red-300',
  purple: 'from-purple-50 to-white border-purple-300',
  pink: 'from-pink-50 to-white border-pink-300',
};

const toList = (value, fallbackKeys = []) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const direct = [...(Array.isArray(value.global) ? value.global : []), ...(Array.isArray(value.private) ? value.private : [])];
    if (direct.length > 0) return direct;
    for (const key of fallbackKeys) {
      if (Array.isArray(value[key])) return value[key];
    }
  }
  return [];
};

const TeacherGuideLessonPage = () => {
  const { courseId, levelId, lessonId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const { data, isLoading, error } = useTeacherGuideLessonDetail(lessonId);
  const { data: speechSettings } = useTeacherGuideSpeechSettings();
  const updateSpeechSettingsMutation = useTeacherUpdateGuideSpeechSettings();

  const lesson = data?.lesson || null;
  const notes = useMemo(() => toList(data?.notes), [data]);
  const pdfs = useMemo(() => toList(data?.pdfs), [data]);
  const assignments = useMemo(() => toList(data?.assignments), [data]);
  const vocabulary = useMemo(() => toList(data?.vocabulary), [data]);
  const vocabularyImages = useMemo(
    () => toList(data?.vocabulary_images, ['images']).map((item) => ({ ...item, protected_file_url: item.protected_file_url || item.protected_image_url || '' })),
    [data]
  );
  const vocabularyPdfs = useMemo(() => toList(data?.vocabulary_pdfs, ['pdfs']), [data]);
  const vocabularyMarkdowns = useMemo(() => toList(data?.vocabulary_markdowns, ['markdowns']), [data]);
  const videos = useMemo(() => toList(data?.videos || data?.video_links), [data]);
  const speechRate = Number(speechSettings?.speech_rate || data?.speech_settings?.speech_rate || 1);
  const [vocabularyAssets, setVocabularyAssets] = useState({});
  const [pdfBanners, setPdfBanners] = useState({});
  const [vocabPdfBanners, setVocabPdfBanners] = useState({});
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

  const openProtectedFile = async (url, name = 'File') => {
    if (!url) {
      toast.error('File link not found');
      return;
    }
    try {
      const response = await instance.get(url, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(response.data);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to open ${name.toLowerCase()}`);
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

  const openVocabularyAsset = (item) => {
    const asset = vocabularyAssets[item.id];
    if (asset?.isImage) {
      openImageInViewer(item);
      return;
    }
    openProtectedFile(item.protected_file_url, item.title || 'file');
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

  useEffect(() => {
    let active = true;
    const objectUrls = [];

    const loadAssets = async () => {
      if (!vocabularyImages.length) {
        setVocabularyAssets({});
        return;
      }

      const entries = await Promise.all(
        vocabularyImages.map(async (item) => {
          if (!item.protected_file_url) return [item.id, null];
          try {
            const response = await instance.get(item.protected_file_url, { responseType: 'blob' });
            const blob = response.data;
            const objectUrl = URL.createObjectURL(blob);
            objectUrls.push(objectUrl);
            const mime = blob?.type || '';
            return [item.id, { url: objectUrl, mime, isImage: mime.startsWith('image/') }];
          } catch {
            return [item.id, null];
          }
        })
      );

      if (active) {
        setVocabularyAssets(Object.fromEntries(entries.filter((entry) => entry[1])));
      }
    };

    loadAssets();

    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [vocabularyImages]);

  useEffect(() => {
    let active = true;
    const objectUrls = [];

    const loadBanners = async (items, setState) => {
      if (!items.length) {
        setState({});
        return;
      }
      const entries = await Promise.all(
        items.map(async (item) => {
          if (!item?.protected_banner_url) return [item.id, ''];
          try {
            const response = await instance.get(item.protected_banner_url, { responseType: 'blob' });
            const objectUrl = URL.createObjectURL(response.data);
            objectUrls.push(objectUrl);
            return [item.id, objectUrl];
          } catch {
            return [item.id, ''];
          }
        })
      );
      if (active) {
        setState(Object.fromEntries(entries));
      }
    };

    loadBanners(pdfs, setPdfBanners);
    loadBanners(vocabularyPdfs, setVocabPdfBanners);

    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pdfs, vocabularyPdfs]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-10">
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
          <p className="text-sm">Failed to load lesson information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-md sm:p-6">
        <div className="mb-4 flex min-w-0 items-center gap-3">
          <button onClick={() => router.push(`/teacher/guide/${courseId}/${levelId}`)} className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200">
            <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">{lesson.topic_name || lesson.title || 'Lesson'}</h1>
            <p className="text-sm text-gray-600">{lesson.level_title}</p>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto border-b border-gray-200 pb-3">
          <div className="flex min-w-max gap-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'pdfs', label: 'PDF Materials' },
            { key: 'assignments', label: 'Assignments' },
            { key: 'vocabulary', label: 'Vocabulary' },
            { key: 'videos', label: 'Videos' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                activeTab === tab.key ? 'bg-[#A60E07] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>

        {activeTab === 'overview' ? (
          notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((item) => (
                <div key={item.id} className={`rounded-xl border bg-gradient-to-r p-4 sm:p-6 ${NOTE_COLOR_MAP[item?.color] || NOTE_COLOR_MAP.blue}`}>
                  <div className="prose prose-sm max-w-none text-slate-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item?.content_markdown || ''}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`rounded-xl border bg-gradient-to-r p-4 sm:p-6 ${NOTE_COLOR_MAP.blue}`}>
              <p className="whitespace-pre-wrap text-base leading-7 text-slate-800">{lesson.description || 'No lesson notes have been added yet.'}</p>
            </div>
          )
        ) : null}

        {activeTab === 'pdfs' ? (
          <div className="space-y-3">
            {pdfs.length === 0 ? <p className="text-sm text-gray-500">No PDFs available.</p> : null}
            {pdfs.map((pdf) => (
              <div key={pdf.id} className="rounded-xl border border-gray-200 p-3">
                <div className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50">
                  {pdfBanners[pdf.id] ? (
                    <img src={pdfBanners[pdf.id]} alt={pdf.title || 'PDF banner'} className="h-28 w-full object-cover" />
                  ) : (
                    <div className="flex h-28 items-center justify-center text-xs font-semibold text-gray-500">Default banner</div>
                  )}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <DocumentIcon className="h-6 w-6 text-red-600" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{pdf.title || pdf.file_name || 'PDF material'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openProtectedPdf(pdf.protected_file_url || `/api/teacher/guides/lessons/${lessonId}/pdfs/${pdf.id}/file`)}
                    className="rounded-lg bg-[#A60E07] px-3 py-2 text-sm font-semibold text-white sm:w-auto"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === 'assignments' ? (
          <div className="space-y-3">
            {assignments.length === 0 ? <p className="text-sm text-gray-500">No assignments available.</p> : null}
            {assignments.map((item) => {
              const text = item.assignment_text || item.text || item.description || '';
              return (
                <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {activeTab === 'vocabulary' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-end">
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

            {vocabulary.length === 0 && vocabularyImages.length === 0 && vocabularyPdfs.length === 0 && vocabularyMarkdowns.length === 0 ? (
              <p className="text-sm text-gray-500">No vocabulary available.</p>
            ) : null}

            {vocabulary.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {vocabulary.map((word) => (
                  <div key={word.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-lg font-bold text-slate-900">{word.word}</p>
                      <button
                        onClick={() => speakWord(word.speak_text || word.word)}
                        className="rounded-lg bg-indigo-50 p-2 text-indigo-700"
                        title="Read aloud"
                      >
                        <SpeakerWaveIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-[#A60E07]">{word.translation}</p>
                    {word.example ? <p className="mt-2 text-sm italic text-gray-700">{word.example}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}

            {vocabularyImages.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {vocabularyImages.map((img) => (
                  <div key={img.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      {vocabularyAssets[img.id]?.isImage ? (
                        <img src={vocabularyAssets[img.id].url} alt={img.title || 'Vocabulary image'} className="h-36 w-full object-cover" />
                      ) : (
                        <div className="flex h-36 items-center justify-center gap-2 text-gray-500">
                          <DocumentIcon className="h-6 w-6 text-red-600" />
                          <span className="text-sm font-semibold">File</span>
                        </div>
                      )}
                    </div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate font-semibold text-slate-900">{img.title || 'Vocabulary asset'}</p>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600">
                        {vocabularyAssets[img.id]?.isImage ? 'Image' : 'File'}
                      </span>
                    </div>
                    <button
                      onClick={() => openVocabularyAsset(img)}
                      disabled={!img.protected_file_url}
                      className="w-full rounded-lg bg-[#A60E07] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {vocabularyAssets[img.id]?.isImage ? 'Open full screen' : 'Open file'}
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {vocabularyMarkdowns.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {vocabularyMarkdowns.map((md) => (
                  <div key={md.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{md.content_markdown || ''}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {vocabularyPdfs.length > 0 ? (
              <div className="space-y-3">
                {vocabularyPdfs.map((pdf) => (
                  <div key={pdf.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50">
                      {vocabPdfBanners[pdf.id] ? (
                        <img src={vocabPdfBanners[pdf.id]} alt={pdf.title || 'Vocabulary PDF banner'} className="h-28 w-full object-cover" />
                      ) : (
                        <div className="flex h-28 items-center justify-center text-xs font-semibold text-gray-500">Default banner</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <DocumentIcon className="h-6 w-6 text-red-600" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{pdf.title || 'Vocabulary PDF'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => openProtectedPdf(pdf.protected_file_url || `/api/teacher/guides/lessons/${lessonId}/vocabulary-pdfs/${pdf.id}/file`)}
                        className="rounded-lg bg-[#A60E07] px-3 py-2 text-sm font-semibold text-white sm:w-auto"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === 'videos' ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {videos.length === 0 ? <p className="text-sm text-gray-500">No videos available.</p> : null}
            {videos.map((video) => (
              <div key={video.id} className="rounded-lg border border-gray-200 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <PlayCircleIcon className="h-5 w-5 text-red-600" />
                  <p className="truncate font-semibold text-slate-900">{video.title}</p>
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
        ) : null}
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

export default TeacherGuideLessonPage;

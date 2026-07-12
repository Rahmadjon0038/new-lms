"use client";
import React, { useState } from "react";
import {
  MegaphoneIcon,
  VideoCameraIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import {
  useStories,
  useCreateStory,
  useUpdateStory,
  useDeleteStory,
  useNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
} from "../../../hooks/content";

const MAIN_COLOR = "#A60E07";

// ============================ STORIS FORMASI ============================
const StoryFormModal = ({ story, onClose }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState(null);
  const createStory = useCreateStory();
  const updateStory = useUpdateStory();
  const isEdit = Boolean(story);
  const isPending = createStory.isPending || updateStory.isPending;

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!videoFile) {
      setError("Video fayl tanlang");
      return;
    }
    try {
      if (isEdit) {
        await updateStory.mutateAsync({ id: story.id, videoFile });
      } else {
        await createStory.mutateAsync({ title: "", videoFile });
      }
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Saqlashda xatolik yuz berdi");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-black text-gray-900">
            {isEdit ? "Videoni almashtirish" : "Yangi storis"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <label className="mb-1 block text-xs font-bold text-gray-500">
          Video fayl
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          className="mb-3 w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3.5 py-3 text-xs font-semibold text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#A60E07] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
        />

        {error && <p className="mb-2 text-xs font-bold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[#A60E07] py-3 text-sm font-extrabold text-white transition hover:bg-[#8b0c06] disabled:opacity-60"
        >
          {isPending ? "Yuklanmoqda..." : isEdit ? "Saqlash" : "Yuklash"}
        </button>
      </form>
    </div>
  );
};

// ============================ YANGILIK FORMASI ============================
const NewsFormModal = ({ item, onClose }) => {
  const [form, setForm] = useState({
    title: item?.title || "",
    body: item?.body || "",
  });
  const [error, setError] = useState(null);
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const isEdit = Boolean(item);
  const isPending = createNews.isPending || updateNews.isPending;

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.body.trim()) {
      setError("Sarlavha va matn kiritilishi kerak");
      return;
    }
    try {
      if (isEdit) {
        await updateNews.mutateAsync({ id: item.id, ...form });
      } else {
        await createNews.mutateAsync(form);
      }
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Saqlashda xatolik yuz berdi");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-black text-gray-900">
            {isEdit ? "Yangilikni tahrirlash" : "Yangi yangilik"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <label className="mb-1 block text-xs font-bold text-gray-500">
          Sarlavha
        </label>
        <input
          type="text"
          value={form.title}
          onChange={setField("title")}
          placeholder="Yangilik sarlavhasi"
          className="mb-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#A60E07]"
        />

        <label className="mb-1 block text-xs font-bold text-gray-500">
          Matn (Markdown qo&apos;llab-quvvatlanadi: **qalin**, # sarlavha, - ro&apos;yxat)
        </label>
        <textarea
          value={form.body}
          onChange={setField("body")}
          rows={10}
          placeholder={"Yangilikning to'liq matni...\n\n**Qalin matn**, # Sarlavha, - ro'yxat kabi markdown belgilaridan foydalanishingiz mumkin."}
          className="mb-3 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#A60E07]"
        />

        {error && <p className="mb-2 text-xs font-bold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-[#A60E07] py-3 text-sm font-extrabold text-white transition hover:bg-[#8b0c06] disabled:opacity-60"
        >
          {isPending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
};

// ============================ ASOSIY SAHIFA ============================
function AdminNewsPage() {
  const [tab, setTab] = useState("news");
  const [storyModal, setStoryModal] = useState(null); // null | 'new' | story obj
  const [newsModal, setNewsModal] = useState(null); // null | 'new' | news obj

  const { data: storiesData, isLoading: storiesLoading } = useStories(true);
  const { data: newsData, isLoading: newsLoading } = useNews(true);
  const updateStory = useUpdateStory();
  const deleteStory = useDeleteStory();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();

  const stories = storiesData?.data || [];
  const news = newsData?.data || [];

  const confirmDelete = (label, action) => {
    if (window.confirm(`${label} o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.`)) {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Sarlavha */}
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${MAIN_COLOR}14` }}
        >
          <MegaphoneIcon className="h-5 w-5" style={{ color: MAIN_COLOR }} />
        </span>
        <div>
          <h1 className="text-lg sm:text-xl font-black text-gray-900">
            Yangiliklar va storislar
          </h1>
          <p className="text-xs text-gray-500">
            Mobil ilova bosh sahifasida ko&apos;rinadigan kontent
          </p>
        </div>
      </div>

      {/* Tablar */}
      <div className="mb-4 flex gap-2">
        {[
          { key: "news", label: "Yangiliklar", icon: MegaphoneIcon },
          { key: "stories", label: "Storislar", icon: VideoCameraIcon },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${
              tab === key
                ? "bg-[#A60E07] text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ============== YANGILIKLAR TABI ============== */}
      {tab === "news" && (
        <div>
          <button
            type="button"
            onClick={() => setNewsModal("new")}
            className="mb-4 flex items-center gap-2 rounded-xl bg-[#A60E07] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#8b0c06]"
          >
            <PlusIcon className="h-4 w-4" />
            Yangilik qo&apos;shish
          </button>

          {newsLoading ? (
            <div className="py-16 text-center text-gray-400 font-semibold">
              Yuklanmoqda...
            </div>
          ) : news.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
              <p className="font-bold text-gray-400">
                Hozircha yangiliklar yo&apos;q
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {news.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-sm ${
                    item.is_active ? "border-gray-100" : "border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-extrabold"
                          style={{
                            color: MAIN_COLOR,
                            backgroundColor: `${MAIN_COLOR}14`,
                          }}
                        >
                          {item.tag}
                        </span>
                        {!item.is_active && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                            Yashirilgan
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="mt-1 text-sm font-bold text-gray-700">
                          {item.subtitle}
                        </p>
                      )}
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
                        {item.body}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        title={item.is_active ? "Yashirish" : "Ko'rsatish"}
                        onClick={() =>
                          updateNews.mutate({
                            id: item.id,
                            is_active: !item.is_active,
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        {item.is_active ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        title="Tahrirlash"
                        onClick={() => setNewsModal(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="O'chirish"
                        onClick={() =>
                          confirmDelete("Yangilik", () =>
                            deleteNews.mutate(item.id)
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============== STORISLAR TABI ============== */}
      {tab === "stories" && (
        <div>
          <button
            type="button"
            onClick={() => setStoryModal("new")}
            className="mb-4 flex items-center gap-2 rounded-xl bg-[#A60E07] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#8b0c06]"
          >
            <PlusIcon className="h-4 w-4" />
            Storis yuklash
          </button>

          {storiesLoading ? (
            <div className="py-16 text-center text-gray-400 font-semibold">
              Yuklanmoqda...
            </div>
          ) : stories.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
              <p className="font-bold text-gray-400">
                Hozircha storislar yo&apos;q
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                    story.is_active ? "border-gray-100" : "border-gray-200 opacity-60"
                  }`}
                >
                  {/* Video preview */}
                  <video
                    src={story.video_url}
                    className="h-44 w-full bg-gray-900 object-cover"
                    controls
                    preload="metadata"
                  />
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-500">
                          {story.created_at
                            ? new Date(story.created_at).toLocaleDateString("uz-UZ")
                            : ""}
                        </p>
                        {!story.is_active && (
                          <span className="text-[10px] font-bold text-gray-400">
                            Yashirilgan
                          </span>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          title={story.is_active ? "Yashirish" : "Ko'rsatish"}
                          onClick={() =>
                            updateStory.mutate({
                              id: story.id,
                              is_active: !story.is_active,
                            })
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          {story.is_active ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          title="Tahrirlash"
                          onClick={() => setStoryModal(story)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="O'chirish"
                          onClick={() =>
                            confirmDelete("Storis", () =>
                              deleteStory.mutate(story.id)
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modallar */}
      {storyModal && (
        <StoryFormModal
          story={storyModal === "new" ? null : storyModal}
          onClose={() => setStoryModal(null)}
        />
      )}
      {newsModal && (
        <NewsFormModal
          item={newsModal === "new" ? null : newsModal}
          onClose={() => setNewsModal(null)}
        />
      )}
    </div>
  );
}

export default AdminNewsPage;

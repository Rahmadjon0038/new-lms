import { instance } from "../hooks/api";

/**
 * Backend avatar_url ni brauzerda ishlaydigan URL'ga keltiradi.
 *
 * Backend URL'ni PUBLIC_BASE_URL env o'zgaruvchisi bilan quradi; server'da u
 * o'rnatilmagan bo'lsa "http://localhost:5000/..." bo'lib keladi va brauzerda
 * rasm ochilmaydi. Mobil ilovadagi _normalizeAvatarUrl bilan bir xil mantiq:
 * localhost bo'lsa yoki nisbiy yo'l bo'lsa — API bazasiga almashtiramiz.
 */
export const normalizeAvatarUrl = (rawUrl) => {
    const raw = String(rawUrl || "").trim();
    if (!raw) return null;

    const apiBase = String(instance.defaults.baseURL || "").replace(/\/$/, "");

    if (raw.startsWith("http://") || raw.startsWith("https://")) {
        if (raw.includes("localhost") || raw.includes("127.0.0.1")) {
            try {
                const url = new URL(raw);
                return `${apiBase}${url.pathname}${url.search}`;
            } catch {
                return null;
            }
        }
        return raw;
    }

    return raw.startsWith("/") ? `${apiBase}${raw}` : `${apiBase}/${raw}`;
};

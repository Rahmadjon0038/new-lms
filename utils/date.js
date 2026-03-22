export const formatDateYMD = (value) => {
  if (!value) return "-";
  const raw = String(value).trim();
  const ymdMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${y}-${m}-${d}`;
  }
  const dmyMatch = raw.match(/^(\d{2})[./-](\d{2})[./-](\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m}-${d}`;
  }
  const normalized = raw.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return raw;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatDateTimeYMDHM = (value) => {
  if (!value) return "-";
  const normalized = String(value).replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(value);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const ymd = `${y}-${m}-${d}`;
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${ymd} ${hh}:${mm}`;
};

export const normalizeMonth = (value) => {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 7);
  const str = String(value).trim();
  const match = str.match(/^\d{4}-\d{2}/);
  if (match) return match[0];
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return str;
  return date.toISOString().slice(0, 7);
};

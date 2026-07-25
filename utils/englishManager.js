const ENGLISH_SUBJECT_PATTERNS = [
  /english/i,
  /ingliz/i,
  /ingliz tili/i,
  /english language/i,
];

export const findEnglishSubject = (subjects = []) => {
  if (!Array.isArray(subjects) || subjects.length === 0) return null;

  const normalizedSubjects = subjects
    .map((subject) => ({
      ...subject,
      nameText: String(subject?.name || "").trim(),
    }))
    .filter((subject) => subject.nameText);

  return (
    normalizedSubjects.find((subject) =>
      ENGLISH_SUBJECT_PATTERNS.some((pattern) => pattern.test(subject.nameText))
    ) || normalizedSubjects[0] || null
  );
};

export const formatMoney = (value) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatCount = (value) => new Intl.NumberFormat("uz-UZ").format(Number(value) || 0);

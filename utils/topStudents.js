// Oyning eng yaxshi o'quvchilari uchun umumiy mantiq.
// Mobil ilova (Taraqqiyot_mobile) bilan bir xil qoida:
// guruhda 3 tagacha faol o'quvchi -> 1 ta, 4-5 ta -> 2 ta, ko'p bo'lsa -> 3 ta.
import { normalizeAvatarUrl } from './avatar';

export const topCountForGroupSize = (totalStudents) => {
    if (totalStudents <= 3) return 1;
    if (totalStudents <= 5) return 2;
    return 3;
};

// GET /api/groups/:id javobidan ({ group, students }) guruhning
// eng yaxshi o'quvchilarini ajratadi
export const buildGroupTop = (groupResponse) => {
    const group = groupResponse?.group || {};
    const students = Array.isArray(groupResponse?.students) ? groupResponse.students : [];
    const active = students.filter((s) => s.group_status === 'active');
    const take = topCountForGroupSize(active.length);
    const scored = active
        .filter((s) => Number(s.monthly_points) > 0)
        .sort((a, b) => Number(b.monthly_points) - Number(a.monthly_points));

    return {
        groupId: group.id,
        groupName: group.name || '',
        activeStudentsCount: active.length,
        students: scored.slice(0, take).map((s) => ({
            id: s.id,
            name: [s.surname, s.name].filter(Boolean).join(' '),
            points: Number(s.monthly_points) || 0,
            avatarUrl: normalizeAvatarUrl(s.avatar_url),
            initials: `${(s.surname || '').charAt(0)}${(s.name || '').charAt(0)}`,
        })),
    };
};

export const monthKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const MONTH_NAMES = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

export const formatMonthLabel = (key) => {
    const [year, month] = String(key).split('-');
    const index = parseInt(month, 10) - 1;
    if (Number.isNaN(index) || index < 0 || index > 11) return key;
    return `${MONTH_NAMES[index]} ${year}`;
};

// class_start_date "DD.MM.YYYY" formatidan oyning birinchi kunini oladi
const parseClassStartMonth = (classStartDate) => {
    const parts = String(classStartDate || '').split('.');
    if (parts.length !== 3) return null;
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (Number.isNaN(month) || Number.isNaN(year)) return null;
    return new Date(year, month - 1, 1);
};

// Eng erta guruh boshlangan oydan joriy oygacha (joriy oy birinchi), max 24 oy
export const buildMonthOptions = (groups) => {
    const now = new Date();
    const current = new Date(now.getFullYear(), now.getMonth(), 1);
    let earliest = null;
    for (const group of groups || []) {
        const start = parseClassStartMonth(group?.group_info?.class_start_date);
        if (start && (!earliest || start < earliest)) {
            earliest = start;
        }
    }
    if (!earliest || earliest > current) {
        return [monthKey(current)];
    }
    const months = [];
    let cursor = current;
    while (cursor >= earliest && months.length < 24) {
        months.push(monthKey(cursor));
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
    }
    return months;
};

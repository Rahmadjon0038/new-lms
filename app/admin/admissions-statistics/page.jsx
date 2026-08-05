"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowPathIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  MinusCircleIcon,
  PhoneIcon,
  UserPlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { instance } from "../../../hooks/api";

const MAIN_COLOR = "#A60E07";

const STATUS_CONFIG = {
  new: {
    label: "Yangi kelganlar",
    badge: "Yangi",
    icon: UserPlusIcon,
    accent: "bg-rose-50 text-rose-700 border-rose-100",
  },
  grouped: {
    label: "Hal bo'lganlar",
    badge: "Hal bo'ldi",
    icon: CheckBadgeIcon,
    accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  unresolved: {
    label: "Hal bo'lmaganlar",
    badge: "Hal bo'lmadi",
    icon: MinusCircleIcon,
    accent: "bg-amber-50 text-amber-700 border-amber-100",
  },
  removed: {
    label: "Guruhdan chiqarilganlar",
    badge: "Chiqarilgan",
    icon: XCircleIcon,
    accent: "bg-slate-50 text-slate-700 border-slate-200",
  },
  rejoined: {
    label: "Qayta guruhga biriktirilganlar",
    badge: "Qayta",
    icon: ArrowPathIcon,
    accent: "bg-sky-50 text-sky-700 border-sky-100",
  },
};

const formatMonthLabel = (month) => {
  const months = {
    "01": "Yanvar",
    "02": "Fevral",
    "03": "Mart",
    "04": "Aprel",
    "05": "May",
    "06": "Iyun",
    "07": "Iyul",
    "08": "Avgust",
    "09": "Sentabr",
    "10": "Oktabr",
    "11": "Noyabr",
    "12": "Dekabr",
  };
  const [year, mm] = String(month || "").split("-");
  return `${months[mm] || month} ${year || ""}`.trim();
};

const buildMonthOptions = (count = 12) => {
  const current = new Date();
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - i, 1));
    const monthValue = d.toISOString().slice(0, 7);
    items.push({
      value: monthValue,
      label: formatMonthLabel(monthValue),
    });
  }
  return items;
};

const normalizeText = (value) => String(value || "").toLowerCase();

const CALL_REASON_PATTERN = /(chaqir|gaplash|qayta|aloqa|bog'lan|boglan|telefon|muloqot|kelmadi|kelmay)/i;
const RESOLVED_REASON_PATTERN = /(hal bo'ldi|hal qilindi|qabul qilindi|o'qiydi|o'qimoqda|guruhga biriktir|biriktirilgan|qo'shil|qo'shildi|davom etadi|qoladi)/i;

const hasGroupInfo = (student) => Boolean(
  student?.group_id
    || student?.group_name
    || student?.group
    || student?.active_group_id
    || student?.active_group_name
);

const isAdmissionRow = (student) => student?.record_type === "admission";
const isGroupJoinRow = (student) => student?.record_type === "group_join";
const isRemovedRow = (student) => student?.record_type === "removed";
const isCalledRow = (student) => isAdmissionRow(student) && CALL_REASON_PATTERN.test(String(student.reason || ""));
const isCalledResolvedRow = (student) => isCalledRow(student) && RESOLVED_REASON_PATTERN.test(String(student.reason || ""));
const isCalledUnresolvedRow = (student) => isCalledRow(student) && !RESOLVED_REASON_PATTERN.test(String(student.reason || ""));
const isUnassignedRow = (student) => isAdmissionRow(student) && !hasGroupInfo(student) && !isCalledRow(student);
const isGroupedAdmissionRow = (student) => isAdmissionRow(student) && hasGroupInfo(student);
const getStudentKey = (student) => `${student?.id || "unknown"}:${student?.record_type || "admission"}:${String(student?.date || "").slice(0, 10)}`;
const getMembershipKey = (student) =>
  `${student?.id || "unknown"}:${student?.group_id || student?.closed_group_id || student?.active_group_id || student?.group_name || "unknown"}`;
const getEventTimestamp = (student) => {
  const raw = student?.created_at || student?.closed_left_at || student?.followup_at || student?.date || "";
  const ts = new Date(raw).getTime();
  return Number.isFinite(ts) ? ts : -Infinity;
};
const formatStudentName = (student) => {
  const surname = String(student?.surname || "").trim();
  const name = String(student?.name || "").trim();
  if (surname && name) return `${surname} ${name}`;
  return surname || name || "Noma'lum";
};
const getAdmissionDisplayStatus = (student) => {
  if (isRemovedRow(student)) return "removed";
  if (isGroupedAdmissionRow(student)) return "grouped";
  if (isUnassignedRow(student)) return "unresolved";
  return "new";
};
const getPersistedCallStatus = (student) => String(student?.followup_status || "").trim() || null;
const getEffectiveCallStatus = (student) => {
  const persisted = getPersistedCallStatus(student);
  if (persisted) return persisted;
  if (isCalledResolvedRow(student)) return "called_resolved";
  if (isCalledUnresolvedRow(student)) return "called_unresolved";
  return null;
};

const isSameDate = (left, right) => {
  if (!left || !right) return false;
  return String(left).slice(0, 10) === String(right).slice(0, 10);
};

// .toISOString() UTC sanasini beradi — Toshkent (UTC+5) da har kuni 00:00-05:00
// oralig'ida bu "bugun"ni noto'g'ri kechagi kun deb hisoblardi. Backend sanalari
// Asia/Tashkent bo'yicha kelgani uchun bu yerda ham xuddi shu zonada hisoblaymiz.
const getTashkentDateIso = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const formatDateGroupLabel = (date) => {
  if (!date) return "Sana belgilanmagan";

  const now = new Date();
  const todayIso = getTashkentDateIso(now);
  const yesterdayIso = getTashkentDateIso(new Date(now.getTime() - 24 * 60 * 60 * 1000));

  if (isSameDate(date, todayIso)) return "Bugun";
  if (isSameDate(date, yesterdayIso)) return "Kecha";

  const parsed = new Date(`${String(date).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return String(date);

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const formatSubjectGroupLabel = (subject) => {
  const label = String(subject || "").trim();
  if (!label) return "Fan belgilanmagan";
  return label.toUpperCase();
};

const StatCard = ({ title, value, hint, icon: Icon, color = MAIN_COLOR, bgClass = "bg-rose-50" }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
    <div className="flex items-start justify-between gap-2">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{title}</div>
        <div className="mt-1 text-xl font-bold text-gray-900">{value}</div>
        {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
      </div>
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${bgClass}`}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
    </div>
  </div>
);

const StudentCard = ({ student, status }) => {
  const displayStatus = student.status || status || "unresolved";
  const config = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.unresolved;
  const Icon = config.icon;
  const isRemoved = displayStatus === "removed";
  const adminLabel =
    isRemoved
      ? "Chiqargan admin"
      : displayStatus === "grouped" && student.record_type === "group_join"
        ? "Qayta biriktirgan admin"
        : "Qabul qilgan admin";
  const sourceLabel =
    displayStatus === "grouped"
      ? student.record_type === "group_join"
        ? "Qayta biriktirilgan"
        : "Bu oy guruhga biriktirilgan"
      : displayStatus === "rejoined"
        ? "Qayta guruhga biriktirilgan"
      : displayStatus === "removed"
        ? "Guruhdan chiqarilgan"
        : null;
  const noteText = student.followup_note || student.reason || student.note;

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[12px] font-semibold text-gray-900">{formatStudentName(student)}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-500">
            <PhoneIcon className="h-2.5 w-2.5" />
            <span>{student.phone || "-"}</span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${config.accent}`}>
          <Icon className="h-2.5 w-2.5" />
          {config.badge}
        </span>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-gray-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDaysIcon className="h-2.5 w-2.5" />
          {student.date}
        </span>
        <div className="flex min-w-0 flex-col items-end">
          <span className="truncate rounded-full bg-rose-50 px-2 py-0.5 font-medium text-rose-700">
            {student.admin_name || "Noma'lum"}
          </span>
          <span className="mt-0.5 text-[9px] text-gray-400">{adminLabel}</span>
        </div>
      </div>

      {student.group || student.subject || student.teacher ? (
        <div className="mt-1 space-y-0.5 text-[10px] text-gray-600">
          {student.group ? (
            <div className="truncate">
              Guruh: <span className="font-medium text-gray-900">{student.group}</span>
            </div>
          ) : null}
          {student.subject ? (
            <div className="truncate">
              Fan: <span className="font-medium text-gray-900">{student.subject}</span>
            </div>
          ) : null}
          {student.teacher ? (
            <div className="truncate">
              O&apos;qituvchi: <span className="font-medium text-gray-900">{student.teacher}</span>
            </div>
          ) : null}
        </div>
      ) : null}
      {isRemoved && student.removed_by_name ? (
        <div className="mt-1 text-[10px] text-gray-600">
          Chiqargan admin: <span className="font-medium text-gray-900">{student.removed_by_name}</span>
        </div>
      ) : null}
      {isRemoved && student.reason ? (
        <div className="mt-1 text-[10px] text-gray-600">
          Sabab: <span className="font-medium text-gray-900">{student.reason}</span>
        </div>
      ) : null}
      {sourceLabel ? <div className="mt-1 text-[9px] text-gray-400">{sourceLabel}</div> : null}
      <div className="mt-1 text-[10px] text-gray-600 line-clamp-1">{noteText}</div>
    </div>
  );
};

const fetchAdmissionsStatistics = async (month) => {
  const res = await instance.get(`/api/dashboard/admissions-statistics?month=${month}`);
  return res?.data?.data ?? null;
};

export default function AdmissionsStatisticsPage() {
  const monthOptions = useMemo(() => buildMonthOptions(12), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]?.value || "2026-08");
  const [selectedAdminId, setSelectedAdminId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admissions-statistics", selectedMonth],
    queryFn: () => fetchAdmissionsStatistics(selectedMonth),
    enabled: Boolean(selectedMonth),
    staleTime: 30_000,
  });

  const admins = useMemo(() => data?.admins || [], [data]);
  const students = useMemo(() => data?.students || [], [data]);

  const filteredAdmissions = useMemo(() => {
    const adminId = selectedAdminId === "all" ? null : Number(selectedAdminId);
    const q = normalizeText(searchTerm);

    return students.filter((student) => {
      const adminOk = adminId ? Number(student.admin_id || 0) === adminId : true;
      const searchOk = !q
        || normalizeText(student.name).includes(q)
        || normalizeText(student.phone).includes(q)
        || normalizeText(student.admin_name).includes(q)
        || normalizeText(student.group).includes(q)
        || normalizeText(student.subject).includes(q)
        || normalizeText(student.note).includes(q);
      return adminOk && searchOk;
    });
  }, [students, selectedAdminId, searchTerm]);

  const summary = useMemo(() => {
    const admissionsOnly = filteredAdmissions.filter(isAdmissionRow);
    const groupJoinsOnly = filteredAdmissions.filter(isGroupJoinRow);
    const removedOnly = filteredAdmissions.filter(isRemovedRow);
    const latestMembershipByKey = new Map();

    [...groupJoinsOnly, ...removedOnly].forEach((student) => {
      const key = getMembershipKey(student);
      const prev = latestMembershipByKey.get(key);
      if (!prev || getEventTimestamp(student) >= getEventTimestamp(prev)) {
        latestMembershipByKey.set(key, student);
      }
    });

    const grouped = admissionsOnly.filter(isGroupedAdmissionRow).length;
    const unresolved = admissionsOnly.filter((student) => isUnassignedRow(student)).length;
    const rejoinedVisible = groupJoinsOnly.filter((student) => latestMembershipByKey.get(getMembershipKey(student))?.record_type === "group_join");
    const removedVisible = removedOnly.filter((student) => latestMembershipByKey.get(getMembershipKey(student))?.record_type === "removed");
    const calledUnresolved = filteredAdmissions.filter((student) => getEffectiveCallStatus(student) === "called_unresolved").length;
    const calledResolved = filteredAdmissions.filter((student) => getEffectiveCallStatus(student) === "called_resolved").length;
    return {
      total: admissionsOnly.length,
      grouped,
      unresolved,
      calledUnresolved,
      calledResolved,
      removed: removedVisible.length,
      rejoined: rejoinedVisible.length,
      unassigned: unresolved,
    };
  }, [filteredAdmissions]);

  const adminStatistics = useMemo(() => {
    const rowsByAdmin = new Map();
    const admissionsOnly = filteredAdmissions.filter(isAdmissionRow);
    const groupJoinsOnly = filteredAdmissions.filter(isGroupJoinRow);

    admissionsOnly.forEach((student) => {
      const key = String(student.admin_id || student.admin_name || "unknown");
      if (!rowsByAdmin.has(key)) {
        rowsByAdmin.set(key, {
          id: student.admin_id || key,
          name: student.admin_name || "Noma'lum",
          total: 0,
          resolvedCount: 0,
          unresolvedCount: 0,
          rejoinedCount: 0,
        });
      }

      const bucket = rowsByAdmin.get(key);
      bucket.total += 1;
      const displayStatus = getAdmissionDisplayStatus(student);
      if (displayStatus === "grouped") bucket.resolvedCount += 1;
      if (displayStatus === "unresolved") bucket.unresolvedCount += 1;
    });

    groupJoinsOnly.forEach((student) => {
      const key = String(student.admin_id || student.admin_name || "unknown");
      if (!rowsByAdmin.has(key)) {
        rowsByAdmin.set(key, {
          id: student.admin_id || key,
          name: student.admin_name || "Noma'lum",
          total: 0,
          resolvedCount: 0,
          unresolvedCount: 0,
          rejoinedCount: 0,
        });
      }
      const bucket = rowsByAdmin.get(key);
      bucket.rejoinedCount += 1;
    });

    return Array.from(rowsByAdmin.values()).sort((left, right) => right.total - left.total);
  }, [filteredAdmissions]);

  const adminCards = useMemo(() => {
    const statsById = new Map(adminStatistics.map((item) => [String(item.id), item]));
    return admins.slice(0, 3).map((admin) => {
      const stats = statsById.get(String(admin.id)) || {
        id: admin.id,
        name: admin.name,
        total: 0,
        resolvedCount: 0,
        unresolvedCount: 0,
        rejoinedCount: 0,
      };
      return {
        ...stats,
        id: admin.id,
        name: admin.name,
      };
    });
  }, [adminStatistics, admins]);

  const boardColumns = useMemo(() => {
    const admissionsOnly = filteredAdmissions.filter(isAdmissionRow);
    const groupJoinsOnly = filteredAdmissions.filter(isGroupJoinRow);
    const removedOnly = filteredAdmissions.filter(isRemovedRow);
    const groupedAdmissions = admissionsOnly.filter(isGroupedAdmissionRow);
    const unresolvedAdmissions = admissionsOnly.filter((student) => getAdmissionDisplayStatus(student) === "unresolved");
    const latestMembershipByKey = new Map();

    [...groupJoinsOnly, ...removedOnly].forEach((student) => {
      const key = getMembershipKey(student);
      const prev = latestMembershipByKey.get(key);
      if (!prev || getEventTimestamp(student) >= getEventTimestamp(prev)) {
        latestMembershipByKey.set(key, student);
      }
    });

    const rejoinedAdmissions = groupJoinsOnly.filter((student) => latestMembershipByKey.get(getMembershipKey(student))?.record_type === "group_join");
    const removedVisible = removedOnly.filter((student) => latestMembershipByKey.get(getMembershipKey(student))?.record_type === "removed");
    return [
      {
        status: "new",
        label: STATUS_CONFIG.new.label,
        items: admissionsOnly.map((student) => ({
          ...student,
          status: getAdmissionDisplayStatus(student),
        })),
        count: admissionsOnly.length,
      },
      {
        status: "grouped",
        label: STATUS_CONFIG.grouped.label,
        items: groupedAdmissions.map((student) => ({ ...student, status: "grouped" })),
        count: groupedAdmissions.length,
      },
      {
        status: "unresolved",
        label: STATUS_CONFIG.unresolved.label,
        items: unresolvedAdmissions.map((student) => ({ ...student, status: "unresolved" })),
        count: unresolvedAdmissions.length,
      },
      {
        status: "removed",
        label: STATUS_CONFIG.removed.label,
        items: removedVisible.map((student) => ({ ...student, status: "removed" })),
        count: removedVisible.length,
      },
      {
        status: "rejoined",
        label: STATUS_CONFIG.rejoined.label,
        items: rejoinedAdmissions.map((student) => ({ ...student, status: "rejoined" })),
        count: rejoinedAdmissions.length,
      },
    ];
  }, [filteredAdmissions]);

  const groupedColumns = useMemo(
    () =>
      boardColumns.map((column) => {
        const dateMap = new Map();

        column.items.forEach((student) => {
          const dateKey = String(student.date || "").slice(0, 10) || "unknown";
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, []);
          }
          dateMap.get(dateKey).push(student);
        });

        const dateGroups = Array.from(dateMap.entries())
          .sort(([left], [right]) => right.localeCompare(left))
          .map(([date, dateItems]) => {
            const subjectMap = new Map();

            dateItems.forEach((student) => {
              const subjectKey = String(student.subject || "").trim() || "unknown";
              if (!subjectMap.has(subjectKey)) {
                subjectMap.set(subjectKey, []);
              }
              subjectMap.get(subjectKey).push(student);
            });

            const subjectGroups = Array.from(subjectMap.entries())
              .sort(([left], [right]) => String(left).localeCompare(String(right), "uz"))
              .map(([subject, subjectItems]) => ({
                subject,
                label: formatSubjectGroupLabel(subject),
                total: subjectItems.length,
                items: subjectItems,
              }));

            return {
              date,
              label: formatDateGroupLabel(date),
              total: dateItems.length,
              subjectGroups,
            };
          });

        return {
          ...column,
          dateGroups,
        };
      }),
    [boardColumns]
  );

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-3 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1600px] space-y-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                <ChartBarIcon className="h-3.5 w-3.5" />
                Qabul statistikasi
              </div>
              <h1 className="mt-2 text-xl font-bold text-gray-900">Qabul statistikasi</h1>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700">
                <FunnelIcon className="h-3.5 w-3.5 text-gray-500" />
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                  }}
                  className="bg-transparent outline-none"
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex w-full min-w-[220px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 sm:w-auto">
                <MagnifyingGlassIcon className="h-3.5 w-3.5 text-gray-500" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Talaba, telefon, guruh..."
                  className="w-full bg-transparent outline-none placeholder:text-gray-400"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
          <StatCard
            title="Bu oydagi qabul"
            value={summary.total}
            icon={UserPlusIcon}
            color={MAIN_COLOR}
            bgClass="bg-rose-50"
          />
          <StatCard
            title="Guruhga biriktirilgan"
            value={summary.grouped}
            icon={CheckBadgeIcon}
            color="#16A34A"
            bgClass="bg-emerald-50"
          />
          <StatCard
            title="Biriktirilmagan"
            value={summary.unassigned}
            icon={MinusCircleIcon}
            color="#B45309"
            bgClass="bg-amber-50"
          />
          <StatCard
            title="Guruhdan chiqarilgan"
            value={summary.removed}
            icon={XCircleIcon}
            color="#475569"
            bgClass="bg-slate-50"
          />
          <StatCard
            title="Qayta guruhga biriktirilgan"
            value={summary.rejoined}
            icon={ArrowPathIcon}
            color="#0EA5E9"
            bgClass="bg-sky-50"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Adminlar statistikasi</h2>
            <button
              type="button"
              onClick={() => setSelectedAdminId("all")}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                selectedAdminId === "all"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Barchasi
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {adminCards.map((admin) => {
              const active = String(selectedAdminId) === String(admin.id);
              return (
                <button
                  key={admin.id}
                  type="button"
                  onClick={() => setSelectedAdminId(String(admin.id))}
                  className={`min-w-[240px] flex-none rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? "border-rose-200 bg-rose-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">{admin.name}</div>
                      <div className="mt-0.5 text-[11px] text-gray-500">{admin.total || 0}/{admin.resolvedCount || 0}</div>
                    </div>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                      {admin.rejoinedCount || 0} qayta
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600">
                      Qabul {admin.total || 0}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600">
                      Hal {admin.resolvedCount || 0}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600">
                      Yo&apos;q {admin.unresolvedCount || 0}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">Qabul holati bo&apos;yicha talabalar</h2>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              Ma&apos;lumotlarni yuklab bo&apos;lmadi. Backend endpointini tekshiring.
            </div>
          ) : null}

          {isLoading && !data ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
              Ma&apos;lumotlar yuklanmoqda...
            </div>
          ) : (
            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-max gap-3">
                {groupedColumns.map((column) => {
                  const config = STATUS_CONFIG[column.status];
                  const Icon = config.icon;
                  return (
                    <div key={column.status} className="w-[420px] flex-none rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-md border ${config.accent}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-[12px] font-semibold text-gray-900">{config.label}</div>
                            <div className="text-[11px] text-gray-500">{column.count} ta</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {column.dateGroups.length > 0 ? (
                          column.dateGroups.map((dateGroup) => (
                            <div key={dateGroup.date} className="space-y-2">
                              <div className="flex items-center justify-between gap-2 rounded-md bg-gray-50 px-2.5 py-1.5">
                                <div className="text-[11px] font-semibold text-gray-700">{dateGroup.label}</div>
                                <div className="text-[11px] text-gray-500">{dateGroup.total} ta</div>
                              </div>

                              <div className="space-y-2">
                                {dateGroup.subjectGroups.map((subjectGroup) => (
                                  <div key={`${dateGroup.date}-${subjectGroup.subject}`} className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2 rounded-md bg-emerald-50 px-3 py-2">
                                      <div className="truncate text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                                        {subjectGroup.label}
                                      </div>
                                      <div className="inline-flex items-center rounded-full bg-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-900">
                                        {subjectGroup.total} ta
                                      </div>
                                    </div>
                                    <div className="space-y-1.5 pl-1">
                                      {subjectGroup.items.map((student) => (
                                        <StudentCard
                                          key={`${student.id}-${student.record_type}-${student.date}`}
                                          student={student}
                                          status={column.status}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-lg border border-dashed border-gray-200 bg-white p-3 text-center text-[11px] text-gray-500">
                            Ma&apos;lumot yo&apos;q
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

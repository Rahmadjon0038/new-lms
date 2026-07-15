'use client';

import React, { useMemo, useState } from 'react';
import { BanknotesIcon, CalendarDaysIcon, CheckIcon, PencilSquareIcon, PlusIcon, TagIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  useCreateExpense,
  useCreateExpenseCategory,
  useDeleteExpense,
  useDeleteExpenseCategory,
  useGetExpenseCategories,
  useGetExpenseSummary,
  useGetExpenses,
  useUpdateExpense,
} from '../../../hooks/expenses';

const MAIN_COLOR = '#A60E07';
const currentMonth = new Date().toISOString().slice(0, 7);
const currentDay = new Date().toISOString().slice(0, 10);

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatAmountInput = (value = '') => {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('uz-UZ').format(Number(digits));
}; 

const parseAmountInput = (value = '') => Number(String(value).replace(/\D/g, '') || 0);

// Pie chart ranglari — validatsiyalangan (ko'rlikка xavfsiz) kategoriya palitrasi.
// Tartib muhim: eng katta bo'lak 1-slot (ko'k), keyin aqua, sariq, yashil...
const PIE_COLORS = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];
const UNCATEGORIZED_COLOR = '#9ca3af'; // kategoriyasiz uchun neytral kulrang

// Kategoriya summalaridan pie ma'lumotini quradi; total > sum bo'lsa "Kategoriyasiz" bo'lak qo'shadi
const buildPieData = (catItems, total) => {
  const cats = (Array.isArray(catItems) ? catItems : [])
    .map((c) => ({ label: c.name, value: Number(c.total_amount) || 0 }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
  const catSum = cats.reduce((acc, c) => acc + c.value, 0);
  const uncategorized = Math.max(0, (Number(total) || 0) - catSum);
  if (uncategorized > 0) cats.push({ label: 'Kategoriyasiz', value: uncategorized, _uncategorized: true });
  return cats;
};

const ExpensePieCard = ({ title, periodLabel, data, total, loading, amountClass = 'text-gray-900', icon: Icon }) => {
  const sum = Number(total) || 0;
  const hasData = Array.isArray(data) && data.length > 0 && sum > 0;
  const colorFor = (item, index) => (item._uncategorized ? UNCATEGORIZED_COLOR : PIE_COLORS[index % PIE_COLORS.length]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-5 w-5 text-gray-600" /> : null}
          <p className="text-xs font-semibold uppercase text-gray-500">{title}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{periodLabel}</span>
      </div>
      <p className={`mt-1 text-2xl font-bold ${amountClass}`}>{formatCurrency(sum)}</p>

      {loading ? (
        <p className="py-6 text-center text-sm text-gray-400">Yuklanmoqda...</p>
      ) : !hasData ? (
        <p className="py-8 text-center text-sm text-gray-400">Bu davrda rasxod yo'q</p>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-4 border-t border-gray-100 pt-3 sm:flex-row sm:gap-8">
          <div className="relative h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={data.length > 1 ? 2 : 0}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {data.map((item, index) => (
                    <Cell key={item.label} fill={colorFor(item, index)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full space-y-3 sm:w-auto sm:min-w-[200px] sm:flex-1">
            {data.map((item, index) => {
              const pct = sum > 0 ? Math.round((item.value / sum) * 100) : 0;
              const color = colorFor(item, index);
              return (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-700">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="truncate">{item.label}</span>
                    <span className="shrink-0 text-[11px] font-medium text-gray-400">{pct}%</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-gray-900">{formatCurrency(item.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryChipPicker = ({ categories, selectedId, onSelect }) => {
  if (!categories.length) {
    return <p className="text-xs text-gray-500">Hozircha kategoriya yo‘q. Sahifadagi «+» tugmasi orqali qo‘shing.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isSelected = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(isSelected ? null : cat.id)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              isSelected
                ? 'border-[#A60E07] bg-[#A60E07] text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-[#A60E07] hover:text-[#A60E07]'
            }`}
          >
            {isSelected ? <CheckIcon className="h-3.5 w-3.5" /> : <TagIcon className="h-3.5 w-3.5" />}
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};

const AdminExpensesPage = () => {
  const [month, setMonth] = useState(currentMonth);
  const [day, setDay] = useState('');
  const [adminName, setAdminName] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({ reason: '', amount: '', category_id: null });
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({ reason: '', amount: '', expense_date: currentDay, category_id: null });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const listQuery = useGetExpenses({
    month,
    date: day || undefined,
    admin_name: adminName.trim() || undefined,
    category_id: categoryId || undefined,
  });
  const summaryQuery = useGetExpenseSummary({ month, date: day || undefined, category_id: categoryId || undefined });
  const categoriesQuery = useGetExpenseCategories({ month, date: day || undefined });

  // Pie chartlar uchun — kategoriya filtridan mustaqil, toza taqsimot
  const dailyDateStr = day || currentDay;
  const monthlyCatQuery = useGetExpenseCategories({ month });
  const dailyCatQuery = useGetExpenseCategories({ date: dailyDateStr });
  const monthlyTotalQuery = useGetExpenseSummary({ month });
  const dailyTotalQuery = useGetExpenseSummary({ date: dailyDateStr });

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const createCategory = useCreateExpenseCategory();
  const deleteCategory = useDeleteExpenseCategory();

  const categories = useMemo(
    () => (Array.isArray(categoriesQuery.data?.items) ? categoriesQuery.data.items : []),
    [categoriesQuery.data]
  );

  const items = useMemo(() => (Array.isArray(listQuery.data?.items) ? listQuery.data.items : []), [listQuery.data]);
  const adminOptions = useMemo(() => {
    const unique = new Set();
    items.forEach((item) => {
      const fullName =
        item.admin_full_name ||
        `${item.admin_name || ''} ${item.admin_surname || ''}`.trim();
      if (fullName) unique.add(fullName);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'uz-UZ'));
  }, [items]);

  // Pie chartlar uchun toza summalar va taqsimot
  const dailyTotal = dailyTotalQuery.data?.date_total_expense ?? dailyTotalQuery.data?.today_total_expense ?? 0;
  const monthlyTotal = monthlyTotalQuery.data?.month_total_expense ?? 0;
  const dailyPieData = useMemo(
    () => buildPieData(dailyCatQuery.data?.items, dailyTotal),
    [dailyCatQuery.data, dailyTotal]
  );
  const monthlyPieData = useMemo(
    () => buildPieData(monthlyCatQuery.data?.items, monthlyTotal),
    [monthlyCatQuery.data, monthlyTotal]
  );

  const closeModal = () => {
    if (createExpense.isPending) return;
    setIsAddModalOpen(false);
    setForm({ reason: '', amount: '', category_id: null });
  };

  const openAddModal = () => {
    // filtrda kategoriya tanlangan bo'lsa modalda ham oldindan tanlab qo'yamiz
    setForm({ reason: '', amount: '', category_id: categoryId || null });
    setIsAddModalOpen(true);
  };

  const onAddCategory = async (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      toast.error('Kategoriya nomini kiriting');
      return;
    }
    try {
      await createCategory.mutateAsync({ name });
      toast.success('Kategoriya qo‘shildi');
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Kategoriya qo‘shishda xatolik');
    }
  };

  const onDeleteCategory = async (cat) => {
    const confirmed = window.confirm(
      `"${cat.name}" kategoriyasini o‘chirasizmi? Unga biriktirilgan rasxodlar kategoriyasiz qoladi.`
    );
    if (!confirmed) return;
    try {
      await deleteCategory.mutateAsync(cat.id);
      if (categoryId === cat.id) setCategoryId(null);
      toast.success(`"${cat.name}" o‘chirildi`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Kategoriyani o‘chirishda xatolik');
    }
  };

  const onAddExpense = async (e) => {
    e.preventDefault();
    if (!form.reason.trim()) {
      toast.error('Rasxod sababi majburiy');
      return;
    }
    const parsedAmount = parseAmountInput(form.amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Summani to‘g‘ri kiriting');
      return;
    }

    try {
      await createExpense.mutateAsync({
        reason: form.reason.trim(),
        amount: parsedAmount,
        category_id: form.category_id || undefined,
        // kun filteri tanlangan bo'lsa, rasxod shu kunga yoziladi
        expense_date: day || undefined,
      });
      toast.success('Rasxod qo‘shildi');
      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Rasxod qo‘shishda xatolik');
    }
  };

  const closeEditModal = () => {
    if (updateExpense.isPending) return;
    setEditingExpense(null);
    setEditForm({ reason: '', amount: '', expense_date: currentDay, category_id: null });
  };

  const openEditModal = (item) => {
    setEditingExpense(item);
    setEditForm({
      reason: item.reason || item.title || '',
      amount: formatAmountInput(String(item.amount || '')),
      expense_date: item.expense_date || currentDay,
      category_id: item.category_id || null,
    });
  };

  const onEditExpense = async (e) => {
    e.preventDefault();
    if (!editingExpense?.id) return;

    const payload = {};
    const nextReason = editForm.reason.trim();
    const prevReason = (editingExpense.reason || editingExpense.title || '').trim();
    if (nextReason && nextReason !== prevReason) {
      payload.reason = nextReason;
    }

    const nextAmount = parseAmountInput(editForm.amount);
    const prevAmount = Number(editingExpense.amount || 0);
    if (nextAmount > 0 && nextAmount !== prevAmount) {
      payload.amount = nextAmount;
    }

    const nextDate = editForm.expense_date;
    const prevDate = editingExpense.expense_date;
    if (nextDate && nextDate !== prevDate) {
      payload.expense_date = nextDate;
    }

    const nextCategoryId = editForm.category_id || null;
    const prevCategoryId = editingExpense.category_id || null;
    if (nextCategoryId !== prevCategoryId) {
      payload.category_id = nextCategoryId;
    }

    if (Object.keys(payload).length === 0) {
      toast.error('Kamida bitta maydonni o‘zgartiring');
      return;
    }

    try {
      const updated = await updateExpense.mutateAsync({
        expenseId: editingExpense.id,
        payload,
      });
      if (payload.expense_date) {
        setMonth(payload.expense_date.slice(0, 7));
      }
      toast.success(updated?.message || 'Rasxod yangilandi');
      closeEditModal();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) {
        toast.error(err?.response?.data?.message || 'Noto‘g‘ri ID yoki noto‘g‘ri maʼlumot');
      } else if (status === 404) {
        toast.error(err?.response?.data?.message || 'Rasxod topilmadi');
      } else {
        toast.error(err?.response?.data?.message || 'Rasxodni yangilashda xatolik');
      }
    }
  };

  const onDeleteExpense = async (item) => {
    if (!item?.id) return;

    try {
      const deleted = await deleteExpense.mutateAsync(item.id);
      const deletedItem = deleted?.deleted_expense || deleted?.expense || deleted?.data || deleted;
      const deletedTitle = deletedItem?.reason || item.reason || item.title || 'Rasxod';
      toast.success(`${deletedTitle} o‘chirildi`);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) {
        toast.error(err?.response?.data?.message || 'Noto‘g‘ri ID');
      } else if (status === 404) {
        toast.error(err?.response?.data?.message || 'Rasxod topilmadi');
      } else {
        toast.error(err?.response?.data?.message || 'Rasxodni o‘chirishda xatolik');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <button
          onClick={openAddModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white sm:w-auto"
          style={{ backgroundColor: MAIN_COLOR }}
        >
          <PlusIcon className="h-4 w-4" />
          Rasxod qo‘shish
        </button>

        {/* Filtr — oy va kun (o'ng chetda) */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
          <CalendarDaysIcon className="hidden h-5 w-5 shrink-0 text-gray-400 sm:block" />
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setDay('');
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A60E07] sm:w-40"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={day}
              onChange={(e) => {
                const value = e.target.value;
                setDay(value);
                if (value) setMonth(value.slice(0, 7));
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A60E07] sm:w-40"
            />
            {day ? (
              <button
                type="button"
                onClick={() => setDay('')}
                className="shrink-0 rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-100"
                title="Kun filterini tozalash"
                aria-label="Kun filterini tozalash"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Rasxod kartalari — summa + taqsimot charti bir kartada */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ExpensePieCard
          title={day && day !== currentDay ? 'Tanlangan kun rasxodi' : 'Bugungi rasxod'}
          periodLabel={dailyDateStr}
          data={dailyPieData}
          total={dailyTotal}
          loading={dailyCatQuery.isLoading || dailyTotalQuery.isLoading}
          amountClass="text-[#A60E07]"
          icon={CalendarDaysIcon}
        />
        <ExpensePieCard
          title="Oylik rasxod"
          periodLabel={month}
          data={monthlyPieData}
          total={monthlyTotal}
          loading={monthlyCatQuery.isLoading || monthlyTotalQuery.isLoading}
          amountClass="text-gray-900"
          icon={BanknotesIcon}
        />
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <TagIcon className="h-5 w-5 text-gray-600" />
          <p className="text-xs font-semibold uppercase text-gray-500">Kategoriyalar</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryId(null)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              !categoryId
                ? 'border-[#A60E07] bg-[#A60E07] text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-[#A60E07] hover:text-[#A60E07]'
            }`}
          >
            Barchasi
          </button>

          {categories.map((cat) => {
            const isActive = categoryId === cat.id;
            return (
              <span
                key={cat.id}
                className={`group inline-flex items-center overflow-hidden rounded-full border text-xs font-semibold transition ${
                  isActive
                    ? 'border-[#A60E07] bg-[#A60E07] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#A60E07] hover:text-[#A60E07]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCategoryId(isActive ? null : cat.id)}
                  className="inline-flex items-center gap-1 py-1.5 pl-3 pr-1"
                >
                  <TagIcon className="h-3.5 w-3.5" />
                  {cat.name}
                  {typeof cat.expense_count === 'number' ? (
                    <span className={`ml-0.5 rounded-full px-1.5 text-[10px] ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.expense_count}
                    </span>
                  ) : null}
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/20' : 'bg-[#A60E07]/10 text-[#A60E07]'}`}>
                    {new Intl.NumberFormat('uz-UZ').format(Number(cat.total_amount) || 0)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCategory(cat)}
                  disabled={deleteCategory.isPending}
                  className={`py-1.5 pl-0.5 pr-2 opacity-0 transition group-hover:opacity-100 ${
                    isActive ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-red-600'
                  }`}
                  title="Kategoriyani o‘chirish"
                  aria-label={`${cat.name} kategoriyasini o‘chirish`}
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            );
          })}

          {isAddingCategory ? (
            <form onSubmit={onAddCategory} className="inline-flex items-center gap-1">
              <input
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }
                }}
                placeholder="Masalan: Kommunal to‘lovlar"
                className="w-44 rounded-full border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-[#A60E07]"
              />
              <button
                type="submit"
                disabled={createCategory.isPending}
                className="rounded-full p-1.5 text-white disabled:opacity-60"
                style={{ backgroundColor: MAIN_COLOR }}
                title="Saqlash"
                aria-label="Kategoriyani saqlash"
              >
                <CheckIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                className="rounded-full border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-100"
                title="Bekor qilish"
                aria-label="Bekor qilish"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-400 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#A60E07] hover:text-[#A60E07]"
              title="Kategoriya qo‘shish"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Kategoriya
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Rasxodlar ro‘yxati</h2>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <select
              name="admin_name"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07] sm:w-56"
            >
              <option value="">Barcha adminlar</option>
              {adminOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {listQuery.data?.count || 0} ta
            </span>
          </div>
        </div>

        {listQuery.isLoading || summaryQuery.isLoading ? <p className="text-sm text-gray-500">Yuklanmoqda...</p> : null}

        {listQuery.isError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {listQuery.error?.response?.data?.message || 'Rasxodlarni olishda xatolik'}
          </p>
        ) : null}

        {!listQuery.isLoading && !listQuery.isError ? (
          items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900">{item.reason || item.title}</p>
                        {item.category_name ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                            <TagIcon className="h-3 w-3" />
                            {item.category_name}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-500">{item.expense_date}</p>
                      <p className="text-xs text-gray-500">
                        Kim yozdi:{' '}
                        {item.admin_full_name ||
                          `${item.admin_name || ''} ${item.admin_surname || ''}`.trim() ||
                          '-'}
                      </p>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-sm font-bold text-[#A60E07]">{formatCurrency(item.amount)}</p>
                      <div className="mt-2 flex items-center justify-start gap-2 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-lg border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-100"
                          title="Tahrirlash"
                          aria-label="Tahrirlash"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(item)}
                          disabled={deleteExpense.isPending}
                          className="rounded-lg border border-red-200 p-1.5 text-red-700 hover:bg-red-50 disabled:opacity-60"
                          title="O‘chirish"
                          aria-label="O‘chirish"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{day ? 'Bu kunda rasxod topilmadi.' : 'Bu oyda rasxod topilmadi.'}</p>
          )
        ) : null}
      </div>

      {isAddModalOpen ? (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 p-3 sm:p-6"
          onClick={closeModal}
        >
          <div
            className="mx-auto mt-8 w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Rasxod qo‘shish</h3>
              <button onClick={closeModal} className="rounded-md p-1 text-gray-600 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onAddExpense} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Kategoriya (ixtiyoriy)</label>
                <CategoryChipPicker
                  categories={categories}
                  selectedId={form.category_id}
                  onSelect={(id) => setForm((p) => ({ ...p, category_id: id }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Sabab</label>
                <input
                  value={form.reason}
                  onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="Masalan: Printer uchun qog‘oz"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Summa</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: formatAmountInput(e.target.value) }))}
                  placeholder="Masalan: 350 000"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {day ? `Rasxod ${day} sanasiga yoziladi (kun filteri tanlangan).` : 'Sana umumiy oy filteri orqali boshqariladi.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={createExpense.isPending}
                className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: MAIN_COLOR }}
              >
                {createExpense.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {editingExpense ? (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 p-3 sm:p-6"
          onClick={closeEditModal}
        >
          <div
            className="mx-auto mt-8 w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Rasxodni tahrirlash</h3>
              <button onClick={closeEditModal} className="rounded-md p-1 text-gray-600 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onEditExpense} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">Kategoriya</label>
                <CategoryChipPicker
                  categories={categories}
                  selectedId={editForm.category_id}
                  onSelect={(id) => setEditForm((p) => ({ ...p, category_id: id }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Sabab</label>
                <input
                  value={editForm.reason}
                  onChange={(e) => setEditForm((p) => ({ ...p, reason: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Summa</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editForm.amount}
                  onChange={(e) => setEditForm((p) => ({ ...p, amount: formatAmountInput(e.target.value) }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Sana</label>
                <input
                  type="date"
                  value={editForm.expense_date}
                  onChange={(e) => setEditForm((p) => ({ ...p, expense_date: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#A60E07]"
                />
              </div>

              <button
                type="submit"
                disabled={updateExpense.isPending}
                className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: MAIN_COLOR }}
              >
                {updateExpense.isPending ? 'Saqlanmoqda...' : 'Yangilash'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminExpensesPage;

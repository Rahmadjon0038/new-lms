'use client';

import React, { useMemo, useState } from 'react';
import { BanknotesIcon, CalendarDaysIcon, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useCreateExpense, useDeleteExpense, useGetExpenseSummary, useGetExpenses, useUpdateExpense } from '../../../hooks/expenses';

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

const AdminExpensesPage = () => {
  const [month, setMonth] = useState(currentMonth);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({ reason: '', amount: '' });
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({ reason: '', amount: '', expense_date: currentDay });

  const listQuery = useGetExpenses({ month });
  const summaryQuery = useGetExpenseSummary({ month });
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const items = useMemo(() => (Array.isArray(listQuery.data?.items) ? listQuery.data.items : []), [listQuery.data]);
  const summary = summaryQuery.data || {};

  const closeModal = () => {
    if (createExpense.isPending) return;
    setIsAddModalOpen(false);
    setForm({ reason: '', amount: '' });
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
    setEditForm({ reason: '', amount: '', expense_date: currentDay });
  };

  const openEditModal = (item) => {
    setEditingExpense(item);
    setEditForm({
      reason: item.reason || item.title || '',
      amount: formatAmountInput(String(item.amount || '')),
      expense_date: item.expense_date || currentDay,
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Rasxodlar</h1>
          <p className="text-sm text-gray-600">Oyni tanlang va rasxodlarni boshqaring</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white sm:w-auto"
          style={{ backgroundColor: MAIN_COLOR }}
        >
          <PlusIcon className="h-4 w-4" />
          Rasxod qo‘shish
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-gray-600" />
            <p className="text-xs font-semibold uppercase text-gray-500">Tanlangan oy</p>
          </div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#A60E07]"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-500">Bugungi rasxod</p>
          <p className="mt-1 text-2xl font-bold text-[#A60E07]">{formatCurrency(summary.today_total_expense || 0)}</p>
          <p className="mt-1 text-xs text-gray-500">{summary.today || currentDay}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="h-5 w-5 text-gray-600" />
            <p className="text-xs font-semibold uppercase text-gray-500">Oylik rasxod</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(summary.month_total_expense || 0)}</p>
          <p className="mt-1 text-xs text-gray-500">{summary.month || month}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Rasxodlar ro‘yxati</h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{listQuery.data?.count || 0} ta</span>
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
                      <p className="truncate text-sm font-semibold text-gray-900">{item.reason || item.title}</p>
                      <p className="text-xs text-gray-500">{item.expense_date}</p>
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
            <p className="text-sm text-gray-500">Bu oyda rasxod topilmadi.</p>
          )
        ) : null}
      </div>

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-[9999] bg-black/50 p-3 sm:p-6">
          <div className="mx-auto mt-8 w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Rasxod qo‘shish</h3>
              <button onClick={closeModal} className="rounded-md p-1 text-gray-600 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onAddExpense} className="space-y-4">
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
                <p className="mt-1 text-xs text-gray-500">Sana umumiy oy filteri orqali boshqariladi.</p>
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
        <div className="fixed inset-0 z-[9999] bg-black/50 p-3 sm:p-6">
          <div className="mx-auto mt-8 w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Rasxodni tahrirlash</h3>
              <button onClick={closeEditModal} className="rounded-md p-1 text-gray-600 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onEditExpense} className="space-y-4">
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

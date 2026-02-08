'use client';

import React, { useMemo, useState } from 'react';
import { BanknotesIcon, CalendarDaysIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useCreateExpense, useGetExpenseSummary, useGetExpenses } from '../../../hooks/expenses';

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

  const listQuery = useGetExpenses({ month });
  const summaryQuery = useGetExpenseSummary({ month });
  const createExpense = useCreateExpense();

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

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rasxodlar</h1>
          <p className="text-sm text-gray-600">Oyni tanlang va rasxodlarni boshqaring</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{item.reason || item.title}</p>
                      <p className="text-xs text-gray-500">{item.expense_date}</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-[#A60E07]">{formatCurrency(item.amount)}</p>
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
    </div>
  );
};

export default AdminExpensesPage;

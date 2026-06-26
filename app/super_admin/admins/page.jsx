"use client";

import React, { useMemo, useState } from "react";
import {
  useAdmins,
  useCreateAdmin,
  useDeleteAdmin,
  usePayAdminSalary,
  useUpdateAdminStatus,
} from "../../../hooks/admins";
import { useGetNotify } from "../../../hooks/notify";
import { XMarkIcon, PlusIcon, EyeIcon, EyeSlashIcon, TrashIcon } from "@heroicons/react/24/outline";

const MAIN_COLOR = "#A60E07";

const formatCurrency = (value) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

const ModalShell = ({ isOpen, title, onClose, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-gray-200 px-5 py-3">{footer}</div> : null}
      </div>
    </div>
  );
};

export default function SuperAdminAdminsPage() {
  const notify = useGetNotify();
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [monthFilter, setMonthFilter] = useState(thisMonth);

  const [createForm, setCreateForm] = useState({
    name: "",
    surname: "",
    username: "",
    password: "",
    phone: "",
    phone2: "",
  });
  const [recoveryInfo, setRecoveryInfo] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    admin: null,
  });

  const [statusModal, setStatusModal] = useState({
    open: false,
    admin: null,
    status: "active",
    terminationDate: "",
  });

  const [salaryModal, setSalaryModal] = useState({
    open: false,
    admin: null,
    month_name: "",
    amount: "",
    description: "",
    isEdit: false,
  });

  const adminsQuery = useAdmins({ status: "all", month_name: monthFilter || thisMonth });
  const createAdminMutation = useCreateAdmin();
  const deleteAdminMutation = useDeleteAdmin();
  const updateStatusMutation = useUpdateAdminStatus();
  const paySalaryMutation = usePayAdminSalary();

  const admins = useMemo(() => {
    if (Array.isArray(adminsQuery.data)) return adminsQuery.data;
    if (Array.isArray(adminsQuery.data?.data)) return adminsQuery.data.data;
    return [];
  }, [adminsQuery.data]);

  const showSalaryColumns = true;

  const handleCreateSubmit = (event) => {
    event.preventDefault();
    if (!createForm.name || !createForm.surname || !createForm.username || !createForm.password || !createForm.phone) {
      notify("err", "Majburiy maydonlarni to'ldiring");
      return;
    }
    createAdminMutation.mutate(createForm, {
      onSuccess: (data) => {
        setRecoveryInfo({
          admin: data?.admin,
          recovery_key: data?.recovery_key,
        });
        setCreateForm({
          name: "",
          surname: "",
          username: "",
          password: "",
          phone: "",
          phone2: "",
        });
        notify("ok", data?.message || "Admin yaratildi");
      },
      onError: (error) => {
        notify("err", error?.response?.data?.message || error?.message || "Admin yaratishda xatolik");
      },
    });
  };

  const openStatusModal = (admin) => {
    setStatusModal({
      open: true,
      admin,
      status: admin?.status || "active",
      terminationDate: admin?.terminationDate ? formatDate(admin.terminationDate) : "",
    });
  };

  const submitStatusUpdate = () => {
    if (!statusModal.admin) return;
    if (statusModal.status === "terminated" && !statusModal.terminationDate) {
      notify("err", "Termination date kiriting");
      return;
    }
    updateStatusMutation.mutate(
      {
        adminId: statusModal.admin.id,
        status: statusModal.status,
        terminationDate: statusModal.status === "terminated" ? statusModal.terminationDate : null,
      },
      {
        onSuccess: (data) => {
          notify("ok", data?.message || "Holat yangilandi");
          setStatusModal({ open: false, admin: null, status: "active", terminationDate: "" });
        },
        onError: (error) => {
          notify("err", error?.response?.data?.message || error?.message || "Holat yangilashda xatolik");
        },
      }
    );
  };

  const openSalaryModal = (admin) => {
    const hasSalary = Boolean(monthFilter && admin?.salary && admin.salary?.month_name === monthFilter);
    setSalaryModal({
      open: true,
      admin,
      month_name: admin?.salary?.month_name || monthFilter || thisMonth,
      amount: admin?.salary?.amount ? String(admin.salary.amount) : "",
      description: admin?.salary?.description || "",
      isEdit: hasSalary,
    });
  };

  const openDeleteModal = (admin) => {
    setDeleteModal({ open: true, admin });
  };

  const submitDeleteAdmin = () => {
    if (!deleteModal.admin) return;
    deleteAdminMutation.mutate(deleteModal.admin.id, {
      onSuccess: (data) => {
        notify("ok", data?.message || "Admin o'chirildi");
        setDeleteModal({ open: false, admin: null });
      },
      onError: (error) => {
        notify("err", error?.response?.data?.message || error?.message || "Adminni o'chirishda xatolik");
      },
    });
  };

  const submitSalary = () => {
    if (!salaryModal.admin) return;
    if (!salaryModal.month_name || !salaryModal.amount) {
      notify("err", "Oy va summa majburiy");
      return;
    }
    paySalaryMutation.mutate(
      {
        admin_id: salaryModal.admin.id,
        month_name: salaryModal.month_name,
        amount: Number(salaryModal.amount),
        description: salaryModal.description,
      },
      {
        onSuccess: (data) => {
          notify("ok", data?.message || "Oylik saqlandi");
          setSalaryModal({ open: false, admin: null, month_name: "", amount: "", description: "", isEdit: false });
        },
        onError: (error) => {
          notify("err", error?.response?.data?.message || error?.message || "Oylik saqlashda xatolik");
        },
      }
    );
  };

  const copyRecoveryKey = async () => {
    if (!recoveryInfo?.recovery_key) return;
    try {
      await navigator.clipboard.writeText(recoveryInfo.recovery_key);
      notify("ok", "Recovery key nusxalandi");
    } catch {
      notify("err", "Recovery key nusxalanmadi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: MAIN_COLOR }}
        >
          <PlusIcon className="h-4 w-4" />
          Admin yaratish
        </button>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
            title="Oy bo'yicha oylik"
          />
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Adminlar</h2>
        </div>

        {adminsQuery.isLoading ? (
          <div className="py-6 text-center text-sm text-gray-500">Yuklanmoqda...</div>
        ) : adminsQuery.isError ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {adminsQuery.error?.response?.data?.message || adminsQuery.error?.message || "Adminlar yuklanmadi"}
          </div>
        ) : (
          <div className="overflow-x-auto border-x border-t border-slate-700">
            <table className="min-w-[900px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <th className="py-2 pl-4 pr-2">FIO</th>
                  <th className="py-2 pr-2">Foydalanuvchi nomi</th>
                  <th className="py-2 pr-2">Telefon</th>
                  <th className="py-2 pr-2">Holat</th>
                  <th className="py-2 pr-2">Yaratilgan</th>
                  <th className="py-2 pr-2">Oylik</th>
                  <th className="py-2 pr-4">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 pl-4 text-gray-500">
                      Adminlar topilmadi
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr
                      key={String(admin.id)}
                      className="border-b border-slate-500 bg-white transition-colors duration-150 hover:bg-slate-100/80"
                    >
                      <td className="py-3 pl-4 pr-2 font-medium text-gray-900">
                        {admin.name} {admin.surname}
                      </td>
                      <td className="py-3 pr-2 text-gray-700">{admin.username || "-"}</td>
                      <td className="py-3 pr-2 text-gray-700">{admin.phone || "-"}</td>
                      <td className="py-3 pr-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            admin.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : admin.status === "on_leave"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {admin.status}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-gray-700">{formatDate(admin.createdAt || admin.created_at)}</td>
                      <td className="py-3 pr-2 text-gray-700">
                        {admin.salary ? formatCurrency(admin.salary.amount) : "-"}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openStatusModal(admin)}
                            className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-slate-400 hover:bg-slate-50"
                          >
                            Holat
                          </button>
                          <button
                            type="button"
                            onClick={() => openSalaryModal(admin)}
                            className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-slate-400 hover:bg-slate-50"
                          >
                            Oylik berish
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(admin)}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            O&apos;chirish
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ModalShell
        isOpen={createModalOpen}
        title="Admin yaratish"
        onClose={() => setCreateModalOpen(false)}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            {recoveryInfo?.recovery_key ? (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <span>Recovery key:</span>
                <span className="font-mono font-semibold">{recoveryInfo.recovery_key}</span>
                <button
                  type="button"
                  onClick={copyRecoveryKey}
                  className="rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-semibold text-amber-800"
                >
                  Nusxalash
                </button>
              </div>
            ) : (
              <span className="text-xs text-gray-500">Recovery key yaratgandan keyin chiqadi.</span>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                form="create-admin-form"
                disabled={createAdminMutation.isLoading}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: MAIN_COLOR }}
              >
                {createAdminMutation.isLoading ? "Yaratilmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        }
      >
        <form id="create-admin-form" onSubmit={handleCreateSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Ism"
            value={createForm.name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Familiya"
            value={createForm.surname}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, surname: e.target.value }))}
          />
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Username"
            value={createForm.username}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, username: e.target.value }))}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm"
              placeholder="Parol"
              value={createForm.password}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:bg-gray-100"
              aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
            >
              {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Telefon"
            value={createForm.phone}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Telefon 2 (ixtiyoriy)"
            value={createForm.phone2}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, phone2: e.target.value }))}
          />
        </form>
      </ModalShell>

      <ModalShell
        isOpen={deleteModal.open}
        title="Adminni o'chirish"
        onClose={() => setDeleteModal({ open: false, admin: null })}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteModal({ open: false, admin: null })}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={submitDeleteAdmin}
              disabled={deleteAdminMutation.isLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleteAdminMutation.isLoading ? "O'chirilmoqda..." : "O'chirish"}
            </button>
          </div>
        }
      >
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>
              {deleteModal.admin?.name} {deleteModal.admin?.surname}
            </strong>{" "}
            adminini o&apos;chirmoqchimisiz?
          </p>
          <p className="text-gray-500">
            Bu amal qaytarilmaydi. Oylik yozuvlari avtomatik o&apos;chadi.
          </p>
        </div>
      </ModalShell>

      <ModalShell
        isOpen={statusModal.open}
        title="Admin holatini o'zgartirish"
        onClose={() => setStatusModal({ open: false, admin: null, status: "active", terminationDate: "" })}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setStatusModal({ open: false, admin: null, status: "active", terminationDate: "" })}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={submitStatusUpdate}
              disabled={updateStatusMutation.isLoading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              {updateStatusMutation.isLoading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Admin</p>
            <p className="text-sm text-gray-600">
              {statusModal.admin?.name} {statusModal.admin?.surname}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-500">Status</label>
              <select
                value={statusModal.status}
                onChange={(e) => setStatusModal((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="active">Faol</option>
                <option value="on_leave">Ta&apos;tilda</option>
                <option value="terminated">Bo&apos;shatilgan</option>
              </select>
            </div>
            {statusModal.status === "terminated" ? (
              <div>
                <label className="text-xs font-semibold text-gray-500">Termination date</label>
                <input
                  type="date"
                  value={statusModal.terminationDate}
                  onChange={(e) => setStatusModal((prev) => ({ ...prev, terminationDate: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            ) : null}
          </div>
        </div>
      </ModalShell>

      <ModalShell
        isOpen={salaryModal.open}
        title={salaryModal.isEdit ? "Admin oyligini yangilash" : "Admin oyligi berish"}
        onClose={() => setSalaryModal({ open: false, admin: null, month_name: "", amount: "", description: "", isEdit: false })}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSalaryModal({ open: false, admin: null, month_name: "", amount: "", description: "", isEdit: false })}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={submitSalary}
              disabled={paySalaryMutation.isLoading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              {paySalaryMutation.isLoading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Admin</p>
            <p className="text-sm text-gray-600">
              {salaryModal.admin?.name} {salaryModal.admin?.surname}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-500">Oy (YYYY-MM)</label>
              <input
                type="month"
                value={salaryModal.month_name}
                onChange={(e) => setSalaryModal((prev) => ({ ...prev, month_name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Summa</label>
              <input
                type="number"
                value={salaryModal.amount}
                onChange={(e) => setSalaryModal((prev) => ({ ...prev, amount: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Izoh</label>
            <input
              value={salaryModal.description}
              onChange={(e) => setSalaryModal((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Mart oyi oyligi"
            />
          </div>
        </div>
      </ModalShell>
    </div>
  );
}

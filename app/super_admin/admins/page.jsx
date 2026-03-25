"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  useAdmins,
  useCreateAdmin,
  usePayAdminSalary,
  useUpdateAdminStatus,
} from "../../../hooks/admins";
import { useGetNotify } from "../../../hooks/notify";
import { XMarkIcon } from "@heroicons/react/24/outline";

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

  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    surname: "",
    username: "",
    password: "",
    phone: "",
    phone2: "",
  });
  const [recoveryInfo, setRecoveryInfo] = useState(null);

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

  const adminsQuery = useAdmins({ status: statusFilter, month_name: monthFilter });
  const createAdminMutation = useCreateAdmin();
  const updateStatusMutation = useUpdateAdminStatus();
  const paySalaryMutation = usePayAdminSalary();

  const admins = useMemo(() => {
    if (Array.isArray(adminsQuery.data)) return adminsQuery.data;
    if (Array.isArray(adminsQuery.data?.data)) return adminsQuery.data.data;
    return [];
  }, [adminsQuery.data]);

  const showSalaryColumns = Boolean(monthFilter);

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
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: MAIN_COLOR }}>Adminlar boshqaruvi</h1>
          <p className="text-sm text-gray-600">Admin yaratish, holatini o'zgartirish va oylik berish.</p>
        </div>
        <Link
          href="/super_admin/admins/salary"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Admin oyliklari
        </Link>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">Admin yaratish</h2>
        <form onSubmit={handleCreateSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <input
            type="password"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Parol"
            value={createForm.password}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
          />
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
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={createAdminMutation.isLoading}
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              {createAdminMutation.isLoading ? "Yaratilmoqda..." : "Admin yaratish"}
            </button>
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
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Adminlar ro'yxati</h2>
            <p className="text-xs text-gray-500">Status va oy bo'yicha filterlang.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">Barchasi</option>
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="terminated">Terminated</option>
            </select>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              title="Oy bo'yicha oylik"
            />
          </div>
        </div>

        {adminsQuery.isLoading ? (
          <div className="py-6 text-center text-sm text-gray-500">Yuklanmoqda...</div>
        ) : adminsQuery.isError ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {adminsQuery.error?.response?.data?.message || adminsQuery.error?.message || "Adminlar yuklanmadi"}
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[1000px] w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">FIO</th>
                  <th className="py-2 pr-2">Username</th>
                  <th className="py-2 pr-2">Telefon</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2">Termination</th>
                  <th className="py-2 pr-2">Yaratilgan</th>
                  {showSalaryColumns ? (
                    <>
                      <th className="py-2 pr-2">Oylik</th>
                      <th className="py-2 pr-2">Tavsif</th>
                      <th className="py-2 pr-2">Yangilangan</th>
                    </>
                  ) : null}
                  <th className="py-2 pr-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={showSalaryColumns ? 11 : 8} className="py-4 text-gray-500">
                      Adminlar topilmadi
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={String(admin.id)} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-2 text-gray-600">{admin.id}</td>
                      <td className="py-2 pr-2 font-medium text-gray-900">
                        {admin.name} {admin.surname}
                      </td>
                      <td className="py-2 pr-2">{admin.username || "-"}</td>
                      <td className="py-2 pr-2">{admin.phone || "-"}</td>
                      <td className="py-2 pr-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
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
                      <td className="py-2 pr-2">{formatDate(admin.terminationDate)}</td>
                      <td className="py-2 pr-2">{formatDate(admin.createdAt || admin.created_at)}</td>
                      {showSalaryColumns ? (
                        <>
                          <td className="py-2 pr-2">
                            {admin.salary ? formatCurrency(admin.salary.amount) : "-"}
                          </td>
                          <td className="py-2 pr-2">{admin.salary?.description || "-"}</td>
                          <td className="py-2 pr-2">{formatDate(admin.salary?.updated_at)}</td>
                        </>
                      ) : null}
                      <td className="py-2 pr-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openStatusModal(admin)}
                            className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Holat
                          </button>
                          <button
                            type="button"
                            onClick={() => openSalaryModal(admin)}
                            className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Oylik berish
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
                <option value="active">active</option>
                <option value="on_leave">on_leave</option>
                <option value="terminated">terminated</option>
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

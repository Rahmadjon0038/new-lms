"use client";

import toast from "react-hot-toast";
export const useGetNotify = () => {
  const notify = (status, msg) => {
    if (status == "ok") {
      toast.success(msg);
    } else if (status == "err") {
      toast.error(msg);
    } else if (status == "load") {
      toast.loading("Yuklanmoqda");
    } else if (status == "dismiss") {
      toast.dismiss();
    } else if ("multi") {
      toast(msg || "Iltimos post qolishda malum qoidalarga amal qiling", {
        duration: 6000,
      });
    }
  };
  return notify;
};
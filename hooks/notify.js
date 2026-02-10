"use client";

import toast from "react-hot-toast";
export const useGetNotify = () => {
  const notify = (status, msg) => {
    const allowedStatuses = ["ok", "err", "load", "dismiss", "multi"];
    let currentStatus = status;
    let currentMsg = msg;

    // Backward compatibility: notify(message, "error"/"success")
    if (!allowedStatuses.includes(currentStatus)) {
      if (currentMsg === "error") {
        currentStatus = "err";
        currentMsg = status;
      } else if (currentMsg === "success") {
        currentStatus = "ok";
        currentMsg = status;
      } else {
        currentStatus = "multi";
        currentMsg = msg || status;
      }
    }

    if (currentStatus === "ok") {
      toast.success(currentMsg);
    } else if (currentStatus === "err") {
      toast.error(currentMsg);
    } else if (currentStatus === "load") {
      toast.loading("Yuklanmoqda");
    } else if (currentStatus === "dismiss") {
      toast.dismiss();
    } else if (currentStatus === "multi") {
      toast(currentMsg || "Iltimos post qolishda malum qoidalarga amal qiling", {
        duration: 6000,
      });
    }
  };
  return notify;
};

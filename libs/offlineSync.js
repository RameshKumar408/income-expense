import { toast } from "react-toastify";
import constant from "@/constant";
import { clearRangeDataCache } from "@/libs/dataCache";

const QUEUE_STORAGE_KEY = "offline_transaction_queue";
let isSyncing = false;

export const getOfflineQueue = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading offline queue:", e);
    return [];
  }
};

export const getOfflineQueueCount = () => {
  return getOfflineQueue().length;
};

export const enqueueOfflineTransaction = (payload, accountInfo = {}) => {
  if (typeof window === "undefined") return false;
  try {
    const queue = getOfflineQueue();
    const token =
      accountInfo.token ||
      window.localStorage.getItem("token") ||
      "";
    const email =
      accountInfo.email ||
      window.localStorage.getItem("activeAccount") ||
      "Unknown";

    const item = {
      tempId: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      accountEmail: email,
      accountToken: token,
      payload,
      createdAt: Date.now(),
    };

    queue.push(item);
    window.localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return true;
  } catch (e) {
    console.error("Error enqueueing offline transaction:", e);
    return false;
  }
};

export const syncOfflineTransactions = async () => {
  if (typeof window === "undefined") return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  if (isSyncing) return;

  const queue = getOfflineQueue();
  if (!queue || queue.length === 0) return;

  isSyncing = true;
  const remainingQueue = [];
  let syncedCount = 0;
  const syncedAccounts = new Set();

  try {
    const apiUrl = `${constant?.Live_url || ""}/api/incomes`;

    for (const item of queue) {
      try {
        if (!item.accountToken) {
          // Cannot sync without token; skip invalid item
          continue;
        }

        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            authorization: item.accountToken,
          },
          body: JSON.stringify(item.payload),
        });

        if (res.ok) {
          syncedCount++;
          if (item.accountEmail) {
            syncedAccounts.add(item.accountEmail);
          }
        } else if (res.status === 401 || res.status === 403) {
          // Account token expired/invalid, discard to avoid poison pill
          console.warn(`Offline item for ${item.accountEmail} unauthorized; discarding`);
        } else {
          // Server error or temporary failure: keep in queue for next retry
          remainingQueue.push(item);
        }
      } catch (itemErr) {
        // Network drop during sync: keep in queue
        remainingQueue.push(item);
      }
    }

    window.localStorage.setItem(
      QUEUE_STORAGE_KEY,
      JSON.stringify(remainingQueue),
    );

    if (syncedCount > 0) {
      clearRangeDataCache();
      const accountSummary =
        syncedAccounts.size === 1
          ? `to ${Array.from(syncedAccounts)[0]}`
          : `across ${syncedAccounts.size} accounts`;
      toast.success(
        `Synced ${syncedCount} offline transaction${syncedCount > 1 ? "s" : ""} ${accountSummary} 📶`,
      );
    }
  } catch (error) {
    console.error("Error during offline sync:", error);
  } finally {
    isSyncing = false;
  }
};


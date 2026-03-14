import { createContext, useContext } from "react";

export const RecentContext = createContext();

export const RECENT_KEY = "quran-recent";
export const RECENT_MAX = 15;

export const loadRecent = () => {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveRecent = (items) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch {}
};

export const useRecent = () => {
  const ctx = useContext(RecentContext);
  if (!ctx) throw new Error("useRecent must be used within RecentProvider");
  return ctx;
};

import { useState, useCallback } from "react";
import { RecentContext, loadRecent, saveRecent, RECENT_MAX } from "./recentContext";

const RecentProvider = ({ children }) => {
  const [recent, setRecent] = useState(loadRecent);

  const addRecent = useCallback((surahNumber, ayahNumber, surahName, ayahText) => {
    setRecent((prev) => {
      const item = {
        surahNumber,
        ayahNumber,
        surahName: surahName || `Surah ${surahNumber}`,
        ayahText: (ayahText || "").slice(0, 80),
      };
      const filtered = prev.filter(
        (r) => !(r.surahNumber === surahNumber && r.ayahNumber === ayahNumber)
      );
      const next = [item, ...filtered].slice(0, RECENT_MAX);
      saveRecent(next);
      return next;
    });
  }, []);

  return (
    <RecentContext.Provider value={{ recent, addRecent }}>
      {children}
    </RecentContext.Provider>
  );
};

export default RecentProvider;

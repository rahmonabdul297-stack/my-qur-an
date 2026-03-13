import { createContext, useState, useContext, useCallback } from "react";

const FAVORITES_KEY = "quran-favorites";

const FavoritesContext = createContext();

const loadFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(loadFavorites);

  const isFavorite = useCallback((surahNumber, ayahNumber) => {
    return favorites.some(
      (f) => f.surahNumber === surahNumber && f.ayahNumber === ayahNumber,
    );
  }, [favorites]);

  const toggleFavorite = useCallback((surahNumber, ayahNumber, surahName, ayahText) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => f.surahNumber === surahNumber && f.ayahNumber === ayahNumber,
      );
      let next;
      if (exists) {
        next = prev.filter(
          (f) => !(f.surahNumber === surahNumber && f.ayahNumber === ayahNumber),
        );
      } else {
        next = [
          ...prev,
          { surahNumber, ayahNumber, surahName, ayahText: ayahText?.slice(0, 50) },
        ];
      }
      saveFavorites(next);
      return next;
    });
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
};

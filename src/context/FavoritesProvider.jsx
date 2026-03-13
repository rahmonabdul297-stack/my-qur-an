import { useState, useCallback } from "react";
import { FavoritesContext, loadFavorites, saveFavorites } from "./favoritesContext";

const FavoritesProvider = ({ children }) => {
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

export default FavoritesProvider;

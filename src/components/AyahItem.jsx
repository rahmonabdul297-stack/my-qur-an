import { useState, useRef, useEffect, useContext } from "react";
import { useFavorites } from "../context/favoritesContext";
import { successNotification, toArabicNumbers } from "../utils/helpers";
import { ThemeContext } from "../context/themeContext";
import { HiOutlineDotsVertical } from "react-icons/hi";

const AyahItem = ({
  ayah,
  surahNumber,
  surahName,
  isPlaying,
  showTranslation = true,
  onPlayFromAyah,
  onOpenVideoTemplate,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { theme } = useContext(ThemeContext);
  const isFav = isFavorite(surahNumber, ayah.numberInSurah ?? ayah.number);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(
      surahNumber,
      ayah.numberInSurah ?? ayah.number,
      surahName,
      ayah.text,
    );
    successNotification(isFav ? "Removed from favorites" : "Added to favorites");
    setShowDropdown(false);
  };

  const handlePlayFrom = (e) => {
    e.stopPropagation();
    onPlayFromAyah?.(ayah);
    setShowDropdown(false);
  };

  const handleVideoTemplate = (e) => {
    e.stopPropagation();
    onOpenVideoTemplate?.(ayah);
    setShowDropdown(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative flex gap-4 p-4 rounded-xl border transition-colors ${
        isPlaying
          ? "border-AppGreen bg-AppGreen/20"
          : "border-transparent hover:border-AppGreen/50 bg-AppGray/10"
      }`}
    >
      <span className="surah-number-hex shrink-0 text-sm">
        {toArabicNumbers(ayah.numberInSurah ?? ayah.number)}
      </span>
      <div className="flex-1">
        {surahName && (
          <p className="text-xs opacity-70 mb-1">{surahName}</p>
        )}
        <p className="text-2xl leading-loose" dir="rtl">
          {ayah.text}
        </p>
        {showTranslation && ayah.translation && (
          <p className="text-base opacity-90 mt-2" dir="ltr">
            {ayah.translation}
          </p>
        )}
        {ayah.page != null && (
          <p className="text-xs opacity-60 mt-1">Page {ayah.page}</p>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown((prev) => !prev);
        }}
        className="shrink-0 p-2 rounded-lg hover:bg-AppGreen/20 transition-colors"
        aria-label="More options"
      >
        <HiOutlineDotsVertical size={22} />
      </button>
      {showDropdown && (
        <div
          className={`absolute right-4 top-full mt-1 z-20 min-w-[200px] py-2 rounded-lg border border-AppGreen/50 ${theme ? "bg-AppGray" : "bg-AppWhite text-AppGray"} shadow-lg`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="w-full px-4 py-2 text-left hover:bg-AppGreen/20 transition-colors flex items-center gap-2"
          >
            {isFav ? "★ Remove from favorites" : "☆ Add to favorites"}
          </button>
          {onPlayFromAyah && (
            <button
              type="button"
              onClick={handlePlayFrom}
              className="w-full px-4 py-2 text-left hover:bg-AppGreen/20 transition-colors flex items-center gap-2"
            >
              ▶ Play from this ayah
            </button>
          )}
          {onOpenVideoTemplate && (
            <button
              type="button"
              onClick={handleVideoTemplate}
              className="w-full px-4 py-2 text-left hover:bg-AppGreen/20 transition-colors flex items-center gap-2"
            >
              🎬 Play in video template
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AyahItem;

import { useState, useRef, useEffect, useContext } from "react";
import { useFavorites } from "../context/favoritesContext";
import { successNotification, toArabicNumbers } from "../utils/helpers";
import { ThemeContext } from "../context/themeContext";
import { LanguageContext } from "../context/languageContext";

const AyahItem = ({
  ayah,
  surahNumber,
  surahName,
  isPlaying,
  showTranslation = true,
  onPlayFromAyah,
  onOpenVideoTemplate,
  onRepeatAyah,
  shareUrl,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
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
    successNotification(isFav ? t("removedFromFavorites") : t("addedToFavorites"));
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

  const handleRepeat = (e, mode) => {
    e.stopPropagation();
    onRepeatAyah?.(ayah, mode);
    setShowDropdown(false);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const ayahNum = ayah.numberInSurah ?? ayah.number;
    const ayahLink = shareUrl || (surahNumber != null ? `${window.location.origin}/surah/${surahNumber}?ayah=${ayahNum}` : window.location.href);
    const shareText = `${surahName || "Surah"} ${ayahNum}\n\n${ayah.text}${ayah.translation ? `\n\n${ayah.translation}` : ""}`;
    const fullShareText = `${shareText}\n\n${ayahLink}`;
    const shareData = {
      title: `${surahName || "Surah"} ${ayahNum}`,
      text: shareText,
      url: ayahLink,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(fullShareText);
        successNotification(t("shareCopied"));
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        await navigator.clipboard.writeText(fullShareText);
        successNotification(t("shareCopied"));
      }
    }
    setShowDropdown(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative  flex gap-3  p-4 rounded-xl border transition-colors ${
        isPlaying
          ? "border-AppGreen bg-AppGreen/20"
          : "border-transparent hover:border-AppGreen/50 bg-AppGray/10"
      }`}
         onClick={(e) => {
          e.stopPropagation();
          setShowDropdown((prev) => !prev);
        }}
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
      </div>
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
            {isFav ? t("removeFromFavorites") : t("addToFavorites")}
          </button>
          {onPlayFromAyah && (
            <button
              type="button"
              onClick={handlePlayFrom}
              className="w-full px-4 py-2 text-left hover:bg-AppGreen/20 transition-colors flex items-center gap-2"
            >
              {t("playFromAyah")}
            </button>
          )}
          {onOpenVideoTemplate && (
            <button
              type="button"
              onClick={handleVideoTemplate}
              className="w-full px-4 py-2 text-left hover:bg-AppGreen/20 transition-colors flex items-center gap-2"
            >
              {t("playInVideoTemplate")}
            </button>
          )}
          {onRepeatAyah && (
            <>
              <button
                type="button"
                onClick={(e) => handleRepeat(e, "once")}
                className="w-full px-4 py-2 text-left hover:bg-AppGreen/20 transition-colors flex items-center gap-2"
              >
                {t("repeatAyahOnce")}
              </button>
              <button
                type="button"
                onClick={(e) => handleRepeat(e, "infinite")}
                className="w-full px-4 py-2 text-left hover:bg-AppGreen/20 transition-colors flex items-center gap-2"
              >
                {t("repeatAyahInfinite")}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="w-full px-4 py-2 text-left hover:bg-AppGreen/20 transition-colors flex items-center gap-2"
          >
            {t("shareAyah")}
          </button>
        </div>
      )}
    </div>
  );
};

export default AyahItem;

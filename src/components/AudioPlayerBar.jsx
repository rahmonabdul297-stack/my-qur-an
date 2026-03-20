import { BsPlayFill, BsPauseFill, BsSkipBackwardFill, BsSkipForwardFill } from "react-icons/bs";
import { useContext } from "react";
import { LanguageContext } from "../context/languageContext";
import { ThemeContext } from "../context/themeContext";

const AudioPlayerBar = ({
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
  onPrevSurah,
  onNextSurah,
  canGoPrevSurah,
  canGoNextSurah,
  prevSurahLabel,
  nextSurahLabel,
  currentLabel,
}) => {
  const { t } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2 sm:gap-4 py-4 px-4 sm:px-6 border-t ${
        theme ? "bg-AppGray/95 border-AppGreen/30" : "bg-AppWhite/95 border-AppGreen/20"
      } backdrop-blur-sm lg:left-[200px]`}
    >
      {onPrevSurah && (
        <button
          type="button"
          onClick={onPrevSurah}
          disabled={!canGoPrevSurah}
          className="p-2 sm:p-3 rounded-full border border-AppGreen/50 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-AppGreen/10 transition-colors"
          aria-label={prevSurahLabel}
          title={prevSurahLabel}
        >
          <BsSkipBackwardFill className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
      {currentLabel && (
        <span className="text-sm opacity-80 truncate max-w-[80px] sm:max-w-[200px]" title={currentLabel}>
          {currentLabel}
        </span>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoPrev}
          className="p-3 rounded-full border border-AppGreen/50 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-AppGreen/10 transition-colors"
          aria-label={t("previous")}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onPlayPause}
          className="p-4 rounded-full bg-AppGreen text-white hover:opacity-90 transition-opacity"
          aria-label={isPlaying ? t("pause") : t("listen")}
        >
          {isPlaying ? (
            <BsPauseFill size={24} />
          ) : (
            <BsPlayFill size={24} />
          )}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="p-3 rounded-full border border-AppGreen/50 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-AppGreen/10 transition-colors"
          aria-label={t("next")}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
          </svg>
        </button>
      </div>
      {onNextSurah && (
        <button
          type="button"
          onClick={onNextSurah}
          disabled={!canGoNextSurah}
          className="p-2 sm:p-3 rounded-full border border-AppGreen/50 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-AppGreen/10 transition-colors"
          aria-label={nextSurahLabel}
          title={nextSurahLabel}
        >
          <BsSkipForwardFill className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
};

export default AudioPlayerBar;

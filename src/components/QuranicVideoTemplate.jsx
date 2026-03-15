import { useRef, useState, useEffect } from "react";
import { HiXMark } from "react-icons/hi2";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { getCachedAudioUrl } from "../utils/audioCache";
import { toArabicNumbers } from "../utils/helpers";
import { getAudioUrl, DEFAULT_RECITER } from "../utils/reciters";

const VIDEO_OPTIONS = [
  { id: "1", src: "/videos/nature video 1.mp4", label: "template 1" },
  { id: "2", src: "/videos/nature video 2.mp4", label: "template 2" },
  { id: "3", src: "/videos/325502_small.mp4", label: "template 3" },
];

const QuranicVideoTemplate = ({
  ayahs,
  startIndex = 0,
  surahName,
  showTranslation = true,
  reciter = DEFAULT_RECITER,
  onClose,
  sharedPlayingIndex,
  sharedIsPlaying,
  onPlayFromIndex,
  onPause,
}) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const blobUrlRef = useRef(null);
  const [localIndex, setLocalIndex] = useState(startIndex);
  const [selectedVideoSrc, setSelectedVideoSrc] = useState(VIDEO_OPTIONS[0].src);

  const useSharedAudio = onPlayFromIndex != null && onPause != null;
  const [standaloneIsPlaying, setStandaloneIsPlaying] = useState(false);
  const displayIndex = useSharedAudio
    ? (sharedPlayingIndex ?? localIndex)
    : localIndex;
  const isPlaying = useSharedAudio ? sharedIsPlaying : standaloneIsPlaying;

  const ayah = ayahs[displayIndex];
  const currentIndexRef = useRef(displayIndex);
  const ayahsRef = useRef(ayahs);
  const reciterRef = useRef(reciter);
  const isAutoAdvancingRef = useRef(false);
  currentIndexRef.current = displayIndex;
  ayahsRef.current = ayahs;
  reciterRef.current = reciter;

  const tryPlayAyahAtIndexRef = useRef(null);
  const tryPlayAyahAtIndex = async (index) => {
    const audio = audioRef.current;
    const list = ayahsRef.current;
    if (!audio || !list?.length || index >= list.length) {
      setStandaloneIsPlaying(false);
      setLocalIndex(0);
      return;
    }
    isAutoAdvancingRef.current = true;
    currentIndexRef.current = index;
    setLocalIndex(index);
    const r = reciterRef.current;
    const url = list[index]?.audio ?? getAudioUrl(r, list[index]?.number);
    try {
      const blobUrl = await getCachedAudioUrl(url);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = blobUrl;
      audio.src = blobUrl;
      await audio.play();
      if (index + 1 < list.length) {
        const nextUrl = list[index + 1]?.audio ?? getAudioUrl(reciterRef.current, list[index + 1]?.number);
        getCachedAudioUrl(nextUrl).catch(() => {});
      }
    } catch {
      try {
        audio.src = url;
        await audio.play();
        if (index + 1 < list.length) {
          const nextUrl = list[index + 1]?.audio ?? getAudioUrl(reciterRef.current, list[index + 1]?.number);
          getCachedAudioUrl(nextUrl).catch(() => {});
        }
      } catch {
        tryPlayAyahAtIndexRef.current?.(index + 1);
      }
    } finally {
      isAutoAdvancingRef.current = false;
    }
  };
  tryPlayAyahAtIndexRef.current = tryPlayAyahAtIndex;

  useEffect(() => {
    if (useSharedAudio) return;
    const audio = audioRef.current;
    if (!audio || !ayahs?.length) return;

    const handleEnded = () => {
      const list = ayahsRef.current;
      if (!list?.length) return;
      const current = currentIndexRef.current;
      const next = current + 1;
      if (next < list.length) {
        tryPlayAyahAtIndexRef.current?.(next);
      } else {
        setStandaloneIsPlaying(false);
        setLocalIndex(0);
      }
    };

    const handleError = () => {
      const current = currentIndexRef.current;
      tryPlayAyahAtIndexRef.current?.(current + 1);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [ayahs?.length, useSharedAudio]);

  useEffect(() => {
    if (useSharedAudio) return;
    if (!standaloneIsPlaying || !ayahs?.length || isAutoAdvancingRef.current) return;
    tryPlayAyahAtIndexRef.current?.(displayIndex);
  }, [displayIndex, standaloneIsPlaying, ayahs?.length, useSharedAudio]);

  const togglePlay = () => {
    if (useSharedAudio) {
      if (sharedIsPlaying) {
        onPause();
      } else {
        onPlayFromIndex(sharedPlayingIndex ?? localIndex);
      }
    } else {
      if (standaloneIsPlaying) {
        audioRef.current?.pause();
        setStandaloneIsPlaying(false);
      } else {
        setStandaloneIsPlaying(true);
      }
    }
  };

  const goToPrev = () => {
    if (useSharedAudio) {
      const idx = sharedPlayingIndex ?? localIndex;
      if (idx > 0) onPlayFromIndex(idx - 1);
      else setLocalIndex(0);
    } else if (displayIndex > 0) {
      const nextIdx = displayIndex - 1;
      setLocalIndex(nextIdx);
      if (standaloneIsPlaying) tryPlayAyahAtIndexRef.current?.(nextIdx);
    }
  };

  const goToNext = () => {
    if (useSharedAudio) {
      const idx = sharedPlayingIndex ?? localIndex;
      if (idx < ayahs.length - 1) onPlayFromIndex(idx + 1);
      else setLocalIndex(ayahs.length - 1);
    } else if (displayIndex < ayahs.length - 1) {
      const nextIdx = displayIndex + 1;
      setLocalIndex(nextIdx);
      if (standaloneIsPlaying) tryPlayAyahAtIndexRef.current?.(nextIdx);
    }
  };

  useEffect(() => {
    setLocalIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  if (!ayahs?.length) return null;

  return (
    <div
      className="fixed w-full h-screen inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      aria-hidden
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative w-full h-full  mx-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          key={selectedVideoSrc}
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-[80vh] object-cover"
        >
          <source src={selectedVideoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50 flex flex-col gap-12  p-6">
          <div className="flex justify-between items-start">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              <HiXMark size={24} />
            </button>
            <span className="text-white/80 text-sm">{surahName}</span>
          </div>

          <div className="flex flex-col justify-between items-center gap-6 flex-1 min-h-0 overflow-hidden">
            <div
              className="p-4 lg:p-8 w-full max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-0 overflow-y-auto overflow-x-hidden"
              dir="rtl"
              style={{ maxHeight: "calc(80vh - 220px)" }}
            >
              <p
                className="text-white font-medium leading-loose overflow-hidden break-words"
                style={{
                  fontSize: "clamp(1.25rem, 3vw, 2.25rem)",
                  lineHeight: "1.8",
                }}
              >
                {ayah?.text}
              </p>
              {showTranslation && ayah?.translation && (
                <p
                  className="text-white/85 mt-3 overflow-hidden break-words mx-auto max-w-full"
                  dir="ltr"
                  style={{
                    fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
                    maxWidth: "min(42rem, 90vw)",
                  }}
                >
                  {ayah.translation}
                </p>
              )}
              <p className="text-white/70 mt-3 text-sm shrink-0">
                Verse {toArabicNumbers(ayah?.numberInSurah ?? ayah?.number)} • Page {ayah?.page ?? "—"}
              </p>
            </div>
          </div>

          {/* Video selector - bottom left */}
 <section className="fixed  lg:pl-40 container bottom-0 right-0 flex flex-col lg:flex-row items-center   justify-between gap-4">
  
 <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={goToPrev}
                disabled={displayIndex === 0}
                className="p-3 rounded-full bg-white/20 text-white disabled:opacity-40 hover:bg-white/30 transition-colors disabled:cursor-not-allowed"
                aria-label="Previous verse"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="p-4 rounded-full bg-AppGreen text-white hover:opacity-90 transition-opacity"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <BsPauseFill size={28} />
                ) : (
                  <BsPlayFill size={28} />
                )}
              </button>
              <button
                type="button"
                onClick={goToNext}
                disabled={displayIndex >= ayahs.length - 1}
                className="p-3 rounded-full bg-white/20 text-white disabled:opacity-40 hover:bg-white/30 transition-colors disabled:cursor-not-allowed"
                aria-label="Next verse"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                </svg>
              </button>
            </div>
          <div className=" flex gap-2 overflow-x-auto max-w-[calc(100vw-3rem)] pb-1 mx-auto">
            {VIDEO_OPTIONS.map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVideoSrc(video.src);
                }}
                className={`shrink-0 w-24 h-14 rounded-lg border-2 overflow-hidden transition-all ${
                  selectedVideoSrc === video.src
                    ? "border-AppGreen ring-2 ring-AppGreen/50"
                    : "border-white/30 hover:border-white/60"
                }`}
                title={video.label}
              >
                <video
                  src={video.src}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover pointer-events-none"
                />
                <span className="w-full  bg-AppGreen/70 text-white text-[10px] px-1 py-0.5 truncate">
                  {video.label}
                </span>
              </button>
            ))}
          </div>
 </section>
        </div>
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

export default QuranicVideoTemplate;

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
}) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const blobUrlRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVideoSrc, setSelectedVideoSrc] = useState(VIDEO_OPTIONS[0].src);

  const ayah = ayahs[currentIndex];
  const audioUrl = ayah?.audio ?? (ayah ? getAudioUrl(reciter, ayah.number) : null);
  const currentIndexRef = useRef(currentIndex);
  const ayahsRef = useRef(ayahs);
  const reciterRef = useRef(reciter);
  const isAutoAdvancingRef = useRef(false);
  currentIndexRef.current = currentIndex;
  ayahsRef.current = ayahs;
  reciterRef.current = reciter;

  const tryPlayAyahAtIndexRef = useRef(null);
  const tryPlayAyahAtIndex = async (index) => {
    const audio = audioRef.current;
    const list = ayahsRef.current;
    if (!audio || !list?.length || index >= list.length) {
      setIsPlaying(false);
      setCurrentIndex(0);
      return;
    }
    isAutoAdvancingRef.current = true;
    currentIndexRef.current = index;
    setCurrentIndex(index);
    const r = reciterRef.current;
    const url = list[index]?.audio ?? getAudioUrl(r, list[index]?.number);
    try {
      const blobUrl = await getCachedAudioUrl(url);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = blobUrl;
      audio.src = blobUrl;
      await audio.play();
    } catch {
      try {
        audio.src = url;
        await audio.play();
      } catch {
        tryPlayAyahAtIndexRef.current?.(index + 1);
      }
    } finally {
      isAutoAdvancingRef.current = false;
    }
  };
  tryPlayAyahAtIndexRef.current = tryPlayAyahAtIndex;

  useEffect(() => {
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
        setIsPlaying(false);
        setCurrentIndex(0);
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
  }, [ayahs?.length]);

  useEffect(() => {
    if (!isPlaying || !ayahs?.length || isAutoAdvancingRef.current) return;
    tryPlayAyahAtIndexRef.current?.(currentIndex);
  }, [currentIndex, isPlaying, ayahs?.length]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < ayahs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

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

          <div className=" flex flex-col justify-between items-center gap-6">
            <div
              className=" p-8 max-w-4xl w-full text-center"
              dir="rtl"
            >
              <p className="text-3xl lg:text-4xl leading-loose text-white font-medium">
                {ayah?.text}
              </p>
              {showTranslation && ayah?.translation && (
                <p className="text-white/85 mt-3 text-base lg:text-lg max-w-2xl mx-auto" dir="ltr">
                  {ayah.translation}
                </p>
              )}
              <p className="text-white/70 mt-3 text-sm">
                Verse {toArabicNumbers(ayah?.numberInSurah ?? ayah?.number)} • Page {ayah?.page ?? "—"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={goToPrev}
                disabled={currentIndex === 0}
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
                disabled={currentIndex >= ayahs.length - 1}
                className="p-3 rounded-full bg-white/20 text-white disabled:opacity-40 hover:bg-white/30 transition-colors disabled:cursor-not-allowed"
                aria-label="Next verse"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Video selector - bottom left */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[calc(100vw-3rem)] pb-1 mx-auto">
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
                <span className="absolute bottom-0 left-0 right-0 bg-AppGreen/70 text-white text-[10px] px-1 py-0.5 truncate">
                  {video.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

export default QuranicVideoTemplate;

import { useParams, Link, useNavigate } from "react-router";
import { useRef, useState, useEffect, useContext, useMemo } from "react";
import useFetch from "../hooks/usefetch";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import AyahItem from "../components/AyahItem";
import AudioPlayerBar from "../components/AudioPlayerBar";
import QuranicVideoTemplate from "../components/QuranicVideoTemplate";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { getCachedAudioUrl } from "../utils/audioCache";
import { toArabicNumbers, groupAyahsByPage } from "../utils/helpers";
import { getAudioUrl, DEFAULT_RECITER, RECITERS } from "../utils/reciters";
import { useRecent } from "../context/recentContext";
import { LanguageContext } from "../context/languageContext";

const JuzDetail = () => {
  const { t } = useContext(LanguageContext);
  const { number } = useParams();
  const navigate = useNavigate();
  const { data, error, loading } = useFetch(
    "https://api.alquran.cloud/v1/quran/quran-uthmani",
  );
  const audioRef = useRef(null);
  const ayahRefs = useRef([]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTemplateState, setVideoTemplateState] = useState({
    open: false,
    startIndex: 0,
  });
  const blobUrlRef = useRef(null);
  const playingIndexRef = useRef(null);
  const juzAyahsRef = useRef([]);
  const reciterRef = useRef(DEFAULT_RECITER);
  const [reciter, setReciter] = useState(DEFAULT_RECITER);
  const [repeatMode, setRepeatMode] = useState(null);
  const [repeatAyahIndex, setRepeatAyahIndex] = useState(null);
  const repeatModeRef = useRef(null);
  const repeatAyahIndexRef = useRef(null);
  const { addRecent } = useRecent();

  repeatModeRef.current = repeatMode;
  repeatAyahIndexRef.current = repeatAyahIndex;

  const juzNum = parseInt(number, 10);
  const juzAyahs = (
    data?.data?.surahs?.flatMap((surah) =>
      surah.ayahs
        .filter((ayah) => ayah.juz === juzNum)
        .map((ayah) => ({
          ...ayah,
          surahName: surah.englishName,
          surahNumber: surah.number,
          audio: ayah.audio ?? getAudioUrl(reciter, ayah.number, { surahNumber: surah.number, numberInSurah: ayah.numberInSurah }),
        })),
    ) ?? []
  ).sort((a, b) => a.number - b.number);

  const juzAyahsByPage = useMemo(() => groupAyahsByPage(juzAyahs), [juzAyahs]);

  playingIndexRef.current = playingIndex;
  juzAyahsRef.current = juzAyahs;
  reciterRef.current = reciter;

  useEffect(() => {
    audioRef.current?.pause();
    setPlayingIndex(null);
    setIsPlaying(false);
  }, [reciter]);

  const hasAutoPlayedRef = useRef(false);
  useEffect(() => {
    hasAutoPlayedRef.current = false;
  }, [number]);

  useEffect(() => {
    if (juzAyahs.length === 0 || hasAutoPlayedRef.current) return;
    hasAutoPlayedRef.current = true;
    setIsPlaying(true);
    tryPlayAyahAtIndexRef.current?.(0);
  }, [juzAyahs.length, number]);

  useEffect(() => {
    if (playingIndex != null && ayahRefs.current[playingIndex]) {
      ayahRefs.current[playingIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [playingIndex]);

  const tryPlayAyahAtIndexRef = useRef(null);
  const tryPlayAyahAtIndex = async (index) => {
    const audio = audioRef.current;
    const list = juzAyahsRef.current;
    if (!audio || !list?.length || index >= list.length) {
      playingIndexRef.current = null;
      setPlayingIndex(null);
      setIsPlaying(false);
      return;
    }
    playingIndexRef.current = index;
    setPlayingIndex(index);
    const r = reciterRef.current;
    const ayah = list[index];
    const url = ayah.audio ?? getAudioUrl(r, ayah.number, { surahNumber: ayah.surahNumber, numberInSurah: ayah.numberInSurah });
    try {
      const blobUrl = await getCachedAudioUrl(url);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = blobUrl;
      audio.src = blobUrl;
      await audio.play();
      const ayah = list[index];
      addRecent(ayah.surahNumber, ayah.numberInSurah ?? ayah.number, ayah.surahName, ayah.text);
      if (index + 1 < list.length) {
        const nextAyah = list[index + 1];
        const nextUrl = nextAyah.audio ?? getAudioUrl(r, nextAyah.number, { surahNumber: nextAyah.surahNumber, numberInSurah: nextAyah.numberInSurah });
        getCachedAudioUrl(nextUrl).catch(() => {});
      }
    } catch {
      try {
        audio.src = url;
        await audio.play();
        const ayah = list[index];
        addRecent(ayah.surahNumber, ayah.numberInSurah ?? ayah.number, ayah.surahName, ayah.text);
        if (index + 1 < list.length) {
          const nextAyah = list[index + 1];
          const nextUrl = nextAyah.audio ?? getAudioUrl(r, nextAyah.number, { surahNumber: nextAyah.surahNumber, numberInSurah: nextAyah.numberInSurah });
          getCachedAudioUrl(nextUrl).catch(() => {});
        }
      } catch {
        tryPlayAyahAtIndexRef.current?.(index + 1);
      }
    }
  };
  tryPlayAyahAtIndexRef.current = tryPlayAyahAtIndex;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !data) return;

    const handleEnded = () => {
      const list = juzAyahsRef.current;
      if (!list?.length) return;
      const current = playingIndexRef.current ?? -1;
      const mode = repeatModeRef.current;
      const repeatIdx = repeatAyahIndexRef.current;

      if (mode === "infinite" && repeatIdx != null && current === repeatIdx) {
        tryPlayAyahAtIndexRef.current?.(repeatIdx);
        return;
      }
      if (mode === "once" && repeatIdx != null && current === repeatIdx) {
        playingIndexRef.current = null;
        setPlayingIndex(null);
        setIsPlaying(false);
        setRepeatMode(null);
        setRepeatAyahIndex(null);
        return;
      }

      const next = current + 1;
      if (next < list.length) {
        tryPlayAyahAtIndexRef.current?.(next);
      } else {
        playingIndexRef.current = null;
        setPlayingIndex(null);
        setIsPlaying(false);
        setRepeatMode(null);
        setRepeatAyahIndex(null);
      }
    };

    const handleError = () => {
      const current = playingIndexRef.current ?? -1;
      tryPlayAyahAtIndexRef.current?.(current + 1);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [data]);

  const playFromIndex = async (index) => {
    if (index >= juzAyahs.length) return;
    tryPlayAyahAtIndexRef.current?.(index);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      playFromIndex(playingIndex ?? 0);
    }
  };

  const handlePlayFromAyah = (ayah) => {
    const index = juzAyahs.findIndex((a) => a.number === ayah.number);
    if (index >= 0) {
      setRepeatMode(null);
      setRepeatAyahIndex(null);
      playFromIndex(index);
    }
  };

  const handleOpenVideoTemplate = (ayah) => {
    const index = juzAyahs.findIndex((a) => a.number === ayah.number);
    if (index >= 0) {
      setVideoTemplateState({ open: true, startIndex: index });
    }
  };

  const handleVideoTemplatePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const handleRepeatAyah = (ayahItem, mode) => {
    const index = juzAyahs.findIndex((a) => a.number === ayahItem.number);
    if (index >= 0) {
      setRepeatMode(mode);
      setRepeatAyahIndex(index);
      setIsPlaying(true);
      tryPlayAyahAtIndexRef.current?.(index);
    }
  };

  const handlePrevAyah = () => {
    const idx = playingIndex ?? 0;
    if (idx > 0) {
      setRepeatMode(null);
      setRepeatAyahIndex(null);
      playFromIndex(idx - 1);
    }
  };

  const handleNextAyah = () => {
    const idx = playingIndex ?? 0;
    if (idx < juzAyahs.length - 1) {
      setRepeatMode(null);
      setRepeatAyahIndex(null);
      playFromIndex(idx + 1);
    }
  };

  const handlePrevJuz = () => {
    if (juzNum > 1) {
      navigate(`/juz/${juzNum - 1}`);
    }
  };

  const handleNextJuz = () => {
    if (juzNum < 30) {
      navigate(`/juz/${juzNum + 1}`, { state: { autoPlay: true } });
    }
  };

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  if (loading) return <Apploader size={20} />;
  if (error) return <AppError error={error} />;

  return (
    <div className="p-7 max-w-4xl mx-auto font-[playpen-sans-arabic]">
      <audio ref={audioRef} />
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-AppGreen hover:underline mb-6"
      >
        ← {t("backToDashboard")}
      </Link>
      <div className="mb-8 p-6 rounded-2xl border border-AppGreen/30 bg-AppGray/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Juz {number}</h1>
            <p className="text-sm opacity-80 mt-1">
              {toArabicNumbers(juzAyahs.length)} {t("ayahs")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={reciter}
              onChange={(e) => setReciter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-AppGreen/50 bg-transparent text-sm min-w-[140px] focus:outline-none focus:ring-2 focus:ring-AppGreen/50"
              title={t("selectReciter")}
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={togglePlayPause}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-AppGreen text-white hover:opacity-90 transition-opacity"
            >
              {isPlaying ? (
                <>
                  <BsPauseFill size={20} />
                  {t("pause")}
                </>
              ) : (
                <>
                  <BsPlayFill size={20} />
                  {t("listen")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {!videoTemplateState.open && (
        <AudioPlayerBar
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onPrev={handlePrevAyah}
          onNext={handleNextAyah}
          canGoPrev={(playingIndex ?? 0) > 0}
          canGoNext={(playingIndex ?? 0) < juzAyahs.length - 1}
          onPrevSurah={handlePrevJuz}
          onNextSurah={handleNextJuz}
          canGoPrevSurah={juzNum > 1}
          canGoNextSurah={juzNum < 30}
          prevSurahLabel={t("prevJuz")}
          nextSurahLabel={t("nextJuz")}
          currentLabel={playingIndex != null && juzAyahs[playingIndex] ? `${juzAyahs[playingIndex].surahName} ${juzAyahs[playingIndex].numberInSurah}` : null}
        />
      )}

      <div className="flex flex-col gap-4 pb-24">
        {juzAyahsByPage.map(({ page, ayahs: pageAyahs }) => (
          <div key={page} className="flex flex-col gap-4">
            {pageAyahs.map((ayah) => {
              const index = juzAyahs.findIndex((a) => a.number === ayah.number);
              return (
                <div
                  key={ayah.number}
                  ref={(el) => { ayahRefs.current[index] = el; }}
                >
                  <AyahItem
                    ayah={ayah}
                    surahNumber={ayah.surahNumber}
                    surahName={ayah.surahName}
                    isPlaying={playingIndex === index}
                    onPlayFromAyah={handlePlayFromAyah}
                    onOpenVideoTemplate={handleOpenVideoTemplate}
                    onRepeatAyah={handleRepeatAyah}
                    shareUrl={`${window.location.origin}/surah/${ayah.surahNumber}?ayah=${ayah.numberInSurah ?? ayah.number}`}
                  />
                </div>
              );
            })}
            <p className="text-sm opacity-70 text-center py-2" dir="ltr">
              {t("page")} {page}
            </p>
          </div>
        ))}
      </div>

      {videoTemplateState.open && (
        <QuranicVideoTemplate
          ayahs={juzAyahs}
          startIndex={videoTemplateState.startIndex}
          surahName={`Juz ${number}`}
          reciter={reciter}
          onClose={() => setVideoTemplateState({ open: false, startIndex: 0 })}
          sharedPlayingIndex={playingIndex}
          sharedIsPlaying={isPlaying}
          onPlayFromIndex={playFromIndex}
          onPause={handleVideoTemplatePause}
        />
      )}
    </div>
  );
};

export default JuzDetail;

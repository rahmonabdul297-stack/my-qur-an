import { useParams, Link, useSearchParams, useNavigate, useLocation } from "react-router";
import { useRef, useState, useEffect, useMemo, useContext } from "react";
import useFetch from "../hooks/usefetch";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import AyahItem from "../components/AyahItem";
import AudioPlayerBar from "../components/AudioPlayerBar";
import QuranicVideoTemplate from "../components/QuranicVideoTemplate";
import { BsPlayFill, BsPauseFill, BsThreeDotsVertical } from "react-icons/bs";
import { getCachedAudioUrl } from "../utils/audioCache";
import { toArabicNumbers, groupAyahsByPage } from "../utils/helpers";
import { RECITERS, DEFAULT_RECITER, getAudioUrl } from "../utils/reciters";
import { useRecent } from "../context/recentContext";
import { ThemeContext } from "../context/themeContext";
import { LanguageContext } from "../context/languageContext";

const EDITIONS_URL = (num, reciter) =>
  `https://api.alquran.cloud/v1/surah/${num}/editions/quran-uthmani,en.sahih,${reciter}`;

const SurahDetail = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const { number } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const ayahParam = searchParams.get("ayah");
  const [reciter, setReciter] = useState(() => location.state?.reciter ?? DEFAULT_RECITER);
  const { data, error, loading } = useFetch(EDITIONS_URL(number, reciter));
  const audioRef = useRef(null);
  const [surahDrop, setSurahDrop] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTemplateState, setVideoTemplateState] = useState({
    open: false,
    startIndex: 0,
  });
  const [showTranslation, setShowTranslation] = useState(true);
  const [repeatMode, setRepeatMode] = useState(null);
  const [repeatAyahIndex, setRepeatAyahIndex] = useState(null);
  const blobUrlRef = useRef(null);
  const repeatModeRef = useRef(null);
  const repeatAyahIndexRef = useRef(null);
  const { addRecent } = useRecent();

  repeatModeRef.current = repeatMode;
  repeatAyahIndexRef.current = repeatAyahIndex;

  const surah = data?.data?.[0];
  const surahRef = useRef(null);
  surahRef.current = surah;
  const ayahs = useMemo(() => {
    const editions = data?.data ?? [];
    const arabic = editions.find(
      (e) => e.edition?.identifier === "quran-uthmani",
    );
    const english = editions.find((e) => e.edition?.identifier === "en.sahih");
    const audioEdition = editions.find(
      (e) => e.edition?.identifier === reciter,
    );
    if (!arabic?.ayahs) return [];
    const enByNum = Object.fromEntries(
      (english?.ayahs ?? []).map((a) => [a.numberInSurah, a.text]),
    );
    const audioByNum = Object.fromEntries(
      (audioEdition?.ayahs ?? []).map((a) => [
        a.number,
        { url: a.audio, secondary: a.audioSecondary?.[0] },
      ]),
    );
    const surahNum = parseInt(number, 10);
    return arabic.ayahs.map((a) => {
      const aud = audioByNum[a.number];
      return {
        ...a,
        surahNumber: surahNum,
        audio: aud?.url ?? getAudioUrl(reciter, a.number, { surahNumber: surahNum, numberInSurah: a.numberInSurah }),
        audioSecondary: aud?.secondary,
        translation: enByNum[a.numberInSurah] ?? "",
      };
    });
  }, [data?.data, reciter]);

  const ayahsByPage = useMemo(() => groupAyahsByPage(ayahs), [ayahs]);

  const ayahRefs = useRef([]);
  const playingIndexRef = useRef(null);
  const ayahsRef = useRef(ayahs);
  const reciterRef = useRef(reciter);
  playingIndexRef.current = playingIndex;
  ayahsRef.current = ayahs;
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
    if (ayahs.length === 0 || hasAutoPlayedRef.current) return;
    const shouldAutoPlay = ayahParam || location.state?.autoPlay;
    if (!shouldAutoPlay) return;
    hasAutoPlayedRef.current = true;
    const startIndex = ayahParam ? ayahs.findIndex((a) => a.numberInSurah === parseInt(ayahParam, 10)) : 0;
    const index = startIndex >= 0 ? startIndex : 0;
    setIsPlaying(true);
    tryPlayAyahAtIndexRef.current?.(index);
    if (location.state?.autoPlay && window.history.replaceState) {
      window.history.replaceState({}, "", location.pathname);
    }
  }, [ayahs.length, ayahParam, number, location.state?.autoPlay, location.pathname]);

  const ayahParamAddedRef = useRef(null);
  useEffect(() => {
    if (!ayahParam || ayahs.length === 0) return;
    const ayahNum = parseInt(ayahParam, 10);
    const index = ayahs.findIndex((a) => a.numberInSurah === ayahNum);
    if (index >= 0) {
      const key = `${number}-${ayahNum}`;
      if (ayahParamAddedRef.current !== key) {
        ayahParamAddedRef.current = key;
        const ayah = ayahs[index];
        addRecent(
          parseInt(number, 10),
          ayahNum,
          surah?.englishName,
          ayah?.text,
        );
      }
      if (ayahRefs.current[index]) {
        ayahRefs.current[index].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [ayahParam, ayahs, number, surah?.englishName, addRecent]);

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
    const list = ayahsRef.current;
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
    const url = ayah.audio ?? getAudioUrl(r, ayah.number, { surahNumber: ayah.surahNumber ?? parseInt(number, 10), numberInSurah: ayah.numberInSurah });
    const urlSecondary = ayah.audioSecondary;
    const tryUrl = async (u) => {
      if (!u) return false;
      try {
        audio.src = u;
        await audio.play();
        return true;
      } catch {
        try {
          const blobUrl = await getCachedAudioUrl(u);
          if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = blobUrl;
          audio.src = blobUrl;
          await audio.play();
          return true;
        } catch {
          return false;
        }
      }
    };
    if (await tryUrl(url)) {
      const s = surahRef.current;
      addRecent(
        parseInt(number, 10),
        list[index].numberInSurah ?? list[index].number,
        s?.englishName,
        list[index].text,
      );
      if (index + 1 < list.length) {
        const nextAyah = list[index + 1];
        const nextUrl = nextAyah.audio ?? getAudioUrl(r, nextAyah.number, { surahNumber: nextAyah.surahNumber ?? parseInt(number, 10), numberInSurah: nextAyah.numberInSurah });
        getCachedAudioUrl(nextUrl).catch(() => {});
      }
      return;
    }
    if (urlSecondary && (await tryUrl(urlSecondary))) {
      const s = surahRef.current;
      addRecent(
        parseInt(number, 10),
        list[index].numberInSurah ?? list[index].number,
        s?.englishName,
        list[index].text,
      );
      if (index + 1 < list.length) {
        const nextAyah = list[index + 1];
        const nextUrl = nextAyah.audio ?? getAudioUrl(r, nextAyah.number, { surahNumber: nextAyah.surahNumber ?? parseInt(number, 10), numberInSurah: nextAyah.numberInSurah });
        getCachedAudioUrl(nextUrl).catch(() => {});
      }
      return;
    }
    tryPlayAyahAtIndexRef.current?.(index + 1);
  };
  tryPlayAyahAtIndexRef.current = tryPlayAyahAtIndex;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !surah) return;

    const handleEnded = () => {
      const list = ayahsRef.current;
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
        const currentSurahNum = parseInt(number, 10);
        if (currentSurahNum < 114) {
          navigate(`/surah/${currentSurahNum + 1}`, { state: { autoPlay: true, reciter: reciterRef.current } });
        }
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
  }, [surah, number]);

  const playFromIndex = (index) => {
    if (index >= ayahs.length) return;
    setIsPlaying(true);
    tryPlayAyahAtIndexRef.current?.(index);
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
    const index = ayahs.findIndex((a) => a.number === ayah.number);
    if (index >= 0) {
      setRepeatMode(null);
      setRepeatAyahIndex(null);
      playFromIndex(index);
    }
  };

  const handleOpenVideoTemplate = (ayah) => {
    const index = ayahs.findIndex((a) => a.number === ayah.number);
    if (index >= 0) {
      setVideoTemplateState({ open: true, startIndex: index });
    }
  };

  const handleVideoTemplatePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const handleRepeatAyah = (ayahItem, mode) => {
    const index = ayahs.findIndex((a) => a.number === ayahItem.number);
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
    if (idx < ayahs.length - 1) {
      setRepeatMode(null);
      setRepeatAyahIndex(null);
      playFromIndex(idx + 1);
    } else if (idx === ayahs.length - 1 && parseInt(number, 10) < 114) {
      setRepeatMode(null);
      setRepeatAyahIndex(null);
      navigate(`/surah/${parseInt(number, 10) + 1}`, { state: { autoPlay: true, reciter: reciterRef.current } });
    }
  };

  const handlePrevSurah = () => {
    const num = parseInt(number, 10);
    if (num > 1) {
      navigate(`/surah/${num - 1}`, { state: { reciter: reciterRef.current } });
    }
  };

  const handleNextSurah = () => {
    const num = parseInt(number, 10);
    if (num < 114) {
      navigate(`/surah/${num + 1}`, { state: { autoPlay: true, reciter: reciterRef.current } });
    }
  };

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  if (loading) return <Apploader size={20} />;
  if (error) return <AppError error={error} />;
  if (!surah) return <div className="p-7">{t("surahNotFound")}</div>;

  const selectedReciterName =
    RECITERS.find((r) => r.id === reciter)?.name ?? reciter;

  return (
    <div className="p-7 max-w-4xl mx-auto font-[playpen-sans-arabic]">
      <audio ref={audioRef} />
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-AppGreen hover:underline"
      >
        ← {t("backToDashboard")}
      </Link>
      <div className="container fixed w-full top-16  lg:top-4 z-10  border-2 border-AppGreen mb-8 p-6 rounded-2xl bg-AppGray/20 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-4 mb-2 flex-wrap">
          <div className="surah-number-hex bg-AppGreen">
            {toArabicNumbers(surah.number)}
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-2xl font-bold">{surah.englishName}</h1>
            <p className="text-sm opacity-80 ">
              {surah.englishNameTranslation}
            </p>
          </div>

          <section
            className={
              surahDrop
                ? `${theme ? "bg-AppGray" : "bg-AppWhite"} top-52 right-0  fixed flex flex-col gap-3 p-4 rounded-2xl border-AppGreen`
                : "hidden"
            }
          >
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
              onClick={() => setShowTranslation((prev) => !prev)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-colors  ${
                showTranslation
                  ? "border-AppGreen bg-AppGreen/20 text-AppGreen"
                  : "border-current opacity-70"
              }`}
              title={showTranslation ? t("hideTranslation") : t("showTranslation")}
            >
              {t("translation")} {showTranslation ? t("translationOn") : t("translationOff")}
            </button>
            <button
              type="button"
              onClick={togglePlayPause}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-AppGreen text-white hover:opacity-90 transition-opacity"
            >
              {isPlaying ? (
                <>
                  <BsPauseFill size={20} />
                  Pause
                </>
              ) : (
                <>
                  <BsPlayFill size={20} />
                  Listen
                </>
              )}
            </button>
          </section>
        </div>
        <p className="text-lg font-medium" dir="rtl">
          {surah.name}
        </p>
        <div className="flex justify-between items-start mt-4">
          <div>
            <p className="text-sm opacity-80 mt-1">
              {t("reciter")}: {selectedReciterName}
            </p>
            <p className="text-sm opacity-80 mt-1">
              {toArabicNumbers(surah.numberOfAyahs)} {t("ayahs")} •{" "}
              {surah.revelationType}
            </p>
          </div>
          <div
            className="border border-AppGreen animate-bounce  hover:bg-AppBlack/30 rounded-xl p-2"
            onClick={() => setSurahDrop(!surahDrop)}
          >
            <BsThreeDotsVertical />
          </div>
        </div>
      </div>

      <div className="container flex flex-col gap-4 mt-[170px] lg:p-6 pb-24">
        {ayahsByPage.map(({ page, ayahs: pageAyahs }) => (
          <div key={page} className="flex flex-col gap-4">
            {pageAyahs.map((ayah) => {
              const index = ayahs.findIndex((a) => a.number === ayah.number);
              return (
                <div
                  key={ayah.number}
                  id={`ayah-${ayah.numberInSurah}`}
                  ref={(el) => {
                    ayahRefs.current[index] = el;
                  }}
                >
                  <AyahItem
                    ayah={ayah}
                    surahNumber={parseInt(number, 10)}
                    surahName={surah.englishName}
                    isPlaying={playingIndex === index}
                    showTranslation={showTranslation}
                    onPlayFromAyah={handlePlayFromAyah}
                    onOpenVideoTemplate={handleOpenVideoTemplate}
                    onRepeatAyah={handleRepeatAyah}
                    shareUrl={`${window.location.origin}/surah/${number}?ayah=${ayah.numberInSurah}`}
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

      {!videoTemplateState.open && (
        <AudioPlayerBar
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onPrev={handlePrevAyah}
          onNext={handleNextAyah}
          canGoPrev={(playingIndex ?? 0) > 0}
          canGoNext={(playingIndex ?? 0) < ayahs.length - 1 || ((playingIndex ?? 0) === ayahs.length - 1 && parseInt(number, 10) < 114)}
          onPrevSurah={handlePrevSurah}
          onNextSurah={handleNextSurah}
          canGoPrevSurah={parseInt(number, 10) > 1}
          canGoNextSurah={parseInt(number, 10) < 114}
          prevSurahLabel={t("prevSurah")}
          nextSurahLabel={t("nextSurah")}
          currentLabel={playingIndex != null && ayahs[playingIndex] ? `${surah.englishName} ${ayahs[playingIndex].numberInSurah}` : null}
        />
      )}

      {videoTemplateState.open && (
        <QuranicVideoTemplate
          ayahs={ayahs}
          startIndex={videoTemplateState.startIndex}
          surahName={`${surah.englishName} - ${surah.englishNameTranslation}`}
          showTranslation={showTranslation}
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

export default SurahDetail;

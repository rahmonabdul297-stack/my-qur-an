import { useParams, Link, useSearchParams } from "react-router";
import { useRef, useState, useEffect, useMemo } from "react";
import useFetch from "../hooks/usefetch";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import AyahItem from "../components/AyahItem";
import QuranicVideoTemplate from "../components/QuranicVideoTemplate";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { getCachedAudioUrl } from "../utils/audioCache";
import { toArabicNumbers } from "../utils/helpers";
import { RECITERS, DEFAULT_RECITER, getAudioUrl } from "../utils/reciters";
import { useRecent } from "../context/recentContext";

const EDITIONS_URL = (num, reciter) =>
  `https://api.alquran.cloud/v1/surah/${num}/editions/quran-uthmani,en.sahih,${reciter}`;

const SurahDetail = () => {
  const { number } = useParams();
  const [searchParams] = useSearchParams();
  const ayahParam = searchParams.get("ayah");
  const [reciter, setReciter] = useState(DEFAULT_RECITER);
  const { data, error, loading } = useFetch(EDITIONS_URL(number, reciter));
  const audioRef = useRef(null);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTemplateState, setVideoTemplateState] = useState({
    open: false,
    startIndex: 0,
  });
  const [showTranslation, setShowTranslation] = useState(true);
  const blobUrlRef = useRef(null);
  const { addRecent } = useRecent();

  const surah = data?.data?.[0];
  const surahRef = useRef(null);
  surahRef.current = surah;
  const ayahs = useMemo(() => {
    const editions = data?.data ?? [];
    const arabic = editions.find((e) => e.edition?.identifier === "quran-uthmani");
    const english = editions.find((e) => e.edition?.identifier === "en.sahih");
    const audioEdition = editions.find((e) => e.edition?.identifier === reciter);
    if (!arabic?.ayahs) return [];
    const enByNum = Object.fromEntries(
      (english?.ayahs ?? []).map((a) => [a.numberInSurah, a.text])
    );
    const audioByNum = Object.fromEntries(
      (audioEdition?.ayahs ?? []).map((a) => [a.number, { url: a.audio, secondary: a.audioSecondary?.[0] }])
    );
    return arabic.ayahs.map((a) => {
      const aud = audioByNum[a.number];
      return {
        ...a,
        audio: aud?.url ?? getAudioUrl(reciter, a.number),
        audioSecondary: aud?.secondary,
        translation: enByNum[a.numberInSurah] ?? "",
      };
    });
  }, [data?.data, reciter]);

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
        addRecent(parseInt(number, 10), ayahNum, surah?.englishName, ayah?.text);
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
    const url = list[index].audio ?? getAudioUrl(r, list[index].number);
    const urlSecondary = list[index].audioSecondary;
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
      addRecent(parseInt(number, 10), list[index].numberInSurah ?? list[index].number, s?.englishName, list[index].text);
      return;
    }
    if (urlSecondary && (await tryUrl(urlSecondary))) {
      const s = surahRef.current;
      addRecent(parseInt(number, 10), list[index].numberInSurah ?? list[index].number, s?.englishName, list[index].text);
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
      const next = current + 1;
      if (next < list.length) {
        tryPlayAyahAtIndexRef.current?.(next);
      } else {
        playingIndexRef.current = null;
        setPlayingIndex(null);
        setIsPlaying(false);
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
  }, [surah]);

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
    if (index >= 0) playFromIndex(index);
  };

  const handleOpenVideoTemplate = (ayah) => {
    const index = ayahs.findIndex((a) => a.number === ayah.number);
    if (index >= 0) {
      setVideoTemplateState({ open: true, startIndex: index });
    }
  };

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  if (loading) return <Apploader size={20} />;
  if (error) return <AppError error={error} />;
  if (!surah) return <div className="p-7">Surah not found</div>;

  const selectedReciterName = RECITERS.find((r) => r.id === reciter)?.name ?? reciter;

  return (
    <div className="p-7 max-w-4xl mx-auto font-[playpen-sans-arabic]">
      <audio ref={audioRef} />
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-AppGreen hover:underline mb-6"
      >
        ← Back to Dashboard
      </Link>
      <div className="sticky top-16 lg:top-4 z-10 border-2 border-AppGreen mb-8 p-6 rounded-2xl bg-AppGray/20 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-4 mb-2 flex-wrap">
          <div className="surah-number-hex bg-AppGreen">{toArabicNumbers(surah.number)}</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{surah.englishName}</h1>
            <p className="text-sm opacity-80">{surah.englishNameTranslation}</p>
          </div>
          <select
            value={reciter}
            onChange={(e) => setReciter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-AppGreen/50 bg-transparent text-sm min-w-[140px] focus:outline-none focus:ring-2 focus:ring-AppGreen/50"
            title="Select reciter"
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              showTranslation ? "border-AppGreen bg-AppGreen/20 text-AppGreen" : "border-current opacity-70"
            }`}
            title={showTranslation ? "Hide translation" : "Show translation"}
          >
            Translation {showTranslation ? "On" : "Off"}
          </button>
          <button
            type="button"
            onClick={togglePlayPause}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-AppGreen text-white hover:opacity-90 transition-opacity"
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
        </div>
        <p className="text-lg font-medium" dir="rtl">
          {surah.name}
        </p>
        <p className="text-sm opacity-80 mt-1">
          Reciter: {selectedReciterName}
        </p>
        <p className="text-sm opacity-80 mt-1">
          {toArabicNumbers(surah.numberOfAyahs)} Ayahs • {surah.revelationType}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {ayahs.map((ayah, index) => (
          <div
            key={ayah.number}
            id={`ayah-${ayah.numberInSurah}`}
            ref={(el) => { ayahRefs.current[index] = el; }}
          >
            <AyahItem
              ayah={ayah}
              surahNumber={parseInt(number, 10)}
              surahName={surah.englishName}
              isPlaying={playingIndex === index}
              showTranslation={showTranslation}
              onPlayFromAyah={handlePlayFromAyah}
              onOpenVideoTemplate={handleOpenVideoTemplate}
            />
          </div>
        ))}
      </div>

      {videoTemplateState.open && (
        <QuranicVideoTemplate
          ayahs={ayahs}
          startIndex={videoTemplateState.startIndex}
          surahName={`${surah.englishName} - ${surah.englishNameTranslation}`}
          showTranslation={showTranslation}
          reciter={reciter}
          onClose={() => setVideoTemplateState({ open: false, startIndex: 0 })}
        />
      )}
    </div>
  );
};

export default SurahDetail;

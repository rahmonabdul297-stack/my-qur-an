import { useParams, Link } from "react-router";
import { useRef, useState, useEffect } from "react";
import useFetch from "../hooks/usefetch";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import AyahItem from "../components/AyahItem";
import QuranicVideoTemplate from "../components/QuranicVideoTemplate";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { getCachedAudioUrl } from "../utils/audioCache";
import { toArabicNumbers } from "../utils/helpers";
import { getAudioUrl, DEFAULT_RECITER, RECITERS } from "../utils/reciters";
import { useRecent } from "../context/recentContext";

const JuzDetail = () => {
  const { number } = useParams();
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
  const { addRecent } = useRecent();

  const juzNum = parseInt(number, 10);
  const juzAyahs = (
    data?.data?.surahs?.flatMap((surah) =>
      surah.ayahs
        .filter((ayah) => ayah.juz === juzNum)
        .map((ayah) => ({
          ...ayah,
          audio: ayah.audio ?? getAudioUrl(reciter, ayah.number),
          surahName: surah.englishName,
          surahNumber: surah.number,
        })),
    ) ?? []
  ).sort((a, b) => a.number - b.number);

  playingIndexRef.current = playingIndex;
  juzAyahsRef.current = juzAyahs;
  reciterRef.current = reciter;

  useEffect(() => {
    audioRef.current?.pause();
    setPlayingIndex(null);
    setIsPlaying(false);
  }, [reciter]);

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
    const url = list[index].audio ?? getAudioUrl(r, list[index].number);
    try {
      const blobUrl = await getCachedAudioUrl(url);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = blobUrl;
      audio.src = blobUrl;
      await audio.play();
      const ayah = list[index];
      addRecent(ayah.surahNumber, ayah.numberInSurah ?? ayah.number, ayah.surahName, ayah.text);
    } catch {
      try {
        audio.src = url;
        await audio.play();
        const ayah = list[index];
        addRecent(ayah.surahNumber, ayah.numberInSurah ?? ayah.number, ayah.surahName, ayah.text);
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
    if (index >= 0) playFromIndex(index);
  };

  const handleOpenVideoTemplate = (ayah) => {
    const index = juzAyahs.findIndex((a) => a.number === ayah.number);
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

  return (
    <div className="p-7 max-w-4xl mx-auto font-[playpen-sans-arabic]">
      <audio ref={audioRef} />
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-AppGreen hover:underline mb-6"
      >
        ← Back to Dashboard
      </Link>
      <div className="mb-8 p-6 rounded-2xl border border-AppGreen/30 bg-AppGray/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Juz {number}</h1>
            <p className="text-sm opacity-80 mt-1">
              {toArabicNumbers(juzAyahs.length)} Ayahs
            </p>
          </div>
          <div className="flex items-center gap-4">
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
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {juzAyahs.map((ayah, index) => (
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
            />
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
        />
      )}
    </div>
  );
};

export default JuzDetail;

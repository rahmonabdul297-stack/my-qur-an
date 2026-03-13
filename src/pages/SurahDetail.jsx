import { useParams, Link, useSearchParams } from "react-router";
import { useRef, useState, useEffect, useMemo } from "react";
import useFetch from "../hooks/usefetch";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import AyahItem from "../components/AyahItem";
import QuranicVideoTemplate from "../components/QuranicVideoTemplate";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";

const RECITER = "ar.alafasy";
const AUDIO_BASE = "https://cdn.islamic.network/quran/audio/128";
const EDITIONS_URL = (num) =>
  `https://api.alquran.cloud/v1/surah/${num}/editions/quran-uthmani,en.sahih`;

const SurahDetail = () => {
  const { number } = useParams();
  const [searchParams] = useSearchParams();
  const ayahParam = searchParams.get("ayah");
  const { data, error, loading } = useFetch(EDITIONS_URL(number));
  const audioRef = useRef(null);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTemplateState, setVideoTemplateState] = useState({
    open: false,
    startIndex: 0,
  });

  const surah = data?.data?.[0];
  const ayahs = useMemo(() => {
    const editions = data?.data ?? [];
    const arabic = editions.find((e) => e.edition?.identifier === "quran-uthmani");
    const english = editions.find((e) => e.edition?.identifier === "en.sahih");
    if (!arabic?.ayahs) return [];
    const enByNum = Object.fromEntries(
      (english?.ayahs ?? []).map((a) => [a.numberInSurah, a.text])
    );
    return arabic.ayahs.map((a) => ({
      ...a,
      audio: a.audio ?? `${AUDIO_BASE}/${RECITER}/${a.number}.mp3`,
      translation: enByNum[a.numberInSurah] ?? "",
    }));
  }, [data?.data]);

  const ayahRefs = useRef([]);

  useEffect(() => {
    if (!ayahParam || ayahs.length === 0) return;
    const ayahNum = parseInt(ayahParam, 10);
    const index = ayahs.findIndex((a) => a.numberInSurah === ayahNum);
    if (index >= 0 && ayahRefs.current[index]) {
      ayahRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [ayahParam, ayahs]);

  useEffect(() => {
    if (playingIndex != null && ayahRefs.current[playingIndex]) {
      ayahRefs.current[playingIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [playingIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const next = (playingIndex ?? -1) + 1;
      if (next < ayahs.length) {
        setPlayingIndex(next);
        audio.src = ayahs[next].audio ?? `${AUDIO_BASE}/${RECITER}/${ayahs[next].number}.mp3`;
        audio.play();
      } else {
        setPlayingIndex(null);
        setIsPlaying(false);
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playingIndex, ayahs]);

  const playFromIndex = (index) => {
    if (index >= ayahs.length) return;
    const audio = audioRef.current;
    if (!audio) return;

    const url = ayahs[index].audio ?? `${AUDIO_BASE}/${RECITER}/${ayahs[index].number}.mp3`;
    audio.src = url;
    setPlayingIndex(index);
    setIsPlaying(true);
    audio.play();
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

  if (loading) return <Apploader size={20} />;
  if (error) return <AppError error={error} />;
  if (!surah) return <div className="p-7">Surah not found</div>;

  return (
    <div className="p-7 max-w-4xl mx-auto font-[playpen-sans-arabic]">
      <audio ref={audioRef} />
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-AppGreen hover:underline mb-6"
      >
        ← Back to Dashboard
      </Link>
      <div className="border-2 border-AppGreen mb-8 p-6 rounded-2xl   bg-AppGray/20">
        <div className=" flex items-center gap-4 mb-2 flex-wrap">
          <div className="surah-number-hex bg-AppGreen">{surah.number}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{surah.englishName}</h1>
            <p className="text-sm opacity-80">{surah.englishNameTranslation}</p>
          </div>
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
        <p className="text-sm opacity-80 mt-2">
          {surah.numberOfAyahs} Ayahs • {surah.revelationType}
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
          onClose={() => setVideoTemplateState({ open: false, startIndex: 0 })}
        />
      )}
    </div>
  );
};

export default SurahDetail;

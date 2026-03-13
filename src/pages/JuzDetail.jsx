import { useParams, Link } from "react-router";
import { useRef, useState, useEffect } from "react";
import useFetch from "../hooks/usefetch";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import AyahItem from "../components/AyahItem";
import QuranicVideoTemplate from "../components/QuranicVideoTemplate";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";

const AUDIO_BASE = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

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

  const juzNum = parseInt(number, 10);
  const juzAyahs = (
    data?.data?.surahs?.flatMap((surah) =>
      surah.ayahs
        .filter((ayah) => ayah.juz === juzNum)
        .map((ayah) => ({
          ...ayah,
          surahName: surah.englishName,
          surahNumber: surah.number,
        })),
    ) ?? []
  ).sort((a, b) => a.number - b.number);

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
      if (next < juzAyahs.length) {
        setPlayingIndex(next);
        audio.src = `${AUDIO_BASE}/${juzAyahs[next].number}.mp3`;
        audio.play();
      } else {
        setPlayingIndex(null);
        setIsPlaying(false);
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playingIndex, juzAyahs]);

  const playFromIndex = (index) => {
    if (index >= juzAyahs.length) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = `${AUDIO_BASE}/${juzAyahs[index].number}.mp3`;
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
    const index = juzAyahs.findIndex((a) => a.number === ayah.number);
    if (index >= 0) playFromIndex(index);
  };

  const handleOpenVideoTemplate = (ayah) => {
    const index = juzAyahs.findIndex((a) => a.number === ayah.number);
    if (index >= 0) {
      setVideoTemplateState({ open: true, startIndex: index });
    }
  };

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
              {juzAyahs.length} Ayahs
            </p>
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
          onClose={() => setVideoTemplateState({ open: false, startIndex: 0 })}
        />
      )}
    </div>
  );
};

export default JuzDetail;

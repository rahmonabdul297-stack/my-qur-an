import { useState, useMemo, useContext } from "react";
import { Link } from "react-router";
import useFetch from "../hooks/usefetch";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import { LanguageContext } from "../context/languageContext";

const JuzPage = ({ select, searchQuery = "" }) => {
  const { t } = useContext(LanguageContext);
  const [Url] = useState(
    "https://api.alquran.cloud/v1/quran/quran-uthmani",
  );
  const { data, error, loading } = useFetch(Url);

  const filteredJuzToSurahs = useMemo(() => {
    const juzToSurahs = {};
    data?.data?.surahs?.forEach((surah) => {
      const juzSet = new Set();
      surah.ayahs.forEach((ayah) => juzSet.add(ayah.juz));
      juzSet.forEach((juzNum) => {
        if (!juzToSurahs[juzNum]) juzToSurahs[juzNum] = [];
        juzToSurahs[juzNum].push(surah);
      });
    });
    Object.keys(juzToSurahs).forEach((juz) => {
      juzToSurahs[juz].sort((a, b) => a.number - b.number);
    });

    if (!searchQuery.trim()) return juzToSurahs;
    const q = searchQuery.toLowerCase().trim();
    const filtered = {};
    Object.keys(juzToSurahs).forEach((juz) => {
      const matching = juzToSurahs[juz].filter(
        (s) =>
          s.englishName?.toLowerCase().includes(q) ||
          s.englishNameTranslation?.toLowerCase().includes(q) ||
          s.name?.includes(searchQuery.trim()),
      );
      if (matching.length > 0) filtered[juz] = matching;
    });
    return filtered;
  }, [data?.data?.surahs, searchQuery]);

  const juzNumbers = Object.keys(filteredJuzToSurahs)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div>
      <div className={select < 2 ? "hidden" : "py-10"}>
        {loading ? (
          <Apploader size={20} />
        ) : error ? (
          <AppError error={error} />
        ) : juzNumbers.length > 0 ? (
          <div className="w-full lg:w-[70vw] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
            {juzNumbers.map((juzNum) => (
              <div
                key={juzNum}
                className="h-max w-full border border-AppGreen p-4 rounded-xl  flex flex-col gap-4" 
              >
                <div className=" flex items-center justify-between">
                  <h3 className="text-lg font-bold">Juz {juzNum}</h3>
                  <Link
                    to={`/juz/${juzNum}`}
                    className="text-sm underline hover:text-AppGreen transition-colors"
                  >
                    {t("readJuz")}
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {filteredJuzToSurahs[juzNum].map((surah) => (
                    <Link
                      key={`${juzNum}-${surah.number}`}
                      to={`/surah/${surah.number}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-AppGreen bg-AppBlack/10 transition-all"
                    >
                     <div className="bg-AppGreen h-10 w-10 text-center  -rotate-45">
                      <div className="rotate-45 bg-AppGreen text-AppWhite h-10 w-10 text-center p-2"> {surah.number}</div>
                    </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">
                          {surah.englishName}
                        </div>
                        <div className="text-xs opacity-80 truncate">
                          {surah.englishNameTranslation}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium" dir="rtl">
                          {surah.name}
                        </div>
                        <div className="text-xs opacity-80">
                          {surah.numberOfAyahs} {t("ayahs")}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          t("noJuzData")
        )}
      </div>
    </div>
  );
};

export default JuzPage;

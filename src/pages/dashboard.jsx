import { CiSearch } from "react-icons/ci";
import { IoMdArrowForward } from "react-icons/io";
import { MdDownload, MdFavorite } from "react-icons/md";
import { Link } from "react-router";
import useFetch from "../hooks/usefetch";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import { filterArrays } from "../components/arrays";
import { useState, useMemo, useContext, useEffect } from "react";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import JuzPage from "./juz";
import { useFavorites } from "../context/favoritesContext";
import { useRecent } from "../context/recentContext";
import { LanguageContext } from "../context/languageContext";
import GeneralFooter from "../components/GeneralFooter";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { infoNotification } from "../utils/helpers";

/** Chrome Help: install / use a Progressive Web App (same “app” as this site in the browser). */
const CHROME_PWA_INSTALL_HELP =
  "https://support.google.com/chrome/answer/9653311";

const Dashboard = () => {
  const { t } = useContext(LanguageContext);
  const { isStandalone, isIOS, canInstall, promptInstall } = usePwaInstall();
  const [Url] = useState(
    "https://api.alquran.cloud/v1/quran/quran-uthmani",
  );
  const { data, error, loading } = useFetch(Url);
  const { favorites } = useFavorites();
  const { recent } = useRecent();
  const [select, setSelected] = useState(1);
  const [showall, setshowall] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDownloadApp, setShowDownloadApp] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => setShowDownloadApp(true), 10_000);
    return () => clearTimeout(timerId);
  }, []);

  const filteredSurahs = useMemo(() => {
    const surahs = data?.data?.surahs ?? [];
    if (!searchQuery.trim()) return surahs;
    const q = searchQuery.toLowerCase().trim();
    return surahs.filter(
      (s) =>
        s.englishName?.toLowerCase().includes(q) ||
        s.englishNameTranslation?.toLowerCase().includes(q) ||
        s.name?.includes(searchQuery.trim()),
    );
  }, [data?.data?.surahs, searchQuery]);

  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const q = searchQuery.toLowerCase().trim();
    return favorites.filter(
      (f) =>
        f.surahName?.toLowerCase().includes(q) ||
        f.ayahText?.toLowerCase().includes(q),
    );
  }, [favorites, searchQuery]);

  const handleInstallApp = async () => {
    if (canInstall) {
      await promptInstall();
      return;
    }
    if (isIOS) {
      infoNotification(t("pwaAddToHomeScreenIOS"));
      return;
    }
    window.open(CHROME_PWA_INSTALL_HELP, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="h-screen font-[ubuntu-sans-mono-font] ">
      <section className="bg-red-400 w-screen h-[70vh] lg:h-[80vh] object-cover relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          controls
          className="w-full h-full lg:h-full object-cover relative overflow-x-hidden"
        >
          <source src="/videos/Qur'an vid.mp4" type="video/mp4" />
        </video>

        <div className="bg-black/55 text-AppWhite  absolute top-0 h-[80vh] w-full flex flex-col  px-11">
          <div className="w-full lg:w-[80%] flex justify-between items-center gap-4 lg:gap-16">
            <div className="my-8 flex items-center flex-1 lg:w-[30%] border rounded-2xl bg-white/10">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[90%] p-2 outline-0 bg-transparent placeholder:text-white/70"
              />
              <CiSearch className="shrink-0 mx-2" size={20} />
            </div>
            <Link
              to="/favorites"
              className="relative my-8 p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Favorites"
            >
              <MdFavorite size={30} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs bg-AppGreen rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
          </div>
          <div className="py-10 h-[40%] w-[70%] lg:w-[40%]  my-auto flex flex-col items-center justify-center gap-5">
            <div className="text-3xl lg:text-5xl font-black">
              {t("heroTitle")}
            </div>
            <Link
              to="/surah"
              className="lg:text-2xl w-full bg-AppGreen rounded-xl text-center flex items-center gap-3 justify-center py-3"
            >
              {t("explore")}
              <IoMdArrowForward />
            </Link>
          </div>
        </div>
      </section>

      <section className="p-7">
        <div className="grid gap-6 lg:grid-cols-2 mb-10">
          <div>
            <h2 className="text-lg font-bold mb-3 capitalize">{t("recentlyListened")}</h2>
            {recent.length === 0 ? (
              <p className="text-sm opacity-70 py-4">
                {t("playOrReadPrompt")}
              </p>
            ) : (
              <div className="w-full flex flex-wrap gap-2">
                {recent.slice(0,1).map((item) => (
                  <Link
                    key={`${item.surahNumber}-${item.ayahNumber}`}
                    to={`/surah/${item.surahNumber}?ayah=${item.ayahNumber}`}
                    className="w-full border-b hover:border-AppGreen px-3 py-3 flex items-center justify-between rounded-2xl transition-colors"
                  >
                    <div className="bg-AppGreen h-10 w-10 text-center  -rotate-45">
                      <div className="rotate-45 text-white bg-AppGreen h-10 w-10 text-center  font-bold text-sm p-2">
                        {item.ayahNumber}
                      </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 mx-4 min-w-0">
                      <div className="text-[16px] font-bold truncate">
                        {item.surahName}
                      </div>
                      <div className="text-sm opacity-80 truncate" dir="rtl">
                        {item.ayahText.slice(0, 50)}.....
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
        </div>
        <div className="flex items-center uppercase font-black gap-3">
          {filterArrays.map((filter) => (
            <div
              key={filter.id}
              onClick={() => setSelected(filter.id)}
              className={
                select === filter.id ? "border-b-2 border-AppGreen " : ""
              }
            >
              {t(filter.translationKey)}
            </div>
          ))}
        </div>
        {/* surahs */}
        <div
          className={
            select !== 1 ? "hidden" : " w-full lg:w-[85%] flex flex-col gap-5 "
          }
        >
          <div className="flex  flex-wrap  gap-2 lg:gap-5 py-10">
            {!showall ? (
              filteredSurahs.length > 0 ? (
                filteredSurahs.slice(0, 10).map((surah) => (
                  <Link
                    key={surah.number}
                    to={`/surah/${surah.number}`}
                    className="w-[180px] lg:w-[250px] border hover:border-AppGreen px-4 py-3 flex items-center justify-between rounded-2xl"
                  >
                    <div className="bg-AppGreen h-10 w-10 text-center  -rotate-45">
                      <div className="rotate-45 bg-AppGreen text-AppWhite h-10 w-10 text-center p-2"> {surah.number}</div>
                    </div>
                    <div className="flex flex-col ">
                      <div className="text-[12px] font-bold">
                        {" "}
                        {surah.englishName}
                      </div>
                      <div className="text-[12px]">
                        {" "}
                        {surah.englishNameTranslation}
                      </div>
                    </div>

                    <div className="flex flex-col ">
                      <div className="text-xs"> {surah.name}</div>
                      <div> {surah.numberOfAyahs} {t("ayahs")}</div>
                    </div>
                  </Link>
                ))
              ) : error ? (
                <AppError error={error} />
              ) : loading ? (
                <Apploader size={20} />
              ) : (
                <p className="w-full py-8 text-center opacity-70">
                  {searchQuery ? t("noSurahsMatch") : t("noChapters")}
                </p>
              )
            ) : filteredSurahs.length > 0 ? (
              filteredSurahs.map((surah) => (
                <Link
                  key={surah.number}
                  to={`/surah/${surah.number}`}
                  className="w-[180px] lg:w-[250px] border hover:border-AppGreen px-3 py-3 flex items-center justify-between rounded-2xl"
                >
                    <div className="bg-AppGreen h-10 w-10 text-center  -rotate-45">
                      <div className="rotate-45 bg-AppGreen text-AppWhite h-10 w-10 text-center p-2"> {surah.number}</div>
                    </div>
                  <div className="flex flex-col ">
                    <div className="text-[12px] font-bold">
                      {" "}
                      {surah.englishName}
                    </div>
                    <div className="text-[12px]">
                      {" "}
                      {surah.englishNameTranslation}
                    </div>
                  </div>

                    <div className="flex flex-col ">
                    <div className="text-xs"> {surah.name}</div>
                    <div> {surah.numberOfAyahs} {t("ayahs")}</div>
                  </div>
                </Link>
              ))
            ) : error ? (
              <AppError error={error} />
            ) : loading ? (
              <Apploader size={20} />
            ) : (
              <p className="w-full py-8 text-center opacity-70">
                {searchQuery ? t("noSurahsMatch") : t("noChapters")}
              </p>
            )}
          </div>
          {/* show full btn */}
          <div
            onClick={() => setshowall(!showall)}
            className="capitalize  bg-AppGreen text-AppWhite w-max px-3 py-1 rounded-md cursor-pointer mx-auto"
          >
            {showall ? (
              <span className="flex items-center">
                {t("showLessSurahs")} <GoTriangleDown />
              </span>
            ) : (
              <span className="flex items-center">
                {t("showAllSurahs")} <GoTriangleUp />
              </span>
            )}
          </div>
        </div>

        {/* juz */}
        <div className={select !== 2 ? "hidden" : ""}>
          <JuzPage select={select} searchQuery={searchQuery} />
        </div>

        {/* favorites */}
        <div
          className={
            select !== 3 ? "hidden" : "w-full lg:w-[85%] flex flex-col gap-5 py-10"
          }
        >
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-16 opacity-70">
              <p className="text-lg">
                {searchQuery ? t("noFavoritesMatch") : t("noFavoritesYet")}
              </p>
              <p className="text-sm mt-2">
                {!searchQuery && t("addToFavoritesHint")}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 lg:gap-5">
              {filteredFavorites.map((fav) => (
                <Link
                  key={`${fav.surahNumber}-${fav.ayahNumber}`}
                  to={`/surah/${fav.surahNumber}?ayah=${fav.ayahNumber}`}
                  className="w-[200px] lg:w-[250px] border hover:border-AppGreen px-3 py-3 flex items-center justify-between rounded-2xl"
                >
               
                    <div className="bg-AppGreen h-10 w-10 text-center  -rotate-45">
                      <div className="rotate-45 bg-AppGreen text-AppWhite h-10 w-10 text-center p-2"> {fav.ayahNumber}</div>
                    </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="text-[12px] font-bold truncate">
                      {fav.surahName}
                    </div>
                    <div className="text-xs opacity-80 truncate" dir="rtl">
                      {fav.ayahText}...
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <GeneralFooter />

      {showDownloadApp && !isStandalone && (
        <button
          type="button"
          onClick={handleInstallApp}
          className="fixed animate-bounce bottom-5 right-4 z-50 flex cursor-pointer items-center gap-2 rounded-full border-0 bg-AppGreen px-4 py-3 text-sm font-semibold text-AppWhite shadow-lg shadow-black/25 transition-opacity hover:opacity-90 md:bottom-6 md:right-6"
          aria-label={t("installApp")}
        >
          <MdDownload className="shrink-0" size={22} />
          <span>{t("installApp")}</span>
        </button>
      )}
    </div>
  );
};
export default Dashboard;

import { CiSearch } from "react-icons/ci";
import { IoMdArrowForward } from "react-icons/io";
import { MdFavorite } from "react-icons/md";
import { Link } from "react-router";
import useFetch from "../hooks/usefetch";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import { filterArrays } from "../components/arrays";
import { useState, useMemo } from "react";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import JuzPage from "./juz";
import { useFavorites } from "../context/favoritesContext";
import GeneralFooter from "../components/GeneralFooter";

const Dashboard = () => {
  const [Url] = useState(
    "https://api.alquran.cloud/v1/quran/quran-uthmani",
  );
  const { data, error, loading } = useFetch(Url);
  const { favorites } = useFavorites();
  const [select, setSelected] = useState(1);
  const [showall, setshowall] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
          <source src="/public/videos/Qur'an vid.mp4" type="video/mp4" />
        </video>

        <div className="bg-black/55 text-AppWhite  absolute top-0 h-[80vh] w-full flex flex-col  px-11">
          <div className="w-full lg:w-[80%] flex justify-between items-center gap-4 lg:gap-16">
            <div className="my-8 flex items-center flex-1 lg:w-[30%] border rounded-2xl bg-white/10">
              <input
                type="text"
                placeholder="Search surahs, ayahs..."
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
              Read, Listen, Search, and Reflect on the Quran
            </div>
            <Link
              to="/surah"
              className="lg:text-2xl w-full bg-AppGreen rounded-xl text-center flex items-center gap-3 justify-center py-3"
            >
              Explore
              <IoMdArrowForward />
            </Link>
          </div>
        </div>
      </section>

      <section className="p-7">
        <div className="flex items-center uppercase font-black gap-3">
          {filterArrays.map((filter) => (
            <div
              key={filter.id}
              onClick={() => setSelected(filter.id)}
              className={
                select === filter.id ? "border-b-2 border-AppGreen " : ""
              }
            >
              {filter.name}
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
                    <div className="bg-AppGreen h-10 w-10 text-center p-2 -rotate-45">
                      <div className="rotate-45"> {surah.number}</div>
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
                      <div> {surah.numberOfAyahs} Ayahs</div>
                    </div>
                  </Link>
                ))
              ) : error ? (
                <AppError error={error} />
              ) : loading ? (
                <Apploader size={20} />
              ) : (
                <p className="w-full py-8 text-center opacity-70">
                  {searchQuery ? "No surahs match your search." : "no chapters!"}
                </p>
              )
            ) : filteredSurahs.length > 0 ? (
              filteredSurahs.map((surah) => (
                <Link
                  key={surah.number}
                  to={`/surah/${surah.number}`}
                  className="w-[180px] lg:w-[250px] border hover:border-AppGreen px-3 py-3 flex items-center justify-between rounded-2xl"
                >
                  <div className="bg-AppGreen h-10 w-10 text-center p-2 -rotate-45">
                    <div className="rotate-45"> {surah.number}</div>
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
                    <div> {surah.numberOfAyahs} Ayahs</div>
                  </div>
                </Link>
              ))
            ) : error ? (
              <AppError error={error} />
            ) : loading ? (
              <Apploader size={20} />
            ) : (
              <p className="w-full py-8 text-center opacity-70">
                {searchQuery ? "No surahs match your search." : "no chapters!"}
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
                Show Less Surahs <GoTriangleDown />
              </span>
            ) : (
              <span className="flex items-center">
                Show All Surahs <GoTriangleUp />
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
                {searchQuery ? "No favorites match your search." : "No favorites yet."}
              </p>
              <p className="text-sm mt-2">
                {!searchQuery &&
                  'Click on any ayah and select "Add to favorites" to save it here.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 lg:gap-5">
              {filteredFavorites.map((fav) => (
                <Link
                  key={`${fav.surahNumber}-${fav.ayahNumber}`}
                  to={`/surah/${fav.surahNumber}`}
                  className="w-[200px] lg:w-[250px] border hover:border-AppGreen px-3 py-3 flex items-center justify-between rounded-2xl"
                >
                  <div className="bg-AppGreen h-10 w-10 text-center p-2 -rotate-45">
                    <div className="rotate-45">{fav.ayahNumber}</div>
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
    </div>
  );
};
export default Dashboard;

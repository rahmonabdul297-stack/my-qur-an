import { Link } from "react-router";
import useFetch from "../hooks/usefetch";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import { useState } from "react";
import GeneralFooter from "../components/GeneralFooter";

const SurahPage = () => {
  const { data, error, loading } = useFetch(
    "https://api.alquran.cloud/v1/quran/quran-uthmani",
  );
const [order, setOrder] = useState(false);
  const surahs = data?.data?.surahs ?? [];

  if (loading) return <Apploader size={20} />;
  if (error) return <AppError error={error} />;

  return (
    <div className="py-7 font-[ubuntu-sans-mono-font]">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-AppGreen hover:underline mb-6 px-7">
        ← Back to Dashboard
      </Link>
      <div className="flex justify-between items-center mb-6 px-7">
      <h1 className="text-2xl font-bold ">Surahs</h1>
     <div className="flex items-center gap-2">
     <h1  className="flex items-center gap-2 font-bold text-2xl">Order by:</h1>
      <button onClick={() => setOrder(!order)} className="text-AppGreen hover:underline">
        {order ? "Descending" : "Ascending"}
      </button>
     </div>
      </div>
      <div className={order ? `flex flex-wrap flex-col-reverse lg:flex-row gap-2 lg:gap-5 p-7`:`flex flex-wrap flex-col lg:flex-row gap-2 lg:gap-5 p-7 mx-auto`}>
        {surahs.length > 0 ? (
          surahs.map((surah) => (
            <Link
              key={surah.number}
              to={`/surah/${surah.number}`}
              className="w-full  lg:w-[250px] border hover:border-AppGreen px-3 py-3 flex items-center justify-between rounded-2xl"
            >
              <div className="bg-AppGreen h-10 w-10 text-center p-2 -rotate-45">
                <div className="rotate-45">{surah.number}</div>
              </div>
              <div className="flex flex-col">
                <div className="text-[12px] font-bold">
                  {surah.englishName}
                </div>
                <div className="text-[12px]">
                  {surah.englishNameTranslation}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xs">{surah.name}</div>
                <div>{surah.numberOfAyahs} Ayahs</div>
              </div>
            </Link>
          ))
        ) : (
          <p className="w-full py-8 text-center opacity-70">No chapters!</p>
        )}
      </div>
      <GeneralFooter />
    </div>
  );
};

export default SurahPage;

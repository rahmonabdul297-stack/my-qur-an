import { Link } from "react-router";
import { useFavorites } from "../context/favoritesContext";

const Favorites = () => {
  const { favorites } = useFavorites();

  return (
    <div className="p-7 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-16 opacity-70">
          <p className="text-lg">No favorites yet.</p>
          <p className="text-sm mt-2">
            Click on any ayah and select &quot;Add to favorites&quot; to save it here.
          </p>
          <Link
            to="/dashboard"
            className="inline-block mt-4 text-AppGreen hover:underline"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {favorites.map((fav) => (
            <Link
              key={`${fav.surahNumber}-${fav.ayahNumber}`}
              to={`/surah/${fav.surahNumber}?ayah=${fav.ayahNumber}`}
              className="flex gap-4 p-4 rounded-xl border border-transparent hover:border-AppGreen bg-AppGray/10 transition-colors"
            >
              <span className="surah-number-hex shrink-0 text-sm">
                {fav.ayahNumber}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{fav.surahName}</p>
                <p className="text-sm opacity-80 mt-1" dir="rtl">
                  {fav.ayahText}...
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;

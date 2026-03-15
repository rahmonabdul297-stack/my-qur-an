import { useContext } from "react";
import { Link } from "react-router";
import { useState, useMemo, useEffect } from "react";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import GeneralFooter from "../components/GeneralFooter";
import { CiSearch } from "react-icons/ci";
import { LanguageContext } from "../context/languageContext";

// Raw GitHub JSON - reliable, no CORS issues, no API key
const DUAS_SOURCES = [
  {
    url: "https://raw.githubusercontent.com/fitrahive/dua-dhikr/main/data/dua-dhikr/daily-dua/en.json",
    category: "daily",
  },
  {
    url: "https://raw.githubusercontent.com/fitrahive/dua-dhikr/main/data/dua-dhikr/dhikr-after-salah/en.json",
    category: "prayer",
  },
];

const CATEGORIES = [
  { value: "all", labelKey: "all" },
  { value: "daily", labelKey: "daily" },
  { value: "prayer", labelKey: "afterSalah" },
];

const Prayer = () => {
  const { t } = useContext(LanguageContext);
  const [duas, setDuas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          DUAS_SOURCES.map(async ({ url, category }) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to fetch ${category}`);
            const data = await res.json();
            return (Array.isArray(data) ? data : []).map((d, i) => ({
              ...d,
              id: `${category}-${i}`,
              category,
              // Normalize field names for display
              dua: d.arabic,
              transliteration: d.latin,
              description: d.translation,
              benefits: d.benefits,
              source: d.source,
            }));
          })
        );
        setDuas(results.flat());
      } catch (err) {
        setError(err.message || "Failed to load supplications. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredDuas = useMemo(() => {
    let result = duas;

    if (selectedCategory !== "all") {
      result = result.filter(
        (dua) => dua.category?.toLowerCase() === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (dua) =>
          dua.title?.toLowerCase().includes(q) ||
          dua.description?.toLowerCase().includes(q) ||
          dua.transliteration?.toLowerCase().includes(q) ||
          dua.dua?.includes(searchQuery.trim())
      );
    }

    return result;
  }, [duas, selectedCategory, searchQuery]);

  if (loading) return <Apploader size={20} />;
  if (error) return <AppError error={error} />;

  return (
    <div className="py-7 font-[ubuntu-sans-mono-font] min-h-screen">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-AppGreen hover:underline mb-6 px-7"
      >
        ← {t("backToDashboard")}
      </Link>

      <div className="px-7 mb-6 ">
        <h1 className="text-2xl font-bold mb-4">{t("supplicationsTitle")}</h1>
        <p className="text-sm opacity-80 mb-4">
          {t("supplicationsSubtitle")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center border rounded-xl px-3 py-2 bg-white/5">
            <CiSearch className="shrink-0 opacity-70" size={20} />
            <input
              type="text"
              placeholder={t("searchDuasPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none px-2 text-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-xl px-4 py-2 bg-white/5 capitalize min-w-[140px]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {t(cat.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-7 flex flex-col gap-4 pb-8 font-[playpen-sans-arabic]">
        {filteredDuas.length > 0 ? (
          filteredDuas.map((dua) => (
            <article
              key={dua.id}
              className="border rounded-2xl p-5 hover:border-AppGreen/50 transition-colors"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="bg-AppGreen/20 text-AppGreen text-xs font-bold px-2 py-0.5 rounded capitalize">
                  {dua.category}
                </span>
                {dua.notes && (
                  <span className="text-xs opacity-70">({dua.notes})</span>
                )}
              </div>
              <h2 className="text-lg font-bold mb-2">{dua.title}</h2>
              {dua.description && (
                <p className="text-sm opacity-80 mb-2">{dua.description}</p>
              )}
              <div
                className="text-xl md:text-2xl font-[playpen-sans-arabic] text-right mb-2 leading-loose"
                dir="rtl"
              >
                {dua.dua}
              </div>
              {dua.transliteration && (
                <p className="text-sm italic opacity-90 mb-2">
                  {dua.transliteration}
                </p>
              )}
              {dua.benefits && (
                <p className="text-xs opacity-75 border-t pt-2 mt-2">
                  {dua.benefits}
                </p>
              )}
              {dua.source && (
                <p className="text-xs opacity-60 mt-1">{dua.source}</p>
              )}
            </article>
          ))
        ) : (
          <p className="w-full py-12 text-center opacity-70">
            {t("noSupplicationsFound")}
          </p>
        )}
      </div>

      <GeneralFooter />
    </div>
  );
};

export default Prayer;

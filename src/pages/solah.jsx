import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import AppError from "../components/Apperror";
import { Apploader } from "../components/Apploader";
import GeneralFooter from "../components/GeneralFooter";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { IoRefresh } from "react-icons/io5";

const PRAYERS = [
  { key: "Fajr", label: "Fajr", sublabel: "Dawn" },
  { key: "Dhuhr", label: "Dhuhr", sublabel: "Noon" },
  { key: "Asr", label: "Asr", sublabel: "Afternoon" },
  { key: "Maghrib", label: "Maghrib", sublabel: "Sunset" },
  { key: "Isha", label: "Isha", sublabel: "Night" },
];

const fetchPrayerTimes = async (lat, lng) => {
  const res = await fetch(
    `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}`
  );
  if (!res.ok) throw new Error("Failed to fetch prayer times");
  const json = await res.json();
  return json.data;
};

const fetchPrayerTimesByAddress = async (address) => {
  const res = await fetch(
    `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(address)}`
  );
  if (!res.ok) throw new Error("Failed to fetch prayer times");
  const json = await res.json();
  return json.data;
};

const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

const Solah = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timings, setTimings] = useState(null);
  const [date, setDate] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [coords, setCoords] = useState(null);
  const [manualAddress, setManualAddress] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const loadByCoords = useCallback(async (latitude, longitude) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrayerTimes(latitude, longitude);
      setTimings(data.timings);
      setDate(data.date);
      setCoords({ lat: latitude, lng: longitude });
      setLocationName(null);
    } catch (err) {
      setError(err.message || "Could not load prayer times");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadByAddress = useCallback(async (address) => {
    if (!address?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrayerTimesByAddress(address.trim());
      setTimings(data.timings);
      setDate(data.date);
      setLocationName(address.trim());
      setCoords(null);
    } catch (err) {
      setError(err.message || "Could not load prayer times");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported. Enter a city name below.");
      setLoading(false);
      setShowManualInput(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        loadByCoords(latitude, longitude);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location access denied. Enter your city to get prayer times."
            : "Could not get your location. Enter your city below."
        );
        setLoading(false);
        setShowManualInput(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [loadByCoords]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    loadByAddress(manualAddress);
  };

  const handleRetryLocation = () => {
    setShowManualInput(false);
    setManualAddress("");
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => loadByCoords(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        setError(
          err.code === 1
            ? "Location access denied. Enter your city to get prayer times."
            : "Could not get your location."
        );
        setLoading(false);
        setShowManualInput(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading && !timings) return <Apploader size={20} />;

  return (
    <div className="py-7 font-[ubuntu-sans-mono-font] min-h-screen">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-AppGreen hover:underline mb-6 px-7"
      >
        ← Back to Dashboard
      </Link>

      <div className="px-7 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Prayer Times (Salah)</h1>
        <p className="text-sm opacity-80 mb-6">
          Daily prayer times based on your location
        </p>

        {error && !timings && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/50 bg-amber-500/10">
            <p className="text-sm mb-3">{error}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRetryLocation}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-AppGreen text-white text-sm hover:opacity-90"
              >
                <HiOutlineLocationMarker size={18} />
                Use my location
              </button>
              {showManualInput && (
                <form
                  onSubmit={handleManualSubmit}
                  className="flex flex-1 min-w-[200px] gap-2"
                >
                  <input
                    type="text"
                    placeholder="Enter city (e.g. London, Cairo)"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border bg-transparent text-sm outline-none focus:border-AppGreen"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-AppGreen text-white text-sm hover:opacity-90 shrink-0"
                  >
                    Get times
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {error && timings && (
          <AppError error={error} />
        )}

        {timings && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {locationName ? (
                <span className="flex items-center gap-1.5 text-sm opacity-80">
                  <HiOutlineLocationMarker size={16} />
                  {locationName}
                </span>
              ) : coords ? (
                <span className="flex items-center gap-1.5 text-sm opacity-80">
                  <HiOutlineLocationMarker size={16} />
                  Your location
                </span>
              ) : null}
              {date?.readable && (
                <span className="text-sm opacity-70">• {date.readable}</span>
              )}
              <button
                type="button"
                onClick={() =>
                  coords
                    ? loadByCoords(coords.lat, coords.lng)
                    : loadByAddress(locationName)
                }
                className="flex items-center gap-1 text-AppGreen text-sm hover:underline ml-auto"
                title="Refresh"
              >
                <IoRefresh size={16} />
                Refresh
              </button>
            </div>

            <div className="grid gap-3">
              {PRAYERS.map(({ key, label, sublabel }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 rounded-xl border hover:border-AppGreen/50 transition-colors bg-AppGray/5"
                >
                  <div>
                    <p className="font-bold">{label}</p>
                    <p className="text-xs opacity-70">{sublabel}</p>
                  </div>
                  <p className="text-lg font-semibold text-AppGreen tabular-nums">
                    {formatTime(timings[key])}
                  </p>
                </div>
              ))}
            </div>

            {!showManualInput && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  className="text-sm text-AppGreen hover:underline"
                >
                  Use a different city
                </button>
              </div>
            )}

            {showManualInput && (
              <form
                onSubmit={handleManualSubmit}
                className="mt-6 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Enter city (e.g. London, Cairo)"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border bg-transparent text-sm outline-none focus:border-AppGreen"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-AppGreen text-white text-sm hover:opacity-90"
                >
                  Update
                </button>
              </form>
            )}
          </>
        )}
      </div>

      <GeneralFooter />
    </div>
  );
};

export default Solah;

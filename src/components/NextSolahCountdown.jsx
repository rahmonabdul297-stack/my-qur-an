import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { HiOutlineLocationMarker } from "react-icons/hi";

const PRAYERS = [
  { key: "Fajr", label: "Fajr" },
  { key: "Dhuhr", label: "Dhuhr" },
  { key: "Asr", label: "Asr" },
  { key: "Maghrib", label: "Maghrib" },
  { key: "Isha", label: "Isha" },
];

const fetchPrayerTimes = async (lat, lng) => {
  const res = await fetch(
    `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}`
  );
  if (!res.ok) throw new Error("Failed to fetch");
  const json = await res.json();
  return json.data;
};

const fetchPrayerTimesByAddress = async (address) => {
  const res = await fetch(
    `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(address)}`
  );
  if (!res.ok) throw new Error("Failed to fetch");
  const json = await res.json();
  return json.data;
};

const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return { hours: h, minutes: m };
};

const getNextPrayer = (timings) => {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  for (const { key } of PRAYERS) {
    const t = parseTime(timings?.[key]);
    if (!t) continue;
    const prayerMins = t.hours * 60 + t.minutes;
    if (prayerMins > currentMins) {
      return { key, ...t, totalMins: prayerMins };
    }
  }
  const first = parseTime(timings?.Fajr);
  if (first) {
    return { key: "Fajr", ...first, totalMins: first.hours * 60 + first.minutes + 24 * 60 };
  }
  return null;
};

const getRemainingMins = (next, currentMins) => {
  if (!next) return 0;
  if (next.key === "Fajr" && next.totalMins > 24 * 60) {
    return (24 * 60 - currentMins) + (next.totalMins - 24 * 60);
  }
  let remaining = next.totalMins - currentMins;
  if (remaining < 0) remaining += 24 * 60;
  return Math.max(0, remaining);
};

const formatCountdown = (mins) => {
  if (mins <= 0) return "Now";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const LOCATION_KEY = "quran-prayer-location";

const NextSolahCountdown = () => {
  const [timings, setTimings] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState(null);

  const loadByCoords = useCallback(async (lat, lng) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrayerTimes(lat, lng);
      setTimings(data.timings);
      setLocationName(null);
    } catch (err) {
      setError(err.message);
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
      setLocationName(address.trim());
      try {
        localStorage.setItem(LOCATION_KEY, address.trim());
      } catch {}
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(LOCATION_KEY);
    if (stored?.trim()) {
      loadByAddress(stored);
      return;
    }
    if (!navigator.geolocation) {
      setError("Enable location for prayer times");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => loadByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        setError("Location denied");
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, [loadByCoords, loadByAddress]);

  useEffect(() => {
    if (!timings) return;
    const next = getNextPrayer(timings);
    setNextPrayer(next);

    const update = () => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      if (next) {
        setCountdown(getRemainingMins(next, currentMins));
      }
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [timings]);

  if (loading && !timings) {
    return (
      <div className="p-4 rounded-xl border border-AppGreen/30 bg-AppGray/10 animate-pulse">
        <div className="h-5 w-32 bg-AppGray/30 rounded mb-2" />
        <div className="h-8 w-24 bg-AppGray/30 rounded" />
      </div>
    );
  }

  if (error && !timings) {
    return (
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
        <p className="text-sm opacity-80 mb-2">{error}</p>
        <Link
          to="/solah"
          className="text-sm text-AppGreen hover:underline"
        >
          Set location →
        </Link>
      </div>
    );
  }

  const prayerLabel = nextPrayer ? PRAYERS.find((p) => p.key === nextPrayer.key)?.label : null;

  return (
    <div className="p-4 rounded-xl border border-AppGreen/30 bg-AppGray/10">
      <div className="flex items-center gap-1.5 text-xs opacity-70 mb-1">
        {locationName ? (
          <>
            <HiOutlineLocationMarker size={14} />
            {locationName}
          </>
        ) : timings ? (
          <>
            <HiOutlineLocationMarker size={14} />
            Your location
          </>
        ) : null}
      </div>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">
        Next prayer
      </p>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xl font-bold text-AppGreen">
          {prayerLabel || "—"}
        </span>
        <span className="text-lg font-semibold tabular-nums">
          {countdown != null ? formatCountdown(countdown) : "—"}
        </span>
      </div>
      <Link
        to="/solah"
        className="text-xs text-AppGreen hover:underline mt-2 inline-block"
      >
        View all times →
      </Link>
    </div>
  );
};

export default NextSolahCountdown;

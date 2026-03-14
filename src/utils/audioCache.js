const CACHE_NAME = "quran-audio-v1";

export const getCachedAudioUrl = async (url) => {
  if (!url) return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(url);
    if (!response) {
      response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch audio");
      await cache.put(url, response.clone());
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    if (!navigator.onLine) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(url);
      if (cached) {
        const blob = await cached.blob();
        return URL.createObjectURL(blob);
      }
    }
    throw err;
  }
};

/**
 * Reciters - CDN: https://cdn.islamic.network/quran/audio/{bitrate}/{id}/{ayahNumber}.mp3
 * ar.dosari uses Every Ayah: https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/{surah}{ayah}.mp3
 */
export const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Alafasy", bitrate: 128 },
  { id: "ar.abdurrahmaansudais", name: "Abdurrahman As-Sudais", bitrate: 64 },
  { id: "ar.mahermuaiqly", name: "Maher Al Muaiqly", bitrate: 128 },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit", bitrate: 64 },
  { id: "ar.abdulsamad", name: "Abdul Samad", bitrate: 64 },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", bitrate: 128 },
  { id: "ar.minshawi", name: "Mohamed Siddiq Al-Minshawi", bitrate: 128 },
  { id: "ar.ahmedajamy", name: "Ahmed Al-Ajamy", bitrate: 128 },
  { id: "ar.shaatree", name: "Abu Bakr Ash-Shaatree", bitrate: 128 },
  { id: "ar.saoodshuraym", name: "Saood Ash-Shuraym", bitrate: 64 },
  { id: "ar.hudhaify", name: "Ali Al-Hudhaify", bitrate: 128 },
  { id: "ar.muhammadayyoub", name: "Muhammad Ayyoub", bitrate: 128 },
  { id: "ar.muhammadjibreel", name: "Muhammad Jibreel", bitrate: 128 },
  { id: "ar.abdullahbasfar", name: "Abdullah Basfar", bitrate: 64 },
  { id: "ar.husarymujawwad", name: "Husary (Mujawwad)", bitrate: 128 },
  { id: "ar.minshawimujawwad", name: "Minshawi (Mujawwad)", bitrate: 64 },
  { id: "ar.hanirifai", name: "Hani Rifai", bitrate: 64 },
  { id: "ar.aymanswoaid", name: "Ayman Sowaid", bitrate: 64 },
  { id: "ar.dosari", name: "Yasser Al-Dosari", audioSource: "everyayah" },
];

export const DEFAULT_RECITER = "ar.dosari";
export const AUDIO_BASE = "https://cdn.islamic.network/quran/audio";
const EVERYAYAH_DOSARI = "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps";

export const getAudioUrl = (reciterId, ayahNumber, options = {}) => {
  if (ayahNumber == null) return null;
  const reciter = RECITERS.find((r) => r.id === reciterId);
  if (reciter?.audioSource === "everyayah" && options.surahNumber != null && options.numberInSurah != null) {
    const s = String(options.surahNumber).padStart(3, "0");
    const a = String(options.numberInSurah).padStart(3, "0");
    return `${EVERYAYAH_DOSARI}/${s}${a}.mp3`;
  }
  const bitrate = reciter?.bitrate ?? 128;
  const id = reciter?.id ?? reciterId;
  return `${AUDIO_BASE}/${bitrate}/${id}/${ayahNumber}.mp3`;
};

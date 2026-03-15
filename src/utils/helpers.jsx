import { toast } from "react-toastify"

export const successNotification=(message)=>{
    toast.success(message)
}
export const errorNotification=(message)=>{
    toast.error(message)
}
export const infoNotification=(message)=>{
    toast.info(message)
}

const ARABIC_NUMERALS = "٠١٢٣٤٥٦٧٨٩";
export const toArabicNumbers = (num) => {
  if (num == null || num === "") return "";
  return String(num).replace(/\d/g, (d) => ARABIC_NUMERALS[parseInt(d, 10)]);
};

export const groupAyahsByPage = (ayahs) => {
  if (!ayahs?.length) return [];
  const groups = [];
  let currentPage = null;
  let currentGroup = [];
  for (const ayah of ayahs) {
    const page = ayah.page ?? 0;
    if (page !== currentPage) {
      if (currentGroup.length > 0) {
        groups.push({ page: currentPage, ayahs: currentGroup });
      }
      currentPage = page;
      currentGroup = [ayah];
    } else {
      currentGroup.push(ayah);
    }
  }
  if (currentGroup.length > 0) {
    groups.push({ page: currentPage, ayahs: currentGroup });
  }
  return groups;
};
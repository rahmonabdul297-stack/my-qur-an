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
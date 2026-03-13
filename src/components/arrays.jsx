import { BsHouse } from "react-icons/bs";
import { CiAlarmOn } from "react-icons/ci";
import { MdFavorite } from "react-icons/md";
import { GiPrayerBeads } from "react-icons/gi";
import { HiOutlineBookOpen } from "react-icons/hi";

export const NavArrays = [
  { id: 1, name: "dashboard", icon: <BsHouse />, path: "/dashboard" },
  { id: 2, name: "solah", icon: <CiAlarmOn />, path: "/solah" },
  { id: 3, name: "surah", icon: <HiOutlineBookOpen />, path: "/surah" },
  { id: 4, name: "prayer", icon: <GiPrayerBeads />, path: "/prayer" },
  { id: 5, name: "favorites", icon: <MdFavorite />, path: "/favorites" },
];

export const filterArrays = [
  { id: 1, name: "surah ",  },
  { id: 2, name: "juz ", },
  { id: 3, name: "favorites ", },
];
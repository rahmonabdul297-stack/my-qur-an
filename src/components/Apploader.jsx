import { useContext } from "react";
import { ClipLoader } from "react-spinners";
import { ThemeContext } from "../context/themeContext";

export const Apploader = ({ size = 60 }) => {
  const {theme}=useContext(ThemeContext)
  return (
    <div className={`w-full h-screen ${theme?"text-AppWhite":"text-AppBlack"} flex justify-center items-center text-center py-10`}>
      <ClipLoader
        size={size}
        aria-label="loading spinner"
        data-testid="loader"
      />
    </div>
  );
};
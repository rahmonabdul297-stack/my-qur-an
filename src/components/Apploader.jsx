import { ClipLoader } from "react-spinners";

export const Apploader = ({ size = 40 }) => {
  return (
    <div className="w-full text-AppBlack flex justify-center items-center text-center py-10">
      <ClipLoader
        size={size}
        aria-label="loading spinner"
        data-testid="loader"
      />
    </div>
  );
};
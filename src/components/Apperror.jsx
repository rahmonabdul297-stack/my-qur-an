import { CiCloudOff } from "react-icons/ci";

const AppError=({error})=>{
    return<div className="h-screen capitalize rounded-lg flex flex-col items-center justify-center text-red-600 font-bold text-center">
        <CiCloudOff size={150} />
        {error}
        </div>
}
export default AppError;
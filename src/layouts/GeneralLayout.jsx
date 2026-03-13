import { Outlet } from "react-router";
import GeneralHeader from "../components/GeneralHeader";
const GeneralLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row overflow-x-hidden">
      <GeneralHeader />

    <div className="mt-16 lg:mt-0 lg:ml-[205px] w-full">
          <Outlet />
       
    </div>


    </div>
  );
};

export default GeneralLayout;

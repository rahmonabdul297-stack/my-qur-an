import { Link } from "react-router";
import { NavArrays } from "./arrays";
import Logo from "./logo";

const GeneralFooter = () => {
  return (
    <div className="p-10 h-max w-full bg-AppBlack text-AppWhite  ">
      <section className="lg:w-[85%] flex justify-between ">
        <section className=" w-full lg:w-[230px]  flex flex-col ">
          <h1 className="text-2xl font-bold capitalize">quick links</h1>
          <div className="flex flex-col gap-3 py-3">
            {NavArrays.map((item) => (
              <Link key={item.id} to={item.path}>
                <div
                  className={`flex items-start gap-2  rounded-md px-3 py-1 capitalize`}
                >
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="hidden  lg:flex w-[40%]   flex-col items-center justify-center">
          <Logo />
          <p className="text-xs text-center">
            DailyQur'an is a platform that helps you learn the Quran in a fun
            and easy way.
          </p>
        </section>

        <section className="w-[300px] flex flex-col  ">
          <h1 className="text-2xl font-bold capitalize">Popular search</h1>
          <div className="flex flex-col gap-3 py-3">
            <Link to="/surah/2?ayah=255">
              <div className="flex items-start gap-2 rounded-md px-3 py-1 capitalize hover:opacity-80">
                <span>Ayah Al Kursiyh</span>
              </div>
            </Link>
            <Link to="/surah/67">
              <div className="flex items-start gap-2 rounded-md px-3 py-1 capitalize hover:opacity-80">
                <span>Surah Al Mulk</span>
              </div>
            </Link>
            <Link to="/surah/36">
              <div className="flex items-start gap-2 rounded-md px-3 py-1 capitalize hover:opacity-80">
                <span>Surah Yasin</span>
              </div>
            </Link>
            <Link to="/surah/18">
              <div className="flex items-start gap-2 rounded-md px-3 py-1 capitalize hover:opacity-80">
                <span>Surah Al Kahf</span>
              </div>
            </Link>
          </div>
        </section>

        
      </section>
      <section className="flex lg:hidden w-full border-b my-10 py-3  flex-col items-center justify-center">
          <Logo />
          <p className="text-xs text-center">
            DailyQur'an is a platform that helps you learn the Quran in a fun
            and easy way.
          </p>
        </section>
        <div className="w-[85%]   lg:border-t text-xs">
          <p className="text-center py-3">Copyright © 2026 DailyQur'an. All rights reserved.</p>
        </div>
    </div>
  );
};

export default GeneralFooter;

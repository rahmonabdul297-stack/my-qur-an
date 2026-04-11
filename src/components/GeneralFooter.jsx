import { useContext } from "react";
import { Link } from "react-router";
import { NavArrays } from "./arrays";
import Logo from "./logo";
import { LanguageContext } from "../context/languageContext";
import { MdEmail } from "react-icons/md";
import { IoLogoWhatsapp, IoPhonePortraitOutline } from "react-icons/io5";

const GeneralFooter = () => {
  const { t } = useContext(LanguageContext);

  const devSection = (
    <div className="flex flex-col gap-2 items-center">
      <h3 className="text-base sm:text-xl text-center font-bold capitalize">
        Non-profit projects owned, managed, or sponsored by:
      </h3>
    <div className="flex items-center gap-3">
        <img
        src="/images/my-img.jpg"
        alt="Dev. Abdulrahmon Yekini"
        className="w-8 h-8 sm:w-12 sm:h-12 rounded-full"
      />
      <p className="text-sm uppercase">Engr. Abdulrahmon Yekini</p>
    </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
       
        <Link
          to="https://abdulrahmon-portfolio-website.vercel.app/"
          className="text-sm flex items-center gap-1 capitalize hover:opacity-80 text-AppGreen underline"
        >
         visit portfolio
        </Link>
      
      </div>
    </div>
  );

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10 lg:p-10 h-max w-full bg-AppBlack text-AppWhite">
      <section className="w-full max-w-[85%] mx-auto flex  lg:justify-between gap-10 lg:gap-6">
        <section className="w-full lg:w-[230px] flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold capitalize">
            {t("quickLinks")}
          </h1>
          <div className="flex flex-col gap-3 py-3">
            {NavArrays.map((item) => (
              <Link key={item.id} to={item.path}>
                <div className="flex items-start gap-2 rounded-md px-3 py-1 capitalize hover:opacity-80">
                  <span>{t(item.name)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="hidden lg:flex w-[40%] flex-col items-center justify-center gap-4">
          {devSection}
          <Logo />
          <p className="text-xs text-center">{t("footerDescription")}</p>
        </section>

        <section className="w-full lg:w-[300px] flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold capitalize">
            {t("popularSearch")}
          </h1>
          <div className="flex flex-col gap-3 py-3">
            <Link to="/surah/2?ayah=255">
              <div className="flex items-start gap-2 rounded-md px-3 py-1 capitalize hover:opacity-80">
                <span>{t("ayahAlKursiyh")}</span>
              </div>
            </Link>
            <Link to="/surah/67">
              <div className="flex items-start gap-2 rounded-md px-3 py-1 capitalize hover:opacity-80">
                <span>{t("surahAlMulk")}</span>
              </div>
            </Link>
            <Link to="/surah/36">
              <div className="flex items-start gap-2 rounded-md px-3 py-1 capitalize hover:opacity-80">
                <span>{t("surahYasin")}</span>
              </div>
            </Link>
            <Link to="/surah/18">
              <div className="flex items-start gap-2 rounded-md px-3 py-1 capitalize hover:opacity-80">
                <span>{t("surahAlKahf")}</span>
              </div>
            </Link>
          </div>
        </section>
      </section>
      <div className="flex lg:hidden flex-col gap-4 items-center text-center pt-20">
        {devSection}
      </div>
      <section className="flex lg:hidden w-full max-w-[85%] mx-auto border-b border-AppWhite/20 my-8 py-6 flex-col items-center justify-center">
        <Logo />
        <p className="text-xs text-center mt-2 px-2">
          {t("footerDescription")}
        </p>
      </section>

      <div className="w-full max-w-[85%] mx-auto lg:border-t lg:border-AppWhite/20 text-xs">
        <p className="text-center py-3 px-2">{t("copyright")}</p>
      </div>
    </div>
  );
};

export default GeneralFooter;

import { useContext, useState } from "react";
import { Link, useLocation } from "react-router";
import { ThemeContext } from "../context/themeContext";
import { LanguageContext } from "../context/languageContext";
import { CiLight, CiSettings } from "react-icons/ci";
import { GoTriangleDown, GoTriangleRight } from "react-icons/go";
import { HiOutlineBars3, HiLanguage } from "react-icons/hi2";
import Logo from "./logo";
import { MdDarkMode } from "react-icons/md";
import { NavArrays } from "./arrays";

const GeneralHeader = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const { language, setLanguage, t, LANGUAGES } = useContext(LanguageContext);
  const [dropdown, setDropdown] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path || (path === "/dashboard" && location.pathname === "/");

  return (
    <>
      <div
        className={`h-16 w-full lg:w-[200px] px-3 flex flex-row lg:flex-col justify-between items-center ${theme ? "bg-AppBlack text-AppWhite" : "bg-AppWhite text-AppBlack"} lg:h-screen fixed lg:overflow-y-auto font-[ubuntu-sans-mono-font] lg:pb-10 z-20`}
      >
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex lg:hidden p-2 -ml-1 rounded-lg hover:bg-AppGray/20 transition-colors"
            aria-label="Open menu"
          >
            <HiOutlineBars3 size={24} />
          </button>
          <Logo />
        </div>

        <section className="hidden lg:flex flex-col border-t-2 border-AppGreen mt-5">
          <h4 className="font-bold py-4">{t("main")}</h4>
          <div className="flex flex-col gap-3 py-3">
            {NavArrays.map((item) => (
              <Link key={item.id} to={item.path}>
                <div
                  className={`flex items-center gap-2 hover:bg-black/30 hover:text-AppWhite rounded-md px-3 py-1 capitalize ${isActive(item.path) ? "bg-AppGreen text-AppWhite" : ""}`}
                >
                  {item.icon}
                  <span>{t(item.name)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="hidden lg:flex flex-col items-start gap-2 bottom-5 cursor-pointer capitalize border-t-2 mt-10 border-AppGreen">
          <h4 className="font-bold">{t("others")}</h4>
          <div
            className="flex items-center justify-between gap-8 w-full"
            onClick={() => setDropdown(!dropdown)}
          >
            <div className="flex items-center gap-2">
              <CiSettings size={24} />
              {t("settings")}
            </div>
            {dropdown ? <GoTriangleDown /> : <GoTriangleRight />}
          </div>

          <div
            className={dropdown ? "flex items-center gap-2 px-3" : "hidden"}
            onClick={() => setTheme(!theme)}
          >
            {theme ? <MdDarkMode /> : <CiLight />}
            {theme ? t("lightMode") : t("darkMode")}
          </div>
          <div
            className={dropdown ? "flex flex-col w-full" : "hidden"}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between gap-2 px-3 cursor-pointer hover:opacity-80"
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
            >
              <div className="flex items-center gap-2">
                <HiLanguage size={20} />
                {t("language")}
              </div>
              {languageMenuOpen ? <GoTriangleDown /> : <GoTriangleRight />}
            </div>
            {languageMenuOpen && (
              <div className="flex flex-col pl-6 mt-1 gap-0.5">
                {Object.entries(LANGUAGES).map(([code, { name }]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setLanguage(code);
                      setLanguageMenuOpen(false);
                    }}
                    className={`text-left px-2 py-1 rounded text-sm hover:bg-AppGreen/20 ${language === code ? "bg-AppGreen/30 font-semibold" : ""}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex lg:hidden items-center gap-2 px-3"
          onClick={() => setTheme(!theme)}
        >
          {theme ? <MdDarkMode /> : <CiLight />}
        </div>
      </div>

      {/* Mobile menu overlay & dropdown */}
      <div
        className={`fixed inset-0 z-30 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
        <nav
          className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] ${theme ? "bg-AppBlack" : "bg-AppWhite"} shadow-xl transform transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-AppGreen/30 flex justify-between items-center">
            <Logo />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-AppGray/20 text-2xl leading-none"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          <div className="p-4 flex flex-col gap-1">
            <h4 className="font-bold py-3 text-AppGreen">{t("menu")}</h4>
            {NavArrays.map((item, index) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block mobile-nav-item"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-AppGreen text-white"
                      : "hover:bg-AppGray/20"
                  }`}
                >
                  {item.icon}
                  <span className="capitalize">{t(item.name)}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="absolute bottom-10 left-0 right-0 p-4 border-t border-AppGreen/30">
          <div
            className="flex items-center justify-between gap-8 cursor-pointer"
            onClick={() => setDropdown(!dropdown)}
          >
            <div className="flex items-center gap-2 text-xl capitalize">
              <CiSettings size={28} />
              {t("settings")}
            </div>
            {dropdown ? <GoTriangleDown /> : <GoTriangleRight />}
          </div>

          <div
            className={dropdown ? "flex items-center gap-2 px-3 py-3.5 capitalize cursor-pointer" : "hidden"}
            onClick={() => setTheme(!theme)}
          >
            {theme ? <MdDarkMode /> : <CiLight />}
            {theme ? t("lightMode") : t("darkMode")}
          </div>
          <div
            className={dropdown ? "flex flex-col" : "hidden"}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between gap-2 px-3 py-3.5 capitalize cursor-pointer hover:opacity-80"
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
            >
              <div className="flex items-center gap-2">
                <HiLanguage size={24} />
                {t("language")}
              </div>
              {languageMenuOpen ? <GoTriangleDown /> : <GoTriangleRight />}
            </div>
            {languageMenuOpen && (
              <div className="flex flex-col pl-6 pb-2 gap-0.5">
                {Object.entries(LANGUAGES).map(([code, { name }]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setLanguage(code);
                      setLanguageMenuOpen(false);
                    }}
                    className={`text-left px-3 py-2 rounded text-sm hover:bg-AppGreen/20 ${language === code ? "bg-AppGreen/30 font-semibold" : ""}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        </nav>
      </div>
    </>
  );
};

export default GeneralHeader;

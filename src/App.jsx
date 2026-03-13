import { BrowserRouter, Route, Routes } from "react-router";
import GeneralLayout from "./layouts/GeneralLayout";
import "./components/index.css";

import Prayer from "./pages/prayer";
import Solah from "./pages/solah";
import Dashboard from "./pages/dashboard";
import SurahPage from "./pages/surah";
import SurahDetail from "./pages/SurahDetail";
import JuzDetail from "./pages/JuzDetail";
import Favorites from "./pages/Favorites";
import { ToastContainer } from "react-toastify";
import { useContext } from "react";
import { ThemeContext } from "./context/ThemeContext";
function App() {
  const {theme}=useContext(ThemeContext)
  return (
    <>
    <div className={theme ? "bg-AppGray text-AppWhite" : "bg-AppWhite text-AppBlack"}>
      <BrowserRouter>
      <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        <Routes>
          <Route element={<GeneralLayout />}>
           <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/surah" element={<SurahPage />} />
               <Route path="/surah/:number" element={<SurahDetail />} />
               <Route path="/juz/:number" element={<JuzDetail />} />
                  <Route path="/solah" element={<Solah />} />
                     <Route path="/prayer" element={<Prayer />} />
                     <Route path="/favorites" element={<Favorites />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </div>
    </>
  );
}

export default App;

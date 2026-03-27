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
import { useContext, useState} from "react";
import { ThemeContext } from "./context/themeContext";
function App() {
  const {theme}=useContext(ThemeContext)
const [installBtn,setInstallBtn]=useState(false)
settimeout(()=>(setInstallBtn(! installBtn),1000)
  return (
    <>
    <div className={theme ? "bg-AppGray text-AppWhite" : "bg-AppWhite text-AppBlack"}>
<button id="installBtn" style="padding:12px 18px;font-size:16px;" className={installBtn?"bg-green-500 rounded-xl fixed bottom-10 right-5": "hidden"}>
  Install App
</button>


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
<script>
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  document.getElementById('installBtn').style.display = 'block';
});

document.getElementById('installBtn').addEventListener('click', () => {
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => {
    deferredPrompt = null;
  });
});
</script>
      </div>
    </>
  );
}

export default App;

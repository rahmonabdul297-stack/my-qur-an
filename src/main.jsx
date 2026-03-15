import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ThemeProvider from './context/ThemeProvider'
import LanguageProvider from './context/LanguageProvider'
import FavoritesProvider from './context/FavoritesProvider'
import RecentProvider from './context/RecentProvider'


createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <LanguageProvider>
      <FavoritesProvider>
        <RecentProvider>
        <StrictMode>
          <App />
        </StrictMode>
        </RecentProvider>
      </FavoritesProvider>
    </LanguageProvider>
  </ThemeProvider>,
)

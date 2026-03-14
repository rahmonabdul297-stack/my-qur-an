import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ThemeProvider from './context/ThemeProvider'
import FavoritesProvider from './context/FavoritesProvider'
import RecentProvider from './context/RecentProvider'


createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <FavoritesProvider>
      <RecentProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </RecentProvider>
    </FavoritesProvider>
  </ThemeProvider>,
)

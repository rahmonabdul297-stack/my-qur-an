import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ThemeProvider from './context/ThemeProvider'
import FavoritesProvider from './context/FavoritesProvider'


createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <FavoritesProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </FavoritesProvider>
  </ThemeProvider>,
)

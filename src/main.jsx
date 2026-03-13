import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AppThemeContext from './context/ThemeContext'
import { FavoritesProvider } from './context/FavoritesContext'


createRoot(document.getElementById('root')).render(
  <AppThemeContext>
    <FavoritesProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </FavoritesProvider>
  </AppThemeContext>,
)

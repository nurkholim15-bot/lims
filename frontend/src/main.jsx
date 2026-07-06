import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Offline Assets
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from '@context/AppContext'
import { ToastProvider } from '@context/ToastContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  </StrictMode>,
)


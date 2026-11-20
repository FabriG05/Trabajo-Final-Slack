import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { SessionProvider } from './Context/SessionContext.jsx'
import './Globals.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <SessionProvider>
      <App />
    </SessionProvider>
  </BrowserRouter>
)

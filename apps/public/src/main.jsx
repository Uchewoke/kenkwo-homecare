import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PublicApp from './PublicApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PublicApp />
  </StrictMode>,
)
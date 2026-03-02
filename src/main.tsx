import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Auto-update: when a new version is deployed, reload to get it
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Automatically apply the update — no prompt needed for this app
    updateSW(true)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

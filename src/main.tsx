import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { applyPalette, getStoredPaletteId } from '@/lib/theme'
import { applyTextSize } from '@/lib/textSize'
import { scheduleReminders } from '@/lib/notifications'
import './index.css'
import App from './App.tsx'

// Apply stored palette BEFORE first render to prevent flash of wrong theme
applyPalette(getStoredPaletteId())
applyTextSize()
scheduleReminders()

// Request persistent storage so the browser won't evict user data
navigator.storage?.persist?.()


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

import { createClient } from '@base44/sdk'

const CACHE_KEY = 'alias_custom_wordpacks'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Fetch custom WordPack entities from Base44.
 * Falls back to localStorage cache when offline.
 * Returns [] if no app ID is configured.
 */
export async function loadCustomWords() {
  const appId = import.meta.env.VITE_BASE44_APP_ID
  if (!appId) return []

  // Return cached copy if fresh enough
  const cached = getCached()
  if (cached !== null) return cached

  try {
    const base44 = createClient({ appId })
    const packs = await base44.entities.WordPack.list({ filters: { active: true } })
    setCached(packs)
    return packs
  } catch {
    // Offline or API error — fall back to built-in words
    return []
  }
}

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function setCached(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // Storage quota exceeded — skip caching
  }
}

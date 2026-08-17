const DISMISSED_KEY = 'pwa_install_dismissed'
const DISMISSED_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

export function initInstallPrompt() {
  if (!shouldShow()) return

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream

  // Always show banner after 1.5 s.
  // For Android: use native install prompt if Chrome already fired
  // beforeinstallprompt; otherwise show manual menu instructions.
  setTimeout(() => {
    if (isIOS) {
      showBanner({ type: 'ios' })
    } else if (window.__pwaPrompt) {
      showBanner({ type: 'android-native', prompt: window.__pwaPrompt })
    } else {
      showBanner({ type: 'android-menu' })
    }
  }, 1500)

  // Head script already stored the event in window.__pwaPrompt and called
  // e.preventDefault() when appropriate. This listener catches the rare case
  // where the event fires after the module loads.
  window.addEventListener('beforeinstallprompt', e => {
    window.__pwaPrompt = e
  })

  window.addEventListener('appinstalled', dismiss)
}

function shouldShow() {
  if (window.matchMedia('(display-mode: standalone)').matches) return false
  if (window.navigator.standalone) return false
  if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return false
  try {
    const ts = localStorage.getItem(DISMISSED_KEY)
    if (ts && Date.now() - Number(ts) < DISMISSED_TTL) return false
  } catch {}
  return true
}

function dismiss() {
  try { localStorage.setItem(DISMISSED_KEY, String(Date.now())) } catch {}
  const banner = document.getElementById('pwa-banner')
  if (!banner) return
  banner.style.transform = 'translateY(120%)'
  setTimeout(() => banner.remove(), 400)
}

function showBanner({ type, prompt } = {}) {
  if (document.getElementById('pwa-banner')) return

  const lang = window.G?.uiLang || 'he'
  const isRTL = lang === 'he'

  const copy = {
    he: {
      title:   'רוצים את המשחק על המסך?',
      native:  'התקינו וזה יהיה תמיד במרחק לחיצה',
      menu:    'הקישו ⋮ ואז "הוספה למסך הבית"',
      ios:     'הקישו שיתוף ואז "הוספה למסך הבית"',
      install: 'התקנה',
    },
    en: {
      title:   'Want this on your home screen?',
      native:  'Install it and it\'s always one tap away',
      menu:    'Tap ⋮ then "Add to Home Screen"',
      ios:     'Tap Share then "Add to Home Screen"',
      install: 'Install',
    },
    es: {
      title:   '¿Lo quieres en tu pantalla?',
      native:  'Instálalo y lo tendrás a un toque',
      menu:    'Toca ⋮ y luego "Añadir a pantalla de inicio"',
      ios:     'Toca Compartir y luego "Añadir a inicio"',
      install: 'Instalar',
    },
  }
  const t = copy[lang] || copy.he

  const desc = type === 'ios' ? t.ios : type === 'android-native' ? t.native : t.menu
  const showInstallBtn = type === 'android-native'

  const banner = document.createElement('div')
  banner.id = 'pwa-banner'
  banner.style.cssText = `
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
    background: linear-gradient(135deg, #6C63FF 0%, #9B59B6 100%);
    color: #fff;
    padding: 14px 16px env(safe-area-inset-bottom, 0px);
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 -4px 24px rgba(108,99,255,0.35);
    direction: ${isRTL ? 'rtl' : 'ltr'};
    font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
    transform: translateY(100%);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  `

  banner.innerHTML = `
    <div style="font-size:2rem;flex-shrink:0;line-height:1">🎭</div>
    <div style="flex:1;min-width:0">
      <div style="font-weight:700;font-size:0.95rem;line-height:1.2">${t.title}</div>
      <div style="font-size:0.78rem;opacity:0.88;margin-top:3px;line-height:1.4">${desc}</div>
    </div>
    ${showInstallBtn ? `
      <button id="pwa-install-btn" style="
        background:#fff; color:#6C63FF; border:none; border-radius:12px;
        padding:9px 15px; font-weight:700; font-size:0.88rem; cursor:pointer;
        font-family:inherit; flex-shrink:0; white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.15);
      ">${t.install}</button>
    ` : ''}
    <button id="pwa-dismiss-btn" style="
      background:rgba(255,255,255,0.18); border:none; border-radius:8px;
      width:30px; height:30px; color:#fff; font-size:1rem; cursor:pointer;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    ">✕</button>
  `

  document.body.appendChild(banner)

  requestAnimationFrame(() => requestAnimationFrame(() => {
    banner.style.transform = 'translateY(0)'
  }))

  document.getElementById('pwa-dismiss-btn').onclick = dismiss

  const installBtn = document.getElementById('pwa-install-btn')
  if (installBtn) {
    installBtn.onclick = () => {
      prompt?.prompt()
      prompt?.userChoice.then(() => { window.__pwaPrompt = null })
      dismiss()
    }
  }
}

import sharp from 'sharp'

const notesSvg = (roundedCorners) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6C63FF"/>
      <stop offset="100%" stop-color="#9B59B6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" ${roundedCorners ? 'rx="96"' : ''} fill="url(#bg)"/>
  <g transform="translate(256,256) scale(4) translate(-51,-53)">
    <g transform="rotate(-13, 54, 60)">
      <path d="M28,36 Q28,32 32,32 L76,32 Q80,32 80,36 L80,84 Q80,88 76,88 L32,88 Q28,88 28,84 Z" fill="#FFF8DC"/>
      <line x1="36" y1="48" x2="72" y2="48" stroke="#D4C070" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="36" y1="57" x2="68" y2="57" stroke="#D4C070" stroke-width="3" stroke-linecap="round"/>
      <line x1="36" y1="66" x2="70" y2="66" stroke="#D4C070" stroke-width="3" stroke-linecap="round"/>
      <line x1="36" y1="75" x2="64" y2="75" stroke="#D4C070" stroke-width="3" stroke-linecap="round"/>
    </g>
    <g transform="rotate(11, 54, 58)">
      <path d="M30,28 Q30,24 34,24 L78,24 Q82,24 82,28 L82,78 Q82,82 78,82 L34,82 Q30,82 30,78 Z" fill="#DFF0FF"/>
      <line x1="37" y1="41" x2="75" y2="41" stroke="#90BBD9" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="37" y1="50" x2="71" y2="50" stroke="#90BBD9" stroke-width="3" stroke-linecap="round"/>
      <line x1="37" y1="59" x2="73" y2="59" stroke="#90BBD9" stroke-width="3" stroke-linecap="round"/>
      <line x1="37" y1="68" x2="67" y2="68" stroke="#90BBD9" stroke-width="3" stroke-linecap="round"/>
    </g>
    <path d="M20,22 Q20,18 24,18 L76,18 Q80,18 80,22 L80,78 Q80,82 76,82 L24,82 Q20,82 20,78 Z" fill="#FFFFFF" stroke="#D8D8D8" stroke-width="0.5"/>
    <path d="M20,18 L24,18 L76,18 L80,18 L80,30 L20,30 Z" fill="#6C63FF"/>
    <line x1="28" y1="40" x2="72" y2="40" stroke="#A89CF5" stroke-width="4" stroke-linecap="round"/>
    <line x1="28" y1="51" x2="68" y2="51" stroke="#CCCCCC" stroke-width="3" stroke-linecap="round"/>
    <line x1="28" y1="60" x2="70" y2="60" stroke="#CCCCCC" stroke-width="3" stroke-linecap="round"/>
    <line x1="28" y1="69" x2="64" y2="69" stroke="#CCCCCC" stroke-width="3" stroke-linecap="round"/>
    <line x1="28" y1="78" x2="66" y2="78" stroke="#CCCCCC" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>`

// Icon with rounded corners — used for 192px and the "any" purpose 512px
const iconRounded = Buffer.from(notesSvg(true))

// Maskable icon — full-bleed (no rounded corners) so Android can safely
// crop it to any shape without transparent edge artifacts
const iconMaskable = Buffer.from(notesSvg(false))

await sharp(iconRounded).resize(192, 192).png().toFile('./public/icon-192.png')
await sharp(iconRounded).resize(512, 512).png().toFile('./public/icon-512.png')
await sharp(iconMaskable).resize(512, 512).png().toFile('./public/icon-512-maskable.png')

console.log('Icons generated: icon-192.png, icon-512.png, icon-512-maskable.png')

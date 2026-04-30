import sharp from 'sharp'

// Icon with rounded corners — used for 192px and the "any" purpose 512px
const iconRounded = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6C63FF"/>
      <stop offset="100%" stop-color="#9B59B6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <rect x="140" y="116" width="232" height="296" rx="16" fill="rgba(0,0,0,0.22)"/>
  <rect x="132" y="106" width="232" height="296" rx="16" fill="#FFFDF5"/>
  <rect x="132" y="106" width="232" height="58" rx="16" fill="#EDE9FE"/>
  <rect x="132" y="148" width="232" height="16" fill="#EDE9FE"/>
  <rect x="168" y="210" width="160" height="14" rx="7" fill="#7C6FCD" opacity="0.45"/>
  <rect x="168" y="248" width="156" height="14" rx="7" fill="#7C6FCD" opacity="0.45"/>
  <rect x="168" y="286" width="120" height="14" rx="7" fill="#7C6FCD" opacity="0.45"/>
  <rect x="168" y="324" width="80"  height="14" rx="7" fill="#7C6FCD" opacity="0.45"/>
  <g transform="translate(296,292) rotate(-45)">
    <rect x="-14" y="-72" width="28" height="96" rx="4" fill="#FFB300"/>
    <polygon points="-14,24 14,24 0,56" fill="#FF8F00"/>
    <rect x="-14" y="-84" width="28" height="14" rx="3" fill="#E0E0E0"/>
    <rect x="-10" y="-72" width="20" height="8" fill="#FFF8E1" opacity="0.6"/>
  </g>
</svg>`)

// Maskable icon — full-bleed (no rounded corners) so Android can safely
// crop it to any shape without transparent edge artifacts
const iconMaskable = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6C63FF"/>
      <stop offset="100%" stop-color="#9B59B6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <rect x="140" y="116" width="232" height="296" rx="16" fill="rgba(0,0,0,0.22)"/>
  <rect x="132" y="106" width="232" height="296" rx="16" fill="#FFFDF5"/>
  <rect x="132" y="106" width="232" height="58" rx="16" fill="#EDE9FE"/>
  <rect x="132" y="148" width="232" height="16" fill="#EDE9FE"/>
  <rect x="168" y="210" width="160" height="14" rx="7" fill="#7C6FCD" opacity="0.45"/>
  <rect x="168" y="248" width="156" height="14" rx="7" fill="#7C6FCD" opacity="0.45"/>
  <rect x="168" y="286" width="120" height="14" rx="7" fill="#7C6FCD" opacity="0.45"/>
  <rect x="168" y="324" width="80"  height="14" rx="7" fill="#7C6FCD" opacity="0.45"/>
  <g transform="translate(296,292) rotate(-45)">
    <rect x="-14" y="-72" width="28" height="96" rx="4" fill="#FFB300"/>
    <polygon points="-14,24 14,24 0,56" fill="#FF8F00"/>
    <rect x="-14" y="-84" width="28" height="14" rx="3" fill="#E0E0E0"/>
    <rect x="-10" y="-72" width="20" height="8" fill="#FFF8E1" opacity="0.6"/>
  </g>
</svg>`)

await sharp(iconRounded).resize(192, 192).png().toFile('./public/icon-192.png')
await sharp(iconRounded).resize(512, 512).png().toFile('./public/icon-512.png')
await sharp(iconMaskable).resize(512, 512).png().toFile('./public/icon-512-maskable.png')

console.log('Icons generated: icon-192.png, icon-512.png, icon-512-maskable.png')

import { loadCustomWords } from './base44.js'

loadCustomWords().then(packs => {
  if (!packs.length || !window.WORD_LISTS) return

  for (const pack of packs) {
    const { language, difficulty, words } = pack
    if (
      window.WORD_LISTS[language] &&
      window.WORD_LISTS[language][difficulty] &&
      Array.isArray(words) &&
      words.length
    ) {
      window.WORD_LISTS[language][difficulty].push(...words)
    }
  }
})

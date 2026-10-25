// Arabic text normalization for phrase matching. Arabic users routinely type
// without hamzas (الم instead of ألم) and mix ة/ه and ى/ي — matching must not
// depend on those choices. Both the haystack and the patterns pass through
// this, so matching stays consistent. Latin text is returned unchanged
// (apart from the shared replacements, which do not affect it).
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[ً-ٰٟ]/g, '') // diacritics
    .replace(/ـ/g, '') // tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

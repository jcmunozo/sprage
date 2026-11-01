// Flag image for a language. Languages aren't countries, so each language maps
// to the country most associated with it. Returns a URL or null when unknown.
// SVGs live in public/flags (from the MIT-licensed flag-icons project) so they
// render the same on every OS — emoji flags don't show on Windows/some browsers.

const LANG_TO_COUNTRY = {
  de: 'DE', en: 'GB', es: 'ES', fr: 'FR', it: 'IT', pt: 'PT', nl: 'NL',
  sv: 'SE', no: 'NO', nb: 'NO', da: 'DK', fi: 'FI', is: 'IS', pl: 'PL',
  cs: 'CZ', sk: 'SK', hu: 'HU', ro: 'RO', bg: 'BG', el: 'GR', tr: 'TR',
  ru: 'RU', uk: 'UA', hr: 'HR', sr: 'RS', sl: 'SI', et: 'EE', lv: 'LV',
  lt: 'LT', ga: 'IE', ca: 'ES', eu: 'ES', gl: 'ES',
  ja: 'JP', zh: 'CN', ko: 'KR', vi: 'VN', th: 'TH', id: 'ID', ms: 'MY',
  tl: 'PH', hi: 'IN', bn: 'BD', ur: 'PK', fa: 'IR', ar: 'SA', he: 'IL',
  sw: 'KE', af: 'ZA',
};

// ISO 639-2/3 three-letter codes people sometimes use instead of 639-1
const THREE_TO_TWO = {
  deu: 'de', ger: 'de', eng: 'en', spa: 'es', fra: 'fr', fre: 'fr', ita: 'it',
  por: 'pt', nld: 'nl', dut: 'nl', swe: 'sv', nor: 'no', dan: 'da', fin: 'fi',
  pol: 'pl', ces: 'cs', cze: 'cs', ell: 'el', gre: 'el', tur: 'tr', rus: 'ru',
  ukr: 'uk', jpn: 'ja', zho: 'zh', chi: 'zh', kor: 'ko', vie: 'vi', tha: 'th',
  ind: 'id', hin: 'hi', ara: 'ar', heb: 'he', fas: 'fa', per: 'fa',
};

// Fallback when a language was created without a code
const NAME_TO_LANG = {
  german: 'de', deutsch: 'de', aleman: 'de', alemán: 'de',
  english: 'en', ingles: 'en', inglés: 'en',
  spanish: 'es', español: 'es', espanol: 'es',
  french: 'fr', français: 'fr', frances: 'fr', francés: 'fr',
  italian: 'it', italiano: 'it',
  portuguese: 'pt', português: 'pt', portugues: 'pt', portugués: 'pt',
  dutch: 'nl', swedish: 'sv', norwegian: 'no', danish: 'da', finnish: 'fi',
  polish: 'pl', czech: 'cs', greek: 'el', turkish: 'tr', russian: 'ru',
  ukrainian: 'uk', japanese: 'ja', japones: 'ja', japonés: 'ja',
  chinese: 'zh', mandarin: 'zh', chino: 'zh', korean: 'ko', coreano: 'ko',
  vietnamese: 'vi', thai: 'th', indonesian: 'id', hindi: 'hi', arabic: 'ar',
  hebrew: 'he', persian: 'fa',
};

// Flags shipped in public/flags
const AVAILABLE = new Set('ar at au bd be bg br ca ch cl cn co cz de dk ec ee eg es fi fr gb gr hk hr hu id ie il in ir is it jp ke kr lt lv ma mx my nl no nz pe ph pk pl pt ro rs ru sa se sg si sk th tr tw ua us uy ve vn za'.split(' '));

const toFlag = (country) => {
  const c = country.toLowerCase();
  return AVAILABLE.has(c) ? `/flags/${c}.svg` : null;
};

export function languageFlag(language) {
  if (!language) return null;
  const raw = (language.code || '').toLowerCase().trim();
  // "de-AT" / "pt_BR" → use the region if one is given
  const [lang, region] = raw.split(/[-_]/);
  if (region && /^[a-z]{2}$/.test(region) && toFlag(region)) return toFlag(region);
  const code =
    THREE_TO_TWO[lang] || lang || NAME_TO_LANG[(language.name || '').toLowerCase().trim()];
  const country = LANG_TO_COUNTRY[code] || LANG_TO_COUNTRY[NAME_TO_LANG[(language.name || '').toLowerCase().trim()]];
  return country ? toFlag(country) : null;
}

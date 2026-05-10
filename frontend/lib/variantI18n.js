// Display a color or size in the customer's locale.
// The canonical value (what the admin originally typed and what variants reference) is
// always the English/key string. When the locale is Arabic and the admin filled in a
// translation for that key, use the translation; otherwise fall back to the raw value.
export function translateVariant(value, translations, lang) {
  if (!value) return '';
  if (lang !== 'ar') return value;
  if (!translations) return value;
  const ar = typeof translations.get === 'function' ? translations.get(value) : translations[value];
  return (ar && String(ar).trim()) || value;
}

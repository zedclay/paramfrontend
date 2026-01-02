/**
 * Utility function to get multilingual value based on current language
 * @param {Object} multilingualObj - Object with language keys (fr, ar, en)
 * @param {string} currentLang - Current language code (fr, ar, en)
 * @param {string} fallback - Fallback value if the key doesn't exist
 * @returns {string} - The value in the current language or fallback
 */
export const getMultilingualValue = (multilingualObj, currentLang = 'fr', fallback = '') => {
  if (!multilingualObj || typeof multilingualObj !== 'object') {
    return fallback;
  }

  // Try to get value in current language
  if (multilingualObj[currentLang]) {
    return multilingualObj[currentLang];
  }

  // Fallback chain: currentLang -> fr -> ar -> en -> first available -> fallback
  const fallbackChain = ['fr', 'ar', 'en'];
  
  for (const lang of fallbackChain) {
    if (multilingualObj[lang]) {
      return multilingualObj[lang];
    }
  }

  // If it's a string (for backward compatibility), return it
  if (typeof multilingualObj === 'string') {
    return multilingualObj;
  }

  return fallback;
};

/**
 * Hook-like function to get multilingual value using i18n language
 * @param {Object} multilingualObj - Object with language keys (fr, ar, en)
 * @param {Object} i18n - i18next instance
 * @param {string} fallback - Fallback value
 * @returns {string} - The value in the current language
 */
export const getMultilingualValueFromI18n = (multilingualObj, i18n, fallback = '') => {
  const currentLang = i18n?.language || 'fr';
  return getMultilingualValue(multilingualObj, currentLang, fallback);
};
/**
 * Utility functions for filtering destinations based on storefront and language
 */

// Map country names (in English) to country codes
const countryCodeMap = {
  'Puerto Rico': 'pr', // Puerto Rico - not in storefront list, so will show everywhere
  'Mexico': 'mx',
  'México': 'mx',
  'Canada': 'ca',
  'Canadá': 'ca',
  'United States': 'us',
  'Estados Unidos': 'us',
  'Brazil': 'br',
  'Brasil': 'br',
  'Colombia': 'co',
  'Colômbia': 'co',
  'Belize': 'bz',
  'Belice': 'bz',
  'Curaçao': 'cw',
  'Curazao': 'cw',
  'Dominican Republic': 'do',
  'República Dominicana': 'do',
  'Argentina': 'ar',
  'Panama': 'pa',
  'Panamá': 'pa',
  'Costa Rica': 'cr',
  'Venezuela': 've',
};

// Storefront exclusion rules
const storefrontRules = {
  // Mexico and Venezuela destinations should not appear in US storefront
  us: {
    excludeCountries: ['mx', 've'],
  },
  // US destinations should not appear in MX storefront
  mx: {
    excludeCountries: ['us'],
  },
};

/**
 * Get country code from dataLayer
 * @returns {string} Country code (default: 'gs')
 */
export function getCountryFromDataLayer() {
  if (typeof window === 'undefined') return 'gs';
  
  try {
    const countryCode = window.EM?.dataLayer?.[0]?.page?.countryIsoCode?.toLowerCase();
    return countryCode || 'gs';
  } catch (error) {
    console.warn('Error reading country from dataLayer:', error);
    return 'gs';
  }
}

/**
 * Get language from dataLayer or default
 * You mentioned you can manage this variable when uploading building content
 * Priority: window.DESTINATION_LANG > dataLayer > default
 * @param {string} defaultLang - Default language to use
 * @returns {string} Language code ('en', 'es', 'pt')
 */
export function getLanguageFromDataLayer(defaultLang = 'es') {
  if (typeof window === 'undefined') return defaultLang;
  
  try {
    // First, check for a global variable that can be set when building
    if (window.DESTINATION_LANG) {
      const lang = window.DESTINATION_LANG.toLowerCase();
      if (['en', 'es', 'pt'].includes(lang)) {
        return lang;
      }
    }
    
    // Second, check dataLayer for language
    const lang = window.EM?.dataLayer?.[0]?.page?.language?.toLowerCase();
    if (lang && ['en', 'es', 'pt'].includes(lang)) {
      return lang;
    }
  } catch (error) {
    console.warn('Error reading language from dataLayer:', error);
  }
  
  return defaultLang;
}

/**
 * Get country code for a destination based on its country name
 * @param {string} countryName - Country name in any language
 * @returns {string|null} Country code or null if not found
 */
function getDestinationCountryCode(countryName) {
  // Try direct match first
  if (countryCodeMap[countryName]) {
    return countryCodeMap[countryName];
  }
  
  // Try case-insensitive match
  const lowerCountryName = countryName.toLowerCase();
  for (const [key, value] of Object.entries(countryCodeMap)) {
    if (key.toLowerCase() === lowerCountryName) {
      return value;
    }
  }
  
  return null;
}

/**
 * Check if a destination should be excluded based on storefront rules
 * @param {Object} destination - Destination object with locales
 * @param {string} storefrontCountry - Storefront country code
 * @param {string} lang - Language code
 * @returns {boolean} True if destination should be excluded
 */
function shouldExcludeDestination(destination, storefrontCountry, lang) {
  // Get the country name from the destination in the current language
  const localeData = destination.locales[lang];
  if (!localeData) return true; // Exclude if no locale data
  
  const countryName = localeData.country;
  const destCountryCode = getDestinationCountryCode(countryName);
  
  if (!destCountryCode) {
    // If we can't map the country, include it (safer default)
    return false;
  }
  
  // Rule: Don't show the storefront's own city
  if (destCountryCode === storefrontCountry) {
    return true;
  }
  
  // Apply storefront-specific exclusion rules
  const rules = storefrontRules[storefrontCountry];
  if (rules && rules.excludeCountries) {
    if (rules.excludeCountries.includes(destCountryCode)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Transform destination to use the correct locale
 * @param {Object} destination - Original destination object
 * @param {string} lang - Language code
 * @returns {Object} Transformed destination with localized content
 */
export function transformDestinationForLocale(destination, lang) {
  const localeData = destination.locales[lang];
  if (!localeData) {
    // Fallback to English if locale not available
    const fallback = destination.locales.en || destination.locales.es || destination.locales.pt;
    return {
      ...destination,
      ...fallback,
      locale: lang,
    };
  }
  
  return {
    ...destination,
    ...localeData,
    locale: lang,
  };
}

/**
 * Filter and transform destinations based on storefront and language
 * @param {Array} destinations - Array of destination objects
 * @param {string} storefrontCountry - Storefront country code (optional, will detect if not provided)
 * @param {string} lang - Language code (optional, will detect if not provided)
 * @returns {Array} Filtered and transformed destinations
 */
export function getFilteredDestinations(destinations, storefrontCountry = null, lang = null) {
  // Detect country and language if not provided
  const country = storefrontCountry || getCountryFromDataLayer();
  const language = lang || getLanguageFromDataLayer();
  
  // Filter destinations based on storefront rules
  const filtered = destinations.filter(dest => {
    return !shouldExcludeDestination(dest, country, language);
  });
  
  // Transform destinations to use the correct locale
  return filtered.map(dest => transformDestinationForLocale(dest, language));
}

/**
 * Get localized categories based on language
 * @param {string} lang - Language code
 * @param {Object} motivationCategories - Categories object from destinations.js
 * @returns {Array} Localized category names
 */
export function getLocalizedCategories(lang, motivationCategories) {
  return motivationCategories[lang] || motivationCategories.en || [];
}

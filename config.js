// Brand Collab Finder - Configuration
// NOTE: In production, API keys should be stored server-side or in environment variables

const CONFIG = {
  // Google AI (Gemini) API
  GEMINI_API_KEY: 'AIzaSyAJXvnKIBvdEkU9IzSUFYnMRL0g9LpDdDk',
  GEMINI_MODEL: 'gemini-2.0-flash',
  GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',

  // App Settings
  MAX_SEARCH_HISTORY: 10,
  RESULTS_BRANDS_COUNT: { min: 5, max: 8 },
  RESULTS_PRODUCTS_COUNT: { min: 5, max: 7 },

  // Favicon Services
  FAVICON_PRIMARY: 'https://www.google.com/s2/favicons?domain={domain}&sz=64',
  FAVICON_FALLBACK: 'https://icons.duckduckgo.com/ip3/{domain}.ico',

  // LocalStorage Keys
  STORAGE_KEYS: {
    SEARCH_HISTORY: 'bcf_search_history',
    FEEDBACK: 'bcf_feedback_corpus'
  }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.RESULTS_BRANDS_COUNT);
Object.freeze(CONFIG.RESULTS_PRODUCTS_COUNT);
Object.freeze(CONFIG.STORAGE_KEYS);

export default CONFIG;

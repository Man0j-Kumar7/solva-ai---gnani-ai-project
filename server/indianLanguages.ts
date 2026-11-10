/**
 * 22 Scheduled Indian Languages detector & metadata for Node.js server
 */

export interface DetectedLanguageInfo {
  code: string;
  name: string;
  isRomanised: boolean;
  confidence: number;
  gnaniSupported: boolean;
  gnaniCode?: string;
  script: string;
}

export function detectLanguage(text: string): DetectedLanguageInfo {
  const clean = (text || '').trim();
  if (!clean) {
    return {
      code: 'en',
      name: 'English',
      isRomanised: false,
      confidence: 1.0,
      gnaniSupported: true,
      gnaniCode: 'en-IN',
      script: 'Latin',
    };
  }

  // 1. Script checks
  if (/[\u0B80-\u0BFF]/.test(clean)) {
    return { code: 'ta', name: 'Tamil (தமிழ்)', isRomanised: false, confidence: 0.98, gnaniSupported: true, gnaniCode: 'ta-IN', script: 'Tamil' };
  }
  if (/[\u0C00-\u0C7F]/.test(clean)) {
    return { code: 'te', name: 'Telugu (తెలుగు)', isRomanised: false, confidence: 0.98, gnaniSupported: true, gnaniCode: 'te-IN', script: 'Telugu' };
  }
  if (/[\u0C80-\u0CFF]/.test(clean)) {
    return { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', isRomanised: false, confidence: 0.98, gnaniSupported: true, gnaniCode: 'kn-IN', script: 'Kannada' };
  }
  if (/[\u0D00-\u0D7F]/.test(clean)) {
    return { code: 'ml', name: 'Malayalam (മലയാളം)', isRomanised: false, confidence: 0.98, gnaniSupported: true, gnaniCode: 'ml-IN', script: 'Malayalam' };
  }
  if (/[\u0980-\u09FF]/.test(clean)) {
    if (/[\u09F0\u09F1]/.test(clean)) {
      return { code: 'as', name: 'Assamese (অসমীয়া)', isRomanised: false, confidence: 0.95, gnaniSupported: false, script: 'Assamese' };
    }
    return { code: 'bn', name: 'Bengali (বাংলা)', isRomanised: false, confidence: 0.95, gnaniSupported: true, gnaniCode: 'bn-IN', script: 'Bengali' };
  }
  if (/[\u0A80-\u0AFF]/.test(clean)) {
    return { code: 'gu', name: 'Gujarati (ગુજરાતી)', isRomanised: false, confidence: 0.98, gnaniSupported: true, gnaniCode: 'gu-IN', script: 'Gujarati' };
  }
  if (/[\u0A00-\u0A7F]/.test(clean)) {
    return { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', isRomanised: false, confidence: 0.98, gnaniSupported: true, gnaniCode: 'pa-IN', script: 'Gurmukhi' };
  }
  if (/[\u0B00-\u0B7F]/.test(clean)) {
    return { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', isRomanised: false, confidence: 0.98, gnaniSupported: false, script: 'Odia' };
  }
  if (/[\u1C50-\u1C7F]/.test(clean)) {
    return { code: 'sat', name: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)', isRomanised: false, confidence: 0.99, gnaniSupported: false, script: 'Ol Chiki' };
  }
  if (/[\uABC0-\uABFF]/.test(clean)) {
    return { code: 'mni', name: 'Manipuri (ꯃꯤꯇꯩꯂꯣꯟ)', isRomanised: false, confidence: 0.99, gnaniSupported: false, script: 'Meetei Mayek' };
  }
  if (/[\u0600-\u06FF]/.test(clean)) {
    return { code: 'ur', name: 'Urdu (اردو)', isRomanised: false, confidence: 0.92, gnaniSupported: false, script: 'Arabic' };
  }

  // Devanagari Script (Hindi, Marathi, Sanskrit, Nepali, Maithili, Konkani, Bodo, Dogri)
  if (/[\u0900-\u097F]/.test(clean)) {
    if (/[\u0933]|\b(आहे|नाही|कसे|काय|आहात|करा|होते)\b/.test(clean)) {
      return { code: 'mr', name: 'Marathi (मराठी)', isRomanised: false, confidence: 0.92, gnaniSupported: true, gnaniCode: 'mr-IN', script: 'Devanagari' };
    }
    if (/[\u0903]|\b(अस्ति|भवति|कथम्|अहम्|त्वम्|धन्यवादः)\b/.test(clean)) {
      return { code: 'sa', name: 'Sanskrit (संस्कृतम्)', isRomanised: false, confidence: 0.90, gnaniSupported: false, script: 'Devanagari' };
    }
    return { code: 'hi', name: 'Hindi (हिन्दी)', isRomanised: false, confidence: 0.95, gnaniSupported: true, gnaniCode: 'hi-IN', script: 'Devanagari' };
  }

  // 2. Romanised / Transliterated
  const tanglishRegex = /\b(vanakkam|epdi|irukinga|iruka|enna|solunga|solu|nandri|panna|romba|aama|illa|kudunga|theriyum|therla|ungaluku|ippo|eppovum|paathutu|panreenga|inga|anga|yaar|ethuku|kooda|seri|paravala)\b/i;
  if (tanglishRegex.test(clean)) {
    return { code: 'tanglish', name: 'Tanglish (Tamil)', isRomanised: true, confidence: 0.88, gnaniSupported: true, gnaniCode: 'ta-IN', script: 'Latin' };
  }

  const hinglishRegex = /\b(namaste|kaise|kaisi|kaisa|kya|chal|raha|rahi|batao|bataiye|theek|shukriya|kripya|mujhe|aapka|tumhara|accha|acche|kuch|nahi|karna|chahiye|hoga|karenge|samajh|aaya)\b/i;
  if (hinglishRegex.test(clean)) {
    return { code: 'hinglish', name: 'Hinglish (Hindi)', isRomanised: true, confidence: 0.88, gnaniSupported: true, gnaniCode: 'hi-IN', script: 'Latin' };
  }

  const telugishRegex = /\b(namaskaram|ela|unnaru|enti|sangathi|dhanyavadalu|cheyyali|eppudu|ekkada|kavali|undhi|ledhu|chudandi)\b/i;
  if (telugishRegex.test(clean)) {
    return { code: 'te-latin', name: 'Telugu (Romanised)', isRomanised: true, confidence: 0.85, gnaniSupported: true, gnaniCode: 'te-IN', script: 'Latin' };
  }

  const kanglishRegex = /\b(namaskara|hegiddira|hegiddeera|enu|samachara|dhanyavadagalu|madabeku|hoge|illi|alli|beku|beda)\b/i;
  if (kanglishRegex.test(clean)) {
    return { code: 'kn-latin', name: 'Kannada (Romanised)', isRomanised: true, confidence: 0.85, gnaniSupported: true, gnaniCode: 'kn-IN', script: 'Latin' };
  }

  const manglishRegex = /\b(namaskaram|engane|und|entha|vishesham|nanni|cheyyanam|ippol|ivide|avide|venam|venda)\b/i;
  if (manglishRegex.test(clean)) {
    return { code: 'ml-latin', name: 'Malayalam (Romanised)', isRomanised: true, confidence: 0.85, gnaniSupported: true, gnaniCode: 'ml-IN', script: 'Latin' };
  }

  return { code: 'en', name: 'English', isRomanised: false, confidence: 0.85, gnaniSupported: true, gnaniCode: 'en-IN', script: 'Latin' };
}

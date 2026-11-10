/**
 * 22 Constitutionally Scheduled Indian Languages of the Eighth Schedule
 * with script matchers, Romanised (colloquial) typing detectors, and Gnani AI voice support status.
 */

export interface IndianLanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  unicodeRange?: [number, number];
  romanisedName?: string;
  gnaniSTT: boolean;
  gnaniTTS: boolean;
  gnaniCode?: string;
  samplePhrases?: string[];
}

export const ALL_22_INDIAN_LANGUAGES: IndianLanguageMeta[] = [
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    unicodeRange: [0x0b80, 0x0bff],
    romanisedName: 'Tanglish',
    gnaniSTT: true,
    gnaniTTS: true,
    gnaniCode: 'ta-IN',
    samplePhrases: ['வணக்கம்! இன்று என்ன செய்யலாம்?', 'எனக்கு உதவி செய்ய முடியுமா?'],
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    unicodeRange: [0x0900, 0x097f],
    romanisedName: 'Hinglish',
    gnaniSTT: true,
    gnaniTTS: true,
    gnaniCode: 'hi-IN',
    samplePhrases: ['नमस्ते SOLVA! आप कैसे हैं?', 'आज का दिन कैसा रहेगा?'],
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    unicodeRange: [0x0c00, 0x0c7f],
    romanisedName: 'Telugish',
    gnaniSTT: true,
    gnaniTTS: true,
    gnaniCode: 'te-IN',
    samplePhrases: ['నమస్కారం! ఎలా ఉన్నారు?', 'నాకు సహాయం చేయగలరా?'],
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    unicodeRange: [0x0c80, 0x0cff],
    romanisedName: 'Kanglish',
    gnaniSTT: true,
    gnaniTTS: true,
    gnaniCode: 'kn-IN',
    samplePhrases: ['ನಮಸ್ಕಾರ! ಹೇಗಿದ್ದೀರಾ?', 'ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ?'],
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'Malayalam',
    unicodeRange: [0x0d00, 0x0d7f],
    romanisedName: 'Manglish',
    gnaniSTT: true,
    gnaniTTS: true,
    gnaniCode: 'ml-IN',
    samplePhrases: ['നമസ്കാരം! എങ്ങനെയുണ്ട്?', 'സഹായം ആവശ്യമുണ്ട്.'],
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    unicodeRange: [0x0980, 0x09ff],
    romanisedName: 'Benglish',
    gnaniSTT: true,
    gnaniTTS: true,
    gnaniCode: 'bn-IN',
    samplePhrases: ['নমস্কার! কেমন আছেন?', 'আমাকে সাহায্য করতে পারেন?'],
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    unicodeRange: [0x0900, 0x097f],
    romanisedName: 'Marathish',
    gnaniSTT: true,
    gnaniTTS: true,
    gnaniCode: 'mr-IN',
    samplePhrases: ['नमस्कार! कसे आहात?', 'मला मदत करू शकता का?'],
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    unicodeRange: [0x0a80, 0x0aff],
    gnaniSTT: true,
    gnaniTTS: true,
    gnaniCode: 'gu-IN',
    samplePhrases: ['નમસ્તે! તમે કેમ છો?', 'મને મદદ કરશો?'],
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    script: 'Gurmukhi',
    unicodeRange: [0x0a00, 0x0a7f],
    gnaniSTT: true,
    gnaniTTS: true,
    gnaniCode: 'pa-IN',
    samplePhrases: ['ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?'],
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    script: 'Odia',
    unicodeRange: [0x0b00, 0x0b7f],
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['ନମସ୍କାର! ଆପଣ କେମିତି ଅଛନ୍ତି?'],
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    script: 'Bengali-Assamese',
    unicodeRange: [0x0980, 0x09ff],
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['নমস্কাৰ! আপুনি কেনে আছে?'],
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    script: 'Arabic/Perso-Arabic',
    unicodeRange: [0x0600, 0x06ff],
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['آداب! آپ کیسے ہیں؟'],
  },
  {
    code: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    script: 'Devanagari',
    unicodeRange: [0x0900, 0x097f],
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['नमस्ते! भवान् कथम् अस्ति?'],
  },
  {
    code: 'ks',
    name: 'Kashmiri',
    nativeName: 'कॉशुर / کٲشُر',
    script: 'Perso-Arabic/Devanagari',
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['کٲشُر زَبانہِ مَنٛز'],
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    script: 'Devanagari',
    unicodeRange: [0x0900, 0x097f],
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['नमस्ते! तपाईँलाई कस्तो छ?'],
  },
  {
    code: 'kok',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    script: 'Devanagari',
    unicodeRange: [0x0900, 0x097f],
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['देव बरे करूं! कशे आसात?'],
  },
  {
    code: 'mai',
    name: 'Maithili',
    nativeName: 'मैथिली',
    script: 'Devanagari',
    unicodeRange: [0x0900, 0x097f],
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['प्रणाम! अपने केहन छी?'],
  },
  {
    code: 'sd',
    name: 'Sindhi',
    nativeName: 'سنڌي / सिन्धी',
    script: 'Perso-Arabic/Devanagari',
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['سلام! ڪيئن آهيو؟'],
  },
  {
    code: 'doi',
    name: 'Dogri',
    nativeName: 'डोगरी',
    script: 'Devanagari',
    unicodeRange: [0x0900, 0x097f],
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['नमस्ते! तुंदा के हाल ऐ?'],
  },
  {
    code: 'mni',
    name: 'Manipuri (Meitei)',
    nativeName: 'মৈতৈলোন্ / ꯃꯤꯇꯩꯂꯣꯟ',
    script: 'Meetei Mayek / Bengali',
    unicodeRange: [0xabc0, 0xabff],
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['ꯈꯨꯔꯨꯝꯖꯔꯤ! ꯀꯔꯤ ꯇꯧꯔꯤꯕꯒꯦ?'],
  },
  {
    code: 'brx',
    name: 'Bodo',
    nativeName: 'बड़ो',
    script: 'Devanagari',
    unicodeRange: [0x0900, 0x097f],
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['खुलुमबाय! नोंथाङा माबोरै दं?'],
  },
  {
    code: 'sat',
    name: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    script: 'Ol Chiki',
    unicodeRange: [0x1c50, 0x1c7f],
    gnaniSTT: false,
    gnaniTTS: false,
    samplePhrases: ['ᱡᱚᱦᱟᱨ! ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱜ ᱵᱤᱱᱟ?'],
  },
];

// Romanised/Colloquial Keyword Patterns
const TANGLISH_PATTERNS = [
  /\b(vanakkam|epdi|irukinga|iruka|enna|solunga|solu|nandri|panna|romba|aama|illa|kudunga|theriyum|therla|ungaluku|ippo|eppovum|paathutu|panreenga|inga|anga|yaar|ethuku|kooda|seri|paravala)\b/i,
];

const HINGLISH_PATTERNS = [
  /\b(namaste|kaise|kaisi|kaisa|kya|chal|raha|rahi|batao|bataiye|theek|shukriya|kripya|mujhe|aapka|tumhara|accha|acche|kuch|nahi|karna|chahiye|hoga|karenge|samajh|aaya)\b/i,
];

const TELUGISH_PATTERNS = [
  /\b(namaskaram|ela|unnaru|enti|sangathi|dhanyavadalu|cheyyali|eppudu|ekkada|kavali|undhi|ledhu|chudandi)\b/i,
];

const KANGLISH_PATTERNS = [
  /\b(namaskara|hegiddira|hegiddeera|enu|samachara|dhanyavadagalu|madabeku|hoge|illi|alli|beku|beda)\b/i,
];

const MANGLISH_PATTERNS = [
  /\b(namaskaram|engane|und|entha|vishesham|nanni|cheyyanam|ippol|ivide|avide|venam|venda)\b/i,
];

/**
 * Intelligent confidence-aware language detector for Indian languages and English
 */
export function detectIndianLanguage(text: string): {
  code: string;
  name: string;
  isRomanised: boolean;
  confidence: number;
  gnaniSupported: boolean;
  script: string;
} {
  const clean = text.trim();
  if (!clean) {
    return {
      code: 'en',
      name: 'English',
      isRomanised: false,
      confidence: 1.0,
      gnaniSupported: true,
      script: 'Latin',
    };
  }

  // 1. Check for specific distinct scripts
  // Tamil: 0x0B80 - 0x0BFF
  if (/[\u0B80-\u0BFF]/.test(clean)) {
    return { code: 'ta', name: 'Tamil (தமிழ்)', isRomanised: false, confidence: 0.98, gnaniSupported: true, script: 'Tamil' };
  }
  // Telugu: 0x0C00 - 0x0C7F
  if (/[\u0C00-\u0C7F]/.test(clean)) {
    return { code: 'te', name: 'Telugu (తెలుగు)', isRomanised: false, confidence: 0.98, gnaniSupported: true, script: 'Telugu' };
  }
  // Kannada: 0x0C80 - 0x0CFF
  if (/[\u0C80-\u0CFF]/.test(clean)) {
    return { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', isRomanised: false, confidence: 0.98, gnaniSupported: true, script: 'Kannada' };
  }
  // Malayalam: 0x0D00 - 0x0D7F
  if (/[\u0D00-\u0D7F]/.test(clean)) {
    return { code: 'ml', name: 'Malayalam (മലയാളം)', isRomanised: false, confidence: 0.98, gnaniSupported: true, script: 'Malayalam' };
  }
  // Bengali / Assamese: 0x0980 - 0x09FF
  if (/[\u0980-\u09FF]/.test(clean)) {
    // Check for Assamese specific characters 'ৰ' (0x09F0) or 'ৱ' (0x09F1)
    if (/[\u09F0\u09F1]/.test(clean)) {
      return { code: 'as', name: 'Assamese (অসমীয়া)', isRomanised: false, confidence: 0.95, gnaniSupported: false, script: 'Assamese' };
    }
    return { code: 'bn', name: 'Bengali (বাংলা)', isRomanised: false, confidence: 0.95, gnaniSupported: true, script: 'Bengali' };
  }
  // Gujarati: 0x0A80 - 0x0AFF
  if (/[\u0A80-\u0AFF]/.test(clean)) {
    return { code: 'gu', name: 'Gujarati (ગુજરાતી)', isRomanised: false, confidence: 0.98, gnaniSupported: true, script: 'Gujarati' };
  }
  // Gurmukhi / Punjabi: 0x0A00 - 0x0A7F
  if (/[\u0A00-\u0A7F]/.test(clean)) {
    return { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', isRomanised: false, confidence: 0.98, gnaniSupported: true, script: 'Gurmukhi' };
  }
  // Odia: 0x0B00 - 0x0B7F
  if (/[\u0B00-\u0B7F]/.test(clean)) {
    return { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', isRomanised: false, confidence: 0.98, gnaniSupported: false, script: 'Odia' };
  }
  // Ol Chiki (Santali): 0x1C50 - 0x1C7F
  if (/[\u1C50-\u1C7F]/.test(clean)) {
    return { code: 'sat', name: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)', isRomanised: false, confidence: 0.99, gnaniSupported: false, script: 'Ol Chiki' };
  }
  // Meetei Mayek (Manipuri): 0xABC0 - 0xABFF
  if (/[\uABC0-\uABFF]/.test(clean)) {
    return { code: 'mni', name: 'Manipuri (ꯃꯤꯇꯩꯂꯣꯟ)', isRomanised: false, confidence: 0.99, gnaniSupported: false, script: 'Meetei Mayek' };
  }
  // Perso-Arabic (Urdu / Kashmiri / Sindhi): 0x0600 - 0x06FF
  if (/[\u0600-\u06FF]/.test(clean)) {
    return { code: 'ur', name: 'Urdu (اردو)', isRomanised: false, confidence: 0.92, gnaniSupported: false, script: 'Arabic' };
  }

  // Devanagari Script (Hindi, Marathi, Sanskrit, Nepali, Maithili, Konkani, Bodo, Dogri)
  if (/[\u0900-\u097F]/.test(clean)) {
    // Check Marathi specific character 'ळ' (0x0933) or common Marathi endings
    if (/[\u0933]|\b(आहे|नाही|कसे|काय|आहात|करा|होते)\b/.test(clean)) {
      return { code: 'mr', name: 'Marathi (मराठी)', isRomanised: false, confidence: 0.92, gnaniSupported: true, script: 'Devanagari' };
    }
    // Check Sanskrit endings (विसर्ग 'ः', अनुस्वार, asti, etc.)
    if (/[\u0903]|\b(अस्ति|भवति|कथम्|अहम्|त्वम्|धन्यवादः)\b/.test(clean)) {
      return { code: 'sa', name: 'Sanskrit (संस्कृतम्)', isRomanised: false, confidence: 0.90, gnaniSupported: false, script: 'Devanagari' };
    }
    // Default Devanagari to Hindi
    return { code: 'hi', name: 'Hindi (हिन्दी)', isRomanised: false, confidence: 0.95, gnaniSupported: true, script: 'Devanagari' };
  }

  // 2. Check Romanised / Transliterated typing
  for (const pat of TANGLISH_PATTERNS) {
    if (pat.test(clean)) {
      return { code: 'tanglish', name: 'Tanglish (Tamil)', isRomanised: true, confidence: 0.88, gnaniSupported: true, script: 'Latin' };
    }
  }
  for (const pat of HINGLISH_PATTERNS) {
    if (pat.test(clean)) {
      return { code: 'hinglish', name: 'Hinglish (Hindi)', isRomanised: true, confidence: 0.88, gnaniSupported: true, script: 'Latin' };
    }
  }
  for (const pat of TELUGISH_PATTERNS) {
    if (pat.test(clean)) {
      return { code: 'te-latin', name: 'Telugu (Romanised)', isRomanised: true, confidence: 0.85, gnaniSupported: true, script: 'Latin' };
    }
  }
  for (const pat of KANGLISH_PATTERNS) {
    if (pat.test(clean)) {
      return { code: 'kn-latin', name: 'Kannada (Romanised)', isRomanised: true, confidence: 0.85, gnaniSupported: true, script: 'Latin' };
    }
  }
  for (const pat of MANGLISH_PATTERNS) {
    if (pat.test(clean)) {
      return { code: 'ml-latin', name: 'Malayalam (Romanised)', isRomanised: true, confidence: 0.85, gnaniSupported: true, script: 'Latin' };
    }
  }

  // Default English
  return { code: 'en', name: 'English', isRomanised: false, confidence: 0.85, gnaniSupported: true, script: 'Latin' };
}

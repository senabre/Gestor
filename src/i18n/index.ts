import es from './es';
import en from './en';
import val from './val';

export const translations = {
  es,
  en,
  val
} as const;

export type TranslationKey = keyof typeof es;

// Validate translations have the same keys
const esKeys = Object.keys(es).sort();
const enKeys = Object.keys(en).sort();
const valKeys = Object.keys(val).sort();

if (JSON.stringify(esKeys) !== JSON.stringify(enKeys) || 
    JSON.stringify(esKeys) !== JSON.stringify(valKeys)) {
  console.warn('Translation keys mismatch detected!');
  
  const missingInEn = esKeys.filter(key => !enKeys.includes(key));
  const missingInVal = esKeys.filter(key => !valKeys.includes(key));
  
  if (missingInEn.length) {
    console.warn('Missing in English:', missingInEn);
  }
  if (missingInVal.length) {
    console.warn('Missing in Valencian:', missingInVal);
  }
}
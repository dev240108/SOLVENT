import { MerchantCategory } from "@/types";

export interface BrandRule {
  pattern: RegExp;
  canonicalName: string;
  category: MerchantCategory;
}

export const KNOWN_BRANDS: BrandRule[] = [
  // Quick Commerce
  { pattern: /\b(BLINKIT|BLINK\s*COMMERCE|GROFERS)\b/i, canonicalName: "Blinkit", category: "QUICK_COMMERCE" },
  { pattern: /\b(ZEPTO|KIRANAKART)\b/i, canonicalName: "Zepto", category: "QUICK_COMMERCE" },
  { pattern: /\b(INSTAMART|SWIGGY\s*INSTAMART)\b/i, canonicalName: "Instamart", category: "QUICK_COMMERCE" },
  { pattern: /\b(BIGBASKET|BB\s*NOW|SUPERMARKET\s*GROCERY)\b/i, canonicalName: "BigBasket", category: "QUICK_COMMERCE" },
  { pattern: /\b(DUNZO)\b/i, canonicalName: "Dunzo", category: "QUICK_COMMERCE" },

  // Food & Dining
  { pattern: /\b(SWIGGY|BUNDL\s*TECH)\b/i, canonicalName: "Swiggy", category: "FOOD_DINING" },
  { pattern: /\b(ZOMATO)\b/i, canonicalName: "Zomato", category: "FOOD_DINING" },
  { pattern: /\b(MCDONALD|HARDCASTLE)\b/i, canonicalName: "McDonald's", category: "FOOD_DINING" },
  { pattern: /\b(DOMINOS|JUBILANT\s*FOOD)\b/i, canonicalName: "Domino's", category: "FOOD_DINING" },
  { pattern: /\b(STARBUCKS|TATA\s*STARBUCKS)\b/i, canonicalName: "Starbucks", category: "FOOD_DINING" },
  { pattern: /\b(CHAAYOS|CHAI\s*POINT|TEA\s*POST)\b/i, canonicalName: "Chai & Tea Cafes", category: "FOOD_DINING" },
  { pattern: /\b(BURGER\s*KING|RESTAURANT\s*BRANDS)\b/i, canonicalName: "Burger King", category: "FOOD_DINING" },
  { pattern: /\b(KFC|PIZZA\s*HUT|DEVYANI|SAPPHIRE)\b/i, canonicalName: "Fast Food", category: "FOOD_DINING" },
  { pattern: /\b(SUBWAY|HALDIRAM|BIKANERVALA)\b/i, canonicalName: "Dining", category: "FOOD_DINING" },

  // Mobility & Commute
  { pattern: /\b(UBER)\b/i, canonicalName: "Uber", category: "MOBILITY" },
  { pattern: /\b(OLA|ANI\s*TECH)\b/i, canonicalName: "Ola Cabs", category: "MOBILITY" },
  { pattern: /\b(RAPIDO|ROPPEN\s*TRANS)\b/i, canonicalName: "Rapido", category: "MOBILITY" },
  { pattern: /\b(BLUSMART)\b/i, canonicalName: "BluSmart", category: "MOBILITY" },
  { pattern: /\b(IRCTC|INDIAN\s*RAIL)\b/i, canonicalName: "IRCTC / Railways", category: "MOBILITY" },
  { pattern: /\b(METRO|DMRC|BMRCL|MMRCL)\b/i, canonicalName: "City Metro", category: "MOBILITY" },
  { pattern: /\b(HPCL|BPCL|IOCL|INDIAN\s*OIL|SHELL|PETROL|FUEL)\b/i, canonicalName: "Fuel Station", category: "MOBILITY" },

  // Subscriptions & Recurring
  { pattern: /\b(NETFLIX)\b/i, canonicalName: "Netflix", category: "SUBSCRIPTIONS" },
  { pattern: /\b(SPOTIFY)\b/i, canonicalName: "Spotify", category: "SUBSCRIPTIONS" },
  { pattern: /\b(HOTSTAR|DISNEY\s*HOTSTAR)\b/i, canonicalName: "Disney+ Hotstar", category: "SUBSCRIPTIONS" },
  { pattern: /\b(PRIME\s*VIDEO|AMAZON\s*DIGITAL|AMZN\s*PRIME)\b/i, canonicalName: "Amazon Prime", category: "SUBSCRIPTIONS" },
  { pattern: /\b(YOUTUBE\s*PREMIUM|GOOGLE\s*YOUTUBE)\b/i, canonicalName: "YouTube Premium", category: "SUBSCRIPTIONS" },
  { pattern: /\b(APPLE\.COM|ITUNES|ICLOUD)\b/i, canonicalName: "Apple Services", category: "SUBSCRIPTIONS" },
  { pattern: /\b(GOOGLE\s*STORAGE|GOOGLE\s*PLAY)\b/i, canonicalName: "Google One / Play", category: "SUBSCRIPTIONS" },
  { pattern: /\b(CHATGPT|OPENAI)\b/i, canonicalName: "OpenAI ChatGPT", category: "SUBSCRIPTIONS" },
  { pattern: /\b(AIRTEL|JIO|VODAFONE|VI\s*PREPAID|TELECOM)\b/i, canonicalName: "Mobile / Broadband", category: "SUBSCRIPTIONS" },

  // Shopping & Retail
  { pattern: /\b(AMAZON|AMZN|AMAZON\s*PAY)\b/i, canonicalName: "Amazon Shopping", category: "SHOPPING" },
  { pattern: /\b(FLIPKART)\b/i, canonicalName: "Flipkart", category: "SHOPPING" },
  { pattern: /\b(MYNTRA)\b/i, canonicalName: "Myntra", category: "SHOPPING" },
  { pattern: /\b(AJIO|RELIANCE\s*RETAIL)\b/i, canonicalName: "Ajio / Reliance", category: "SHOPPING" },
  { pattern: /\b(NYKAA|FSN\s*E-COMMERCE)\b/i, canonicalName: "Nykaa", category: "SHOPPING" },
  { pattern: /\b(DECATHLON)\b/i, canonicalName: "Decathlon", category: "SHOPPING" },
  { pattern: /\b(ZARA|H&M|UNIQLO)\b/i, canonicalName: "Apparel Retail", category: "SHOPPING" },

  // Peer to Peer / UPI indicators
  { pattern: /\b(UPI\/P2P|UPI-P2P|P2P\s*PAYMENT|TRANSFER\s*TO)\b/i, canonicalName: "Peer Transfer", category: "P2P_TRANSFER" },
];

/**
 * Normalizes a raw narration text against known brand rules.
 * If match found, returns canonical name & category.
 * If not found, returns null so caller can pseudonymize.
 */
export function matchBrand(narration: string): { canonicalName: string; category: MerchantCategory } | null {
  const upper = narration.toUpperCase();
  for (const rule of KNOWN_BRANDS) {
    if (rule.pattern.test(upper)) {
      return { canonicalName: rule.canonicalName, category: rule.category };
    }
  }
  return null;
}

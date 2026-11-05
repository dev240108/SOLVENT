import { MerchantCategory } from "@/types";

export interface BrandRule {
  pattern: RegExp;
  canonicalName: string;
  category: MerchantCategory;
}

export const KNOWN_BRANDS: BrandRule[] = [
  // Quick Commerce & Groceries
  { pattern: /\b(BLINKIT|BLINK\s*COMMERCE|GROFERS)\b/i, canonicalName: "Blinkit", category: "QUICK_COMMERCE" },
  { pattern: /\b(ZEPTO|KIRANAKART)\b/i, canonicalName: "Zepto", category: "QUICK_COMMERCE" },
  { pattern: /\b(INSTAMART|SWIGGY\s*INSTAMART)\b/i, canonicalName: "Swiggy Instamart", category: "QUICK_COMMERCE" },
  { pattern: /\b(BIGBASKET|BB\s*NOW|BB\s*DAILY|SUPERMARKET\s*GROCERY)\b/i, canonicalName: "BigBasket", category: "QUICK_COMMERCE" },
  { pattern: /\b(DUNZO)\b/i, canonicalName: "Dunzo", category: "QUICK_COMMERCE" },
  { pattern: /\b(JIOMART|RELIANCE\s*FRESH|RELIANCE\s*SMART)\b/i, canonicalName: "JioMart / Reliance Fresh", category: "QUICK_COMMERCE" },
  { pattern: /\b(DMART|AVENUE\s*SUPERMARTS)\b/i, canonicalName: "DMart", category: "QUICK_COMMERCE" },
  { pattern: /\b(NATURES\s*BASKET|SPENCERS)\b/i, canonicalName: "Supermarket Groceries", category: "QUICK_COMMERCE" },

  // Food & Dining
  { pattern: /\b(SWIGGY|BUNDL\s*TECH)\b/i, canonicalName: "Swiggy", category: "FOOD_DINING" },
  { pattern: /\b(ZOMATO)\b/i, canonicalName: "Zomato", category: "FOOD_DINING" },
  { pattern: /\b(MCDONALD|HARDCASTLE)\b/i, canonicalName: "McDonald's", category: "FOOD_DINING" },
  { pattern: /\b(DOMINOS|JUBILANT\s*FOOD)\b/i, canonicalName: "Domino's Pizza", category: "FOOD_DINING" },
  { pattern: /\b(STARBUCKS|TATA\s*STARBUCKS)\b/i, canonicalName: "Starbucks", category: "FOOD_DINING" },
  { pattern: /\b(CHAAYOS|CHAI\s*POINT|TEA\s*POST|MBA\s*CHAIWALA)\b/i, canonicalName: "Chai & Cafe", category: "FOOD_DINING" },
  { pattern: /\b(BURGER\s*KING|RESTAURANT\s*BRANDS)\b/i, canonicalName: "Burger King", category: "FOOD_DINING" },
  { pattern: /\b(KFC|PIZZA\s*HUT|DEVYANI|SAPPHIRE)\b/i, canonicalName: "KFC / Pizza Hut", category: "FOOD_DINING" },
  { pattern: /\b(SUBWAY|HALDIRAM|BIKANERVALA|SARAVANA\s*BHAVAN)\b/i, canonicalName: "Restaurant Dining", category: "FOOD_DINING" },
  { pattern: /\b(EATCLUB|BOX8|MOJO\s*PIZZA|BEHROUZ|FAASOS|REBEL\s*FOODS)\b/i, canonicalName: "EatClub / Cloud Kitchen", category: "FOOD_DINING" },
  { pattern: /\b(THIRD\s*WAVE|BLUE\s*TOKAI|CCD|CAFE\s*COFFEE\s*DAY)\b/i, canonicalName: "Coffee & Cafe", category: "FOOD_DINING" },

  // Mobility, Travel & Fuel
  { pattern: /\b(UBER)\b/i, canonicalName: "Uber", category: "MOBILITY" },
  { pattern: /\b(OLA|ANI\s*TECH)\b/i, canonicalName: "Ola Cabs", category: "MOBILITY" },
  { pattern: /\b(RAPIDO|ROPPEN\s*TRANS)\b/i, canonicalName: "Rapido", category: "MOBILITY" },
  { pattern: /\b(BLUSMART)\b/i, canonicalName: "BluSmart", category: "MOBILITY" },
  { pattern: /\b(IRCTC|INDIAN\s*RAIL)\b/i, canonicalName: "IRCTC / Railways", category: "MOBILITY" },
  { pattern: /\b(METRO|DMRC|BMRCL|MMRCL|CMRL)\b/i, canonicalName: "City Metro", category: "MOBILITY" },
  { pattern: /\b(HPCL|BPCL|IOCL|INDIAN\s*OIL|SHELL|PETROL|FUEL|CNG\s*STATION)\b/i, canonicalName: "Fuel / Petrol Pump", category: "MOBILITY" },
  { pattern: /\b(FASTAG|IHMCL|TOLL\s*PLAZA)\b/i, canonicalName: "FASTag Toll", category: "MOBILITY" },
  { pattern: /\b(MAKEMYTRIP|GOIBIBO|CLEARTRIP|EASEMYTRIP|INDIGO|AIR\s*INDIA)\b/i, canonicalName: "Travel & Flights", category: "MOBILITY" },

  // Subscriptions & Bills
  { pattern: /\b(NETFLIX)\b/i, canonicalName: "Netflix", category: "SUBSCRIPTIONS" },
  { pattern: /\b(SPOTIFY)\b/i, canonicalName: "Spotify", category: "SUBSCRIPTIONS" },
  { pattern: /\b(HOTSTAR|DISNEY\s*HOTSTAR)\b/i, canonicalName: "Disney+ Hotstar", category: "SUBSCRIPTIONS" },
  { pattern: /\b(PRIME\s*VIDEO|AMAZON\s*DIGITAL|AMZN\s*PRIME)\b/i, canonicalName: "Amazon Prime", category: "SUBSCRIPTIONS" },
  { pattern: /\b(YOUTUBE\s*PREMIUM|GOOGLE\s*YOUTUBE)\b/i, canonicalName: "YouTube Premium", category: "SUBSCRIPTIONS" },
  { pattern: /\b(APPLE\.COM|ITUNES|ICLOUD|APPLE\s*SERVICES)\b/i, canonicalName: "Apple Services", category: "SUBSCRIPTIONS" },
  { pattern: /\b(GOOGLE\s*STORAGE|GOOGLE\s*PLAY|GOOGLE\s*ONE)\b/i, canonicalName: "Google One / Play", category: "SUBSCRIPTIONS" },
  { pattern: /\b(CHATGPT|OPENAI)\b/i, canonicalName: "OpenAI ChatGPT", category: "SUBSCRIPTIONS" },
  { pattern: /\b(AIRTEL|BHARTI\s*AIRTEL)\b/i, canonicalName: "Airtel Mobile / DTH", category: "SUBSCRIPTIONS" },
  { pattern: /\b(JIO|RELIANCE\s*JIO)\b/i, canonicalName: "Jio Mobile / Fiber", category: "SUBSCRIPTIONS" },
  { pattern: /\b(VODAFONE|VI\s*PREPAID|VI\s*POSTPAID)\b/i, canonicalName: "Vi Mobile Bill", category: "SUBSCRIPTIONS" },
  { pattern: /\b(TATA\s*PLAY|TATA\s*SKY|DISH\s*TV)\b/i, canonicalName: "DTH / TV", category: "SUBSCRIPTIONS" },
  { pattern: /\b(SONYLIV|ZEE5|JIOCINEMA)\b/i, canonicalName: "OTT Subscription", category: "SUBSCRIPTIONS" },
  { pattern: /\b(BESCOM|TNEB|MSEDCL|BSES|PSPCL|ELECTRICITY|POWER\s*CORP)\b/i, canonicalName: "Electricity Bill", category: "SUBSCRIPTIONS" },

  // Shopping & Retail
  { pattern: /\b(AMAZON|AMZN|AMAZON\s*PAY)\b/i, canonicalName: "Amazon Shopping", category: "SHOPPING" },
  { pattern: /\b(FLIPKART)\b/i, canonicalName: "Flipkart", category: "SHOPPING" },
  { pattern: /\b(MYNTRA)\b/i, canonicalName: "Myntra", category: "SHOPPING" },
  { pattern: /\b(AJIO|RELIANCE\s*RETAIL)\b/i, canonicalName: "Ajio / Reliance Retail", category: "SHOPPING" },
  { pattern: /\b(NYKAA|FSN\s*E-COMMERCE)\b/i, canonicalName: "Nykaa", category: "SHOPPING" },
  { pattern: /\b(DECATHLON)\b/i, canonicalName: "Decathlon", category: "SHOPPING" },
  { pattern: /\b(ZARA|H&M|UNIQLO|MAX\s*FASHION|WESTSIDE|LIFESTYLE|PANTALOONS)\b/i, canonicalName: "Clothing / Fashion Store", category: "SHOPPING" },
  { pattern: /\b(CROMA|VIJAY\s*SALES|RELIANCE\s*DIGITAL)\b/i, canonicalName: "Electronics Store", category: "SHOPPING" },
  { pattern: /\b(APOLLO\s*PHARMACY|1MG|PHARMEASY|NETMEDS|MEDPLUS)\b/i, canonicalName: "Pharmacy / Medicines", category: "SHOPPING" },

  // Banking & Transfers
  { pattern: /\b(SALARY|SAL\s*FOR|MONTHLY\s*SALARY)\b/i, canonicalName: "Salary Credit", category: "P2P_TRANSFER" },
  { pattern: /\b(INT\.?PD|INTEREST\s*PAID|INT\s*CR)\b/i, canonicalName: "Bank Interest", category: "P2P_TRANSFER" },
  { pattern: /\b(ATM\s*WDL|ATM\s*CASH|CASH\s*WDL)\b/i, canonicalName: "ATM Cash Withdrawal", category: "UNCLASSIFIED" },
  { pattern: /\b(ZERODHA|GROWW|UPSTOX|ANGEL\s*ONE|INDMONEY)\b/i, canonicalName: "Investment / Stocks", category: "P2P_TRANSFER" },
  { pattern: /\b(CRED\s*CLUB|CRED\s*PAY)\b/i, canonicalName: "CRED Bill Payment", category: "SUBSCRIPTIONS" },
  { pattern: /\b(UPI\/P2P|UPI-P2P|TRANSFER\s*TO)\b/i, canonicalName: "Personal UPI Transfer", category: "P2P_TRANSFER" },
];

/**
 * Normalizes a raw narration text against known brand rules.
 * If match found, returns canonical name & category.
 */
export function matchBrand(narration: string): { canonicalName: string; category: MerchantCategory } | null {
  if (!narration) return null;
  const upper = narration.toUpperCase();
  for (const rule of KNOWN_BRANDS) {
    if (rule.pattern.test(upper)) {
      return { canonicalName: rule.canonicalName, category: rule.category };
    }
  }
  return null;
}

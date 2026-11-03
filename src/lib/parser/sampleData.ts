import { NormalizedTransaction } from "@/types";

/**
 * Returns a high-fidelity synthetic 60-day statement dataset for an Indian professional / student.
 * Clearly labeled as synthetic.
 */
export function getSyntheticTransactions(): NormalizedTransaction[] {
  const txns: NormalizedTransaction[] = [];
  const baseDate = new Date();

  const addTx = (
    daysAgo: number,
    time: string,
    merchantKey: string,
    amountINR: number,
    type: "DEBIT" | "CREDIT",
    categoryHint: any,
    snippet: string
  ) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - daysAgo);
    const dateStr = d.toISOString().slice(0, 10);

    const matchHour = parseInt(time.split(":")[0], 10);
    let timeBucket: any = "AFTERNOON";
    if (matchHour >= 6 && matchHour < 12) timeBucket = "MORNING";
    else if (matchHour >= 12 && matchHour < 18) timeBucket = "AFTERNOON";
    else if (matchHour >= 18 && matchHour < 23) timeBucket = "EVENING";
    else timeBucket = "LATE_NIGHT";

    txns.push({
      date: dateStr,
      time,
      merchantKey,
      amountINR,
      type,
      timeBucket,
      categoryHint,
      parseConfidence: 0.98,
      rawNarrationSnippet: snippet,
    });
  };

  // Salary credits (2 months)
  addTx(55, "09:30", "Employer Payroll Credit", 45000, "CREDIT", "UNCLASSIFIED", "ACH CR CORP SALARY");
  addTx(25, "09:30", "Employer Payroll Credit", 45000, "CREDIT", "UNCLASSIFIED", "ACH CR CORP SALARY");

  // Recurring Subscriptions
  addTx(52, "02:15", "Netflix", 649, "DEBIT", "SUBSCRIPTIONS", "NETFLIX INDIA RECURRING DEBIT");
  addTx(22, "02:15", "Netflix", 649, "DEBIT", "SUBSCRIPTIONS", "NETFLIX INDIA RECURRING DEBIT");
  addTx(48, "03:00", "Spotify", 119, "DEBIT", "SUBSCRIPTIONS", "SPOTIFY INDIA AUTOPAY");
  addTx(18, "03:00", "Spotify", 119, "DEBIT", "SUBSCRIPTIONS", "SPOTIFY INDIA AUTOPAY");
  addTx(40, "11:20", "Airtel / Jio", 899, "DEBIT", "SUBSCRIPTIONS", "AIRTEL FIBER BROADBAND");
  addTx(10, "11:20", "Airtel / Jio", 899, "DEBIT", "SUBSCRIPTIONS", "AIRTEL FIBER BROADBAND");

  // Quick Commerce (Blinkit & Zepto) - frequent late evening / afternoon
  const qcMerchants = ["Blinkit", "Zepto", "Instamart"];
  for (let d = 58; d >= 2; d -= 2) {
    const merch = qcMerchants[d % qcMerchants.length];
    const hour = (18 + (d % 6)).toString().padStart(2, "0");
    const min = (10 + (d * 3) % 49).toString().padStart(2, "0");
    const amt = 135 + (d * 17) % 240;
    addTx(d, `${hour}:${min}`, merch, amt, "DEBIT", "QUICK_COMMERCE", `UPI/${merch.toUpperCase()}/order`);
  }

  // Food & Dining (Swiggy & Zomato)
  for (let d = 57; d >= 3; d -= 3) {
    const merch = d % 2 === 0 ? "Swiggy" : "Zomato";
    const hour = (19 + (d % 5)).toString().padStart(2, "0");
    const min = (15 + (d * 4) % 40).toString().padStart(2, "0");
    const amt = 240 + (d * 23) % 420;
    addTx(d, `${hour}:${min}`, merch, amt, "DEBIT", "FOOD_DINING", `UPI/${merch.toUpperCase()}/FOOD`);
  }

  // Mobility (Uber / Rapido / Metro)
  for (let d = 55; d >= 4; d -= 3) {
    const merch = d % 2 === 0 ? "Uber" : "Rapido";
    const hour = (d % 2 === 0 ? "09" : "18");
    const min = (10 + d) % 50;
    const amt = merch === "Rapido" ? 65 + (d % 35) : 210 + (d % 150);
    addTx(d, `${hour}:${min.toString().padStart(2, "0")}`, merch, amt, "DEBIT", "MOBILITY", `UPI/${merch}`);
  }

  // Micro-Drains (< ₹100): Tapri, Chai, Snacks, Pan shop, Micro-QR
  for (let d = 59; d >= 1; d--) {
    // 1 to 2 micro-spends almost daily
    const amt1 = 15 + (d * 7) % 75; // e.g. ₹20, ₹35, ₹50, ₹85
    addTx(d, `11:${(10 + d) % 50}`, "Chai & Tea Cafes", amt1, "DEBIT", "MICRO_QR", "UPI/SCAN/CHAI_CORNER");

    if (d % 2 === 0) {
      const amt2 = 25 + (d * 11) % 65;
      addTx(d, `16:${(20 + d) % 50}`, "Micro-QR Tapri", amt2, "DEBIT", "MICRO_QR", "UPI/SCAN/TAPRI_CORNER");
    }
  }

  // Shopping & Lifestyle
  addTx(45, "14:20", "Amazon Shopping", 2499, "DEBIT", "SHOPPING", "AMAZON PAY INDIA");
  addTx(30, "16:45", "Myntra", 1850, "DEBIT", "SHOPPING", "MYNTRA DESIGNS BLR");
  addTx(12, "20:10", "Amazon Shopping", 1240, "DEBIT", "SHOPPING", "AMAZON PAY INDIA");

  // Peer to peer transfers
  addTx(50, "12:00", "Peer Transfer (Rent/Split)", 12500, "DEBIT", "P2P_TRANSFER", "UPI/P2P/HOUSE_RENT");
  addTx(20, "12:00", "Peer Transfer (Rent/Split)", 12500, "DEBIT", "P2P_TRANSFER", "UPI/P2P/HOUSE_RENT");
  addTx(35, "19:30", "Peer Transfer", 500, "CREDIT", "P2P_TRANSFER", "UPI/P2P/SPLIT_REFUND");

  return txns;
}

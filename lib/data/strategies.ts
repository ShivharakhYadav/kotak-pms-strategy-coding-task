import type { Strategy } from "@/lib/types/strategy";

/**
 * Entirely fictional placeholder data for the take-home assessment.
 * No real Kotak content, figures, or production information.
 */
export const strategies: Strategy[] = [
  {
    slug: "kotak-sample-focus-portfolio",
    name: "Kotak Sample Focus Portfolio",
    fundManagerName: "Aditi Sharma",
    inceptionDate: "2016-04-01",
    benchmark: "Nifty 200 TRI",
    minimumInvestment: 5000000,
    trailingReturns: [
      { period: "1M", strategyReturn: 2.1, benchmarkReturn: 1.8 },
      { period: "3M", strategyReturn: 6.4, benchmarkReturn: 5.2 },
      { period: "6M", strategyReturn: 11.2, benchmarkReturn: 9.0 },
      { period: "1Y", strategyReturn: 18.5, benchmarkReturn: 14.2 },
      { period: "3Y", strategyReturn: 16.8, benchmarkReturn: 13.1 },
      { period: "5Y", strategyReturn: 15.2, benchmarkReturn: 12.4 },
      { period: "SI", strategyReturn: 17.9, benchmarkReturn: 13.6 },
    ],
    holdings: [
      { stockName: "HDFC Bank Ltd", allocationPercentage: 9.8 },
      { stockName: "ICICI Bank Ltd", allocationPercentage: 8.6 },
      { stockName: "Reliance Industries Ltd", allocationPercentage: 7.9 },
      { stockName: "Infosys Ltd", allocationPercentage: 7.1 },
      { stockName: "Larsen & Toubro Ltd", allocationPercentage: 6.4 },
      { stockName: "Bajaj Finance Ltd", allocationPercentage: 5.8 },
      { stockName: "Titan Company Ltd", allocationPercentage: 5.2 },
    ],
  },
];

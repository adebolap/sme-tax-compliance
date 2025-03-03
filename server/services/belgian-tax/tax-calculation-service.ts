import { z } from "zod";
import { Invoice } from "@shared/schema";

const TaxRateSchema = z.object({
  category: z.enum(["standard", "reduced", "zero", "exempt"]),
  rate: z.number(),
  description: z.string(),
});

type TaxRate = z.infer<typeof TaxRateSchema>;

export class BelgianTaxCalculationService {
  // Belgian VAT rates as of 2025
  private static readonly VAT_RATES: TaxRate[] = [
    { category: "standard", rate: 21, description: "Standard rate" },
    { category: "reduced", rate: 12, description: "First reduced rate - restaurants, food service" },
    { category: "reduced", rate: 6, description: "Second reduced rate - basic necessities" },
    { category: "zero", rate: 0, description: "Zero-rated goods and services" },
    { category: "exempt", rate: 0, description: "VAT exempt transactions" },
  ];

  static getApplicableVATRate(category: string): TaxRate {
    const rate = this.VAT_RATES.find(r => r.category === category);
    if (!rate) {
      throw new Error(`Invalid VAT category: ${category}`);
    }
    return rate;
  }

  static calculateVAT(amount: number, category: string = "standard"): {
    vatAmount: number;
    totalAmount: number;
    appliedRate: number;
  } {
    const rate = this.getApplicableVATRate(category);
    const vatAmount = (amount * rate.rate) / 100;
    
    return {
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      totalAmount: parseFloat((amount + vatAmount).toFixed(2)),
      appliedRate: rate.rate,
    };
  }

  static applyDeductions(totalAmount: number, deductions: Array<{
    type: string;
    amount: number;
  }>): {
    finalAmount: number;
    appliedDeductions: Array<{
      type: string;
      amount: number;
    }>;
  } {
    let finalAmount = totalAmount;
    const appliedDeductions = [];

    for (const deduction of deductions) {
      // Validate deduction type and calculate amount
      switch (deduction.type) {
        case "professional":
          // Professional expenses deduction (limited to 30%)
          const maxDeduction = totalAmount * 0.3;
          const actualDeduction = Math.min(deduction.amount, maxDeduction);
          finalAmount -= actualDeduction;
          appliedDeductions.push({
            type: deduction.type,
            amount: actualDeduction,
          });
          break;
        case "investment":
          // Investment deduction (limited to 20%)
          const maxInvestmentDeduction = totalAmount * 0.2;
          const actualInvestmentDeduction = Math.min(deduction.amount, maxInvestmentDeduction);
          finalAmount -= actualInvestmentDeduction;
          appliedDeductions.push({
            type: deduction.type,
            amount: actualInvestmentDeduction,
          });
          break;
        default:
          throw new Error(`Invalid deduction type: ${deduction.type}`);
      }
    }

    return {
      finalAmount: parseFloat(finalAmount.toFixed(2)),
      appliedDeductions,
    };
  }

  static generateTaxSummary(invoices: Invoice[]): {
    totalRevenue: number;
    totalVAT: number;
    vatBreakdown: Record<string, { count: number; amount: number }>;
  } {
    const summary = {
      totalRevenue: 0,
      totalVAT: 0,
      vatBreakdown: {} as Record<string, { count: number; amount: number }>,
    };

    for (const invoice of invoices) {
      const amount = Number(invoice.amount);
      const vatAmount = Number(invoice.vatAmount);
      
      summary.totalRevenue += amount;
      summary.totalVAT += vatAmount;

      const rateKey = `${invoice.vatRate}%`;
      if (!summary.vatBreakdown[rateKey]) {
        summary.vatBreakdown[rateKey] = { count: 0, amount: 0 };
      }
      summary.vatBreakdown[rateKey].count++;
      summary.vatBreakdown[rateKey].amount += vatAmount;
    }

    // Round all numbers to 2 decimal places
    summary.totalRevenue = parseFloat(summary.totalRevenue.toFixed(2));
    summary.totalVAT = parseFloat(summary.totalVAT.toFixed(2));
    Object.keys(summary.vatBreakdown).forEach(key => {
      summary.vatBreakdown[key].amount = parseFloat(
        summary.vatBreakdown[key].amount.toFixed(2)
      );
    });

    return summary;
  }
}

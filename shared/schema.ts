import { pgTable, text, serial, integer, date, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Helper function to validate Belgian VAT number format
const isValidBelgianVATFormat = (vat: string) => {
  const cleanVAT = vat.replace(/[^0-9]/g, '');
  return /^[0-9]{10}$/.test(cleanVAT);
};

// Add these fields to the users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  vatNumber: text("vat_number").notNull(),
  vatVerified: boolean("vat_verified").default(false),
  companyAddress: text("company_address"),
  vatVerificationDate: timestamp("vat_verification_date"),
});

// Update the insert schema to include the new fields
export const insertUserSchema = createInsertSchema(users)
  .extend({
    vatNumber: z.string()
      .transform(val => val.replace(/[^0-9]/g, ''))
      .refine(val => isValidBelgianVATFormat(val), {
        message: "Invalid Belgian VAT number format. Should be 10 digits",
      }),
  })
  .pick({
    username: true,
    password: true,
    companyName: true,
    vatNumber: true,
    vatVerified: true,
    companyAddress: true,
    vatVerificationDate: true,
  });

// Add tax category enum
export const TaxCategory = {
  STANDARD: "standard",
  REDUCED_12: "reduced",
  REDUCED_6: "reduced",
  ZERO: "zero",
  EXEMPT: "exempt",
} as const;

export type TaxCategoryType = typeof TaxCategory[keyof typeof TaxCategory];

// Update the invoices table to include tax category
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientName: text("client_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  taxCategory: text("tax_category").notNull().default("standard"),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: text("status").notNull(),
  deductions: text("deductions"),
});

// Update the invoice schema with tax category validation
export const insertInvoiceSchema = createInsertSchema(invoices)
  .extend({
    amount: z.string()
      .transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) throw new Error("Amount must be a positive number");
        return num.toFixed(2);
      }),
    vatRate: z.string()
      .transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > 100) throw new Error("VAT rate must be between 0 and 100");
        return num.toFixed(2);
      }),
    vatAmount: z.string()
      .transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0) throw new Error("Invalid VAT amount");
        return num.toFixed(2);
      }),
    taxCategory: z.enum([
      TaxCategory.STANDARD,
      TaxCategory.REDUCED_12,
      TaxCategory.REDUCED_6,
      TaxCategory.ZERO,
      TaxCategory.EXEMPT,
    ]).default(TaxCategory.STANDARD),
    deductions: z.string().optional(),
  })
  .pick({
    clientName: true,
    amount: true,
    vatRate: true,
    vatAmount: true,
    taxCategory: true,
    issueDate: true,
    dueDate: true,
    status: true,
    deductions: true,
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
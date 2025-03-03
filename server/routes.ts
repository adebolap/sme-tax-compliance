import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertInvoiceSchema } from "@shared/schema";
import { BelgianTaxReportingService } from "./services/belgian-tax/tax-reporting-service";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Invoice routes
  app.post("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(invoice);
    } catch (err) {
      res.status(400).json({ error: "Invalid invoice data" });
    }
  });

  app.get("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const invoices = await storage.getInvoices(req.user!.id);
    res.json(invoices);
  });

  app.get("/api/invoices/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const invoice = await storage.getInvoice(parseInt(req.params.id));
    if (!invoice || invoice.userId !== req.user!.id) {
      return res.sendStatus(404);
    }
    res.json(invoice);
  });

  // Tax reporting routes
  app.post("/api/tax/vat-report", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { startDate, endDate } = req.body;

      // Get user's invoices for the period
      const invoices = await storage.getInvoicesByDateRange(
        req.user!.id,
        new Date(startDate),
        new Date(endDate)
      );

      const report = await BelgianTaxReportingService.generateVATReport(
        invoices,
        new Date(startDate),
        new Date(endDate),
        req.user!.vatNumber
      );

      res.json(report);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to generate VAT report"
      });
    }
  });

  app.get("/api/tax/report-status/:reportId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const status = await BelgianTaxReportingService.checkReportStatus(req.params.reportId);
      res.json(status);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to check report status"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
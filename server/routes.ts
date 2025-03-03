import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertInvoiceSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}

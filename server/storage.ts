import { users, invoices, type User, type InsertUser, type Invoice, type InsertInvoice } from "@shared/schema";
import { db } from "./db";
import { eq, and, between } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createInvoice(invoice: InsertInvoice & { userId: number }): Promise<Invoice>;
  getInvoices(userId: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Invoice[]>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createInvoice(invoice: InsertInvoice & { userId: number }): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async getInvoices(userId: number): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.userId, userId));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoicesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Invoice[]> {
    return db.select()
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          between(invoices.issueDate, startDate, endDate)
        )
      );
  }
}

export const storage = new DatabaseStorage();
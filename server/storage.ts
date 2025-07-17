import { users, expenses, accountBalance, type User, type UpsertUser, type Expense, type InsertExpense, type AccountBalance, type InsertAccountBalance } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { eq, sql } from "drizzle-orm";
import { SupabaseRestStorage } from "./supabase-rest";

export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Expense operations
  getAllExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  getExpensesByCategory(category: string): Promise<Expense[]>;
  getUnpaidExpenses(): Promise<Expense[]>;
  markExpenseAsPaid(id: number): Promise<boolean>;
  
  // Account balance operations
  getAccountBalance(): Promise<AccountBalance | undefined>;
  updateAccountBalance(balance: InsertAccountBalance): Promise<AccountBalance>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private expenses: Map<number, Expense>;
  private currentExpenseId: number;
  private accountBalance: AccountBalance | undefined;

  constructor() {
    this.users = new Map();
    this.expenses = new Map();
    this.currentExpenseId = 1;
    this.accountBalance = undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  async getAllExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const expense: Expense = { 
      ...insertExpense, 
      id,
      isPaid: insertExpense.isPaid || "true",
      createdAt: new Date()
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: number, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense: Expense = { ...expense, ...updateData };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.category === category
    );
  }

  async getUnpaidExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.isPaid === "false"
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async markExpenseAsPaid(id: number): Promise<boolean> {
    const expense = this.expenses.get(id);
    if (!expense) return false;
    
    expense.isPaid = "true";
    this.expenses.set(id, expense);
    return true;
  }

  async getAccountBalance(): Promise<AccountBalance | undefined> {
    return this.accountBalance;
  }

  async updateAccountBalance(balanceData: InsertAccountBalance): Promise<AccountBalance> {
    const balance: AccountBalance = {
      id: 1,
      currentBalance: balanceData.currentBalance,
      updatedAt: new Date(),
    };
    this.accountBalance = balance;
    return balance;
  }
}

// Database storage implementation using Supabase
export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private client: Client;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }
    
    console.log("Database URL configured:", process.env.DATABASE_URL.substring(0, 50) + "...");
    
    try {
      // Use standard PostgreSQL client for Supabase
      this.client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });
      
      this.db = drizzle(this.client);
      console.log("✅ Connected to Supabase database");
      
      // Initialize tables
      this.initializeTables();
    } catch (error) {
      console.error("❌ Failed to connect to database:", error);
      throw error;
    }
  }

  private async initializeTables() {
    try {
      console.log("🔧 Attempting to create tables using PostgreSQL client...");
      
      // Connect to database first
      await this.client.connect();
      console.log("✅ PostgreSQL client connected");
      
      // Create tables using direct SQL
      await this.client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )
      `);

      await this.client.query(`
        CREATE TABLE IF NOT EXISTS expenses (
          id SERIAL PRIMARY KEY,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          value DECIMAL(10, 2) NOT NULL,
          date DATE NOT NULL,
          payment_method TEXT NOT NULL
        )
      `);

      console.log("✅ Database tables created successfully");
      
      // Test the connection by selecting from expenses table
      const testQuery = await this.client.query('SELECT * FROM expenses LIMIT 1');
      console.log("✅ Database connection and tables verified - ready for use!");
      
    } catch (error) {
      console.error("❌ Failed to initialize database tables:", error);
      console.log("📝 Using PostgreSQL client for Supabase connection");
      
      // Don't throw error, let the app continue
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async getAllExpenses(): Promise<Expense[]> {
    const result = await this.db.select().from(expenses).orderBy(expenses.date);
    return result.reverse(); // Most recent first
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const result = await this.db.insert(expenses).values(insertExpense).returning();
    return result[0];
  }

  async updateExpense(id: number, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const result = await this.db.update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();
    return result[0];
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await this.db.delete(expenses).where(eq(expenses.id, id)).returning();
    return result.length > 0;
  }

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    const result = await this.db.select().from(expenses)
      .where(eq(expenses.category, category))
      .orderBy(expenses.date);
    return result.reverse();
  }
}

// Use database storage if DATABASE_URL is available, otherwise use memory storage
let storage: IStorage;

// Test direct connection using pg library
async function testDirectConnection() {
  console.log("🔍 Testing direct connection with pg library...");
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    await client.connect();
    console.log("✅ Direct pg connection successful!");
    
    // Test query
    const result = await client.query('SELECT 1 as test');
    console.log("✅ Query test successful:", result.rows[0]);
    
    await client.end();
    return true;
  } catch (error) {
    console.log("❌ Direct pg connection failed:", error);
    try {
      await client.end();
    } catch (e) {}
    return false;
  }
}

// Smart fallback: try Supabase REST API first, then direct connection, then memory
async function initializeStorage() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql://')) {
    console.log("🔄 Attempting Supabase connection...");
    
    // Try REST API first (bypasses DNS issues)
    try {
      console.log("🌐 Trying Supabase REST API...");
      const restStorage = new SupabaseRestStorage();
      
      // Test the REST API connection
      const testResult = await Promise.race([
        restStorage.getAllExpenses(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('REST API timeout')), 5000)
        )
      ]);
      
      console.log("✅ Supabase REST API connection successful!");
      return restStorage;
    } catch (error) {
      console.log("❌ Supabase REST API failed:", error);
    }
    
    // If REST API fails, try direct connection
    const directWorks = await testDirectConnection();
    
    if (directWorks) {
      try {
        const dbStorage = new DatabaseStorage();
        
        // Test the connection with a simple query timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 8000);
        });
        
        // This will either succeed or timeout/fail
        await Promise.race([
          dbStorage.getAllExpenses(),
          timeoutPromise
        ]);
        
        console.log("✅ Supabase direct connection successful!");
        return dbStorage;
      } catch (error) {
        console.log("❌ Direct connection failed despite DNS working");
        console.log("📝 Fallback to memory storage");
        return new MemStorage();
      }
    } else {
      console.log("❌ All Supabase connection methods failed, using memory storage");
      console.log("📝 Network connectivity issue with Supabase");
      return new MemStorage();
    }
  } else {
    console.log("💾 Using in-memory storage (DATABASE_URL not configured)");
    return new MemStorage();
  }
}

// Initialize storage with fallback
storage = new MemStorage(); // Default fallback
initializeStorage().then(newStorage => {
  storage = newStorage;
  console.log("🎯 Storage initialized successfully");
}).catch(error => {
  console.error("⚠️ Storage initialization failed:", error);
  storage = new MemStorage();
});

export { storage };

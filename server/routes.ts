import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, insertAccountBalanceSchema } from "@shared/schema";
import { z } from "zod";
import { isEmailAuthorized, AUTHORIZED_EMAILS, addAuthorizedEmail, removeAuthorizedEmail } from "./auth-whitelist";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user for testing without authentication
  const mockUser = {
    id: "mock-user-123",
    email: "usuario@exemplo.com",
    firstName: "Usuário",
    lastName: "Teste",
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Auth routes (mock)
  app.get('/api/auth/user', async (req, res) => {
    res.json(mockUser);
  });

  // Check if user email is authorized
  app.post('/api/auth/check-authorization', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ 
          authorized: false, 
          message: 'Email é obrigatório' 
        });
      }

      const authorized = isEmailAuthorized(email);
      
      if (!authorized) {
        return res.status(403).json({ 
          authorized: false, 
          message: 'Acesso negado. Usuário não autorizado para acessar este sistema.' 
        });
      }

      res.json({ authorized: true });
    } catch (error) {
      res.status(500).json({ 
        authorized: false, 
        message: 'Erro interno do servidor' 
      });
    }
  });

  // Get authorized emails list (admin only)
  app.get('/api/auth/authorized-emails', async (req, res) => {
    try {
      res.json({ emails: AUTHORIZED_EMAILS });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar emails autorizados' });
    }
  });

  // Add authorized email (admin only)
  app.post('/api/auth/add-email', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Email é obrigatório' });
      }

      addAuthorizedEmail(email);
      res.json({ message: 'Email adicionado com sucesso', emails: AUTHORIZED_EMAILS });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao adicionar email' });
    }
  });

  // Remove authorized email (admin only)
  app.delete('/api/auth/remove-email', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Email é obrigatório' });
      }

      removeAuthorizedEmail(email);
      res.json({ message: 'Email removido com sucesso', emails: AUTHORIZED_EMAILS });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao remover email' });
    }
  });
  // Get all expenses - public route
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar despesas" });
    }
  });

  // Create new expense - public route
  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar despesa" });
      }
    }
  });

  // Update expense - public route
  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expenseData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, expenseData);
      
      if (!expense) {
        return res.status(404).json({ message: "Despesa não encontrada" });
      }
      
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar despesa" });
      }
    }
  });

  // Delete expense - public route
  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExpense(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Despesa não encontrada" });
      }
      
      res.json({ message: "Despesa excluída com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir despesa" });
    }
  });

  // Get expenses by category
  app.get("/api/expenses/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const expenses = await storage.getExpensesByCategory(category);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar despesas por categoria" });
    }
  });

  // Get unpaid expenses
  app.get("/api/expenses/unpaid", async (req, res) => {
    try {
      const expenses = await storage.getUnpaidExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar despesas não pagas" });
    }
  });

  // Mark expense as paid
  app.patch("/api/expenses/:id/paid", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markExpenseAsPaid(id);
      
      if (!success) {
        return res.status(404).json({ message: "Despesa não encontrada" });
      }
      
      res.json({ message: "Despesa marcada como paga" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao marcar despesa como paga" });
    }
  });

  // Get account balance
  app.get("/api/account/balance", async (req, res) => {
    try {
      const balance = await storage.getAccountBalance();
      res.json(balance);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar saldo da conta" });
    }
  });

  // Update account balance
  app.put("/api/account/balance", async (req, res) => {
    try {
      const balanceData = insertAccountBalanceSchema.parse(req.body);
      const balance = await storage.updateAccountBalance(balanceData);
      res.json(balance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar saldo da conta" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

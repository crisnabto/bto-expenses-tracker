import express from 'express';
import { storage } from '../server/storage';
import { authorizedEmails } from '../server/auth-whitelist';

const app = express();

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(express.json());

// Auth endpoint for production
app.post('/api/auth/check-authorization', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ authorized: false, error: 'Email required' });
    }

    const authorized = authorizedEmails.includes(email.toLowerCase());
    res.json({ authorized });
  } catch (error) {
    console.error('Authorization check error:', error);
    res.status(500).json({ authorized: false, error: 'Internal server error' });
  }
});

// Account balance endpoints
app.get('/api/account/balance', async (req, res) => {
  try {
    const balance = await storage.getAccountBalance();
    res.json(balance);
  } catch (error) {
    console.error('Error fetching account balance:', error);
    res.status(500).json({ message: 'Failed to fetch account balance' });
  }
});

app.put('/api/account/balance', async (req, res) => {
  try {
    const { currentBalance } = req.body;
    const balance = await storage.updateAccountBalance(currentBalance);
    res.json(balance);
  } catch (error) {
    console.error('Error updating account balance:', error);
    res.status(500).json({ message: 'Failed to update account balance' });
  }
});

// Expense endpoints
app.get('/api/expenses', async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const expenses = await storage.getExpenses(Number(page), Number(limit));
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

app.get('/api/expenses/unpaid', async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const expenses = await storage.getUnpaidExpenses(Number(page), Number(limit));
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching unpaid expenses:', error);
    res.status(500).json({ message: 'Failed to fetch unpaid expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const expenseData = req.body;
    const expense = await storage.createExpense(expenseData);
    res.json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Failed to create expense' });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const expenseData = req.body;
    const expense = await storage.updateExpense(Number(id), expenseData);
    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteExpense(Number(id));
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

// Admin endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = authorizedEmails.map(email => ({ email, authorized: true }));
    res.json(users);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    if (!authorizedEmails.includes(email.toLowerCase())) {
      authorizedEmails.push(email.toLowerCase());
    }
    
    res.json({ message: 'User added successfully', email });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Failed to add user' });
  }
});

app.delete('/api/admin/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const index = authorizedEmails.indexOf(email.toLowerCase());
    
    if (index > -1) {
      authorizedEmails.splice(index, 1);
    }
    
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ message: 'Failed to remove user' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel
export default app;
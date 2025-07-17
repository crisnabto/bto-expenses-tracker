import { useState, useEffect } from "react";
import ExpenseForm from "@/components/expense-form";
import ExpenseList from "@/components/expense-list";
import CategorySummary from "@/components/category-summary";
import ExpensePieChart from "@/components/expense-pie-chart";
import AccountBalance from "@/components/account-balance";

import Logo from "@/components/logo";
import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { LogOut, Settings } from "lucide-react";
import type { Expense } from "@shared/schema";

export default function Home() {
  const { user, signOut } = useSupabaseAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: balance } = useQuery({
    queryKey: ["/api/account/balance"],
  });

  // Get current month and year (this will be updated by the chart component)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Handler functions to update the header
  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
  };
  
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
        navigate("/login");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  // Calculate monthly totals for selected month/year
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [monthlyPaid, setMonthlyPaid] = useState(0);
  const [monthlyUnpaid, setMonthlyUnpaid] = useState(0);
  
  useEffect(() => {
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
    });
    
    const total = monthlyExpenses.reduce((sum, expense) => sum + parseFloat(expense.value), 0);
    const paid = monthlyExpenses.filter(expense => expense.isPaid === true).reduce((sum, expense) => sum + parseFloat(expense.value), 0);
    const unpaid = monthlyExpenses.filter(expense => expense.isPaid === false).reduce((sum, expense) => sum + parseFloat(expense.value), 0);
    
    setMonthlyTotal(total);
    setMonthlyPaid(paid);
    setMonthlyUnpaid(unpaid);
  }, [expenses, selectedMonth, selectedYear]);

  // Format month name
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthName = `${monthNames[selectedMonth]} ${selectedYear}`;
  
  // Data de hoje
  const today = new Date().toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit' 
  });
  const currentBalance = balance ? parseFloat(balance.currentBalance) : 0;
  
  // Calcular valor que falta (mesmo cálculo do AccountBalance)
  const totalUnpaidExpenses = expenses.filter(expense => expense.isPaid === false).reduce((sum, expense) => sum + parseFloat(expense.value), 0);
  const neededAmount = Math.max(0, totalUnpaidExpenses - currentBalance);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-blue-50 shadow-lg border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-neutral-600 font-medium">{monthName}</p>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-end space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">Total</p>
                      <p className="text-lg font-bold text-neutral-800">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(monthlyTotal)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-600">Pago</p>
                      <p className="text-lg font-bold text-green-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(monthlyPaid)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-red-600">Futuro</p>
                      <p className="text-lg font-bold text-red-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(monthlyUnpaid)}
                      </p>
                    </div>
                    <div className="text-neutral-400 text-2xl font-light">|</div>
                    <div className="text-right">
                      <p className="text-xs text-blue-600">Saldo CEF hoje ({today})</p>
                      <p className="text-lg font-bold text-blue-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(currentBalance)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-orange-600">Valor que falta</p>
                      <p className="text-lg font-bold text-orange-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(neededAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.email && (
                <div className="flex flex-col items-center gap-2">
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-200">
                      <span className="text-white font-medium text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/admin')}
                      className="h-7 px-3 text-xs flex items-center gap-1"
                    >
                      <Settings className="h-3 w-3" />
                      Admin
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleLogout}
                      className="h-7 px-3 text-xs flex items-center gap-1"
                    >
                      <LogOut className="h-3 w-3" />
                      Sair
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Logo size="sm" />
                {user?.email && (
                  <div className="text-sm text-neutral-700 font-medium">
                    Olá, {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {user?.email && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/admin')}
                      className="h-6 px-2 text-xs"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleLogout}
                      className="h-6 px-2 text-xs"
                    >
                      Sair
                    </Button>
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-200">
                        <span className="text-white font-medium text-xs">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-neutral-600 font-medium mb-2">{monthName}</p>
              <div className="grid grid-cols-5 gap-1 items-center text-xs">
                <div className="text-center">
                  <p className="text-xs text-neutral-500">Total</p>
                  <p className="text-xs font-bold text-neutral-800 break-words">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(monthlyTotal)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-green-600">Pago</p>
                  <p className="text-xs font-bold text-green-600 break-words">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(monthlyPaid)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-red-600">Futuro</p>
                  <p className="text-xs font-bold text-red-600 break-words">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(monthlyUnpaid)}
                  </p>
                </div>
                <div className="text-center border-l border-neutral-300 pl-1">
                  <p className="text-xs text-blue-600">Saldo CEF ({today})</p>
                  <p className="text-xs font-bold text-blue-600 break-words">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(currentBalance)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-orange-600">Falta</p>
                  <p className="text-xs font-bold text-orange-600 break-words">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(neededAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form, Balance and Summary */}
          <div className="lg:col-span-1 space-y-6">
            <ExpenseForm />
            <AccountBalance />
            <CategorySummary expenses={expenses} />
          </div>

          {/* Right Column - Chart and Expense List */}
          <div className="lg:col-span-2 space-y-6">
            <ExpensePieChart 
              expenses={expenses} 
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
            />
            <ExpenseList />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {/* 1. Pie Chart */}
          <ExpensePieChart 
            expenses={expenses} 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
          />
          
          {/* 2. Account Balance */}
          <AccountBalance />
          
          {/* 3. Category Summary */}
          <CategorySummary expenses={expenses} />
          
          {/* 4. Expense List */}
          <ExpenseList />
          
          {/* 5. Form */}
          <ExpenseForm />
        </div>
      </main>
    </div>
  );
}

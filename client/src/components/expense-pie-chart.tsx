import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Expense } from "@shared/schema";

interface ExpensePieChartProps {
  expenses: Expense[];
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const categoryEmojis: Record<string, string> = {
  papai: "👨‍🦳",
  farmacia: "💊",
  supermercado: "🛒",
  gasolina: "⛽",
  conte: "📖",
  residencia: "🏠",
};

const categoryNames: Record<string, string> = {
  papai: "Papai",
  farmacia: "Farmácia",
  supermercado: "Supermercado",
  gasolina: "Gasolina",
  conte: "Conte",
  residencia: "Residência",
};

const categoryColors: Record<string, string> = {
  papai: "#8884d8",
  farmacia: "#82ca9d",
  supermercado: "#ffc658",
  gasolina: "#ff7300",
  conte: "#e91e63",
  residencia: "#00c49f",
};

export default function ExpensePieChart({ expenses, selectedMonth, selectedYear, onMonthChange, onYearChange }: ExpensePieChartProps) {
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
  });

  // Calculate category totals for the current month
  const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += parseFloat(expense.value);
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for the pie chart
  const chartData = Object.entries(categoryTotals)
    .filter(([, total]) => total > 0)
    .map(([category, total]) => ({
      name: categoryNames[category] || category,
      value: total,
      category,
      color: categoryColors[category] || "#8884d8"
    }));

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">
            {categoryEmojis[data.category]} {data.name}
          </p>
          <p className="text-blue-600 font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend formatter
  const CustomLegend = ({ payload }: any) => {
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={index} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });



  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm border border-neutral-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-800 flex items-center">
            📊 Gastos por Categoria - {monthName}
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Select value={selectedMonth.toString()} onValueChange={(value) => {
              const month = parseInt(value);
              onMonthChange(month);
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => {
              const year = parseInt(value);
              onYearChange(year);
            }}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-neutral-500">
            <p>Nenhuma despesa em {monthName}.</p>
            <p className="text-sm mt-1">Adicione despesas para ver o gráfico.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-800 flex items-center">
          📊 Gastos por Categoria - {monthName}
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Select value={selectedMonth.toString()} onValueChange={(value) => {
            const month = parseInt(value);
            onMonthChange(month);
          }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => {
            const year = parseInt(value);
            onYearChange(year);
          }}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

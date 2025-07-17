import { PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Expense } from "@shared/schema";

interface CategorySummaryProps {
  expenses: Expense[];
}

const categoryEmojis: Record<string, string> = {
  papai: "🍼",
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

export default function CategorySummary({ expenses }: CategorySummaryProps) {
  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += parseFloat(expense.value);
    return acc;
  }, {} as Record<string, number>);

  // Sort categories by total (descending)
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .filter(([, total]) => total > 0);

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
          <PieChart className="text-accent mr-2" />
          Resumo por Categoria
        </h3>
        
        <div className="space-y-3">
          {sortedCategories.length > 0 ? (
            sortedCategories.map(([category, total]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{categoryEmojis[category]}</span>
                  <span className="font-medium text-neutral-700">
                    {categoryNames[category]}
                  </span>
                </div>
                <span className="font-bold text-neutral-800">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(total)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <p>Nenhuma despesa cadastrada ainda.</p>
              <p className="text-sm mt-1">Adicione uma despesa para ver o resumo por categoria.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

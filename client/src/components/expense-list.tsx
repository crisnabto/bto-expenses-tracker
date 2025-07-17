import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { List, Edit, Trash2, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Expense } from "@shared/schema";

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

const paymentMethodColors: Record<string, string> = {
  "dinheiro": "bg-gray-100 text-gray-800",
  "cartao-credito": "bg-blue-100 text-blue-800",
  "cartao-debito": "bg-purple-100 text-purple-800",
  "pix": "bg-green-100 text-green-800",
  "transferencia": "bg-yellow-100 text-yellow-800",
};

const paymentMethodNames: Record<string, string> = {
  "dinheiro": "Dinheiro",
  "cartao-credito": "Cartão de Crédito",
  "cartao-debito": "Cartão de Débito",
  "pix": "PIX",
  "transferencia": "Transferência",
};

export default function ExpenseList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir despesa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const filteredExpenses = expenses.filter((expense) => {
    if (filterCategory === "all") return true;
    return expense.category === filterCategory;
  });

  // Sort by date (newest first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate pagination
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = sortedExpenses.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  const handleFilterChange = (value: string) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };



  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    // Fix timezone issue by creating date with local timezone
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-neutral-500">Carregando despesas...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-neutral-200">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-800 flex items-center">
            <List className="text-primary mr-2" />
            Despesas Cadastradas
          </h2>
          <div className="flex items-center space-x-3">
            <Select value={filterCategory} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="papai">Papai</SelectItem>
                <SelectItem value="farmacia">Farmácia</SelectItem>
                <SelectItem value="supermercado">Supermercado</SelectItem>
                <SelectItem value="gasolina">Gasolina</SelectItem>
                <SelectItem value="conte">Conte</SelectItem>
                <SelectItem value="residencia">Residência</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-8">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-32">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">
                Valor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-32">
                Pagamento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-28">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {currentExpenses.length > 0 ? (
              currentExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto ${expense.isPaid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{categoryEmojis[expense.category]}</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {categoryNames[expense.category]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-900 max-w-xs truncate">
                    {expense.description}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-neutral-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(parseFloat(expense.value))}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge className={`${paymentMethodColors[expense.paymentMethod]} text-xs`}>
                      {paymentMethodNames[expense.paymentMethod]}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent hover:text-orange-700"
                        onClick={() => {
                          toast({
                            title: "Em desenvolvimento",
                            description: "Funcionalidade de edição em desenvolvimento.",
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-white bg-red-500 hover:bg-red-600"
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja excluir a despesa "${expense.description}"?`)) {
                            deleteExpenseMutation.mutate(expense.id);
                          }
                        }}
                        disabled={deleteExpenseMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                  {filterCategory === "all" 
                    ? "Nenhuma despesa cadastrada ainda."
                    : `Nenhuma despesa encontrada para a categoria "${categoryNames[filterCategory]}".`
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sortedExpenses.length > 0 && (
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-700">
              Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">{Math.min(endIndex, sortedExpenses.length)}</span> de <span className="font-medium">{sortedExpenses.length}</span> despesa{sortedExpenses.length !== 1 ? 's' : ''}
              {filterCategory !== "all" && ` da categoria ${categoryNames[filterCategory]}`}
            </p>
            
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    
                    if (totalPages <= maxVisiblePages) {
                      // Show all pages
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Show first page, current page area, and last page
                      if (currentPage <= 3) {
                        for (let i = 1; i <= 4; i++) pages.push(i);
                        pages.push('...');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 2) {
                        pages.push(1);
                        pages.push('...');
                        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
                      } else {
                        pages.push(1);
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => (
                      page === '...' ? (
                        <span key={index} className="px-2 text-neutral-500">...</span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page as number)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      )
                    ));
                  })()}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

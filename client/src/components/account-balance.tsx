import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, Plus, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type AccountBalance, type Expense } from "@shared/schema";

export default function AccountBalance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newBalance, setNewBalance] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Buscar saldo atual
  const { data: balance, isLoading: balanceLoading } = useQuery<AccountBalance | null>({
    queryKey: ["/api/account/balance"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/account/balance");
      return response.status === 200 ? response.json() : null;
    },
  });

  // Buscar despesas não pagas
  const { data: unpaidExpenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses/unpaid"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/expenses/unpaid");
      return response.json();
    },
  });

  // Atualizar saldo
  const updateBalanceMutation = useMutation({
    mutationFn: async (currentBalance: string) => {
      const response = await apiRequest("PUT", "/api/account/balance", {
        currentBalance
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/account/balance"] });
      toast({
        title: "Sucesso",
        description: "Saldo atualizado com sucesso!",
      });
      setIsEditing(false);
      setNewBalance("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar saldo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Marcar despesa como paga
  const markAsPaidMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      const response = await apiRequest("PATCH", `/api/expenses/${expenseId}/paid`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/unpaid"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Sucesso",
        description: "Despesa marcada como paga!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao marcar despesa como paga.",
        variant: "destructive",
      });
    },
  });

  // Calcular totais
  const totalUnpaidExpenses = unpaidExpenses.reduce((sum, expense) => 
    sum + parseFloat(expense.value), 0
  );
  
  const currentBalance = balance ? parseFloat(balance.currentBalance) : 0;
  const neededAmount = Math.max(0, totalUnpaidExpenses - currentBalance);
  const remainingAfterPayments = currentBalance - totalUnpaidExpenses;

  const handleUpdateBalance = () => {
    if (newBalance && parseFloat(newBalance) >= 0) {
      updateBalanceMutation.mutate(newBalance);
    }
  };

  const handleMarkAsPaid = (expenseId: number) => {
    markAsPaidMutation.mutate(expenseId);
  };

  // Calcular paginação para despesas futuras
  const totalPages = Math.ceil(unpaidExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUnpaidExpenses = unpaidExpenses.slice(startIndex, endIndex);

  if (balanceLoading || expensesLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Saldo Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Saldo da Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                Saldo Atual: R$ {currentBalance.toFixed(2)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="newBalance">Novo Saldo</Label>
                <div className="flex gap-2">
                  <Input
                    id="newBalance"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                  />
                  <Button
                    onClick={handleUpdateBalance}
                    disabled={updateBalanceMutation.isPending}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Despesas Futuras */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas Futuras ({unpaidExpenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {unpaidExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhuma despesa futura encontrada
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {currentUnpaidExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                        <span className="font-bold text-red-600 text-sm">
                          R$ {parseFloat(expense.value).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 break-words">
                        {expense.description}
                      </div>
                      <div className="text-xs text-gray-600">
                        {expense.date}
                      </div>
                      <div className="text-xs text-gray-600">
                        {expense.paymentMethod}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => handleMarkAsPaid(expense.id)}
                        disabled={markAsPaidMutation.isPending}
                      >
                        Marcar como Pago
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

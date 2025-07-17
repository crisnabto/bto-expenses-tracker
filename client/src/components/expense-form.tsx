import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertExpenseSchema, type InsertExpense } from "@shared/schema";

const categories = [
  { value: "papai", label: "👨‍🦳 Papai" },
  { value: "farmacia", label: "💊 Farmácia" },
  { value: "supermercado", label: "🛒 Supermercado" },
  { value: "gasolina", label: "⛽ Gasolina" },
  { value: "conte", label: "📖 Conte" },
  { value: "residencia", label: "🏠 Residência" },
];

const paymentMethods = [
  { value: "dinheiro", label: "💵 Dinheiro" },
  { value: "cartao-credito", label: "💳 Cartão de Crédito" },
  { value: "cartao-debito", label: "💳 Cartão de Débito" },
  { value: "pix", label: "🔗 PIX" },
  { value: "transferencia", label: "🏦 Transferência" },
];

export default function ExpenseForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [category, setCategory] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isPaid, setIsPaid] = useState<boolean>(true);

  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      category: "",
      description: "",
      value: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      isPaid: true,
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (expense: InsertExpense) => {
      const response = await apiRequest("POST", "/api/expenses", expense);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Sucesso",
        description: "Despesa cadastrada com sucesso!",
      });
      form.reset({
        category: "",
        description: "",
        value: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "",
        isPaid: true,
      });
      setCategory("");
      setPaymentMethod("");
      setIsPaid(true);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar despesa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertExpense) => {
    const expenseData = {
      ...data,
      isPaid: isPaid
    };
    createExpenseMutation.mutate(expenseData);
  };

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
          <PlusCircle className="text-primary mr-2" />
          Nova Despesa
        </h2>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-neutral-700 mb-2">
              Categoria <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={category} 
              onValueChange={(value) => {
                setCategory(value);
                form.setValue("category", value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-neutral-700 mb-2">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Descreva a despesa..."
              className="resize-none"
              rows={3}
              {...form.register("description")}
            />
          </div>

          <div>
            <Label htmlFor="value" className="text-sm font-medium text-neutral-700 mb-2">
              Valor <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-neutral-500">R$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="pl-10"
                {...form.register("value")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="date" className="text-sm font-medium text-neutral-700 mb-2">
              Data <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              {...form.register("date")}
            />
          </div>

          <div>
            <Label htmlFor="paymentMethod" className="text-sm font-medium text-neutral-700 mb-2">
              Forma de Pagamento <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={paymentMethod} 
              onValueChange={(value) => {
                setPaymentMethod(value);
                form.setValue("paymentMethod", value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPaid"
              checked={isPaid}
              onCheckedChange={setIsPaid}
            />
            <Label htmlFor="isPaid" className="text-sm font-medium text-neutral-700">
              {isPaid ? "✅ Despesa já paga" : "⏰ Despesa futura (não paga)"}
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-blue-700 text-white"
            disabled={createExpenseMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {createExpenseMutation.isPending ? "Cadastrando..." : "Cadastrar Despesa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

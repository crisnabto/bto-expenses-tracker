import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/logo";
import { useLocation } from "wouter";

export default function Landing() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            BTO Expenses
          </h1>
          <p className="text-gray-600">
            Gerencie suas despesas de forma simples e eficiente
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Bem-vindo!</CardTitle>
            <CardDescription>
              Faça login para acessar suas despesas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Categorize suas despesas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Visualize gastos em gráficos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Controle por método de pagamento</span>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={() => navigate("/login")}
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Sistema seguro de gerenciamento de despesas</p>
        </div>
      </div>
    </div>
  );
}
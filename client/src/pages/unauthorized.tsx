import { AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function Unauthorized() {
  const { signOut } = useSupabaseAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Acesso Negado
          </CardTitle>
          <CardDescription className="text-red-600">
            Você não tem permissão para acessar este sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Este sistema é restrito a usuários autorizados. 
            Se você acredita que deveria ter acesso, entre em contato com o administrador.
          </p>
          <div className="pt-4">
            <Button 
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Fazer Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
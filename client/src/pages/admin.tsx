import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Admin() {
  const [newEmail, setNewEmail] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar emails autorizados
  const { data: emailsData, isLoading } = useQuery({
    queryKey: ['/api/auth/authorized-emails'],
  });

  // Mutation para adicionar email
  const addEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest('POST', '/api/auth/add-email', { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/authorized-emails'] });
      setNewEmail('');
      toast({
        title: "Email adicionado",
        description: "O email foi adicionado à lista de autorizados com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o email.",
        variant: "destructive",
      });
    },
  });

  // Mutation para remover email
  const removeEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest('DELETE', '/api/auth/remove-email', { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/authorized-emails'] });
      toast({
        title: "Email removido",
        description: "O email foi removido da lista de autorizados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o email.",
        variant: "destructive",
      });
    },
  });

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail.trim() && newEmail.includes('@')) {
      addEmailMutation.mutate(newEmail.trim());
    }
  };

  const handleRemoveEmail = (email: string) => {
    removeEmailMutation.mutate(email);
  };

  const emails = (emailsData as any)?.emails || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Administração de Usuários
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie quais usuários podem acessar o sistema BTO Expenses
          </p>
        </div>

        <div className="grid gap-6">
          {/* Adicionar novo email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Adicionar Usuário Autorizado
              </CardTitle>
              <CardDescription>
                Digite o email do usuário que deve ter acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEmail} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    type="submit" 
                    disabled={addEmailMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {addEmailMutation.isPending ? 'Adicionando...' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Lista de emails autorizados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usuários Autorizados ({emails.length})
              </CardTitle>
              <CardDescription>
                Lista de emails que podem acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando usuários...</p>
                </div>
              ) : emails.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum usuário autorizado encontrado
                </p>
              ) : (
                <div className="space-y-2">
                  {emails.map((email: string) => (
                    <div 
                      key={email}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{email}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEmail(email)}
                        disabled={removeEmailMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Try to get session from URL params (code flow)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            toast({
              title: "Erro de autenticação",
              description: error.message,
              variant: "destructive",
            });
            navigate("/login");
            return;
          }

          if (data.session) {
            toast({
              title: "Login realizado com sucesso!",
              description: "Bem-vindo ao BTO Expenses",
            });
            navigate("/");
            return;
          }
        }
        
        // Try hash-based flow (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          
          if (error) {
            toast({
              title: "Erro de autenticação",
              description: error.message,
              variant: "destructive",
            });
            navigate("/login");
            return;
          }

          if (data.session) {
            toast({
              title: "Login realizado com sucesso!",
              description: "Bem-vindo ao BTO Expenses",
            });
            navigate("/");
            return;
          }
        }
        
        // Fallback to getSession
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          toast({
            title: "Erro de autenticação",
            description: error.message,
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        if (data.session) {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo ao BTO Expenses",
          });
          navigate("/");
        } else {
          navigate("/login");
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro inesperado durante autenticação.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processando autenticação...</p>
      </div>
    </div>
  );
}
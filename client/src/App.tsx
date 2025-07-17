import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import AuthCallback from "@/pages/auth-callback";
import Unauthorized from "@/pages/unauthorized";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useVercelAuth } from "@/lib/vercel-auth";

function Router() { 
  // Usar hook especial para Vercel em produção 
  const isProduction = import.meta.env.PROD;
  const supabaseAuth = useSupabaseAuth();
  const vercelAuth = useVercelAuth();
  
  const { user, loading, isUnauthorized } = isProduction ? vercelAuth : supabaseAuth;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return <Unauthorized />;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/unauthorized" component={Unauthorized} />
      {!user ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

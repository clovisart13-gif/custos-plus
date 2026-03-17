import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navigation } from "./components/Navigation";
import { useAuth } from "./_core/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import FichasCusto from "./pages/FichasCusto";
import VisualizarFicha from "./pages/VisualizarFicha";

import VisualizarOrcamento from "./pages/VisualizarOrcamento";
import ResumoOrcamentos from "./pages/ResumoOrcamentos";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import Empresas from "./pages/Empresas";

function ProtectedRoute({ path, component: Component }: { path: string; component: any }) {
  const { user } = useAuth();
  
  // Rotas que requerem admin
  const adminRoutes = ["/fichas-custo", "/ficha/:id", "/gerenciar-usuarios", "/empresas"];
  
  if (adminRoutes.some(route => path.startsWith(route.split(":")[0]))) {
    if (user?.role !== "admin") {
      return <Redirect to="/resumo-orcamentos" />;
    }
  }
  
  return <Component />;
}

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/fichas-custo">
          {() => <ProtectedRoute path="/fichas-custo" component={FichasCusto} />}
        </Route>
        <Route path="/ficha/:id">
          {() => <ProtectedRoute path="/ficha/:id" component={VisualizarFicha} />}
        </Route>
        <Route path="/orcamentos" component={ResumoOrcamentos} />
        <Route path="/resumo-orcamentos" component={ResumoOrcamentos} />
        <Route path="/orcamento/:id" component={VisualizarOrcamento} />
        <Route path="/gerenciar-usuarios">
          {() => <ProtectedRoute path="/gerenciar-usuarios" component={GerenciarUsuarios} />}
        </Route>
        <Route path="/empresas">
          {() => <ProtectedRoute path="/empresas" component={Empresas} />}
        </Route>
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TenantProvider } from "./contexts/TenantContext";
import { Navigation } from "./components/Navigation";
import { useAuth } from "./_core/hooks/useAuth";
import ResumoOrcamentos from "./pages/ResumoOrcamentos";
import FichasCusto from "./pages/FichasCusto";
import VisualizarFicha from "./pages/VisualizarFicha";
import VisualizarOrcamento from "./pages/VisualizarOrcamento";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import Empresas from "./pages/Empresas";
import LoginPassword from "./pages/LoginPassword";
import SelectTenant from "./pages/SelectTenant";
import LoginOAuth from "./pages/LoginOAuth";

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
  const [location] = useLocation();
  const isLoginPage = location === "/login" || location === "/login-oauth";
  const isSelectTenant = location === "/select-tenant";
  
  return (
    <>
      <Switch>
        <Route path="/select-tenant" component={SelectTenant} />
        <Route path="/login" component={LoginPassword} />
        <Route path="/login-oauth" component={LoginOAuth} />
      </Switch>
      {!isLoginPage && !isSelectTenant && <Navigation />}
      <Switch>
        <Route path="/" component={SelectTenant} />
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
        <TenantProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </TenantProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTenant } from "@/contexts/TenantContext";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, LogOut, User, FileCheck, Users, Building2 } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { selectedTenantId, setSelectedTenantId } = useTenant();
  const logoutMutation = trpc.auth.logout.useMutation();
  const [currentTenant, setCurrentTenant] = useState<{ id: number; name: string } | null>(null);
  const [availableTenants, setAvailableTenants] = useState<{ id: number; name: string }[]>([]);

  // Mapear tenantId para nome
  const tenantMap: Record<number, string> = {
    1: "R2PB Confecções",
    2: "Mirage",
    3: "KMC Comercial",
  };

  // Carregar tenant selecionado
  useEffect(() => {
    if (selectedTenantId) {
      const tenantName = tenantMap[selectedTenantId] || `Tenant ${selectedTenantId}`;
      setCurrentTenant({ id: selectedTenantId, name: tenantName });
    }
  }, [selectedTenantId]);

  // Carregar tenants disponíveis para admin
  useEffect(() => {
    if (user?.role === "admin") {
      // Admin pode ver todos os tenants
      const allTenants = [
        { id: 1, name: "R2PB Confecções" },
        { id: 2, name: "Mirage" },
        { id: 3, name: "KMC Comercial" },
      ];
      setAvailableTenants(allTenants);
    } else if (user?.tenantId) {
      // Usuário comum só vê seu tenant
      const tenantName = tenantMap[user.tenantId] || `Tenant ${user.tenantId}`;
      setAvailableTenants([{ id: user.tenantId, name: tenantName }]);
    }
  }, [user?.role, user?.tenantId]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const navItems = [
    { path: "/fichas-custo", label: "Fichas de Custo", icon: FileText },
    { path: "/resumo-orcamentos", label: "Orçamentos", icon: FileCheck },
  ];

  const adminItems = [
    { path: "/gerenciar-usuarios", label: "Gerenciar Usuários", icon: Users },
    { path: "/empresas", label: "Empresas", icon: Building2 },
  ];

  return (
    <nav className="border-b bg-background print:hidden">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/logo-r2pb.jpeg" 
              alt="R2PB Confecções" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-xl font-semibold text-foreground">
              Custos Plus
            </span>
          </a>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
                {user?.role === "admin" && adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>

              {/* Tenant Selector */}
              {availableTenants.length > 0 && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {user?.role === "admin" && availableTenants.length > 1 ? (
                    <Select value={selectedTenantId?.toString() || ""} onValueChange={(value) => setSelectedTenantId(parseInt(value))}>
                      <SelectTrigger className="w-48 h-9">
                        <SelectValue placeholder="Selecionar empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id.toString()}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm font-medium text-foreground">{currentTenant?.name}</span>
                  )}
                </div>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user?.name || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {currentTenant && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Tenant:</span> {currentTenant.name}
                      </p>
                    )}
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

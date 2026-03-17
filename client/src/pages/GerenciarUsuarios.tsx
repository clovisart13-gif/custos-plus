import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Plus, Loader2, Copy, Check, Edit2 } from "lucide-react";
import { useRouter } from "wouter";
import { getLoginUrl } from "@/const";

export default function GerenciarUsuarios() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { selectedTenantId } = useTenant();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [tenantId, setTenantId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTenantId, setEditTenantId] = useState<string>("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [isUpdating, setIsUpdating] = useState(false);

  // Query para listar usuários
  const { data: usuarios, isLoading: usuariosLoading, refetch } = trpc.admin.listUsers.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  // Query para listar empresas
  const { data: empresas, isLoading: empresasLoading } = trpc.admin.listEmpresas.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  // Mutation para criar usuário
  const createUserMutation = trpc.admin.createUser.useMutation({
    onSuccess: (data) => {
      setNome("");
      setEmail("");
      setRole("user");
      setTenantId("");
      setIsCreating(false);
      // Mostrar senha gerada
      if (data.password) {
        setSenhaGerada(data.password);
      }
      refetch();
    },
    onError: (error) => {
      alert(`Erro ao criar usuário: ${error.message}`);
      setIsCreating(false);
    },
  });

  // Mutation para atualizar usuário
  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      setEditingUser(null);
      setIsUpdating(false);
      refetch();
    },
    onError: (error) => {
      alert(`Erro ao atualizar usuário: ${error.message}`);
      setIsUpdating(false);
    },
  });

  // Mutation para deletar usuário
  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      alert(`Erro ao deletar usuário: ${error.message}`);
    },
  });

  const handleCreateUser = async () => {
    if (!nome || !email || !tenantId) {
      alert("Preencha todos os campos");
      return;
    }

    setIsCreating(true);
    createUserMutation.mutate({ 
      nome, 
      email, 
      role,
      tenantId: parseInt(tenantId),
    });
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      deleteUserMutation.mutate({ userId });
    }
  };

  const handleCopiarSenha = () => {
    if (senhaGerada) {
      navigator.clipboard.writeText(senhaGerada);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditNome(user.name || "");
    setEditEmail(user.email || "");
    setEditTenantId(user.tenantId.toString());
    setEditRole(user.role);
  };

  const handleUpdateUser = async () => {
    if (!editNome || !editEmail || !editTenantId) {
      alert("Preencha todos os campos");
      return;
    }

    setIsUpdating(true);
    updateUserMutation.mutate({
      userId: editingUser.id,
      nome: editNome,
      email: editEmail,
      tenantId: parseInt(editTenantId),
      role: editRole,
    });
  };

  // Verificar se é admin - APÓS todos os hooks
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Acesso Restrito</h1>
        <p className="text-muted-foreground">Faça login para acessar esta página</p>
        <Button onClick={() => window.location.href = getLoginUrl()}>
          Fazer Login
        </Button>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground">Apenas administradores podem acessar esta página</p>
        <Button onClick={() => window.location.href = "/"}>
          Voltar para Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie usuários do sistema por empresa
          </p>
        </div>

        {/* Alerta de Senha Gerada */}
        {senhaGerada && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-green-900">✅ Usuário criado com sucesso!</p>
                  <p className="text-sm text-green-800 mt-1">Senha temporária gerada:</p>
                  <p className="font-mono text-lg font-bold text-green-900 mt-2">{senhaGerada}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopiarSenha}
                  className="gap-2"
                >
                  {copiado ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSenhaGerada(null)}
                className="mt-4"
              >
                Fechar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Criar Usuário */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Novo Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nome</label>
                <Input
                  placeholder="Nome do usuário"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={isCreating}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  placeholder="email@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isCreating}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Empresa</label>
                <Select value={tenantId} onValueChange={setTenantId} disabled={isCreating || empresasLoading}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas?.map((empresa: any) => (
                      <SelectItem key={empresa.id} value={empresa.tenantId.toString()}>
                        {empresa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Alçada</label>
                <Select value={role} onValueChange={(value) => setRole(value as "user" | "admin")}>
                  <SelectTrigger className="mt-1" disabled={isCreating}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="user" value="user">Usuário</SelectItem>
                    <SelectItem key="admin" value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCreateUser}
                  disabled={isCreating || !nome || !email || !tenantId}
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {usuariosLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Alçada</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios?.map((u: any) => {
                      const empresa = empresas?.find((e: any) => e.tenantId === u.tenantId);
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name || "N/A"}</TableCell>
                          <TableCell>{u.email || "N/A"}</TableCell>
                          <TableCell>{empresa?.nome || `Tenant ${u.tenantId}`}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                u.role === "admin"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {u.role === "admin" ? "Administrador" : "Usuário"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(u)}
                              disabled={updateUserMutation.isPending}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {!usuarios || usuarios.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Editar Usuário */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nome</label>
                <Input
                  placeholder="Nome do usuário"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  disabled={isUpdating}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  placeholder="email@example.com"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  disabled={isUpdating}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Empresa</label>
                <Select value={editTenantId} onValueChange={setEditTenantId} disabled={isUpdating || empresasLoading}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas
                      ?.filter((empresa: any) => empresa.tenantId === selectedTenantId)
                      .map((empresa: any) => (
                        <SelectItem key={empresa.id} value={empresa.tenantId.toString()}>
                          {empresa.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Alçada</label>
                <Select value={editRole} onValueChange={(value) => setEditRole(value as "user" | "admin")} disabled={isUpdating}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="user" value="user">Usuário</SelectItem>
                    <SelectItem key="admin" value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={isUpdating || !editNome || !editEmail || !editTenantId}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

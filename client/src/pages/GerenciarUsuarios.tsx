import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
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
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useRouter } from "wouter";
import { getLoginUrl } from "@/const";

export default function GerenciarUsuarios() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [isCreating, setIsCreating] = useState(false);

  // Query para listar usuários - SEMPRE executar, mas com enabled condicional
  const { data: usuarios, isLoading: usuariosLoading, refetch } = trpc.admin.listUsers.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  // Mutation para criar usuário
  const createUserMutation = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      setNome("");
      setEmail("");
      setRole("user");
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      alert(`Erro ao criar usuário: ${error.message}`);
      setIsCreating(false);
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
    if (!nome || !email) {
      alert("Preencha todos os campos");
      return;
    }

    setIsCreating(true);
    createUserMutation.mutate({ nome, email, role });
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      deleteUserMutation.mutate({ userId });
    }
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
            Crie e gerencie usuários do sistema
          </p>
        </div>

        {/* Formulário de Criar Usuário */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Novo Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label className="text-sm font-medium text-foreground">Alçada</label>
                <Select value={role} onValueChange={(value) => setRole(value as "user" | "admin")}>
                  <SelectTrigger className="mt-1" disabled={isCreating}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCreateUser}
                  disabled={isCreating || !nome || !email}
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
                      Criar Usuário
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
                      <TableHead>Alçada</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios?.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name || "N/A"}</TableCell>
                        <TableCell>{u.email || "N/A"}</TableCell>
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
                        <TableCell>
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
                    ))}
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
      </div>
    </div>
  );
}

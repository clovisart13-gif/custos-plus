import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Search, Send, Plus, Eye, Trash2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/_core/hooks/useAuth";
import CriarOrcamentoSimples from "@/components/CriarOrcamentoSimples";
import SelecionarFichasModal from "@/components/SelecionarFichasModal";

type StatusType = "pendente" | "aprovado" | "reprovado" | "todos";
type FilterType = "todos" | "pendente_envio";
type SortType = "recente" | "cliente";

export default function ResumoOrcamentos() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const { selectedTenantId } = useTenant();

  // Se não está autenticado, redireciona para seleção de tenant
  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecionando...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  const [statusFilter, setStatusFilter] = useState<StatusType>("todos");
  const [filterType, setFilterType] = useState<FilterType>("todos");
  const [sortBy, setSortBy] = useState<SortType>("recente");
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingKanbanId, setSendingKanbanId] = useState<number | null>(null);
  const [showNovoOrcamento, setShowNovoOrcamento] = useState(false);
  const [showSelecionarFichas, setShowSelecionarFichas] = useState(false);

  // Buscar orçamentos com totais calculados em tempo real
  const { data: orcamentos = [], isLoading: loadingOrcamentos, refetch } =
    trpc.orcamentos.listComTotaisCalculados.useQuery(
      { tenantId: selectedTenantId || undefined },
      {
      staleTime: 0,
      gcTime: 0,
    });

  // Buscar KPIs
  const { data: kpis, isLoading: loadingKpis } = trpc.orcamentos.getKPIs.useQuery(
    { tenantId: selectedTenantId || undefined },
    {
    staleTime: 0,
    gcTime: 0,
  });

  // Hooks de utils (fora das mutations)
  const utils = trpc.useUtils();

  // Mutation para atualizar status
  const updateStatusMutation = trpc.orcamentos.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      utils.orcamentos.getKPIs.invalidate();
      toast.success("Status atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });

  // Mutation para enviar para Kanban
  const enviarKanbanMutation = trpc.orcamentos.enviarParaKanban.useMutation({
    onSuccess: () => {
      setSendingKanbanId(null);
      utils.orcamentos.listComTotaisCalculados.invalidate();
      refetch();
      toast.success("Enviado para Kanban!");
    },
    onError: (error) => {
      setSendingKanbanId(null);
      toast.error("Erro ao enviar: " + error.message);
    },
  });

  // Mutation para deletar
  const deleteOrcamento = trpc.orcamentos.delete.useMutation({
    onSuccess: () => {
      toast.success("Orçamento deletado com sucesso");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erro ao deletar orçamento: " + error.message);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este orçamento?")) {
      deleteOrcamento.mutate({ id });
    }
  };

  const handleView = (id: number) => {
    navigate(`/orcamento/${id}`);
  };

  // Filtrar e ordenar orçamentos
  const orcamentosFiltrados = useMemo(() => {
    let filtered = orcamentos;

    // Filtrar por tipo (pendente de envio) - tem prioridade
    if (filterType === "pendente_envio") {
      filtered = filtered.filter((orc) => orc.status === "aprovado" && !orc.enviado);
    } else {
      // Filtrar por status (só se não estiver em "pendente de envio")
      if (statusFilter !== "todos") {
        filtered = filtered.filter((orc) => orc.status === statusFilter);
      }
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (orc) =>
          orc.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orc.numeroOrcamento.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    if (sortBy === "cliente") {
      filtered = [...filtered].sort((a, b) =>
        a.nomeCliente.localeCompare(b.nomeCliente)
      );
    } else {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [orcamentos, statusFilter, filterType, searchTerm, sortBy]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      pendente: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      aprovado: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      reprovado: { bg: "bg-red-100", text: "text-red-800", icon: AlertCircle },
    };

    const { bg, text, icon: Icon } = config[status] || config.pendente;
    return (
      <Badge className={`${bg} ${text} gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isOrcamentoVencido = (dataEmissao: Date, validade: number, status: string): boolean => {
    if (status !== "pendente") return false;
    const dataVencimento = new Date(dataEmissao);
    dataVencimento.setDate(dataVencimento.getDate() + validade);
    return new Date() > dataVencimento;
  };

  const diasParaVencer = (dataEmissao: Date, validade: number, status: string): number => {
    if (status !== "pendente") return Infinity;
    const dataVencimento = new Date(dataEmissao);
    dataVencimento.setDate(dataVencimento.getDate() + validade);
    const hoje = new Date();
    const diferenca = dataVencimento.getTime() - hoje.getTime();
    return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
  };

  const getRowClass = (status: string, dataEmissao: Date, validade: number) => {
    // Verificar se está vencido e pendente
    if (isOrcamentoVencido(dataEmissao, validade, status)) {
      return "border-l-4 border-l-red-600 bg-red-50 hover:bg-red-100";
    }

    // Verificar se vence nos próximos 3 dias e está pendente
    const dias = diasParaVencer(dataEmissao, validade, status);
    if (dias <= 3 && dias > 0 && status === "pendente") {
      return "border-l-4 border-l-orange-500 bg-orange-50 hover:bg-orange-100";
    }

    // Cores padrão
    const classes: Record<string, string> = {
      pendente: "border-l-4 border-l-yellow-400 hover:bg-yellow-50",
      aprovado: "border-l-4 border-l-green-400 hover:bg-green-50",
      reprovado: "border-l-4 border-l-red-400 hover:bg-red-50",
    };
    return classes[status] || classes.pendente;
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Resumo de Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie e aprove seus orçamentos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => setShowNovoOrcamento(true)}
          >
            <Plus className="w-5 h-5" />
            Novo Orçamento Manual
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="gap-2"
            onClick={() => setShowSelecionarFichas(true)}
          >
            <Plus className="w-5 h-5" />
            Criar de Fichas
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{kpis?.pendente.quantidade || 0}</p>
              <p className="text-sm text-yellow-600">{formatCurrency(kpis?.pendente.totalValor || 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aprovados</p>
              <p className="text-2xl font-bold">{kpis?.aprovado.quantidade || 0}</p>
              <p className="text-sm text-green-600">{formatCurrency(kpis?.aprovado.totalValor || 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Reprovados</p>
              <p className="text-2xl font-bold">{kpis?.reprovado.quantidade || 0}</p>
              <p className="text-sm text-red-600">{formatCurrency(kpis?.reprovado.totalValor || 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          {/* Barra de Busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente ou número do orçamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === "todos" && filterType === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter("todos");
                setFilterType("todos");
              }}
            >
              Todos ({orcamentos.length})
            </Button>
            <Button
              variant={statusFilter === "pendente" && filterType === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter("pendente");
                setFilterType("todos");
              }}
              className={statusFilter === "pendente" && filterType === "todos" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              Pendentes ({kpis?.pendente.quantidade || 0})
            </Button>
            <Button
              variant={statusFilter === "aprovado" && filterType === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter("aprovado");
                setFilterType("todos");
              }}
              className={statusFilter === "aprovado" && filterType === "todos" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              Aprovados ({kpis?.aprovado.quantidade || 0})
            </Button>
            <Button
              variant={statusFilter === "reprovado" && filterType === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter("reprovado");
                setFilterType("todos");
              }}
              className={statusFilter === "reprovado" && filterType === "todos" ? "bg-red-500 hover:bg-red-600" : ""}
            >
              Reprovados ({kpis?.reprovado.quantidade || 0})
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setFilterType("pendente_envio");
                setStatusFilter("todos");
              }}
              className={filterType === "pendente_envio" ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              <Send className="w-4 h-4 mr-1" />
              Pendente de Envio
            </Button>

            {/* Sort */}
            <div className="flex gap-2 ml-auto">
              <Button
                variant={sortBy === "recente" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("recente")}
              >
                Mais Recente
              </Button>
              <Button
                variant={sortBy === "cliente" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("cliente")}
              >
                Por Cliente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legenda de Alertas */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vencido */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-1 h-12 bg-red-600 rounded"></div>
              <div>
                <h4 className="font-semibold text-red-700 mb-1">Orçamento Vencido</h4>
                <p className="text-sm text-gray-600">Orçamento pendente que já ultrapassou a data de validade. Requer ação imediata.</p>
              </div>
            </div>

            {/* Vencendo em breve */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-1 h-12 bg-orange-500 rounded"></div>
              <div>
                <h4 className="font-semibold text-orange-700 mb-1">Vencendo em Breve</h4>
                <p className="text-sm text-gray-600">Orçamento pendente que vence nos próximos 3 dias. Aprove ou reprove em breve.</p>
              </div>
            </div>

            {/* Normal */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-1 h-12 bg-yellow-400 rounded"></div>
              <div>
                <h4 className="font-semibold text-yellow-700 mb-1">Pendente</h4>
                <p className="text-sm text-gray-600">Orçamento aguardando aprovação ou reprovação.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Orçamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {loadingOrcamentos ? "Carregando..." : `${orcamentosFiltrados.length} orçamento(s)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrcamentos ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Carregando orçamentos...</p>
            </div>
          ) : orcamentosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum orçamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orcamentosFiltrados.map((orc) => (
                <div
                  key={orc.id}
                  className={`flex items-center justify-between p-4 bg-white border rounded-lg transition-colors ${
                    getRowClass(
                      orc.status,
                      orc.dataEmissao,
                      orc.validade
                    )
                  }`}
                >
                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {orc.validade && isOrcamentoVencido(orc.dataEmissao, orc.validade, orc.status) && (
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      {orc.validade && diasParaVencer(orc.dataEmissao, orc.validade, orc.status) <= 3 &&
                        diasParaVencer(orc.dataEmissao, orc.validade, orc.status) > 0 &&
                        orc.status === "pendente" && (
                          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        )}
                      <h3 className="font-semibold text-gray-900 truncate">
                        {orc.nomeCliente}
                      </h3>
                      {getStatusBadge(orc.status)}
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span>
                        <span className="font-medium">Ref:</span> {orc.numeroOrcamento}
                      </span>
                      <span>
                        <span className="font-medium">Marca:</span> {orc.marca || "-"}
                      </span>
                      <span>
                        <span className="font-medium">Peças:</span> {orc.totalPecas}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right mr-6">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(orc.total)}
                    </p>
                    <p className="text-xs text-gray-500">{orc.totalPecas} peças</p>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    {/* Botões de Aprovação/Reprovação */}
                    {orc.status === "pendente" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => updateStatusMutation.mutate({ orcamentoId: orc.id, status: "aprovado" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          ✓ Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => updateStatusMutation.mutate({ orcamentoId: orc.id, status: "reprovado" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          ✗ Reprovar
                        </Button>
                      </>
                    )}

                    {/* Botão Enviar para Kanban */}
                    {orc.status === "aprovado" && !orc.enviado && (
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => {
                          setSendingKanbanId(orc.id);
                          enviarKanbanMutation.mutate({ orcamentoId: orc.id });
                        }}
                        disabled={sendingKanbanId === orc.id}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Enviar Kanban
                      </Button>
                    )}

                    {/* Botões Visualizar e Deletar */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(orc.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(orc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <CriarOrcamentoSimples
        isOpen={showNovoOrcamento}
        onClose={() => {
          setShowNovoOrcamento(false);
          refetch();
        }}
      />

      <SelecionarFichasModal
        isOpen={showSelecionarFichas}
        onClose={() => {
          setShowSelecionarFichas(false);
          refetch();
        }}
      />
    </div>
  );
}

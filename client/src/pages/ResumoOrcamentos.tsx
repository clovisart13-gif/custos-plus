import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Search, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type StatusType = "pendente" | "aprovado" | "reprovado" | "todos";
type SortType = "recente" | "cliente";

export default function ResumoOrcamentos() {
  const [statusFilter, setStatusFilter] = useState<StatusType>("todos");
  const [sortBy, setSortBy] = useState<SortType>("recente");
  const [searchTerm, setSearchTerm] = useState("");

  // Buscar orçamentos com totais calculados em tempo real
  const { data: orcamentos = [], isLoading: loadingOrcamentos } =
    trpc.orcamentos.listComTotaisCalculados.useQuery();

  // Buscar KPIs
  const { data: kpis, isLoading: loadingKpis } = trpc.orcamentos.getKPIs.useQuery();

  // Mutation para atualizar status
  const updateStatusMutation = trpc.orcamentos.updateStatus.useMutation({
    onSuccess: () => {
      trpc.useUtils().orcamentos.listComTotaisCalculados.invalidate();
      trpc.useUtils().orcamentos.getKPIs.invalidate();
    },
  });

  // Filtrar e ordenar orçamentos
  const orcamentosFiltrados = useMemo(() => {
    let filtered = orcamentos;

    // Filtrar por status
    if (statusFilter !== "todos") {
      filtered = filtered.filter((orc) => orc.status === statusFilter);
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
  }, [orcamentos, statusFilter, searchTerm, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "aprovado":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case "reprovado":
        return (
          <Badge className="bg-rose-500 hover:bg-rose-600 text-white">
            <AlertCircle className="w-3 h-3 mr-1" />
            Reprovado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRowClass = (status: string) => {
    switch (status) {
      case "pendente":
        return "border-l-4 border-amber-500 hover:bg-amber-50";
      case "aprovado":
        return "border-l-4 border-emerald-500 hover:bg-emerald-50";
      case "reprovado":
        return "border-l-4 border-rose-500 hover:bg-rose-50";
      default:
        return "";
    }
  };

  if (loadingOrcamentos || loadingKpis) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando resumo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resumo de Orçamentos</h1>
        <p className="text-gray-600">Gerencie e aprove seus orçamentos</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">Pendentes</p>
                <p className="text-3xl font-bold text-amber-900">
                  {kpis?.pendente.quantidade || 0}
                </p>
                <p className="text-sm text-amber-700">
                  {formatCurrency(kpis?.pendente.totalValor || 0)}
                </p>
              </div>
              <Clock className="w-12 h-12 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 font-medium">Aprovados</p>
                <p className="text-3xl font-bold text-emerald-900">
                  {kpis?.aprovado.quantidade || 0}
                </p>
                <p className="text-sm text-emerald-700">
                  {formatCurrency(kpis?.aprovado.totalValor || 0)}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-emerald-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-700 font-medium">Reprovados</p>
                <p className="text-3xl font-bold text-rose-900">
                  {kpis?.reprovado.quantidade || 0}
                </p>
                <p className="text-sm text-rose-700">
                  {formatCurrency(kpis?.reprovado.totalValor || 0)}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-rose-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou número do orçamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtros e Ordenação */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("todos")}
              >
                Todos ({orcamentos.length})
              </Button>
              <Button
                variant={statusFilter === "pendente" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pendente")}
                className={statusFilter === "pendente" ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                Pendentes ({kpis?.pendente.quantidade || 0})
              </Button>
              <Button
                variant={statusFilter === "aprovado" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("aprovado")}
                className={statusFilter === "aprovado" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
              >
                Aprovados ({kpis?.aprovado.quantidade || 0})
              </Button>
              <Button
                variant={statusFilter === "reprovado" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("reprovado")}
                className={statusFilter === "reprovado" ? "bg-rose-500 hover:bg-rose-600" : ""}
              >
                Reprovados ({kpis?.reprovado.quantidade || 0})
              </Button>
            </div>

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

      {/* Lista de Orçamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {orcamentosFiltrados.length} orçamento(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orcamentosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum orçamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orcamentosFiltrados.map((orc) => (
                <div
                  key={orc.id}
                  className={`flex items-center justify-between p-4 bg-white border rounded-lg transition-colors ${getRowClass(
                    orc.status
                  )}`}
                >
                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
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
                        <span className="font-medium">Peças:</span>{" "}
                        {orc.totalPecas.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {/* Valor e Ações */}
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right min-w-fit">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(orc.total)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {orc.status !== "aprovado" && (
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white whitespace-nowrap"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              orcamentoId: orc.id,
                              status: "aprovado",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          ✓ Aprovar
                        </Button>
                      )}
                      {orc.status !== "reprovado" && (
                        <Button
                          size="sm"
                          className="bg-rose-500 hover:bg-rose-600 text-white whitespace-nowrap"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              orcamentoId: orc.id,
                              status: "reprovado",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          ✗ Reprovar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

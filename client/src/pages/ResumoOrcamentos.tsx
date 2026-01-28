import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, DollarSign, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type StatusType = "pendente" | "aprovado" | "reprovado" | "todos";

export default function ResumoOrcamentos() {
  const [statusFilter, setStatusFilter] = useState<StatusType>("todos");
  const [sortBy, setSortBy] = useState<"data" | "valor">("data");

  // Buscar orçamentos com totais calculados em tempo real
  const { data: orcamentos = [], isLoading: loadingOrcamentos } =
    trpc.orcamentos.listComTotaisCalculados.useQuery();

  // Buscar KPIs
  const { data: kpis, isLoading: loadingKpis } = trpc.orcamentos.getKPIs.useQuery();

  // Mutation para atualizar status
  const updateStatusMutation = trpc.orcamentos.updateStatus.useMutation({
    onSuccess: () => {
      // Invalidar queries para recarregar dados
      trpc.useUtils().orcamentos.listComTotaisCalculados.invalidate();
      trpc.useUtils().orcamentos.getKPIs.invalidate();
    },
  });

  // Filtrar orçamentos
  const orcamentosFiltrados = useMemo(() => {
    let filtered = orcamentos;

    if (statusFilter !== "todos") {
      filtered = filtered.filter((orc) => orc.status === statusFilter);
    }

    // Ordenar
    if (sortBy === "valor") {
      filtered = [...filtered].sort((a, b) => b.total - a.total);
    } else {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }, [orcamentos, statusFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "aprovado":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case "reprovado":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Reprovado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-50 hover:bg-yellow-100";
      case "aprovado":
        return "bg-green-50 hover:bg-green-100";
      case "reprovado":
        return "bg-red-50 hover:bg-red-100";
      default:
        return "bg-gray-50 hover:bg-gray-100";
    }
  };

  if (loadingOrcamentos || loadingKpis) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando resumo de orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resumo de Orçamentos</h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie todos os seus orçamentos com status e totalizações em tempo real
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pendentes */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold text-yellow-900">
                  {kpis?.pendente.quantidade || 0}
                </p>
                <p className="text-xs text-yellow-700">orçamentos</p>
              </div>
              <div className="pt-2 border-t border-yellow-200">
                <p className="text-sm font-semibold text-yellow-900">
                  {formatCurrency(kpis?.pendente.totalValor || 0)}
                </p>
                <p className="text-xs text-yellow-700">
                  {kpis?.pendente.totalPecas || 0} peças
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aprovados */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Aprovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {kpis?.aprovado.quantidade || 0}
                </p>
                <p className="text-xs text-green-700">orçamentos</p>
              </div>
              <div className="pt-2 border-t border-green-200">
                <p className="text-sm font-semibold text-green-900">
                  {formatCurrency(kpis?.aprovado.totalValor || 0)}
                </p>
                <p className="text-xs text-green-700">
                  {kpis?.aprovado.totalPecas || 0} peças
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reprovados */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Reprovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold text-red-900">
                  {kpis?.reprovado.quantidade || 0}
                </p>
                <p className="text-xs text-red-700">orçamentos</p>
              </div>
              <div className="pt-2 border-t border-red-200">
                <p className="text-sm font-semibold text-red-900">
                  {formatCurrency(kpis?.reprovado.totalValor || 0)}
                </p>
                <p className="text-xs text-red-700">
                  {kpis?.reprovado.totalPecas || 0} peças
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ordenação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
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
              >
                Pendentes ({kpis?.pendente.quantidade || 0})
              </Button>
              <Button
                variant={statusFilter === "aprovado" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("aprovado")}
              >
                Aprovados ({kpis?.aprovado.quantidade || 0})
              </Button>
              <Button
                variant={statusFilter === "reprovado" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("reprovado")}
              >
                Reprovados ({kpis?.reprovado.quantidade || 0})
              </Button>
            </div>

            <div className="flex gap-2 ml-auto">
              <Button
                variant={sortBy === "data" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("data")}
              >
                Mais Recentes
              </Button>
              <Button
                variant={sortBy === "valor" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("valor")}
              >
                Maior Valor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Orçamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {orcamentosFiltrados.length} orçamento(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orcamentosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum orçamento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Referência
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Marca
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Peças
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orcamentosFiltrados.map((orc) => (
                    <tr
                      key={orc.id}
                      className={`border-b border-gray-100 ${getStatusColor(orc.status)}`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {orc.numeroOrcamento}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{orc.nomeCliente}</td>
                      <td className="py-3 px-4 text-gray-600">{orc.marca || "-"}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {orc.totalPecas.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {formatCurrency(orc.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(orc.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-1 justify-center">
                          {orc.status !== "aprovado" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  orcamentoId: orc.id,
                                  status: "aprovado",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              Aprovar
                            </Button>
                          )}
                          {orc.status !== "reprovado" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 text-red-600 hover:text-red-700"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  orcamentoId: orc.id,
                                  status: "reprovado",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              Reprovar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

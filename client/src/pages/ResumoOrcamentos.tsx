import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Package, TrendingUp } from "lucide-react";
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
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "aprovado":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case "reprovado":
        return (
          <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-3 py-1">
            <AlertCircle className="w-3 h-3 mr-1" />
            Reprovado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusRowClass = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-amber-50 hover:bg-amber-100 border-l-4 border-amber-500";
      case "aprovado":
        return "bg-emerald-50 hover:bg-emerald-100 border-l-4 border-emerald-500";
      case "reprovado":
        return "bg-rose-50 hover:bg-rose-100 border-l-4 border-rose-500";
      default:
        return "bg-gray-50 hover:bg-gray-100";
    }
  };

  if (loadingOrcamentos || loadingKpis) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando resumo de orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      {/* Título */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Resumo de Orçamentos
        </h1>
        <p className="text-gray-600 text-lg">
          Gerencie e aprove seus orçamentos com totalizações em tempo real
        </p>
      </div>

      {/* KPI Cards - Layout Impactante */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pendentes */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200 rounded-full -mr-12 -mt-12 opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-amber-900">Pendentes</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-4xl font-bold text-amber-900">
                  {kpis?.pendente.quantidade || 0}
                </p>
                <p className="text-sm text-amber-700 font-medium">orçamentos</p>
              </div>
              <div className="pt-3 border-t-2 border-amber-300">
                <p className="text-2xl font-bold text-amber-900">
                  {formatCurrency(kpis?.pendente.totalValor || 0)}
                </p>
                <p className="text-sm text-amber-700 font-medium">
                  {kpis?.pendente.totalPecas || 0} peças
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aprovados */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200 rounded-full -mr-12 -mt-12 opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900">Aprovados</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-4xl font-bold text-emerald-900">
                  {kpis?.aprovado.quantidade || 0}
                </p>
                <p className="text-sm text-emerald-700 font-medium">orçamentos</p>
              </div>
              <div className="pt-3 border-t-2 border-emerald-300">
                <p className="text-2xl font-bold text-emerald-900">
                  {formatCurrency(kpis?.aprovado.totalValor || 0)}
                </p>
                <p className="text-sm text-emerald-700 font-medium">
                  {kpis?.aprovado.totalPecas || 0} peças
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reprovados */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 p-6 border-2 border-rose-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200 rounded-full -mr-12 -mt-12 opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-500 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-rose-900">Reprovados</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-4xl font-bold text-rose-900">
                  {kpis?.reprovado.quantidade || 0}
                </p>
                <p className="text-sm text-rose-700 font-medium">orçamentos</p>
              </div>
              <div className="pt-3 border-t-2 border-rose-300">
                <p className="text-2xl font-bold text-rose-900">
                  {formatCurrency(kpis?.reprovado.totalValor || 0)}
                </p>
                <p className="text-sm text-rose-700 font-medium">
                  {kpis?.reprovado.totalPecas || 0} peças
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Ordenação */}
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
          <CardTitle className="text-lg">Filtros e Ordenação</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("todos")}
                className={statusFilter === "todos" ? "bg-blue-600 hover:bg-blue-700" : ""}
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

            <div className="flex gap-2 ml-auto">
              <Button
                variant={sortBy === "data" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("data")}
                className={sortBy === "data" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Mais Recentes
              </Button>
              <Button
                variant={sortBy === "valor" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("valor")}
                className={sortBy === "valor" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Maior Valor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Orçamentos */}
      <Card className="border-2 border-gray-200 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            {orcamentosFiltrados.length} orçamento(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orcamentosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum orçamento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 font-bold text-gray-700">Referência</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700">Cliente</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700">Marca</th>
                    <th className="text-right py-4 px-6 font-bold text-gray-700">Peças</th>
                    <th className="text-right py-4 px-6 font-bold text-gray-700">Total</th>
                    <th className="text-center py-4 px-6 font-bold text-gray-700">Status</th>
                    <th className="text-center py-4 px-6 font-bold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orcamentosFiltrados.map((orc, idx) => (
                    <tr
                      key={orc.id}
                      className={`${getStatusRowClass(orc.status)} transition-colors duration-200 ${
                        idx !== orcamentosFiltrados.length - 1 ? "border-b border-gray-200" : ""
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-gray-900">{orc.numeroOrcamento}</td>
                      <td className="py-4 px-6 text-gray-800 font-medium">{orc.nomeCliente}</td>
                      <td className="py-4 px-6 text-gray-700">{orc.marca || "-"}</td>
                      <td className="py-4 px-6 text-right text-gray-800 font-medium">
                        {orc.totalPecas.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-gray-900 text-lg">
                        {formatCurrency(orc.total)}
                      </td>
                      <td className="py-4 px-6 text-center">{getStatusBadge(orc.status)}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex gap-2 justify-center">
                          {orc.status !== "aprovado" && (
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-9"
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
                              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs h-9"
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

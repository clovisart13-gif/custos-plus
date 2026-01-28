import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Package, Search, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type StatusType = "pendente" | "aprovado" | "reprovado";

export default function ResumoOrcamentos() {
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

  // Filtrar por busca
  const orcamentosFiltrados = orcamentos.filter((orc) =>
    orc.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    orc.numeroOrcamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar por status
  const pendentes = orcamentosFiltrados.filter((o) => o.status === "pendente");
  const aprovados = orcamentosFiltrados.filter((o) => o.status === "aprovado");
  const reprovados = orcamentosFiltrados.filter((o) => o.status === "reprovado");

  const OrcamentoCard = ({ orc }: { orc: any }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow hover:border-gray-300">
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{orc.nomeCliente}</p>
          <p className="text-xs text-gray-500">{orc.numeroOrcamento}</p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(orc.total)}
            </p>
            <p className="text-xs text-gray-500">{orc.totalPecas.toLocaleString("pt-BR")} peças</p>
          </div>
        </div>

        {orc.marca && (
          <p className="text-xs text-gray-600">
            <span className="font-medium">Marca:</span> {orc.marca}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          {orc.status !== "aprovado" && (
            <Button
              size="sm"
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8"
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
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs h-8"
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
  );

  const KanbanColumn = ({
    title,
    status,
    items,
    color,
    icon: Icon,
    count,
    totalValue,
  }: {
    title: string;
    status: StatusType;
    items: any[];
    color: string;
    icon: any;
    count: number;
    totalValue: number;
  }) => (
    <div className="flex flex-col h-full min-h-[600px] bg-gray-50 rounded-xl p-4 border border-gray-200">
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{count} orçamento(s)</p>
          </div>
        </div>
        <p className="text-lg font-bold text-gray-900">{formatCurrency(totalValue)}</p>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <p className="text-sm">Nenhum orçamento</p>
          </div>
        ) : (
          items.map((orc) => <OrcamentoCard key={orc.id} orc={orc} />)
        )}
      </div>
    </div>
  );

  if (loadingOrcamentos || loadingKpis) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando resumo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resumo de Orçamentos</h1>
          <p className="text-gray-600">Gerencie seus orçamentos em tempo real</p>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Pendentes</h3>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {kpis?.pendente.quantidade || 0}
            </p>
            <p className="text-sm text-gray-600">
              {formatCurrency(kpis?.pendente.totalValor || 0)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Aprovados</h3>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {kpis?.aprovado.quantidade || 0}
            </p>
            <p className="text-sm text-gray-600">
              {formatCurrency(kpis?.aprovado.totalValor || 0)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-rose-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Reprovados</h3>
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {kpis?.reprovado.quantidade || 0}
            </p>
            <p className="text-sm text-gray-600">
              {formatCurrency(kpis?.reprovado.totalValor || 0)}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou número do orçamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <KanbanColumn
            title="Pendentes"
            status="pendente"
            items={pendentes}
            color="bg-amber-500"
            icon={Clock}
            count={pendentes.length}
            totalValue={kpis?.pendente.totalValor || 0}
          />
          <KanbanColumn
            title="Aprovados"
            status="aprovado"
            items={aprovados}
            color="bg-emerald-500"
            icon={CheckCircle}
            count={aprovados.length}
            totalValue={kpis?.aprovado.totalValor || 0}
          />
          <KanbanColumn
            title="Reprovados"
            status="reprovado"
            items={reprovados}
            color="bg-rose-500"
            icon={AlertCircle}
            count={reprovados.length}
            totalValue={kpis?.reprovado.totalValor || 0}
          />
        </div>
      </div>
    </div>
  );
}

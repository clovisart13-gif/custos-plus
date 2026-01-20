import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeTutorial } from "@/components/WelcomeTutorial";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { FileText, DollarSign, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useMemo, useEffect } from "react";

export default function Dashboard() {
  const [familiaFiltro, setFamiliaFiltro] = useState<string>('todos');
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const { data: kpis, isLoading: kpisLoading, refetch: refetchKpis } = trpc.dashboard.kpis.useQuery(
    { familia: familiaFiltro },
    { 
      enabled: isAuthenticated,
      staleTime: 0
    }
  );

  useEffect(() => {
    if (isAuthenticated) {
      refetchKpis();
    }
  }, [familiaFiltro, isAuthenticated, refetchKpis]);

  const { data: custosMedios, isLoading: custosLoading } = trpc.dashboard.custosMediosPorFamilia.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Filtrar dados por família selecionada
  const custosMediosFiltrados = useMemo(() => {
    if (!custosMedios) return [];
    if (familiaFiltro === 'todos') return custosMedios;
    return custosMedios.filter(item => item.familia === familiaFiltro);
  }, [custosMedios, familiaFiltro]);

  // Extrair famílias únicas
  const familias = useMemo(() => {
    if (!custosMedios) return [];
    return Array.from(new Set(custosMedios.map(item => item.familia))).sort();
  }, [custosMedios]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  // Preparar dados para gráfico de barras
  const barChartData = custosMediosFiltrados?.map((item) => ({
    familia: item.familia,
    total: item.totalMedio,
  })) || [];

  // Preparar dados para gráfico de pizza
  const totalMaoDeObra = custosMediosFiltrados?.reduce(
    (sum, item) =>
      sum +
      item.modelagem +
      item.piloto +
      item.corte +
      item.beneficiamento +
      item.costura +
      item.lavanderia +
      item.acabamento +
      item.passadoria,
    0
  ) || 0;

  const totalMateriaPrima = custosMediosFiltrados?.reduce(
    (sum, item) => sum + item.tecido + item.aviamento,
    0
  ) || 0;

  const pieChartData = [
    { name: "Mão-de-Obra", value: totalMaoDeObra, fill: "#3B82F6" },
    { name: "Matéria-Prima", value: totalMateriaPrima, fill: "#10B981" },
  ];

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <>
      <WelcomeTutorial />
      <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral dos custos de produção
          </p>
        </div>

        {/* KPIs Cards - REMOVIDO */}


        {/* Tabela de Custos Médios por Família */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Custos por Família</CardTitle>
            <select
              value={familiaFiltro}
              onChange={(e) => setFamiliaFiltro(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="todos">Todas as famílias</option>
              {familias.map((familia) => (
                <option key={familia} value={familia}>
                  {familia}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent>
            {custosLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : custosMediosFiltrados && custosMediosFiltrados.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Família</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Modelagem</TableHead>
                      <TableHead className="text-right">Piloto</TableHead>
                      <TableHead className="text-right">Corte</TableHead>
                      <TableHead className="text-right">Benefic.</TableHead>
                      <TableHead className="text-right">Costura</TableHead>
                      <TableHead className="text-right">Lavand.</TableHead>
                      <TableHead className="text-right">Acabam.</TableHead>
                      <TableHead className="text-right">Passad.</TableHead>
                      <TableHead className="text-right">Tecido</TableHead>
                      <TableHead className="text-right">Aviamento</TableHead>
                      <TableHead className="text-right font-bold">TOTAL GERAL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {custosMediosFiltrados.map((item) => (
                      <TableRow key={item.familia}>
                        <TableCell className="font-medium">{item.familia}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                        <TableCell className="text-right">R$ {item.modelagem.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {item.piloto.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {item.corte.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {item.beneficiamento.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {item.costura.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {item.lavanderia.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {item.acabamento.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {item.passadoria.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {item.tecido.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {item.aviamento.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-bold">
                          R$ {item.totalMedio.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {custosMediosFiltrados.length > 0 && (
                      <TableRow className="bg-blue-50 hover:bg-blue-50">
                        <TableCell className="font-bold text-blue-900 text-lg">TOTAL/MEDIA</TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          {custosMediosFiltrados.reduce((sum, item) => sum + item.count, 0)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          R$ {(custosMediosFiltrados.reduce((sum, item) => sum + item.modelagem, 0) / custosMediosFiltrados.length).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          R$ {(custosMediosFiltrados.reduce((sum, item) => sum + item.piloto, 0) / custosMediosFiltrados.length).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          R$ {(custosMediosFiltrados.reduce((sum, item) => sum + item.corte, 0) / custosMediosFiltrados.length).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          R$ {(custosMediosFiltrados.reduce((sum, item) => sum + item.beneficiamento, 0) / custosMediosFiltrados.length).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          R$ {(custosMediosFiltrados.reduce((sum, item) => sum + item.costura, 0) / custosMediosFiltrados.length).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          R$ {(custosMediosFiltrados.reduce((sum, item) => sum + item.lavanderia, 0) / custosMediosFiltrados.length).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          R$ {(custosMediosFiltrados.reduce((sum, item) => sum + item.acabamento, 0) / custosMediosFiltrados.length).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          R$ {(custosMediosFiltrados.reduce((sum, item) => sum + item.passadoria, 0) / custosMediosFiltrados.length).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          R$ {(custosMediosFiltrados.reduce((sum, item) => sum + item.tecido, 0) / custosMediosFiltrados.length).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          R$ {(custosMediosFiltrados.reduce((sum, item) => sum + item.aviamento, 0) / custosMediosFiltrados.length).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900 text-lg">
                          R$ {(custosMediosFiltrados.reduce((sum, item) => sum + item.totalMedio, 0) / custosMediosFiltrados.length).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Nenhum dado disponível. Adicione fichas de custo para visualizar análises.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras */}
          <Card>
            <CardHeader>
              <CardTitle>Custo Total por Família</CardTitle>
            </CardHeader>
            <CardContent>
              {custosLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="familia" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                    <Bar dataKey="total" name="Custo Médio">
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum dado disponível
                </p>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Pizza */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              {custosLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pieChartData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum dado disponível
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
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
import { FileText, DollarSign, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const { data: kpis, isLoading: kpisLoading } = trpc.dashboard.kpis.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: custosMedios, isLoading: custosLoading } = trpc.dashboard.custosMediosPorFamilia.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

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
        <Button asChild>
          <a href={getLoginUrl()}>Fazer Login</a>
        </Button>
      </div>
    );
  }

  // Preparar dados para gráfico de barras
  const barChartData = custosMedios?.map((item) => ({
    familia: item.familia,
    total: item.totalMedio,
  })) || [];

  // Preparar dados para gráfico de pizza
  const totalMaoDeObra = custosMedios?.reduce(
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

  const totalMateriaPrima = custosMedios?.reduce(
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

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Referências
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{kpis?.totalReferencias || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custo Médio Geral
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">
                  R$ {(kpis?.custoMedioGeral || 0).toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Família Mais Cara
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{kpis?.familiaMaisCara || "-"}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Família Mais Barata
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {kpisLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{kpis?.familiaMaisBarata || "-"}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Custos Médios por Família */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Custos Médios por Família</CardTitle>
          </CardHeader>
          <CardContent>
            {custosLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : custosMedios && custosMedios.length > 0 ? (
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
                      <TableHead className="text-right font-bold">TOTAL MÉDIO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {custosMedios.map((item) => (
                      <TableRow key={item.familia}>
                        <TableCell className="font-medium">{item.familia}</TableCell>
                        <TableCell className="text-right">{item.quantidade}</TableCell>
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

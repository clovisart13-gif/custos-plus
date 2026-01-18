import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState, useRef } from "react";
import AdicionarItemOrcamento from "@/components/AdicionarItemOrcamento";

export default function VisualizarOrcamento() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [showAddItem, setShowAddItem] = useState(false);

  const orcamentoId = id ? parseInt(id) : 0;

  const { data: orcamento, isLoading: loadingOrcamento, refetch } = trpc.orcamentos.getById.useQuery(
    { id: orcamentoId },
    { enabled: orcamentoId > 0 }
  );

  const { data: itens = [], isLoading: loadingItens, refetch: refetchItens } = trpc.orcamentos.getItens.useQuery(
    { orcamentoId },
    { enabled: orcamentoId > 0 }
  );

  if (loadingOrcamento || loadingItens) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate("/orcamentos")} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Orçamento não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const totalPecas = itens.reduce((sum, item) => sum + item.quantidade, 0);
  const subtotal = itens.reduce((sum, item) => sum + Number(item.valorTotal), 0);
  const total = subtotal;

  const valorSinal = (total * Number(orcamento.percentualSinal)) / 100;
  const valorRetirada = (total * Number(orcamento.percentualRetirada)) / 100;
  const valorPrazo = (total * Number(orcamento.percentualPrazo)) / 100;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Button variant="ghost" onClick={() => navigate("/orcamentos")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Header da Empresa */}
      <Card className="mb-8 print:border-0 print:shadow-none">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img 
                src="/logo-r2pb.jpeg" 
                alt="R2PB Confecções" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold">QUICK THREADS LTDA</h1>
                <p className="text-sm text-muted-foreground">R. Ten. Pena, 166 - Bom Retiro, São Paulo - SP, 01127-020</p>
                <p className="text-sm text-muted-foreground">CNPJ: 50.295.280/0001-80</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">ORÇAMENTO</p>
              <p className="text-lg font-semibold">{orcamento.numeroOrcamento}</p>
              <p className="text-sm text-muted-foreground">{formatDate(orcamento.dataEmissao)}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dados do Cliente */}
      <Card className="mb-8 print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Cliente:</strong> {orcamento.nomeCliente}</p>
          <p><strong>Marca/Coleção:</strong> {orcamento.marca}</p>
          <p><strong>Validade do Orçamento:</strong> {orcamento.validade} dias</p>
          <p><strong>Prazo de Entrega:</strong> {orcamento.prazoDias} dias</p>
        </CardContent>
      </Card>

      {/* Itens do Orçamento */}
      <Card className="mb-8 print:border-0 print:shadow-none">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-base">Itens do Orçamento</CardTitle>
          {!showAddItem && (
            <Button size="sm" onClick={() => setShowAddItem(true)}>
              + Adicionar Item
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showAddItem && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <AdicionarItemOrcamento 
                orcamentoId={orcamentoId}
                onSuccess={() => {
                  setShowAddItem(false);
                  refetchItens();
                }}
                onCancel={() => setShowAddItem(false)}
              />
            </div>
          )}

          {itens.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum item adicionado ainda</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Referência</th>
                    <th className="text-left py-2 px-2">Descrição</th>
                    <th className="text-right py-2 px-2">Quantidade</th>
                    <th className="text-right py-2 px-2">Valor Unitário</th>
                    <th className="text-right py-2 px-2">Total</th>
                    <th className="text-center py-2 px-2 print:hidden">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted">
                      <td className="py-2 px-2">{item.referencia}</td>
                      <td className="py-2 px-2">{item.descricao}</td>
                      <td className="text-right py-2 px-2">{item.quantidade}</td>
                      <td className="text-right py-2 px-2">{formatCurrency(Number(item.valorUnitario))}</td>
                      <td className="text-right py-2 px-2 font-semibold">{formatCurrency(Number(item.valorTotal))}</td>
                      <td className="text-center py-2 px-2 print:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => alert("Editar item em desenvolvimento")}
                          className="text-xs"
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="mb-8 print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-lg">
            <span>Total de Peças:</span>
            <span className="font-semibold">{totalPecas}</span>
          </div>
          <div className="flex justify-between text-lg border-t pt-4">
            <span>Subtotal:</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold border-t pt-4">
            <span>TOTAL:</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Condições de Pagamento */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Condições de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-sm">Sinal ({Number(orcamento.percentualSinal)}%):</span>
              <span className="font-semibold text-sm">{formatCurrency(valorSinal)}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-sm">Retirada ({Number(orcamento.percentualRetirada)}%):</span>
              <span className="font-semibold text-sm">{formatCurrency(valorRetirada)}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-sm">30 dias ({Number(orcamento.percentualPrazo)}%):</span>
              <span className="font-semibold text-sm">{formatCurrency(valorPrazo)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-1">
            <div className="text-sm text-blue-900">
              <strong>PIX:</strong> CNPJ 50.295.280/0001-80
            </div>
            <div className="text-sm text-blue-900">
              <strong>Email:</strong> comercial@quickthreads.com.br
            </div>
            <div className="text-sm text-blue-900">
              <strong>Site:</strong> www.r2pbconfeccoes.com.br
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

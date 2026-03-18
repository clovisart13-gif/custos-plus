import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Printer, Send, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState, useRef } from "react";
import AdicionarItemManual from "@/components/AdicionarItemManual";
import EditarItemOrcamento from "@/components/EditarItemOrcamento";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { EditarDescontoModal } from "@/components/EditarDescontoModal";
import { EditarObservacoesModal } from "@/components/EditarObservacoesModal";


export default function VisualizarOrcamento() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [enviandoKanban, setEnviandoKanban] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [editingClienteMarca, setEditingClienteMarca] = useState(false);
  const [nomeClienteEdit, setNomeClienteEdit] = useState("");
  const [marcaEdit, setMarcaEdit] = useState("");
  const [editingValidadeEPrazo, setEditingValidadeEPrazo] = useState(false);
  const [validadeEdit, setValidadeEdit] = useState("");
  const [prazoEdit, setPrazoEdit] = useState("");
  const [editingCondicoesPagamento, setEditingCondicoesPagamento] = useState(false);
  const [percentualSinalEdit, setPercentualSinalEdit] = useState("");
  const [descricaoSinalEdit, setDescricaoSinalEdit] = useState("Sinal");
  const [percentualRetiradaEdit, setPercentualRetiradaEdit] = useState("");
  const [descricaoRetiradaEdit, setDescricaoRetiradaEdit] = useState("Retirada");
  const [percentualPrazoEdit, setPercentualPrazoEdit] = useState("");
  const [descricaoPrazoEdit, setDescricaoPrazoEdit] = useState("30 dias");
  const [showEditarDescontoModal, setShowEditarDescontoModal] = useState(false);
  const [showEditarObservacoesModal, setShowEditarObservacoesModal] = useState(false);

  const orcamentoId = id ? parseInt(id) : 0;

  const { data: orcamento, isLoading: loadingOrcamento, refetch } = trpc.orcamentos.getById.useQuery(
    { id: orcamentoId },
    { enabled: orcamentoId > 0 }
  );

  const { data: itens = [], isLoading: loadingItens, refetch: refetchItens } = trpc.orcamentos.getItens.useQuery(
    { orcamentoId },
    { enabled: orcamentoId > 0 }
  );

  const utils = trpc.useUtils();

  const updateClienteMarcaMutation = trpc.orcamentos.updateClienteMarca.useMutation({
    onSuccess: () => {
      refetch();
      utils.orcamentos.list.invalidate();
      setEditingClienteMarca(false);
      toast.success("Cliente e marca atualizados!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + (error.message || "Erro desconhecido"));
    },
  });

  const updateValidadeEPrazoMutation = trpc.orcamentos.updateValidadeEPrazo.useMutation({
    onSuccess: () => {
      refetch();
      utils.orcamentos.list.invalidate();
      setEditingValidadeEPrazo(false);
      toast.success("Validade e prazo atualizados!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + (error.message || "Erro desconhecido"));
    },
  });

  const updateCondicoesPagamentoMutation = trpc.orcamentos.updateCondicoesPagamento.useMutation({
    onSuccess: () => {
      refetch();
      utils.orcamentos.list.invalidate();
      setEditingCondicoesPagamento(false);
      toast.success("Condicoes de pagamento atualizadas!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + (error.message || "Erro desconhecido"));
    },
  });

  const deleteItemMutation = trpc.orcamentos.deleteItem.useMutation({
    onSuccess: () => {
      refetchItens();
      utils.orcamentos.list.invalidate();
      setDeletingItemId(null);
    },
    onError: (error) => {
      alert("Erro ao deletar item: " + (error.message || "Erro desconhecido"));
      setDeletingItemId(null);
    },
  });

  const enviarParaKanbanMutation = trpc.orcamentos.enviarParaKanban.useMutation({
    onSuccess: () => {
      setEnviado(true);
      setEnviandoKanban(false);
      alert("Orçamento enviado para o Kanban com sucesso!");
    },
    onError: (error) => {
      setEnviandoKanban(false);
      alert("Erro ao enviar para Kanban: " + (error.message || "Erro desconhecido"));
    },
  });

  const handleEnviarKanban = async () => {
    setEnviandoKanban(true);
    await enviarParaKanbanMutation.mutateAsync({ orcamentoId });
  };

  const handleSalvarClienteMarca = async () => {
    if (!nomeClienteEdit || !marcaEdit) {
      toast.error("Preencha cliente e marca!");
      return;
    }
    await updateClienteMarcaMutation.mutateAsync({
      orcamentoId,
      nomeCliente: nomeClienteEdit,
      marca: marcaEdit,
    });
  };

  const handleSalvarValidadeEPrazo = async () => {
    if (!validadeEdit || !prazoEdit) {
      toast.error("Preencha validade e prazo!");
      return;
    }
    await updateValidadeEPrazoMutation.mutateAsync({
      orcamentoId,
      validade: parseInt(validadeEdit),
      prazoEntregaTexto: prazoEdit,
    });
  };

  const handleSalvarCondicoesPagamento = async () => {
    if (!percentualSinalEdit || !percentualRetiradaEdit || !percentualPrazoEdit) {
      toast.error("Preencha todos os percentuais!");
      return;
    }
    await updateCondicoesPagamentoMutation.mutateAsync({
      orcamentoId,
      percentualSinal: parseFloat(percentualSinalEdit),
      percentualRetirada: parseFloat(percentualRetiradaEdit),
      percentualPrazo: parseFloat(percentualPrazoEdit),
    });
  };

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
  
  // Calcular desconto
  let valorDesconto = 0;
  if (orcamento.descontoValor && Number(orcamento.descontoValor) > 0) {
    if (orcamento.descontoTipo === 'percentual') {
      valorDesconto = (subtotal * Number(orcamento.descontoValor)) / 100;
    } else {
      valorDesconto = Number(orcamento.descontoValor);
    }
  }
  
  const total = subtotal - valorDesconto;

  const valorSinal = (total * Number(orcamento.percentualSinal)) / 100;
  const valorRetirada = (total * Number(orcamento.percentualRetirada)) / 100;
  const valorPrazo = (total * Number(orcamento.percentualPrazo)) / 100;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          
          /* Ocultar URLs automáticas do navegador */
          a[href]:after {
            content: none !important;
            display: none !important;
            visibility: hidden !important;
          }
          
          a {
            text-decoration: none !important;
            color: inherit !important;
          }
          
          abbr[title]:after {
            content: none !important;
            display: none !important;
          }
          
          /* Ocultar qualquer link gerado automaticamente */
          body::after,
          html::after,
          div::after {
            content: none !important;
            display: none !important;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print-header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 14px;
            margin: 0 0 8mm 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          
          .print-logo {
            height: 45px;
            width: auto;
            background: white;
            padding: 5px 10px;
            border-radius: 4px;
            flex-shrink: 0;
          }
          
          .print-title {
            text-align: right;
            flex-shrink: 0;
          }
          
          .print-title p {
            font-size: 14px;
            margin: 2px 0;
            opacity: 0.95;
            white-space: nowrap;
          }
          
          .print-section {
            margin-bottom: 8px;
            page-break-inside: avoid;
          }
          
          .print-section-title {
            background: #f3f4f6;
            padding: 6px 10px;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #374151;
            border-left: none;
            margin-left: -4px;
          }
          
          .print-section-content {
            padding: 8px 10px;
            font-size: 10px;
            line-height: 1.4;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 9px;
            overflow: visible;
            table-layout: fixed;
          }
          
          .print-table thead {
            background: #1e40af;
            color: white;
          }
          
          .print-table th {
            padding: 6px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .print-table td {
            padding: 5px 8px;
            border-bottom: 1px solid #e5e7eb;
            overflow: visible;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          .print-table tbody tr:nth-child(even) {
            background: #f9fafb;
          }
          
          .print-table tbody tr:hover {
            background: #f3f4f6;
          }
          
          .print-table tbody tr:first-child td {
            padding: 8px 8px;
            line-height: 1.6;
            min-height: 25px;
            overflow: visible !important;
            white-space: normal !important;
            word-break: break-word !important;
          }
          
          .print-table tbody tr:first-child td:last-child {
            padding-right: 12px !important;
            text-align: right !important;
          }
          
          .print-totals {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 12px 15px;
            margin-top: 10px;
            border-radius: 6px;
          }
          
          .print-totals-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-size: 11px;
          }
          
          .print-totals-row.total {
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid rgba(255,255,255,0.3);
            padding-top: 8px;
            margin-top: 8px;
          }
          
          .print-payment {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 10px 12px;
            margin-top: 10px;
            font-size: 10px;
          }
          
          .print-payment-item {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            padding: 3px 0;
          }
          
          .print-payment-item strong {
            color: #92400e;
          }
          
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #f3f4f6;
            padding: 10px 20px;
            font-size: 8px;
            text-align: center;
            color: #6b7280;
            border-top: 2px solid #3b82f6;
            z-index: 1000;
          }
          
          .print-company-info {
            font-size: 9px;
            color: #4b5563;
            margin-bottom: 8px;
            line-height: 1.3;
          }
        }
        
        @media screen {
          .print-preview-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            overflow: visible;
            box-sizing: border-box;
          }
        }
      `}</style>

      <div className="container py-8 print:hidden">
        <div className="flex justify-between items-center mb-8">
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
            {orcamento.status === "aprovado" && !enviado && (
              <Button 
                onClick={handleEnviarKanban} 
                disabled={enviandoKanban}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                {enviandoKanban ? "Enviando..." : "Enviar para Kanban"}
              </Button>
            )}
            {enviado && (
              <Button disabled variant="outline" className="gap-2">
                <Send className="h-4 w-4" />
                Enviado para Kanban ✓
              </Button>
            )}
          </div>
        </div>

        {/* Versão de Edição (tela) */}
        <div className="space-y-6">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-base">Dados do Cliente</CardTitle>
              {!editingClienteMarca && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNomeClienteEdit(orcamento.nomeCliente);
                    setMarcaEdit(orcamento.marca);
                    setEditingClienteMarca(true);
                  }}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {editingClienteMarca ? (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label htmlFor="nomeClienteEdit">Cliente</Label>
                    <Input
                      id="nomeClienteEdit"
                      value={nomeClienteEdit}
                      onChange={(e) => setNomeClienteEdit(e.target.value)}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="marcaEdit">Marca/Coleção</Label>
                    <Input
                      id="marcaEdit"
                      value={marcaEdit}
                      onChange={(e) => setMarcaEdit(e.target.value)}
                      placeholder="Marca ou coleção"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSalvarClienteMarca}
                      disabled={updateClienteMarcaMutation.isPending}
                    >
                      {updateClienteMarcaMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingClienteMarca(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p><strong>Cliente:</strong> {orcamento.nomeCliente}</p>
                  <p><strong>Marca/Coleção:</strong> {orcamento.marca}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Validade e Prazo */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-base">Validade e Prazo</CardTitle>
              {!editingValidadeEPrazo && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setValidadeEdit(orcamento.validade?.toString() || "");
                    setPrazoEdit(orcamento.prazoEntregaTexto || "");
                    setEditingValidadeEPrazo(true);
                  }}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {editingValidadeEPrazo ? (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label htmlFor="validadeEdit">Validade (dias)</Label>
                    <Input
                      id="validadeEdit"
                      type="number"
                      value={validadeEdit}
                      onChange={(e) => setValidadeEdit(e.target.value)}
                      placeholder="Ex: 30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prazoEdit">Prazo de Entrega</Label>
                    <Input
                      id="prazoEdit"
                      value={prazoEdit}
                      onChange={(e) => setPrazoEdit(e.target.value)}
                      placeholder="Ex: 15 dias uteis"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSalvarValidadeEPrazo}
                      disabled={updateValidadeEPrazoMutation.isPending}
                    >
                      {updateValidadeEPrazoMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingValidadeEPrazo(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p><strong>Validade do Orcamento:</strong> {orcamento.validade} dias</p>
                  <p><strong>Prazo de Entrega:</strong> {orcamento.prazoEntregaTexto || orcamento.prazoDias + ' dias'}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Itens do Orcamento */}
          <Card>
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
                  <AdicionarItemManual 
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
                <div className="w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Referência</th>
                        <th className="text-left py-2 px-2">Descrição</th>
                        <th className="text-right py-2 px-2">Quantidade</th>
                        <th className="text-right py-2 px-2">Valor Unitário</th>
                        <th className="text-right py-2 px-2">Total</th>
                        <th className="text-center py-2 px-2">Ações</th>
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
                          <td className="text-center py-2 px-2">
                            <div className="flex gap-1 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Tem certeza que deseja deletar este item?")) {
                                    setDeletingItemId(item.id);
                                    deleteItemMutation.mutate({ itemId: item.id });
                                  }
                                }}
                                disabled={deletingItemId === item.id}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

          {/* Totais */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-base">Totais</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEditarDescontoModal(true)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Editar Desconto
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total de Peças:</span>
                  <span className="font-semibold">{totalPecas} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                {orcamento.descontoValor && Number(orcamento.descontoValor) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto ({orcamento.descontoTipo === 'percentual' ? `${orcamento.descontoValor}%` : 'Valor fixo'}):</span>
                    <span className="font-semibold">-{formatCurrency(
                      orcamento.descontoTipo === 'percentual' 
                        ? (subtotal * Number(orcamento.descontoValor)) / 100
                        : Number(orcamento.descontoValor)
                    )}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>VALOR TOTAL:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-base text-blue-900">Observações</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEditarObservacoesModal(true)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Editar
              </Button>
            </CardHeader>
            <CardContent>
              {orcamento.observacoes ? (
                <p className="text-sm whitespace-pre-wrap text-gray-700">{orcamento.observacoes}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Nenhuma observação adicionada. Clique em "Editar" para adicionar.</p>
              )}
            </CardContent>
          </Card>

          {/* Condições de Pagamento */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-base">Condições de Pagamento</CardTitle>
              {!editingCondicoesPagamento && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPercentualSinalEdit(orcamento.percentualSinal?.toString() || "0");
                    setPercentualRetiradaEdit(orcamento.percentualRetirada?.toString() || "0");
                    setPercentualPrazoEdit(orcamento.percentualPrazo?.toString() || "0");
                    setEditingCondicoesPagamento(true);
                  }}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingCondicoesPagamento ? (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Sinal (%)</Label>
                      <Input
                        type="number"
                        value={percentualSinalEdit}
                        onChange={(e) => setPercentualSinalEdit(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Retirada (%)</Label>
                      <Input
                        type="number"
                        value={percentualRetiradaEdit}
                        onChange={(e) => setPercentualRetiradaEdit(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Prazo (%)</Label>
                      <Input
                        type="number"
                        value={percentualPrazoEdit}
                        onChange={(e) => setPercentualPrazoEdit(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSalvarCondicoesPagamento}
                      disabled={updateCondicoesPagamentoMutation.isPending}
                    >
                      {updateCondicoesPagamentoMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCondicoesPagamento(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><strong>Sinal:</strong> {orcamento.percentualSinal}% = {formatCurrency(valorSinal)}</p>
                  <p><strong>Retirada:</strong> {orcamento.percentualRetirada}% = {formatCurrency(valorRetirada)}</p>
                  <p><strong>Prazo:</strong> {orcamento.percentualPrazo}% = {formatCurrency(valorPrazo)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Versão para Impressão (PDF) */}
      <div className="hidden print:block print-preview-container">
        {/* Cabeçalho Colorido */}
        <div className="print-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: 0 }}>
            <img src="/logo-r2pb.jpeg" alt="R2PB" className="print-logo" />
            <div style={{ color: 'white', flex: '1', minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '3px' }}>QUICK THREADS LTDA</div>
              <div style={{ fontSize: '9.5px', opacity: '0.95', lineHeight: '1.3' }}>R. Ten. Pena, 166 - Bom Retiro, São Paulo - SP, 01127-020</div>
            </div>
          </div>
          <div className="print-title">
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 3px 0', whiteSpace: 'nowrap' }}>{orcamento.numeroOrcamento}</p>
            <p style={{ fontSize: '14px', margin: '0', whiteSpace: 'nowrap' }}>{formatDate(orcamento.dataEmissao)}</p>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="print-section">
          <div className="print-section-title">Dados do Cliente</div>
          <div className="print-section-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><strong>Cliente:</strong> {orcamento.nomeCliente}</div>
              <div><strong>Marca/Coleção:</strong> {orcamento.marca}</div>
              <div><strong>Validade:</strong> {orcamento.validade} dias</div>
              <div><strong>Prazo de Entrega:</strong> {orcamento.prazoEntregaTexto || orcamento.prazoDias + ' dias'}</div>
            </div>
          </div>
        </div>

        {/* Itens do Orçamento */}
        <div className="print-section">
          <div className="print-section-title">Itens do Orçamento</div>
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Referência</th>
                <th style={{ width: '30%' }}>Descrição</th>
                <th style={{ width: '8%', textAlign: 'right' }}>Qtd.</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Vlr. Unit.</th>
                <th style={{ width: '35%', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id}>
                  <td>{item.referencia}</td>
                  <td>{item.descricao}</td>
                  <td style={{ textAlign: 'right' }}>{item.quantidade}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(Number(item.valorUnitario))}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(Number(item.valorTotal))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totais */}
        <div className="print-totals">
          <div className="print-totals-row">
            <span>Total de Peças:</span>
            <span style={{ fontWeight: '600' }}>{totalPecas} unidades</span>
          </div>
          <div className="print-totals-row">
            <span>Subtotal:</span>
            <span style={{ fontWeight: '600' }}>{formatCurrency(subtotal)}</span>
          </div>
          {orcamento.descontoValor && Number(orcamento.descontoValor) > 0 && (
            <div className="print-totals-row" style={{ color: '#059669' }}>
              <span>Desconto ({orcamento.descontoTipo === 'percentual' ? `${orcamento.descontoValor}%` : 'Valor fixo'}):</span>
              <span style={{ fontWeight: '600' }}>-{formatCurrency(
                orcamento.descontoTipo === 'percentual' 
                  ? (subtotal * Number(orcamento.descontoValor)) / 100
                  : Number(orcamento.descontoValor)
              )}</span>
            </div>
          )}
          <div className="print-totals-row total">
            <span>VALOR TOTAL:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Observações */}
        {orcamento.observacoes && (
          <div style={{ 
            marginTop: '8mm', 
            padding: '8px 12px', 
            background: '#f0f9ff', 
            border: '1px solid #bfdbfe', 
            borderRadius: '4px',
            pageBreakInside: 'avoid'
          }}>
            <div style={{ fontWeight: '700', marginBottom: '4px', fontSize: '10px', color: '#1e40af' }}>OBSERVAÇÕES</div>
            <div style={{ fontSize: '9px', lineHeight: '1.4', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
              {orcamento.observacoes}
            </div>
          </div>
        )}

        {/* Condições de Pagamento */}
        <div className="print-payment">
          <div style={{ fontWeight: '700', marginBottom: '6px', fontSize: '11px', color: '#92400e' }}>CONDIÇÕES DE PAGAMENTO</div>
          <div className="print-payment-item">
            <span><strong>Sinal ({orcamento.percentualSinal}%):</strong></span>
            <span>{formatCurrency(valorSinal)}</span>
          </div>
          <div className="print-payment-item">
            <span><strong>Retirada ({orcamento.percentualRetirada}%):</strong></span>
            <span>{formatCurrency(valorRetirada)}</span>
          </div>
          <div className="print-payment-item">
            <span><strong>Prazo ({orcamento.percentualPrazo}%):</strong></span>
            <span>{formatCurrency(valorPrazo)}</span>
          </div>
        </div>

        {/* Rodapé */}
        <div className="print-footer">
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', marginBottom: '6px', letterSpacing: '0.5px' }}>
            💳 PIX (CNPJ): 50295280000180
          </div>
          <div style={{ fontSize: '9px', marginBottom: '3px' }}>
            <strong>Email:</strong> comercial@quickthreads.com.br | <strong>Site:</strong> www.r2pbconfeccoes.com.br
          </div>
          <div style={{ marginTop: '4px', fontSize: '8px' }}>Este orçamento é válido por {orcamento.validade} dias a partir da data de emissão.</div>
        </div>
      </div>

      {/* Dialogs de Edição */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Item</DialogTitle>
            </DialogHeader>
            <EditarItemOrcamento
              item={editingItem}
              onSuccess={() => {
                setEditingItem(null);
                refetchItens();
              }}
              onCancel={() => setEditingItem(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Editar Desconto */}
      <EditarDescontoModal
        open={showEditarDescontoModal}
        onClose={() => setShowEditarDescontoModal(false)}
        orcamentoId={orcamentoId}
        descontoTipoAtual={orcamento?.descontoTipo || undefined}
        descontoValorAtual={orcamento?.descontoValor || undefined}
      />

      {/* Modal de Editar Observações */}
      <EditarObservacoesModal
        open={showEditarObservacoesModal}
        onClose={() => setShowEditarObservacoesModal(false)}
        orcamentoId={orcamentoId}
        observacoesAtuais={orcamento?.observacoes || undefined}
      />
    </>
  );
}

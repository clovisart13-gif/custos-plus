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
  const [percentualRetiradaEdit, setPercentualRetiradaEdit] = useState("");
  const [percentualPrazoEdit, setPercentualPrazoEdit] = useState("");

  const orcamentoId = id ? parseInt(id) : 0;

  const { data: orcamento, isLoading: loadingOrcamento, refetch } = trpc.orcamentos.getById.useQuery(
    { id: orcamentoId },
    { enabled: orcamentoId > 0 }
  );

  const { data: itens = [], isLoading: loadingItens, refetch: refetchItens } = trpc.orcamentos.getItens.useQuery(
    { orcamentoId },
    { enabled: orcamentoId > 0 }
  );

  const updateClienteMarcaMutation = trpc.orcamentos.updateClienteMarca.useMutation({
    onSuccess: () => {
      refetch();
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

  // Debug
  console.log('Orçamento status:', orcamento.status);
  console.log('Deve mostrar botão?', orcamento.status === 'aprovado' && !enviado);

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
    <div className="container py-8 print:p-0 print:m-0">
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
          {orcamento.status !== "aprovado" && (
            <div className="text-sm text-muted-foreground">Status: {orcamento.status}</div>
          )}
          {enviado && (
            <Button disabled variant="outline" className="gap-2">
              <Send className="h-4 w-4" />
              Enviado para Kanban ✓
            </Button>
          )}
        </div>
      </div>

      {/* Header da Empresa */}
      <Card className="mb-8 print:border-0 print:shadow-none print:mb-4">
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
      <Card className="mb-8 print:border-0 print:shadow-none print:mb-4">
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
              className="gap-2 print:hidden"
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
      <Card className="mb-8 print:border-0 print:shadow-none print:mb-4">
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
              className="gap-2 print:hidden"
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
      <Card className="mb-8 print:border-0 print:shadow-none print:mb-4">
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Referência</th>
                    <th className="text-left py-2 px-2">Descrição</th>
                    <th className="text-right py-2 px-2">Quantidade</th>
                    <th className="text-right py-2 px-2">Valor Unitário</th>
                    <th className="text-right py-2 px-2">Total</th>
                    <th className="text-center py-2 px-2 print:hidden" style={{ display: 'none' }}>Ações</th>
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
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItem(item);
                            }}
                            className="text-xs"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja deletar este item?')) {
                                setDeletingItemId(item.id);
                                deleteItemMutation.mutateAsync({ itemId: item.id });
                              }
                            }}
                            disabled={deletingItemId === item.id}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
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

      {/* Resumo Financeiro */}
      <Card className="mb-8 print:border-0 print:shadow-none print:mb-4">
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

      {/* Condicoes de Pagamento */}
      <Card className="print:border-0 print:shadow-none print:mb-0">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-base">Condicoes de Pagamento</CardTitle>
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
              className="gap-2 print:hidden"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingCondicoesPagamento ? (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div>
                <Label htmlFor="percentualSinalEdit">Sinal (%)</Label>
                <Input
                  id="percentualSinalEdit"
                  type="number"
                  step="0.01"
                  value={percentualSinalEdit}
                  onChange={(e) => setPercentualSinalEdit(e.target.value)}
                  placeholder="Ex: 50"
                />
              </div>
              <div>
                <Label htmlFor="percentualRetiradaEdit">Retirada (%)</Label>
                <Input
                  id="percentualRetiradaEdit"
                  type="number"
                  step="0.01"
                  value={percentualRetiradaEdit}
                  onChange={(e) => setPercentualRetiradaEdit(e.target.value)}
                  placeholder="Ex: 30"
                />
              </div>
              <div>
                <Label htmlFor="percentualPrazoEdit">30 dias (%)</Label>
                <Input
                  id="percentualPrazoEdit"
                  type="number"
                  step="0.01"
                  value={percentualPrazoEdit}
                  onChange={(e) => setPercentualPrazoEdit(e.target.value)}
                  placeholder="Ex: 20"
                />
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
            <>
              <div className="space-y-1">
                  {Number(orcamento.percentualSinal) > 0 && (
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Sinal ({Number(orcamento.percentualSinal)}%):</span>
                    <span className="font-semibold text-sm">{formatCurrency(valorSinal)}</span>
                  </div>
                )}
                {Number(orcamento.percentualRetirada) > 0 && (
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Retirada ({Number(orcamento.percentualRetirada)}%):</span>
                    <span className="font-semibold text-sm">{formatCurrency(valorRetirada)}</span>
                  </div>
                )}
                {Number(orcamento.percentualPrazo) > 0 && (
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span className="text-sm">30 dias ({Number(orcamento.percentualPrazo)}%):</span>
                    <span className="font-semibold text-sm">{formatCurrency(valorPrazo)}</span>
                  </div>
                )}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edicao */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <EditarItemOrcamento
              item={editingItem}
              orcamento={orcamento}
              onSuccess={() => {
                setEditingItem(null);
                refetchItens();
              }}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

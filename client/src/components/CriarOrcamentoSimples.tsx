import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Loader2, Trash2 } from "lucide-react";

interface CriarOrcamentoSimplesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CriarOrcamentoSimples({
  isOpen,
  onClose,
}: CriarOrcamentoSimplesProps) {
  const [, navigate] = useLocation();
  const [nomeCliente, setNomeCliente] = useState("");
  const [marca, setMarca] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [descontoTipo, setDescontoTipo] = useState<"percentual" | "valor">("percentual");
  const [descontoValor, setDescontoValor] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [orcamentoId, setOrcamentoId] = useState<number | null>(null);
  
  // Formulário para adicionar itens
  const [descricao, setDescricao] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const utils = trpc.useUtils();
  const createMutation = trpc.orcamentos.create.useMutation();
  const createItemMutation = trpc.orcamentos.createItem.useMutation();
  const deleteItemMutation = trpc.orcamentos.deleteItem.useMutation();
  const { data: orcamento } = trpc.orcamentos.getById.useQuery(
    { id: orcamentoId || 0 },
    { enabled: !!orcamentoId }
  );
  const { data: itens = [] } = trpc.orcamentos.getItens.useQuery(
    { orcamentoId: orcamentoId || 0 },
    { enabled: !!orcamentoId }
  );
  const orcamentoComItens = orcamento ? { ...orcamento, itens } : undefined;

  const handleCreateOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeCliente) {
      toast.error("Preencha nome do cliente!");
      return;
    }

    setIsCreating(true);

    try {
      const novoOrcamento = await createMutation.mutateAsync({
        nomeCliente,
        marca,
        observacoes: observacoes || undefined,
        descontoTipo: descontoValor > 0 ? descontoTipo : undefined,
        descontoValor: descontoValor > 0 ? descontoValor : undefined,
      });

      setOrcamentoId(novoOrcamento.id);
      setNomeCliente('');
      setMarca('');
      setObservacoes('');
      setDescontoTipo('percentual');
      setDescontoValor(0);
      toast.success("Orçamento criado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao criar orçamento:", error);
      toast.error("Erro ao criar orçamento: " + error.message);
      setIsCreating(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao || !valorUnitario || !quantidade) {
      toast.error("Preencha todos os campos do item!");
      return;
    }

    const valor = parseFloat(valorUnitario);
    const qtd = parseFloat(quantidade);

    if (isNaN(valor) || valor <= 0 || isNaN(qtd) || qtd <= 0) {
      toast.error("Valores inválidos!");
      return;
    }

    setIsAddingItem(true);

    try {
      const markup = 0.5; // 50% de markup padrão
      await createItemMutation.mutateAsync({
        orcamentoId: orcamentoId!,
        fichaId: 0, // Não vinculado a ficha
        referencia: descricao.substring(0, 20),
        descricao,
        quantidade: qtd,
        custo: valor, // Custo = valor unitário para itens manuais
        valorUnitario: valor,
        markup: markup,
      });

      // Limpar campos
      setDescricao("");
      setValorUnitario("");
      setQuantidade("1");
      
      // Invalidar cache para recarregar
      utils.orcamentos.getById.invalidate({ id: orcamentoId! });
      toast.success("Item adicionado!");
    } catch (error: any) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item: " + error.message);
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItemMutation.mutateAsync({ itemId });
      utils.orcamentos.getById.invalidate({ id: orcamentoId! });
      toast.success("Item deletado!");
    } catch (error: any) {
      console.error("Erro ao deletar item:", error);
      toast.error("Erro ao deletar item: " + error.message);
    }
  };

  const handleFinish = () => {
    if (orcamentoId) {
      navigate(`/orcamento/${orcamentoId}`);
      onClose();
    }
  };

  // Tela 1: Criar orçamento
  if (!orcamentoId) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Orçamento</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateOrcamento} className="space-y-4">
            <div>
              <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
              <Input
                id="nomeCliente"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Ex: Cliente Teste"
                required
              />
            </div>

            <div>
              <Label htmlFor="marca">Marca/Coleção (Opcional)</Label>
              <Input
                id="marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: Verão 2026"
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                placeholder="Notas adicionais sobre o orçamento..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="descontoTipo">Tipo de Desconto</Label>
                <select
                  id="descontoTipo"
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background h-10"
                  value={descontoTipo}
                  onChange={(e) => setDescontoTipo(e.target.value as "percentual" | "valor")}
                >
                  <option value="percentual">Percentual (%)</option>
                  <option value="valor">Valor (R$)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="descontoValor">Valor do Desconto</Label>
                <Input
                  id="descontoValor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={descontoValor}
                  onChange={(e) => setDescontoValor(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  "Criar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Tela 2: Adicionar itens
  const totalValor = orcamentoComItens?.itens?.reduce((sum: number, item: any) => sum + (item.valorTotal || 0), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Orçamento: {orcamento?.numeroOrcamento} - {orcamento?.nomeCliente}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do orçamento */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-semibold">{orcamento?.nomeCliente}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marca</p>
                <p className="font-semibold">{orcamento?.marca}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold text-lg">R$ {totalValor.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Itens</p>
                <p className="font-semibold">{orcamentoComItens?.itens?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Formulário para adicionar item */}
          <form onSubmit={handleAddItem} className="bg-background border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Adicionar Item</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Camiseta Verão"
                  required
                />
              </div>

              <div>
                <Label htmlFor="valorUnitario">Valor Unitário *</Label>
                <Input
                  id="valorUnitario"
                  type="number"
                  step="0.01"
                  value={valorUnitario}
                  onChange={(e) => setValorUnitario(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isAddingItem} className="w-full">
              {isAddingItem ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adicionando...
                </>
              ) : (
                "Adicionar Item"
              )}
            </Button>
          </form>

          {/* Lista de itens */}
          {orcamentoComItens?.itens && orcamentoComItens.itens.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Descrição</th>
                    <th className="text-right p-3">Valor Unit.</th>
                    <th className="text-right p-3">Qtd.</th>
                    <th className="text-right p-3">Total</th>
                    <th className="text-center p-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {orcamentoComItens.itens.map((item: any) => (
                    <tr key={item.id} className="border-t hover:bg-muted/50">
                      <td className="p-3">{item.descricao}</td>
                      <td className="text-right p-3">R$ {item.valorUnitario?.toFixed(2)}</td>
                      <td className="text-right p-3">{item.quantidade}</td>
                      <td className="text-right p-3 font-semibold">R$ {item.valorTotal?.toFixed(2)}</td>
                      <td className="text-center p-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Botões finais */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleFinish}>
              Finalizar e Visualizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

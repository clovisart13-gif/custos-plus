import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface GerarOrcamentoEmLoteProps {
  isOpen: boolean;
  onClose: () => void;
  fichasIds: number[];
  fichas: any[];
}

export default function GerarOrcamentoEmLote({
  isOpen,
  onClose,
  fichasIds,
  fichas,
}: GerarOrcamentoEmLoteProps) {
  const [, navigate] = useLocation();
  const [markup, setMarkup] = useState("0.50");
  const [nomeCliente, setNomeCliente] = useState("");
  const [marca, setMarca] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const orcamentoIdRef = useRef<number | null>(null);
  const itemsAddedRef = useRef<number>(0);
  const totalItemsRef = useRef<number>(0);

  const utils = trpc.useUtils();
  const createMutation = trpc.orcamentos.create.useMutation();
  const createItemMutation = trpc.orcamentos.createItem.useMutation({
    onSuccess: () => {
      itemsAddedRef.current++;
      if (itemsAddedRef.current === totalItemsRef.current) {
        // Todos os itens foram adicionados com sucesso
        utils.orcamentos.list.invalidate();
        toast.success("Orcamento criado com sucesso!");
        setNomeCliente("");
        setMarca("");
        setMarkup("0.50");
        onClose();
        if (orcamentoIdRef.current) {
          navigate(`/orcamento/${orcamentoIdRef.current}`);
        }
        setIsCreating(false);
      }
    },
    onError: (error: any) => {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item: " + error.message);
      setIsCreating(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeCliente || !marca) {
      toast.error("Preencha todos os campos!");
      return;
    }

    const markupNum = parseFloat(markup);
    if (isNaN(markupNum) || markupNum <= 0) {
      toast.error("Markup invalido!");
      return;
    }

    const selectedFichas = fichas.filter((f) => fichasIds.includes(f.id));
    
    if (selectedFichas.length === 0) {
      toast.error("Nenhuma ficha selecionada!");
      return;
    }

    setIsCreating(true);
    itemsAddedRef.current = 0;
    totalItemsRef.current = selectedFichas.length;

    try {
      // 1. Criar o orçamento
      const orcamento = await createMutation.mutateAsync({
        nomeCliente,
        marca,
      });

      orcamentoIdRef.current = orcamento.id;

      // 2. Adicionar todos os itens sequencialmente
      for (const ficha of selectedFichas) {
        const custoTotal = 
          (parseFloat(ficha.modelagem || 0) +
          parseFloat(ficha.piloto || 0) +
          parseFloat(ficha.corte || 0) +
          parseFloat(ficha.beneficiamento || 0) +
          parseFloat(ficha.costura || 0) +
          parseFloat(ficha.lavanderia || 0) +
          parseFloat(ficha.acabamento || 0) +
          parseFloat(ficha.passadoria || 0) +
          parseFloat(ficha.tecido || 0) +
          parseFloat(ficha.aviamento || 0));
        
        const valorUnitario = custoTotal / markupNum;
        const valorTotal = valorUnitario * 1; // quantidade = 1

        // Usar mutate para adicionar item
        createItemMutation.mutate({
          orcamentoId: orcamento.id,
          fichaId: ficha.id,
          referencia: ficha.referencia,
          descricao: ficha.observacoes || ficha.referencia,
          quantidade: 1,
          custo: custoTotal,
          valorUnitario: valorUnitario,
          markup: markupNum,
        });
      }
    } catch (error: any) {
      console.error("Erro ao criar orcamento:", error);
      toast.error("Erro ao criar orcamento: " + error.message);
      setIsCreating(false);
    }
  };

  const selectedFichasData = fichas.filter((f) => fichasIds.includes(f.id));
  const totalCusto = selectedFichasData.reduce((sum, f) => {
    const custoTotal = 
      (parseFloat(f.modelagem || 0) +
      parseFloat(f.piloto || 0) +
      parseFloat(f.corte || 0) +
      parseFloat(f.beneficiamento || 0) +
      parseFloat(f.costura || 0) +
      parseFloat(f.lavanderia || 0) +
      parseFloat(f.acabamento || 0) +
      parseFloat(f.passadoria || 0) +
      parseFloat(f.tecido || 0) +
      parseFloat(f.aviamento || 0));
    return sum + custoTotal;
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerar Orcamento em Lote</DialogTitle>
          <DialogDescription>
            Voce esta gerando um orcamento com {fichasIds.length} ficha(s)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fichas Selecionadas */}
          <div className="bg-muted p-4 rounded-lg">
            <Label className="font-semibold mb-2 block">Fichas Selecionadas:</Label>
            <div className="grid grid-cols-2 gap-2">
              {selectedFichasData.map((ficha) => {
                const custoTotal = 
                  (parseFloat(ficha.modelagem || 0) +
                  parseFloat(ficha.piloto || 0) +
                  parseFloat(ficha.corte || 0) +
                  parseFloat(ficha.beneficiamento || 0) +
                  parseFloat(ficha.costura || 0) +
                  parseFloat(ficha.lavanderia || 0) +
                  parseFloat(ficha.acabamento || 0) +
                  parseFloat(ficha.passadoria || 0) +
                  parseFloat(ficha.tecido || 0) +
                  parseFloat(ficha.aviamento || 0));
                
                return (
                  <div key={ficha.id} className="text-sm bg-background p-2 rounded">
                    <div className="font-medium">{ficha.referencia}</div>
                    <div className="text-muted-foreground text-xs">{ficha.observacoes || "Sem observações"}</div>
                    <div className="text-primary font-semibold">
                      R$ {custoTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campos */}
          <div className="space-y-4">
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
              <Label htmlFor="marca">Marca/Colecao *</Label>
              <Input
                id="marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: Colecao Verao"
                required
              />
            </div>

            <div>
              <Label htmlFor="markup">Markup (Divisor) *</Label>
              <div className="flex gap-2">
                <Input
                  id="markup"
                  type="number"
                  step="0.01"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                  placeholder="0.50"
                  required
                />
                <div className="text-xs text-muted-foreground pt-2 whitespace-nowrap">
                  <div>÷0.40=2.5x</div>
                  <div>÷0.50=2x</div>
                  <div>÷0.60=1.67x</div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Total de Fichas:</span>
              <span className="font-semibold">{fichasIds.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Custo Total:</span>
              <span className="font-semibold">
                R$ {totalCusto.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botoes */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Criando... ({itemsAddedRef.current}/{totalItemsRef.current})
                </>
              ) : (
                "Criar Orcamento"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

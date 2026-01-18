import { useState } from "react";
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

  const utils = trpc.useUtils();

  const createMutation = trpc.orcamentos.create.useMutation({
    onSuccess: (data) => {
      utils.orcamentos.list.invalidate();
      toast.success("Orcamento criado com sucesso!");
      onClose();
      navigate(`/orcamento/${data.id}`);
    },
    onError: () => {
      toast.error("Erro ao criar orcamento");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
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

    const items = selectedFichas.map((ficha) => {
      const custoTotal = parseFloat(ficha.custoTotal || 0);
      const valorUnitario = custoTotal / markupNum;
      return {
        referencia: ficha.referencia,
        descricao: ficha.tipo,
        custo: custoTotal,
        markup: markupNum,
        quantidade: 1,
        valorUnitario: valorUnitario,
      };
    });

    createMutation.mutate({
      nomeCliente,
      marca,
      numeroOrcamento: `ORQ-${Date.now()}`,
      itens,
    });
  };

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
              {fichas
                .filter((f) => fichasIds.includes(f.id))
                .map((ficha) => (
                  <div key={ficha.id} className="text-sm bg-background p-2 rounded">
                    <div className="font-medium">{ficha.referencia}</div>
                    <div className="text-muted-foreground">{ficha.tipo}</div>
                    <div className="text-primary font-semibold">
                      R$ {parseFloat(ficha.custoTotal || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
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
                <div className="text-sm text-muted-foreground pt-2">
                  <div>÷ 0.40 = 2.5x</div>
                  <div>÷ 0.50 = 2x</div>
                  <div>÷ 0.60 = 1.67x</div>
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
                R${" "}
                {fichas
                  .filter((f) => fichasIds.includes(f.id))
                  .reduce((sum, f) => sum + parseFloat(f.custoTotal || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botoes */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Criando...
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

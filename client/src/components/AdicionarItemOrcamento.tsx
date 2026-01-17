import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AdicionarItemOrcamentoProps {
  orcamentoId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AdicionarItemOrcamento({ 
  orcamentoId, 
  onSuccess, 
  onCancel 
}: AdicionarItemOrcamentoProps) {
  const [selectedFicha, setSelectedFicha] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState("1");
  const [markup, setMarkup] = useState("0.50");

  const { data: fichas = [] } = trpc.fichasCusto.list.useQuery();
  const createItem = trpc.orcamentos.createItem.useMutation({
    onSuccess: () => {
      toast.success("Item adicionado ao orçamento");
      setSelectedFicha(null);
      setQuantidade("1");
      setMarkup("0.50");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar item: " + error.message);
    },
  });

  const selectedFichaData = fichas.find(f => f.id === selectedFicha);

  // Calcular custos
  const custoTotal = selectedFichaData ? (
    Number(selectedFichaData.modelagem || 0) +
    Number(selectedFichaData.piloto || 0) +
    Number(selectedFichaData.corte || 0) +
    Number(selectedFichaData.beneficiamento || 0) +
    Number(selectedFichaData.costura || 0) +
    Number(selectedFichaData.lavanderia || 0) +
    Number(selectedFichaData.acabamento || 0) +
    Number(selectedFichaData.passadoria || 0) +
    Number(selectedFichaData.tecido || 0) +
    Number(selectedFichaData.aviamento || 0)
  ) : 0;

  const markupDivisor = Number(markup);
  const valorUnitario = markupDivisor > 0 ? custoTotal / markupDivisor : 0;
  const valorTotal = valorUnitario * Number(quantidade);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFicha || !quantidade) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!selectedFichaData) {
      toast.error("Ficha não encontrada");
      return;
    }

    createItem.mutate({
      orcamentoId,
      fichaId: selectedFicha,
      referencia: selectedFichaData.referencia,
      descricao: selectedFichaData.familia,
      quantidade: Number(quantidade),
      custo: custoTotal,
      valorUnitario,
      valorTotal,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ficha">Ficha de Custo *</Label>
          <Select value={selectedFicha?.toString() || ""} onValueChange={(v) => setSelectedFicha(Number(v))}>
            <SelectTrigger id="ficha">
              <SelectValue placeholder="Escolha uma ficha..." />
            </SelectTrigger>
            <SelectContent>
              {fichas.map((ficha) => (
                <SelectItem key={ficha.id} value={ficha.id.toString()}>
                  {ficha.referencia} - {ficha.familia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantidade">Quantidade *</Label>
          <Input
            id="quantidade"
            type="number"
            min="1"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="markup">Markup Divisor *</Label>
        <Select value={markup} onValueChange={setMarkup}>
          <SelectTrigger id="markup">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.40">÷ 0,40 (Maior Margem)</SelectItem>
            <SelectItem value="0.50">÷ 0,50 (Médio)</SelectItem>
            <SelectItem value="0.60">÷ 0,60 (Menor Margem)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedFichaData && (
        <div className="bg-background p-3 rounded-lg space-y-2 text-sm">
          <p><strong>Custo Total:</strong> R$ {custoTotal.toFixed(2)}</p>
          <p><strong>Valor Unitário:</strong> R$ {valorUnitario.toFixed(2)}</p>
          <p><strong>Valor Total:</strong> R$ {valorTotal.toFixed(2)}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={createItem.isPending} className="flex-1 gap-2">
          {createItem.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Adicionar Item
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

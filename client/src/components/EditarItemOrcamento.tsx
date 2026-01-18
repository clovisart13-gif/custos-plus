import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EditarItemOrcamentoProps {
  item: {
    id: number;
    referencia: string;
    descricao: string;
    quantidade: number;
    valorUnitario: string;
    valorTotal: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditarItemOrcamento({
  item,
  onSuccess,
  onCancel,
}: EditarItemOrcamentoProps) {
  const [quantidade, setQuantidade] = useState(item.quantidade.toString());
  const [valorUnitario, setValorUnitario] = useState(item.valorUnitario);
  const [isLoading, setIsLoading] = useState(false);

  const utils = trpc.useUtils();
  const updateItemMutation = trpc.orcamentos.updateItem.useMutation();

  const valorTotal = (
    parseFloat(quantidade) * parseFloat(valorUnitario)
  ).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantidade || !valorUnitario) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (parseFloat(quantidade) <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }

    if (parseFloat(valorUnitario) < 0) {
      toast.error("Valor unitário não pode ser negativo");
      return;
    }

    setIsLoading(true);
    try {
      await updateItemMutation.mutateAsync({
        itemId: item.id,
        quantidade: parseFloat(quantidade),
        valorUnitario: parseFloat(valorUnitario),
      });

      toast.success("Item atualizado com sucesso!");
      utils.orcamentos.getItens.invalidate();
      onSuccess();
    } catch (error) {
      toast.error("Erro ao atualizar item");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Referência</label>
        <Input value={item.referencia} disabled className="mt-1" />
      </div>

      <div>
        <label className="text-sm font-medium">Descrição</label>
        <Input value={item.descricao} disabled className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Quantidade</label>
          <Input
            type="number"
            min="1"
            step="1"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Valor Unitário (R$)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={valorUnitario}
            onChange={(e) => setValorUnitario(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="p-3 bg-muted rounded">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Total:</span>
          <span className="font-semibold">R$ {parseFloat(valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

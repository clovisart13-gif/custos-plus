import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AdicionarItemManualProps {
  orcamentoId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdicionarItemManual({
  orcamentoId,
  onSuccess,
  onCancel,
}: AdicionarItemManualProps) {
  const [descricao, setDescricao] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  const createItemMutation = trpc.orcamentos.createItem.useMutation();

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao || !valorUnitario || !quantidade) {
      toast.error("Preencha todos os campos!");
      return;
    }

    const valor = parseFloat(valorUnitario);
    const qtd = parseFloat(quantidade);

    if (isNaN(valor) || valor <= 0 || isNaN(qtd) || qtd <= 0) {
      toast.error("Valores inválidos!");
      return;
    }

    setIsLoading(true);

    try {
      await createItemMutation.mutateAsync({
        orcamentoId,
        fichaId: 0,
        referencia: descricao.substring(0, 20),
        descricao,
        quantidade: qtd,
        custo: 0,
        valorUnitario: valor,
        valorTotal: valor * qtd,
        markupDivisor: 1,
      });

      toast.success("Item adicionado com sucesso!");
      setDescricao("");
      setValorUnitario("");
      setQuantidade("1");
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddItem} className="space-y-4 p-4 bg-muted rounded-lg">
      <h3 className="font-semibold">Adicionar Item Manualmente</h3>

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

      <div className="grid grid-cols-2 gap-4">
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Adicionando...
            </>
          ) : (
            "Adicionar Item"
          )}
        </Button>
      </div>
    </form>
  );
}

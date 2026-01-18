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
import { useLocation } from "wouter";

interface CriarOrcamentoDaFichaFormProps {
  ficha: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CriarOrcamentoDaFichaForm({
  ficha,
  onSuccess,
  onCancel,
}: CriarOrcamentoDaFichaFormProps) {
  const [, setLocation] = useLocation();
  const [markup, setMarkup] = useState("0.50");
  const [isCreating, setIsCreating] = useState(false);

  const { data: nextNumber } = trpc.orcamentos.generateNextNumber.useQuery();
  const createOrcamento = trpc.orcamentos.create.useMutation();
  const createItem = trpc.orcamentos.createItem.useMutation();

  // Calcular custos
  const custoTotal = (
    Number(ficha.modelagem || 0) +
    Number(ficha.piloto || 0) +
    Number(ficha.corte || 0) +
    Number(ficha.beneficiamento || 0) +
    Number(ficha.costura || 0) +
    Number(ficha.lavanderia || 0) +
    Number(ficha.acabamento || 0) +
    Number(ficha.passadoria || 0) +
    Number(ficha.tecido || 0) +
    Number(ficha.aviamento || 0)
  );

  const markupDivisor = Number(markup);
  const valorUnitario = markupDivisor > 0 ? custoTotal / markupDivisor : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!markup) {
      toast.error("Selecione um markup");
      return;
    }

    if (!nextNumber) {
      toast.error("Erro ao gerar número do orçamento");
      return;
    }

    try {
      setIsCreating(true);

      // 1. Criar orçamento
      const orcamentoResult = await createOrcamento.mutateAsync({
        nomeCliente: ficha.cliente,
        marca: ficha.familia,
        numeroOrcamento: nextNumber,
      });

      const orcamentoId = (orcamentoResult as any).insertId;

      if (!orcamentoId) {
        toast.error("Erro ao criar orçamento");
        return;
      }

      // 2. Adicionar item ao orçamento
      await createItem.mutateAsync({
        orcamentoId,
        fichaId: ficha.id,
        referencia: ficha.referencia,
        descricao: ficha.familia,
        quantidade: 1,
        custo: custoTotal,
        valorUnitario: custoTotal / markupDivisor,
        valorTotal: custoTotal / markupDivisor,
        markupDivisor,
      });

      toast.success("Orçamento criado com sucesso!");
      onSuccess?.();

      // 3. Redirecionar para visualização do orçamento
      setTimeout(() => {
        setLocation(`/orcamentos/${orcamentoId}`);
      }, 500);
    } catch (error: any) {
      toast.error("Erro ao criar orçamento: " + error.message);
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <p>
          <strong>Referência:</strong> {ficha.referencia}
        </p>
        <p>
          <strong>Família:</strong> {ficha.familia}
        </p>
        <p>
          <strong>Cliente:</strong> {ficha.cliente}
        </p>
        <p>
          <strong>Custo Total:</strong> R${" "}
          {custoTotal.toFixed(2)}
        </p>
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

      <div className="bg-primary/5 p-3 rounded-lg space-y-2 text-sm">
        <p>
          <strong>Valor Unitário:</strong> R$ {valorUnitario.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          A quantidade será definida quando você adicionar itens ao orçamento
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isCreating || createOrcamento.isPending}
          className="flex-1 gap-2"
        >
          {(isCreating || createOrcamento.isPending) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Criar Orçamento
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

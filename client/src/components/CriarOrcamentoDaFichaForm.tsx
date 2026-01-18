import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
      toast.error("Selecione um markup divisor");
      return;
    }

    try {
      setIsCreating(true);

      // Criar orçamento
      const orcamentoResult = await createOrcamento.mutateAsync({
        nomeCliente: ficha.cliente || "Cliente",
        marca: ficha.familia || "Marca",
        numeroOrcamento: nextNumber || "ORÇ-26-001",
      });

      const orcamentoId = (orcamentoResult as any)?.id;

      if (!orcamentoId) {
        toast.error("Erro ao criar orçamento");
        setIsCreating(false);
        return;
      }

      // Adicionar item ao orçamento
      await createItem.mutateAsync({
        orcamentoId,
        fichaId: ficha.id,
        referencia: ficha.referencia,
        descricao: ficha.familia,
        quantidade: 1,
        custo: custoTotal,
        markupDivisor: markupDivisor,
        valorUnitario: valorUnitario,
        valorTotal: valorUnitario,
      });

      toast.success("Orçamento criado com sucesso!");
      setIsCreating(false);
      setLocation(`/orcamento/${orcamentoId}`);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      toast.error("Erro ao criar orçamento");
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações da Ficha */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Ficha Selecionada</h3>
        <p className="text-sm text-gray-600">
          <strong>Referência:</strong> {ficha.referencia}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Família:</strong> {ficha.familia}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Custo Total:</strong> R$ {custoTotal.toFixed(2)}
        </p>
      </div>

      {/* Seleção de Markup com Radio Buttons */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Selecione o Markup Divisor</Label>
        
        <div className="space-y-2">
          {['0.40', '0.50', '0.60'].map((value) => (
            <div key={value} className="flex items-center">
              <input
                type="radio"
                id={`markup-${value}`}
                name="markup"
                value={value}
                checked={markup === value}
                onChange={(e) => setMarkup(e.target.value)}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <label
                htmlFor={`markup-${value}`}
                className="ml-3 flex-1 cursor-pointer text-sm text-gray-700 hover:text-gray-900"
              >
                <span className="font-medium">÷ {value}</span>
                <span className="text-gray-500 ml-2">
                  = R$ {(custoTotal / Number(value)).toFixed(2)} por peça
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo de Valores */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-600">
          <strong>Markup Selecionado:</strong> ÷ {markup}
        </p>
        <p className="text-lg font-semibold text-blue-900 mt-2">
          Valor Unitário: R$ {valorUnitario.toFixed(2)}
        </p>
      </div>

      {/* Botões */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isCreating}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isCreating ? "Criando..." : "Criar Orçamento"}
        </Button>
      </div>
    </form>
  );
}

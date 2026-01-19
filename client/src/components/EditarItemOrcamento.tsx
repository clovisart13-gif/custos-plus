import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    markupDivisor?: number;
    custo?: number;
  };
  orcamento?: {
    prazoDias?: number;
    percentualSinal?: number;
    percentualRetirada?: number;
    percentualPrazo?: number;
    observacoes?: string;
    prazoEntregaTexto?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditarItemOrcamento({
  item,
  orcamento,
  onSuccess,
  onCancel,
}: EditarItemOrcamentoProps) {
  const [quantidade, setQuantidade] = useState(item.quantidade.toString());
  const [valorUnitario, setValorUnitario] = useState(item.valorUnitario);
  const [markup, setMarkup] = useState((item.markupDivisor || 0.5).toString());
  const [custo, setCusto] = useState((item.custo || 0).toString());
  const [prazoDias, setPrazoDias] = useState(orcamento?.prazoDias?.toString() || "30");
  const [prazoEntregaTexto, setPrazoEntregaTexto] = useState(orcamento?.prazoEntregaTexto || "30 dias após aprovação do protótipo");
  const [percentualSinal, setPercentualSinal] = useState((orcamento?.percentualSinal || 25).toString());
  const [percentualRetirada, setPercentualRetirada] = useState((orcamento?.percentualRetirada || 25).toString());
  const [percentualPrazo, setPercentualPrazo] = useState((orcamento?.percentualPrazo || 50).toString());
  const [observacoes, setObservacoes] = useState(orcamento?.observacoes || "");
  const [isLoading, setIsLoading] = useState(false);

  const utils = trpc.useUtils();
  const updateItemMutation = trpc.orcamentos.updateItem.useMutation();

  // Recalcular PV quando markup muda: PV = Custo ÷ Markup
  const handleMarkupChange = (novoMarkup: string) => {
    setMarkup(novoMarkup);
    if (parseFloat(novoMarkup) > 0 && parseFloat(custo) > 0) {
      const novoPV = (parseFloat(custo) / parseFloat(novoMarkup)).toFixed(2);
      setValorUnitario(novoPV);
    }
  };

  // Recalcular Markup quando PV muda: Markup = Custo ÷ PV
  const handlePVChange = (novoPV: string) => {
    setValorUnitario(novoPV);
    if (parseFloat(novoPV) > 0 && parseFloat(custo) > 0) {
      const novoMarkup = (parseFloat(custo) / parseFloat(novoPV)).toFixed(4);
      setMarkup(novoMarkup);
    }
  };

  const valorTotal = (
    parseFloat(quantidade) * parseFloat(valorUnitario)
  ).toFixed(2);

  // Mostrar apenas parcelas com % > 0
  const mostrarPrazo = parseFloat(percentualPrazo) > 0;

  // Calcular soma de percentuais
  const somaPercentuais = parseFloat(percentualSinal) + parseFloat(percentualRetirada) + (mostrarPrazo ? parseFloat(percentualPrazo) : 0);
  const percentuaisValidos = Math.abs(somaPercentuais - 100) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantidade || !valorUnitario || !markup) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (!prazoEntregaTexto) {
      toast.error("Preencha o prazo de entrega");
      return;
    }

    if (!percentuaisValidos) {
      toast.error(`Percentuais devem somar 100% (atual: ${somaPercentuais.toFixed(1)}%)`);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        itemId: item.id,
        quantidade: parseFloat(quantidade),
        valorUnitario: parseFloat(valorUnitario),
        markup: parseFloat(markup),
        percentualSinal: parseFloat(percentualSinal),
        percentualRetirada: parseFloat(percentualRetirada),
        percentualPrazo: parseFloat(percentualPrazo),
        prazoDias: parseInt(prazoDias),
        prazoEntregaTexto,
        observacoes,
      };
      console.log("[EditarItemOrcamento] Enviando payload:", payload);
      await updateItemMutation.mutateAsync(payload);
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
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {/* Informações do Item */}
      <div className="space-y-3 pb-3 border-b">
        <div>
          <label className="text-sm font-medium">Referência</label>
          <Input value={item.referencia} disabled className="bg-gray-100" />
        </div>
        <div>
          <label className="text-sm font-medium">Descrição</label>
          <Input value={item.descricao} disabled className="bg-gray-100" />
        </div>
      </div>

      {/* Quantidade e Valores */}
      <div className="space-y-3 pb-3 border-b">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium">Quantidade</label>
            <Input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="Ex: 100"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Valor Unitário (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={valorUnitario}
              onChange={(e) => handlePVChange(e.target.value)}
              placeholder="Ex: 40.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium">Markup Divisor</label>
            <Input
              type="number"
              step="0.01"
              value={markup}
              onChange={(e) => handleMarkupChange(e.target.value)}
              placeholder="Ex: 0.50"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Custo (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              placeholder="Ex: 20.00"
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Total: R$ {valorTotal}</label>
        </div>
      </div>

      {/* Prazo de Entrega */}
      <div className="space-y-3 pb-3 border-b">
        <div>
          <label className="text-sm font-medium">Prazo de Entrega</label>
          <Input
            type="text"
            value={prazoEntregaTexto}
            onChange={(e) => setPrazoEntregaTexto(e.target.value)}
            placeholder="Ex: 30 dias após aprovação do protótipo"
          />
        </div>
      </div>

      {/* Percentuais de Pagamento */}
      <div className="space-y-3 pb-3 border-b">
        <div>
          <label className="text-sm font-medium">Sinal (%)</label>
          <Input
            type="number"
            step="0.01"
            value={percentualSinal}
            onChange={(e) => setPercentualSinal(e.target.value)}
            placeholder="Ex: 50"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Retirada (%)</label>
          <Input
            type="number"
            step="0.01"
            value={percentualRetirada}
            onChange={(e) => setPercentualRetirada(e.target.value)}
            placeholder="Ex: 50"
          />
        </div>

        {mostrarPrazo && (
          <div>
            <label className="text-sm font-medium">Prazo (%)</label>
            <Input
              type="number"
              step="0.01"
              value={percentualPrazo}
              onChange={(e) => setPercentualPrazo(e.target.value)}
              placeholder="Ex: 0"
            />
          </div>
        )}

        <div className={`text-sm font-medium ${percentuaisValidos ? 'text-green-600' : 'text-red-600'}`}>
          Total de percentuais: {somaPercentuais.toFixed(1)}%
        </div>
      </div>

      {/* Observações */}
      <div>
        <label className="text-sm font-medium">Observações</label>
        <Textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Adicione observações sobre este item..."
          className="h-20"
        />
      </div>

      {/* Botões */}
      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !percentuaisValidos}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

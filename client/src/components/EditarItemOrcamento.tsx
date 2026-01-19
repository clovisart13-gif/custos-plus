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
  const pvRecalculado = parseFloat(custo) > 0 && parseFloat(markup) > 0 
    ? (parseFloat(custo) / parseFloat(markup)).toFixed(2)
    : valorUnitario;

  const valorTotal = (
    parseFloat(quantidade) * parseFloat(valorUnitario)
  ).toFixed(2);

  // Mostrar apenas parcelas com % > 0
  const mostrarPrazo = parseFloat(percentualPrazo) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantidade || !valorUnitario || !markup) {
      toast.error("Preencha todos os campos obrigatórios");
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

    if (parseFloat(markup) <= 0) {
      toast.error("Markup deve ser maior que zero");
      return;
    }

    // Validar que percentuais somem 100%
    const somaPercentuais = parseFloat(percentualSinal) + parseFloat(percentualRetirada) + parseFloat(percentualPrazo);
    if (Math.abs(somaPercentuais - 100) > 0.01) {
      toast.error(`Percentuais devem somar 100% (atual: ${somaPercentuais.toFixed(1)}%)`);
      return;
    }

    if (!prazoEntregaTexto.trim()) {
      toast.error("Preencha o prazo de entrega");
      return;
    }

    setIsLoading(true);
    try {
      await updateItemMutation.mutateAsync({
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
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {/* Informações do Item */}
      <div className="space-y-3 pb-3 border-b">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Markup Divisor</label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Custo (R$)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
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
      </div>

      {/* Prazos e Pagamento */}
      <div className="space-y-3 pb-3 border-b">
        <h3 className="font-semibold text-sm">Prazos e Pagamento</h3>
        
        <div>
          <label className="text-sm font-medium">Prazo de Entrega</label>
          <Input
            type="text"
            placeholder="Ex: 30 dias após aprovação do protótipo"
            value={prazoEntregaTexto}
            onChange={(e) => setPrazoEntregaTexto(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-sm font-medium">Sinal (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={percentualSinal}
              onChange={(e) => setPercentualSinal(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Retirada (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={percentualRetirada}
              onChange={(e) => setPercentualRetirada(e.target.value)}
              className="mt-1"
            />
          </div>

          {mostrarPrazo && (
            <div>
              <label className="text-sm font-medium">Prazo (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="1"
                value={percentualPrazo}
                onChange={(e) => setPercentualPrazo(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
          {!mostrarPrazo && (
            <Input
              type="hidden"
              value={percentualPrazo}
            />
          )}
        </div>
        
        {/* Indicador de soma de percentuais */}
        <div className="mt-2 p-2 rounded text-sm">
          <div className="flex justify-between items-center">
            <span>Total de percentuais:</span>
            <span className={`font-semibold ${Math.abs(parseFloat(percentualSinal) + parseFloat(percentualRetirada) + parseFloat(percentualPrazo) - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              {(parseFloat(percentualSinal) + parseFloat(percentualRetirada) + parseFloat(percentualPrazo)).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Observações</h3>
        <Textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Adicione observações sobre este item..."
          className="mt-1 min-h-20"
        />
      </div>

      {/* Botões */}
      <div className="flex gap-2 justify-end pt-3 border-t">
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

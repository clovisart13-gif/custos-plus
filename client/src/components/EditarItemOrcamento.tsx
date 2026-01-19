import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";

interface Parcela {
  id: string;
  nome: string;
  percentual: number;
}

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
  const [prazoEntregaTexto, setPrazoEntregaTexto] = useState(orcamento?.prazoEntregaTexto || "");
  const [parcelas, setParcelas] = useState<Parcela[]>([
    { id: "1", nome: "Sinal", percentual: orcamento?.percentualSinal || 25 },
    { id: "2", nome: "À Vista", percentual: orcamento?.percentualRetirada || 25 },
    { id: "3", nome: "30 dias", percentual: orcamento?.percentualPrazo || 50 },
  ]);
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

  // Calcular soma de percentuais
  const somaPercentuais = parcelas.reduce((sum, p) => sum + (Number(p.percentual) || 0), 0);
  const percentuaisValidos = Math.abs(somaPercentuais - 100) < 0.01;

  // Adicionar nova parcela
  const handleAdicionarParcela = () => {
    const novaId = (Math.max(...parcelas.map(p => parseInt(p.id)), 0) + 1).toString();
    setParcelas([...parcelas, { id: novaId, nome: "", percentual: 0 }]);
  };

  // Remover parcela
  const handleRemoverParcela = (id: string) => {
    if (parcelas.length > 1) {
      setParcelas(parcelas.filter(p => p.id !== id));
    } else {
      toast.error("Deve haver pelo menos uma parcela");
    }
  };

  // Atualizar parcela
  const handleAtualizarParcela = (id: string, campo: "nome" | "percentual", valor: string | number) => {
    setParcelas(parcelas.map(p => 
      p.id === id 
        ? { ...p, [campo]: campo === "percentual" ? parseFloat(valor.toString()) : valor }
        : p
    ));
  };

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

    // Validar que todas as parcelas têm nome
    if (parcelas.some(p => !p.nome.trim())) {
      toast.error("Todas as parcelas devem ter um nome");
      return;
    }

    setIsLoading(true);
    try {
      // Mapear percentuais por nome em vez de posição
      const findPercentualByName = (nomesPossiveis: string[]): number => {
        for (const nome of nomesPossiveis) {
          const parcela = parcelas.find(p => p.nome.toLowerCase() === nome.toLowerCase());
          if (parcela) return parseFloat(parcela.percentual.toString());
        }
        return 0;
      };

      // Serializar TODAS as parcelas em JSON
      const parcelasJson = JSON.stringify(parcelas.map(p => ({
        nome: p.nome,
        percentual: parseFloat(p.percentual.toString())
      })));

      const percentualSinal = findPercentualByName(["Sinal", "Entrada", "Adiantamento"]) || parseFloat(parcelas[0]?.percentual) || 0;
      const percentualRetirada = findPercentualByName(["À Vista", "Retirada", "Entrega"]) || parseFloat(parcelas[1]?.percentual) || 0;
      const percentualPrazo = findPercentualByName(["30 dias", "Prazo", "30DD"]) || parseFloat(parcelas[2]?.percentual) || 0;

      const payload = {
        itemId: item.id,
        quantidade: parseFloat(quantidade),
        valorUnitario: parseFloat(valorUnitario),
        markup: parseFloat(markup),
        percentualSinal,
        percentualRetirada,
        percentualPrazo,
        prazoDias: parseInt(prazoDias),
        prazoEntregaTexto,
        observacoes: observacoes ? `${observacoes}\n[PARCELAS]${parcelasJson}` : `[PARCELAS]${parcelasJson}`,
      };
      console.log("[EditarItemOrcamento] Enviando payload:", payload);
      console.log("[EditarItemOrcamento] Parcelas completas:", parcelas);
      console.log("[EditarItemOrcamento] Parcelas JSON:", parcelasJson);
      await updateItemMutation.mutateAsync(payload);
      toast.success("Item atualizado com sucesso!");
      utils.orcamentos.getItens.invalidate();
      utils.orcamentos.getById.invalidate();
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

      {/* Percentuais de Pagamento Dinâmicos */}
      <div className="space-y-3 pb-3 border-b">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Formas de Pagamento</label>
          <div className={`text-sm font-medium ${percentuaisValidos ? 'text-green-600' : 'text-red-600'}`}>
            {somaPercentuais.toFixed(1)}%
          </div>
        </div>

        {/* Lista de Parcelas */}
        <div className="space-y-2">
          {parcelas.map((parcela, index) => (
            <div key={parcela.id} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium">Nome</label>
                <Input
                  type="text"
                  value={parcela.nome}
                  onChange={(e) => handleAtualizarParcela(parcela.id, "nome", e.target.value)}
                  placeholder="Ex: Sinal, À Vista, 30DD"
                  className="text-sm"
                />
              </div>
              <div className="w-24">
                <label className="text-xs font-medium">%</label>
                <Input
                  type="number"
                  step="0.01"
                  value={parcela.percentual}
                  onChange={(e) => handleAtualizarParcela(parcela.id, "percentual", e.target.value)}
                  placeholder="0"
                  className="text-sm"
                />
              </div>
              {parcelas.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoverParcela(parcela.id)}
                  className="p-2 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Botão Adicionar Parcela */}
        {!percentuaisValidos && somaPercentuais < 100 && (
          <button
            type="button"
            onClick={handleAdicionarParcela}
            className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-blue-400 rounded hover:bg-blue-50 text-blue-600 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar Parcela
          </button>
        )}
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

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
  const [referencia, setReferencia] = useState(item.referencia);
  const [quantidade, setQuantidade] = useState(item.quantidade.toString());
  const [valorUnitario, setValorUnitario] = useState(item.valorUnitario);
  const [markup, setMarkup] = useState((item.markupDivisor || 0.5).toString());
  const [custo, setCusto] = useState((item.custo || 0).toString());
  const [descricao, setDescricao] = useState(item.descricao);
  const [parcelas, setParcelas] = useState<Parcela[]>([
    { id: '1', nome: 'Sinal', percentual: orcamento?.percentualSinal || 25 },
    { id: '2', nome: 'Retirada', percentual: orcamento?.percentualRetirada || 25 },
    { id: '3', nome: '30 dias', percentual: orcamento?.percentualPrazo || 50 },
  ]);
  // Prazos e percentuais foram movidos para nível do orçamento
  // Não editar esses campos aqui
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
    setParcelas(parcelas.map((p: any) => 
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



    setIsLoading(true);
    try {
      const payload = {
        itemId: item.id,
        referencia: referencia,
        quantidade: parseFloat(quantidade),
        valorUnitario: parseFloat(valorUnitario),
        markup: parseFloat(markup),
        descricao: descricao,
      };
      console.log("[EditarItemOrcamento] Enviando payload:", payload);
      await updateItemMutation.mutateAsync(payload);
      toast.success("Item atualizado com sucesso!");
      utils.orcamentos.getItens.invalidate();
      utils.orcamentos.list.invalidate();  // Invalidar lista de orçamentos também
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
          <label className="text-sm font-medium">Código de Referência *</label>
          <Input 
            value={referencia} 
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Ex: 26VES-002"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Descrição</label>
          <Input 
            value={descricao} 
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Camiseta Verão 2024"
          />
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

      {/* Nota: Prazo de Entrega, Percentuais de Pagamento e Observações foram movidos para o nível do orçamento */}

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

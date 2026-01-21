import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NovoOrcamentoManualProps {
  onSuccess?: () => void;
}

export default function NovoOrcamentoManual({ onSuccess }: NovoOrcamentoManualProps) {
  const [formData, setFormData] = useState({
    nomeCliente: "",
    marca: "",
    observacoes: "",
    descontoTipo: "percentual" as "percentual" | "valor",
    descontoValor: 0,
  });

  const { data: nextNumber } = trpc.orcamentos.generateNextNumber.useQuery();
  const createOrcamento = trpc.orcamentos.create.useMutation({
    onSuccess: () => {
      toast.success("Orçamento criado com sucesso");
      setFormData({ 
        nomeCliente: "", 
        marca: "",
        observacoes: "",
        descontoTipo: "percentual",
        descontoValor: 0,
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao criar orçamento: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomeCliente) {
      toast.error("Preencha nome do cliente!");
      return;
    }

    createOrcamento.mutate({
      nomeCliente: formData.nomeCliente,
      marca: formData.marca,
      observacoes: formData.observacoes || undefined,
      descontoTipo: formData.descontoValor > 0 ? formData.descontoTipo : undefined,
      descontoValor: formData.descontoValor > 0 ? formData.descontoValor : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
        <Input
          id="nomeCliente"
          placeholder="Ex: Empresa XYZ"
          value={formData.nomeCliente}
          onChange={(e) => setFormData({ ...formData, nomeCliente: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="marca">Marca/Coleção (Opcional)</Label>
        <Input
          id="marca"
          placeholder="Ex: Coleção Verão 2024"
          value={formData.marca}
          onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
        />
      </div>

      <div>
        <Label>Número do Orçamento</Label>
        <Input
          disabled
          value={nextNumber || "Carregando..."}
        />
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <textarea
          id="observacoes"
          className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          placeholder="Notas adicionais sobre o orçamento..."
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="descontoTipo">Tipo de Desconto</Label>
          <select
            id="descontoTipo"
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background h-10"
            value={formData.descontoTipo}
            onChange={(e) => setFormData({ ...formData, descontoTipo: e.target.value as "percentual" | "valor" })}
          >
            <option value="percentual">Percentual (%)</option>
            <option value="valor">Valor (R$)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="descontoValor">Valor do Desconto</Label>
          <Input
            id="descontoValor"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.descontoValor}
            onChange={(e) => setFormData({ ...formData, descontoValor: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <Button type="submit" disabled={createOrcamento.isPending} className="w-full gap-2">
        {createOrcamento.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Criar Orçamento
      </Button>
    </form>
  );
}

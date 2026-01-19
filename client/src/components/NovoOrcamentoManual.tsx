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
  });

  const { data: nextNumber } = trpc.orcamentos.generateNextNumber.useQuery();
  const createOrcamento = trpc.orcamentos.create.useMutation({
    onSuccess: () => {
      toast.success("Orçamento criado com sucesso");
      setFormData({ nomeCliente: "", marca: "" });
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

      <Button type="submit" disabled={createOrcamento.isPending} className="w-full gap-2">
        {createOrcamento.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Criar Orçamento
      </Button>
    </form>
  );
}

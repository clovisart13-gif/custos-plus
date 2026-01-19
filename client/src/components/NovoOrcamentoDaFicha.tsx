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

interface NovoOrcamentoDaFichaProps {
  onSuccess?: () => void;
}

export default function NovoOrcamentoDaFicha({ onSuccess }: NovoOrcamentoDaFichaProps) {
  const [selectedFicha, setSelectedFicha] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState("1");

  const { data: fichas = [] } = trpc.fichasCusto.list.useQuery();
  const { data: nextNumber } = trpc.orcamentos.generateNextNumber.useQuery();
  const createOrcamento = trpc.orcamentos.create.useMutation({
    onSuccess: () => {
      toast.success("Orçamento criado com sucesso");
      setSelectedFicha(null);
      setQuantidade("1");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error("Erro ao criar orçamento: " + error.message);
    },
  });

  const selectedFichaData = fichas.find(f => f.id === selectedFicha);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFicha || !quantidade) {
      toast.error("Selecione uma ficha e informe a quantidade");
      return;
    }

    if (!selectedFichaData) {
      toast.error("Ficha não encontrada");
      return;
    }

    createOrcamento.mutate({
      nomeCliente: selectedFichaData.cliente,
      marca: selectedFichaData.familia,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="ficha">Selecione a Ficha de Custo *</Label>
        <Select value={selectedFicha?.toString() || ""} onValueChange={(v) => setSelectedFicha(Number(v))}>
          <SelectTrigger id="ficha">
            <SelectValue placeholder="Escolha uma ficha..." />
          </SelectTrigger>
          <SelectContent>
            {fichas.map((ficha) => (
              <SelectItem key={ficha.id} value={ficha.id.toString()}>
                {ficha.referencia} - {ficha.familia} ({ficha.cliente})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedFichaData && (
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p><strong>Referência:</strong> {selectedFichaData.referencia}</p>
          <p><strong>Família:</strong> {selectedFichaData.familia}</p>
          <p><strong>Cliente:</strong> {selectedFichaData.cliente}</p>
          <p><strong>Tipo:</strong> {selectedFichaData.tipo}</p>
        </div>
      )}

      <div>
        <Label htmlFor="quantidade">Quantidade *</Label>
        <Input
          id="quantidade"
          type="number"
          min="1"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          required
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

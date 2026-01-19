import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface SelecionarFichasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SelecionarFichasModal({
  isOpen,
  onClose,
}: SelecionarFichasModalProps) {
  const [, navigate] = useLocation();
  const [nomeCliente, setNomeCliente] = useState("");
  const [marca, setMarca] = useState("");
  const [selectedFichas, setSelectedFichas] = useState<number[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const { data: fichas = [] } = trpc.fichasCusto.list.useQuery();
  const createMutation = trpc.orcamentos.create.useMutation();
  const createItemMutation = trpc.orcamentos.createItem.useMutation();

  const handleSelectFicha = (fichaId: number) => {
    setSelectedFichas((prev) =>
      prev.includes(fichaId)
        ? prev.filter((id) => id !== fichaId)
        : [...prev, fichaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFichas.length === fichas.length) {
      setSelectedFichas([]);
    } else {
      setSelectedFichas(fichas.map((f) => f.id));
    }
  };

  const handleCreateOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeCliente || !marca) {
      toast.error("Preencha nome do cliente e marca!");
      return;
    }

    if (selectedFichas.length === 0) {
      toast.error("Selecione pelo menos uma ficha de custo!");
      return;
    }

    setIsCreating(true);

    try {
      // Criar orçamento
      const orcamento = await createMutation.mutateAsync({
        nomeCliente,
        marca,
        numeroOrcamento: `ORÇ-${Date.now()}`,
      });

      // Adicionar itens selecionados
      const selectedFichasData = fichas.filter((f) => selectedFichas.includes(f.id));

      for (const ficha of selectedFichasData) {
        await createItemMutation.mutateAsync({
          orcamentoId: orcamento.id,
          fichaId: ficha.id,
          referencia: ficha.referencia,
          descricao: ficha.descricao || ficha.referencia,
          quantidade: 1,
          custo: ficha.custo || 0,
          valorUnitario: ficha.custo || 0,
          markup: 0.5,
        });
      }

      toast.success(`Orçamento criado com ${selectedFichasData.length} itens!`);
      onClose();
      navigate(`/orcamentos/${orcamento.id}`);
    } catch (error) {
      toast.error("Erro ao criar orçamento!");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Orçamento a partir de Fichas de Custo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreateOrcamento} className="space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="font-semibold">Dados do Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomeCliente">Nome do Cliente</Label>
                <Input
                  id="nomeCliente"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Ex: Acme Corp"
                  required
                />
              </div>
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Ex: Nike"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seleção de Fichas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Selecione as Fichas de Custo</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedFichas.length === fichas.length
                  ? "Desselecionar Todas"
                  : "Selecionar Todas"}
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
              {fichas.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma ficha de custo disponível</p>
              ) : (
                fichas.map((ficha) => (
                  <div
                    key={ficha.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded"
                  >
                    <Checkbox
                      id={`ficha-${ficha.id}`}
                      checked={selectedFichas.includes(ficha.id)}
                      onCheckedChange={() => handleSelectFicha(ficha.id)}
                    />
                    <label
                      htmlFor={`ficha-${ficha.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{ficha.referencia}</div>
                      <div className="text-sm text-gray-600">{ficha.descricao}</div>
                      <div className="text-sm text-gray-500">
                        Custo: R$ {(ficha.custo || 0).toFixed(2)}
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>

            <p className="text-sm text-gray-600">
              {selectedFichas.length} ficha(s) selecionada(s)
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || selectedFichas.length === 0}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Orçamento"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

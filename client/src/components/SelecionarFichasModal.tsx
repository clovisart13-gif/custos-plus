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
  const [markup, setMarkup] = useState("0.5");
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
      const markupValue = parseFloat(markup || "0");

      for (const ficha of selectedFichasData) {
        const valorUnitario = (ficha.custo || 0) * (1 + markupValue);
        
        await createItemMutation.mutateAsync({
          orcamentoId: orcamento.id,
          fichaId: ficha.id,
          referencia: ficha.referencia,
          descricao: ficha.descricao || ficha.referencia,
          quantidade: 1,
          custo: ficha.custo || 0,
          valorUnitario: valorUnitario,
          markup: markupValue,
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

  const markupValue = parseFloat(markup || "0");

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

          {/* Markup */}
          <div className="space-y-4">
            <h3 className="font-semibold">Configuração de Preço</h3>
            <div>
              <Label htmlFor="markup">Markup (ex: 0.5 = 50%)</Label>
              <Input
                id="markup"
                type="number"
                step="0.01"
                min="0"
                value={markup}
                onChange={(e) => setMarkup(e.target.value)}
                placeholder="0.5"
              />
              <p className="text-sm text-gray-500 mt-1">
                Preço de Venda = Custo × (1 + Markup)
              </p>
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
                fichas.map((ficha) => {
                  const pv = (ficha.custo || 0) * (1 + markupValue);
                  const lucro = pv - (ficha.custo || 0);
                  
                  return (
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
                        <div className="grid grid-cols-3 gap-4 text-sm mt-1">
                          <div>
                            <span className="text-gray-500">Custo:</span>
                            <div className="font-medium">R$ {(ficha.custo || 0).toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">PV:</span>
                            <div className="font-medium text-green-600">R$ {pv.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Lucro:</span>
                            <div className="font-medium text-blue-600">R$ {lucro.toFixed(2)}</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })
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

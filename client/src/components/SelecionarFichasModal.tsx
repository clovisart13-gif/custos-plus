import { useState, useMemo } from "react";
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
  const [descricao, setDescricao] = useState("");
  const [selectedFichas, setSelectedFichas] = useState<number[]>([]);
  const [markup, setMarkup] = useState("0.5");
  const [isCreating, setIsCreating] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState<string>("");

  const { data: fichas = [] } = trpc.fichasCusto.list.useQuery();
  const createMutation = trpc.orcamentos.create.useMutation();
  const createItemMutation = trpc.orcamentos.createItem.useMutation();

  // Extrair clientes únicos das fichas
  const clientesUnicos = useMemo(() => {
    const clientes = new Set<string>();
    fichas.forEach((f) => {
      if (f.cliente) clientes.add(f.cliente);
    });
    return Array.from(clientes).sort();
  }, [fichas]);

  // Filtrar fichas por cliente selecionado
  const fichasFiltradas = useMemo(() => {
    if (!filtroCliente || filtroCliente === "__all__") return fichas;
    return fichas.filter((f) => f.cliente === filtroCliente);
  }, [fichas, filtroCliente]);

  // Pré-preencher cliente quando filtro muda
  const handleFiltroClienteChange = (cliente: string) => {
    setFiltroCliente(cliente);
    if (cliente && cliente !== "__all__") {
      setNomeCliente(cliente);
    }
  };

  const handleSelectFicha = (fichaId: number) => {
    setSelectedFichas((prev) =>
      prev.includes(fichaId)
        ? prev.filter((id) => id !== fichaId)
        : [...prev, fichaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFichas.length === fichasFiltradas.length && fichasFiltradas.length > 0) {
      setSelectedFichas([]);
    } else {
      setSelectedFichas(fichasFiltradas.map((f) => f.id));
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
      const fichasCompletas = fichas.filter((f) => selectedFichas.includes(f.id));
      const markupValue = parseFloat(markup || "0");

      for (const ficha of fichasCompletas) {
        const valorUnitario = (ficha.custo || 0) * (1 + markupValue);
        
        await createItemMutation.mutateAsync({
          orcamentoId: orcamento.id,
          fichaId: ficha.id,
          referencia: ficha.referencia,
          descricao: ficha.referencia,
          quantidade: 1,
          custo: ficha.custo || 0,
          valorUnitario: valorUnitario,
          markup: markupValue,
        });
      }

      toast.success(`Orçamento criado com ${fichasCompletas.length} itens!`);
      onClose();
      navigate(`/orcamento/${orcamento.id}`);
    } catch (error) {
      toast.error("Erro ao criar orçamento!");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
            <h3 className="font-semibold text-sm">Dados do Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomeCliente">Nome do Cliente</Label>
                <Input
                  id="nomeCliente"
                  placeholder="Ex: Acme Corp"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  placeholder="Ex: Nike"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Descrição do Orçamento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Descrição do Orçamento</h3>
            <div>
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Input
                id="descricao"
                placeholder="Ex: Coleção Verão 2026"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          </div>

          {/* Configuração de Preço */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Configuração de Preço</h3>
            <div>
              <Label htmlFor="markup">Markup (ex: 0.5 = 50%)</Label>
              <Input
                id="markup"
                type="number"
                placeholder="0.5"
                step="0.1"
                value={markup}
                onChange={(e) => setMarkup(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Preço de Venda = Custo × (1 + Markup)
              </p>
            </div>
          </div>

          {/* Seleção de Fichas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Selecione as Fichas de Custo</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedFichas.length === fichasFiltradas.length
                  ? "Desselecionar Todas"
                  : "Selecionar Todas"}
              </Button>
            </div>

            {/* Filtro por Cliente */}
            {clientesUnicos.length > 0 && (
              <div>
                <Label htmlFor="filtroCliente">Filtrar por Cliente</Label>
                <select
                  id="filtroCliente"
                  value={filtroCliente}
                  onChange={(e) => handleFiltroClienteChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                >
                  <option value="__all__">Todos os clientes</option>
                  {clientesUnicos.map((cliente) => (
                    <option key={cliente} value={cliente}>
                      {cliente}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {fichasFiltradas.length} ficha(s) encontrada(s)
                </p>
              </div>
            )}

            {/* Lista de Fichas */}
            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
              {fichasFiltradas.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma ficha encontrada</p>
              ) : (
                fichasFiltradas.map((ficha, index) => {
                  const markupValue = parseFloat(markup || "0");
                  const pv = (ficha.custo || 0) * (1 + markupValue);
                  const lucro = pv - (ficha.custo || 0);

                  return (
                    <div
                      key={ficha.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        id={`ficha-${ficha.id}`}
                        checked={selectedFichas.includes(ficha.id)}
                        onCheckedChange={() => handleSelectFicha(ficha.id)}
                      />
                      <label
                        htmlFor={`ficha-${ficha.id}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        <div className="font-semibold">{ficha.referencia}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Custo: <span className="font-semibold">{formatCurrency(ficha.custo || 0)}</span>
                          {" • "}
                          PV: <span className="font-semibold">{formatCurrency(pv)}</span>
                          {" • "}
                          Lucro: <span className="font-semibold text-green-600">{formatCurrency(lucro)}</span>
                        </div>
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || selectedFichas.length === 0}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

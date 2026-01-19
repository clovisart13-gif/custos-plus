import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
          descricao: ficha.descricao || ficha.referencia,
          quantidade: 1,
          valorUnitario,
          markup: markupValue,
          custo: ficha.custo || 0,
        });
      }

      toast.success("Orçamento criado com sucesso!");
      setNomeCliente("");
      setMarca("");
      setSelectedFichas([]);
      setMarkup("0.5");
      setFiltroCliente("");
      onClose();
      navigate(`/orcamento/${orcamento.id}`);
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      toast.error("Erro ao criar orçamento");
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

        <form onSubmit={handleCreateOrcamento} className="space-y-4">
          {/* Dados do Cliente */}
          <div className="space-y-2">
            <h3 className="font-semibold">Dados do Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomeCliente">Nome do Cliente</Label>
                <Input
                  id="nomeCliente"
                  placeholder="Ex: Acme Corp"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  placeholder="Ex: Nike"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Configuração de Preço */}
          <div className="space-y-2">
            <h3 className="font-semibold">Configuração de Preço</h3>
            <div>
              <Label htmlFor="markup">Markup (ex: 0.5 = 50%)</Label>
              <Input
                id="markup"
                type="number"
                step="0.01"
                placeholder="0.5"
                value={markup}
                onChange={(e) => setMarkup(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Preço de Venda = Custo × (1 + Markup)
              </p>
            </div>
          </div>

          {/* Seleção de Fichas */}
          <div className="space-y-2">
            <h3 className="font-semibold">Selecione as Fichas de Custo</h3>
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleSelectAll}
              >
                {selectedFichas.length === fichasFiltradas.length && fichasFiltradas.length > 0
                  ? "Desselecionar Todas"
                  : "Selecionar Todas"}
              </Button>
              <span className="text-sm text-gray-600">
                {fichasFiltradas.length} ficha(s) encontrada(s)
              </span>
            </div>

            {/* Filtro por Cliente */}
            <div>
              <Label htmlFor="filtroCliente">Filtrar por Cliente</Label>
              <Select value={filtroCliente} onValueChange={setFiltroCliente}>
                <SelectTrigger id="filtroCliente">
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos os clientes</SelectItem>
                  {clientesUnicos.map((cliente) => (
                    <SelectItem key={cliente} value={cliente}>
                      {cliente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Fichas */}
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
              {fichasFiltradas.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma ficha encontrada</p>
              ) : (
                fichasFiltradas.map((ficha) => {
                  const custo = ficha.custo || 0;
                  const markupValue = parseFloat(markup || "0");
                  const pv = custo * (1 + markupValue);
                  const lucro = pv - custo;

                  return (
                    <div
                      key={ficha.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
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
                        {ficha.referencia} {ficha.descricao && `- ${ficha.descricao}`}
                        <br />
                        <span className="text-xs text-gray-500">
                          Custo: {formatCurrency(custo)} • PV: {formatCurrency(pv)} • Lucro:{" "}
                          <span className="text-green-600 font-semibold">
                            {formatCurrency(lucro)}
                          </span>
                        </span>
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || selectedFichas.length === 0}
              className="gap-2"
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Orçamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CriarOrcamentoDaFichaForm from "@/components/CriarOrcamentoDaFichaForm";
import GerarOrcamentoEmLote from "@/components/GerarOrcamentoEmLote";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function FichasCusto() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [filterFamilia, setFilterFamilia] = useState<string>("");
  const [filterCliente, setFilterCliente] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false);
  const [selectedFichaForOrcamento, setSelectedFichaForOrcamento] = useState<any>(null);
  const [selectedFichasForBatch, setSelectedFichasForBatch] = useState<Set<number>>(new Set());
  const [showBatchOrcamentoModal, setShowBatchOrcamentoModal] = useState(false);

  const utils = trpc.useUtils();

  const { data: fichas, isLoading } = trpc.fichasCusto.listFiltered.useQuery(
    {
      search: search || undefined,
      tipo: filterTipo || undefined,
      familia: filterFamilia || undefined,
      cliente: filterCliente || undefined,
    },
    { enabled: isAuthenticated }
  );

  const { data: tipos } = trpc.fichasCusto.getDistinctValues.useQuery(
    { field: "tipo" },
    { enabled: isAuthenticated }
  );

  const { data: familias } = trpc.fichasCusto.getDistinctValues.useQuery(
    { field: "familia" },
    { enabled: isAuthenticated }
  );

  const { data: clientes } = trpc.fichasCusto.getDistinctValues.useQuery(
    { field: "cliente" },
    { enabled: isAuthenticated }
  );

  const deleteMutation = trpc.fichasCusto.delete.useMutation({
    onSuccess: () => {
      utils.fichasCusto.listFiltered.invalidate();
      toast.success("Ficha deletada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao deletar ficha");
    },
  });

  const updateFieldMutation = trpc.fichasCusto.updateField.useMutation({
    onSuccess: () => {
      utils.fichasCusto.listFiltered.invalidate();
      setEditingCell(null);
      toast.success("Campo atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar campo");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta ficha?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleGerarOrcamento = (ficha: any) => {
    setSelectedFichaForOrcamento(ficha);
    setShowOrcamentoModal(true);
  };

  const handleCellEdit = (id: number, field: string, value: string) => {
    const numericFields = [
      "modelagem",
      "piloto",
      "corte",
      "beneficiamento",
      "costura",
      "lavanderia",
      "acabamento",
      "passadoria",
      "tecido",
      "aviamento",
    ];

    const finalValue = numericFields.includes(field) ? parseFloat(value) || 0 : value;
    updateFieldMutation.mutate({ id, field, value: finalValue });
  };

  const calculateTotal = (ficha: any) => {
    return (
      Number(ficha.modelagem) +
      Number(ficha.piloto) +
      Number(ficha.corte) +
      Number(ficha.beneficiamento) +
      Number(ficha.costura) +
      Number(ficha.lavanderia) +
      Number(ficha.acabamento) +
      Number(ficha.passadoria) +
      Number(ficha.tecido) +
      Number(ficha.aviamento)
    );
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Acesso Restrito</h1>
        <p className="text-muted-foreground">Faça login para acessar esta página</p>
        <Button asChild>
          <a href={getLoginUrl()}>Fazer Login</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fichas de Custo</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os custos de produção por referência
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Referência
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar referência..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {tipos?.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterFamilia} onValueChange={setFilterFamilia}>
              <SelectTrigger>
                <SelectValue placeholder="Família" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {familias?.map((familia) => (
                  <SelectItem key={familia} value={familia}>
                    {familia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCliente} onValueChange={setFilterCliente}>
              <SelectTrigger>
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {clientes?.map((cliente) => (
                  <SelectItem key={cliente} value={cliente}>
                    {cliente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botao Gerar Orcamento em Lote */}
        {selectedFichasForBatch.size > 0 && (
          <div className="mb-6 flex gap-4">
            <Button
              onClick={() => setShowBatchOrcamentoModal(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Gerar Orcamento em Lote ({selectedFichasForBatch.size})
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedFichasForBatch(new Set())}
            >
              Limpar Selecao
            </Button>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedFichasForBatch.size === fichas?.length && fichas?.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFichasForBatch(new Set(fichas?.map(f => f.id) || []));
                        } else {
                          setSelectedFichasForBatch(new Set());
                        }
                      }}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </TableHead>
                  <TableHead className="w-[120px]">Referência</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Família</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Modelagem</TableHead>
                  <TableHead className="text-right">Piloto</TableHead>
                  <TableHead className="text-right">Corte</TableHead>
                  <TableHead className="text-right">Benefic.</TableHead>
                  <TableHead className="text-right">Costura</TableHead>
                  <TableHead className="text-right">Lavand.</TableHead>
                  <TableHead className="text-right">Acabam.</TableHead>
                  <TableHead className="text-right">Passad.</TableHead>
                  <TableHead className="text-right">Tecido</TableHead>
                  <TableHead className="text-right">Aviamento</TableHead>
                  <TableHead className="text-right font-bold">TOTAL</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={17} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : fichas && fichas.length > 0 ? (
                  fichas.map((ficha) => (
                    <TableRow key={ficha.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedFichasForBatch.has(ficha.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedFichasForBatch);
                            if (e.target.checked) {
                              newSet.add(ficha.id);
                            } else {
                              newSet.delete(ficha.id);
                            }
                            setSelectedFichasForBatch(newSet);
                          }}
                          className="h-4 w-4 cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{ficha.referencia}</TableCell>
                      <TableCell>{ficha.tipo}</TableCell>
                      <TableCell>{ficha.familia}</TableCell>
                      <TableCell>{ficha.cliente}</TableCell>
                      <EditableCell
                        value={Number(ficha.modelagem)}
                        onSave={(val) => handleCellEdit(ficha.id, "modelagem", val)}
                      />
                      <EditableCell
                        value={Number(ficha.piloto)}
                        onSave={(val) => handleCellEdit(ficha.id, "piloto", val)}
                      />
                      <EditableCell
                        value={Number(ficha.corte)}
                        onSave={(val) => handleCellEdit(ficha.id, "corte", val)}
                      />
                      <EditableCell
                        value={Number(ficha.beneficiamento)}
                        onSave={(val) => handleCellEdit(ficha.id, "beneficiamento", val)}
                      />
                      <EditableCell
                        value={Number(ficha.costura)}
                        onSave={(val) => handleCellEdit(ficha.id, "costura", val)}
                      />
                      <EditableCell
                        value={Number(ficha.lavanderia)}
                        onSave={(val) => handleCellEdit(ficha.id, "lavanderia", val)}
                      />
                      <EditableCell
                        value={Number(ficha.acabamento)}
                        onSave={(val) => handleCellEdit(ficha.id, "acabamento", val)}
                      />
                      <EditableCell
                        value={Number(ficha.passadoria)}
                        onSave={(val) => handleCellEdit(ficha.id, "passadoria", val)}
                      />
                      <EditableCell
                        value={Number(ficha.tecido)}
                        onSave={(val) => handleCellEdit(ficha.id, "tecido", val)}
                      />
                      <EditableCell
                        value={Number(ficha.aviamento)}
                        onSave={(val) => handleCellEdit(ficha.id, "aviamento", val)}
                      />
                      <TableCell className="text-right font-bold">
                        R$ {calculateTotal(ficha).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLocation(`/ficha/${ficha.id}`)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGerarOrcamento(ficha)}
                            className="text-xs"
                            title="Gerar Orçamento"
                          >
                            Orçamento
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ficha.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={17} className="text-center py-8 text-muted-foreground">
                      Nenhuma ficha de custo encontrada. Clique em "Nova Referência" para começar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <NovaFichaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Modal para gerar orcamento em lote */}
      <GerarOrcamentoEmLote
        isOpen={showBatchOrcamentoModal}
        onClose={() => setShowBatchOrcamentoModal(false)}
        fichasIds={Array.from(selectedFichasForBatch)}
        fichas={fichas || []}
      />

      {/* Modal para gerar orcamento */}
      <Dialog open={showOrcamentoModal} onOpenChange={setShowOrcamentoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Orçamento</DialogTitle>
            <DialogDescription>
              Escolha o markup e a quantidade para esta ficha de custo
            </DialogDescription>
          </DialogHeader>
          {selectedFichaForOrcamento && (
            <CriarOrcamentoDaFichaForm
              ficha={selectedFichaForOrcamento}
              onSuccess={() => {
                setShowOrcamentoModal(false);
                setSelectedFichaForOrcamento(null);
              }}
              onCancel={() => setShowOrcamentoModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de célula editável
function EditableCell({ value, onSave }: { value: number; onSave: (value: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <TableCell className="text-right">
        <Input
          type="number"
          step="0.01"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
          className="w-24 text-right"
          autoFocus
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      className="text-right cursor-pointer hover:bg-accent"
      onClick={() => setIsEditing(true)}
    >
      R$ {value.toFixed(2)}
    </TableCell>
  );
}

// Modal de Nova Ficha
function NovaFichaModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    referencia: "",
    tipo: "",
    familia: "",
    cliente: "",
    fotoUrl: "",
    modelagem: 0,
    piloto: 0,
    corte: 0,
    beneficiamento: 0,
    costura: 0,
    lavanderia: 0,
    acabamento: 0,
    passadoria: 0,
    tecido: 0,
    aviamento: 0,
    observacoes: "",
  });

  const utils = trpc.useUtils();
  
  // Gerar código automaticamente quando família é preenchida
  const handleFamiliaChange = async (familia: string) => {
    setFormData({ ...formData, familia });
    
    if (familia.length >= 3) {
      try {
        const codigo = await utils.client.fichasCusto.generateNextCode.query({ familia });
        setFormData(prev => ({ ...prev, referencia: codigo }));
      } catch (error) {
        console.error("Erro ao gerar código:", error);
      }
    }
  };

  const createMutation = trpc.fichasCusto.create.useMutation({
    onSuccess: () => {
      utils.fichasCusto.listFiltered.invalidate();
      toast.success("Ficha criada com sucesso!");
      onClose();
      setFormData({
        referencia: "",
        tipo: "",
        familia: "",
        cliente: "",
        fotoUrl: "",
        modelagem: 0,
        piloto: 0,
        corte: 0,
        beneficiamento: 0,
        costura: 0,
        lavanderia: 0,
        acabamento: 0,
        passadoria: 0,
        tecido: 0,
        aviamento: 0,
        observacoes: "",
      });
    },
    onError: () => {
      toast.error("Erro ao criar ficha");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const calculateTotal = () => {
    return (
      formData.modelagem +
      formData.piloto +
      formData.corte +
      formData.beneficiamento +
      formData.costura +
      formData.lavanderia +
      formData.acabamento +
      formData.passadoria +
      formData.tecido +
      formData.aviamento
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Ficha de Custo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referencia">Referência *</Label>
                <Input
                  id="referencia"
                  value={formData.referencia}
                  onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Input
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ex: Malha, Plano"
                  required
                />
              </div>
              <div>
                <Label htmlFor="familia">Família *</Label>
                <Input
                  id="familia"
                  value={formData.familia}
                  onChange={(e) => handleFamiliaChange(e.target.value)}
                  placeholder="Ex: Camiseta, Bermuda"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fotoUrl">URL da Foto do Produto</Label>
              <Input
                id="fotoUrl"
                value={formData.fotoUrl}
                onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                placeholder="Cole a URL da imagem aqui"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dica: Faça upload da imagem em um serviço como Imgur ou Google Drive e cole o link aqui
              </p>
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Custos de Mão-de-Obra */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Custos de Mão-de-Obra</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="modelagem">Modelagem</Label>
                <Input
                  id="modelagem"
                  type="number"
                  step="0.01"
                  value={formData.modelagem}
                  onChange={(e) => setFormData({ ...formData, modelagem: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="piloto">Piloto</Label>
                <Input
                  id="piloto"
                  type="number"
                  step="0.01"
                  value={formData.piloto}
                  onChange={(e) => setFormData({ ...formData, piloto: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="corte">Corte</Label>
                <Input
                  id="corte"
                  type="number"
                  step="0.01"
                  value={formData.corte}
                  onChange={(e) => setFormData({ ...formData, corte: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="beneficiamento">Beneficiamento</Label>
                <Input
                  id="beneficiamento"
                  type="number"
                  step="0.01"
                  value={formData.beneficiamento}
                  onChange={(e) => setFormData({ ...formData, beneficiamento: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="costura">Costura</Label>
                <Input
                  id="costura"
                  type="number"
                  step="0.01"
                  value={formData.costura}
                  onChange={(e) => setFormData({ ...formData, costura: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="lavanderia">Lavanderia</Label>
                <Input
                  id="lavanderia"
                  type="number"
                  step="0.01"
                  value={formData.lavanderia}
                  onChange={(e) => setFormData({ ...formData, lavanderia: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="acabamento">Acabamento</Label>
                <Input
                  id="acabamento"
                  type="number"
                  step="0.01"
                  value={formData.acabamento}
                  onChange={(e) => setFormData({ ...formData, acabamento: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="passadoria">Passadoria</Label>
                <Input
                  id="passadoria"
                  type="number"
                  step="0.01"
                  value={formData.passadoria}
                  onChange={(e) => setFormData({ ...formData, passadoria: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Custos de Matéria-Prima */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Custos de Matéria-Prima</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tecido">Tecido</Label>
                <Input
                  id="tecido"
                  type="number"
                  step="0.01"
                  value={formData.tecido}
                  onChange={(e) => setFormData({ ...formData, tecido: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="aviamento">Aviamento</Label>
                <Input
                  id="aviamento"
                  type="number"
                  step="0.01"
                  value={formData.aviamento}
                  onChange={(e) => setFormData({ ...formData, aviamento: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Custo Total */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">CUSTO TOTAL</span>
              <span className="text-2xl font-bold text-primary">
                R$ {calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Trash2, Edit2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GerenciarObservacoes() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    categoria: "geral",
  });

  const { data: observacoes = [], refetch } = trpc.observacoesPredefinidas.list.useQuery();
  const createMutation = trpc.observacoesPredefinidas.create.useMutation();
  const updateMutation = trpc.observacoesPredefinidas.update.useMutation();
  const deleteMutation = trpc.observacoesPredefinidas.delete.useMutation();

  const handleSave = async () => {
    if (!formData.titulo || !formData.conteudo) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setFormData({ titulo: "", conteudo: "", categoria: "geral" });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar observação");
    }
  };

  const handleEdit = (obs: any) => {
    setFormData({
      titulo: obs.titulo,
      conteudo: obs.conteudo,
      categoria: obs.categoria,
    });
    setEditingId(obs.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao deletar observação");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ titulo: "", conteudo: "", categoria: "geral" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Observações Pré-definidas</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingId(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Observação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar" : "Criar"} Observação
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  placeholder="Ex: Prazo de entrega"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Conteúdo</label>
                <Textarea
                  value={formData.conteudo}
                  onChange={(e) =>
                    setFormData({ ...formData, conteudo: e.target.value })
                  }
                  placeholder="Ex: Entrega em 30 dias úteis..."
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="geral">Geral</option>
                  <option value="prazo">Prazo</option>
                  <option value="pagamento">Pagamento</option>
                  <option value="condicoes">Condições</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {observacoes.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            Nenhuma observação pré-definida criada ainda.
          </Card>
        ) : (
          observacoes.map((obs) => (
            <Card key={obs.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{obs.titulo}</h3>
                  <p className="text-gray-600 mt-2">{obs.conteudo}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {obs.categoria}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(obs)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(obs.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface EditarObservacoesModalProps {
  open: boolean;
  onClose: () => void;
  orcamentoId: number;
  observacoesAtuais?: string;
}

export function EditarObservacoesModal({
  open,
  onClose,
  orcamentoId,
  observacoesAtuais,
}: EditarObservacoesModalProps) {
  const [observacoes, setObservacoes] = useState<string>(observacoesAtuais || "");
  const { data: observacoesPredefinidas = [] } = trpc.observacoesPredefinidas.list.useQuery();

  const utils = trpc.useUtils();
  const updateMutation = trpc.orcamentos.updateDescontoObservacoes.useMutation({
    onSuccess: () => {
      utils.orcamentos.getById.invalidate({ id: orcamentoId });
      utils.orcamentos.list.invalidate();
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      setObservacoes(observacoesAtuais || "");
    }
  }, [open, observacoesAtuais]);

  const handleSalvar = () => {
    updateMutation.mutate({
      orcamentoId,
      observacoes,
    });
  };

  const handleAdicionarPredefinida = (conteudo: string) => {
    setObservacoes((prev) => (prev ? prev + "\n" + conteudo : conteudo));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Observações</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="observacoes">Observações</Label>
              {observacoesPredefinidas.length > 0 && (
                <Select onValueChange={handleAdicionarPredefinida}>
                  <SelectTrigger className="w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Adicionar predefinida" />
                  </SelectTrigger>
                  <SelectContent>
                    {observacoesPredefinidas.map((obs) => (
                      <SelectItem key={obs.id} value={obs.conteudo}>
                        {obs.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas adicionais sobre o orçamento..."
              rows={6}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

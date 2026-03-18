import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

interface DuplicarFichaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fichaOriginal: any;
}

export default function DuplicarFichaModal({ isOpen, onClose, fichaOriginal }: DuplicarFichaModalProps) {
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

  // Pré-preencher formulário com dados da ficha original
  useEffect(() => {
    if (fichaOriginal && isOpen) {
      setFormData({
        referencia: `${fichaOriginal.referencia}-COPIA`,
        tipo: fichaOriginal.tipo || "",
        familia: fichaOriginal.familia || "",
        cliente: fichaOriginal.cliente || "",
        fotoUrl: fichaOriginal.fotoUrl || "",
        modelagem: Number(fichaOriginal.modelagem) || 0,
        piloto: Number(fichaOriginal.piloto) || 0,
        corte: Number(fichaOriginal.corte) || 0,
        beneficiamento: Number(fichaOriginal.beneficiamento) || 0,
        costura: Number(fichaOriginal.costura) || 0,
        lavanderia: Number(fichaOriginal.lavanderia) || 0,
        acabamento: Number(fichaOriginal.acabamento) || 0,
        passadoria: Number(fichaOriginal.passadoria) || 0,
        tecido: Number(fichaOriginal.tecido) || 0,
        aviamento: Number(fichaOriginal.aviamento) || 0,
        observacoes: fichaOriginal.observacoes || "",
      });
    }
  }, [fichaOriginal, isOpen]);

  const duplicateMutation = trpc.fichasCusto.duplicate.useMutation({
    onSuccess: () => {
      utils.fichasCusto.listFiltered.invalidate();
      toast.success("Ficha duplicada com sucesso!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao duplicar ficha");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    duplicateMutation.mutate(formData);
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
          <DialogTitle>Duplicar Ficha de Custo</DialogTitle>
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
                  onChange={(e) => setFormData({ ...formData, familia: e.target.value })}
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
              <ImageUpload
                value={formData.fotoUrl || ""}
                onChange={(url: string) => setFormData({ ...formData, fotoUrl: url })}
                label="Foto do Produto"
              />
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

          {/* Total */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-lg font-semibold text-blue-900">
              Custo Total: R$ {calculateTotal().toFixed(2)}
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={duplicateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={duplicateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {duplicateMutation.isPending ? "Duplicando..." : "Duplicar Ficha"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

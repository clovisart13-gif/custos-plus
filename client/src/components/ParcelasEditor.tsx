import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ParcelasEditorProps {
  orcamento: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ParcelasEditor({
  orcamento,
  onSuccess,
  onCancel,
}: ParcelasEditorProps) {
  const [sinal, setSinal] = useState(String(orcamento.percentualSinal || 0));
  const [retirada, setRetirada] = useState(String(orcamento.percentualRetirada || 0));
  const [prazo, setPrazo] = useState(String(orcamento.percentualPrazo || 0));
  const [isSaving, setIsSaving] = useState(false);

  const updateOrcamentoMutation = trpc.orcamentos.update.useMutation();

  const sinalNum = parseFloat(sinal) || 0;
  const retiradaNum = parseFloat(retirada) || 0;
  const prazoNum = parseFloat(prazo) || 0;
  const total = sinalNum + retiradaNum + prazoNum;

  const isValid = total === 100 && sinalNum >= 0 && retiradaNum >= 0 && prazoNum >= 0;

  const handleSave = async () => {
    if (!isValid) {
      toast.error("Percentuais devem somar 100%");
      return;
    }

    setIsSaving(true);
    try {
      await updateOrcamentoMutation.mutateAsync({
        id: orcamento.id,
        percentualSinal: sinalNum,
        percentualRetirada: retiradaNum,
        percentualPrazo: prazoNum,
      });
      toast.success("Percentuais salvos com sucesso!");
      onSuccess?.();
    } catch (error) {
      toast.error("Erro ao salvar percentuais");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Editar Parcelas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campos de entrada */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sinal">Sinal (%)</Label>
            <Input
              id="sinal"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={sinal}
              onChange={(e) => setSinal(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="retirada">Retirada (%)</Label>
            <Input
              id="retirada"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={retirada}
              onChange={(e) => setRetirada(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="prazo">30 Dias (%)</Label>
            <Input
              id="prazo"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Validação */}
        <div className={`p-3 rounded-lg flex items-start gap-2 ${
          isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
            isValid ? 'text-green-600' : 'text-red-600'
          }`} />
          <div className={isValid ? 'text-green-800' : 'text-red-800'}>
            <p className="font-medium text-sm">
              Total: {total.toFixed(2)}%
            </p>
            <p className="text-xs mt-1">
              {isValid 
                ? '✓ Percentuais válidos' 
                : '✗ Percentuais devem somar 100%'}
            </p>
          </div>
        </div>

        {/* Preview das parcelas */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium mb-3">Preview das Parcelas:</p>
          {sinalNum > 0 && (
            <div className="flex justify-between text-sm">
              <span>Sinal ({sinalNum}%):</span>
              <span className="font-medium">R$ {((orcamento.totalGeral || 0) * sinalNum / 100).toFixed(2)}</span>
            </div>
          )}
          {retiradaNum > 0 && (
            <div className="flex justify-between text-sm">
              <span>Retirada ({retiradaNum}%):</span>
              <span className="font-medium">R$ {((orcamento.totalGeral || 0) * retiradaNum / 100).toFixed(2)}</span>
            </div>
          )}
          {prazoNum > 0 && (
            <div className="flex justify-between text-sm">
              <span>30 Dias ({prazoNum}%):</span>
              <span className="font-medium">R$ {((orcamento.totalGeral || 0) * prazoNum / 100).toFixed(2)}</span>
            </div>
          )}
          {total === 0 && (
            <p className="text-xs text-gray-500">Nenhuma parcela definida</p>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar Parcelas"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

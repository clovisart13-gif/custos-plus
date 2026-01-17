import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Trash2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLocation } from "wouter";
import NovoOrcamentoModal from "@/components/NovoOrcamentoModal";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Orcamentos() {
  const [location, navigate] = useLocation();
  const [showNovoOrcamento, setShowNovoOrcamento] = useState(false);

  const { data: orcamentos = [], isLoading, refetch } = trpc.orcamentos.list.useQuery();
  const deleteOrcamento = trpc.orcamentos.delete.useMutation({
    onSuccess: () => {
      toast.success("Orçamento deletado com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao deletar orçamento: " + error.message);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este orçamento?")) {
      deleteOrcamento.mutate({ id });
    }
  };

  const handleView = (id: number) => {
    navigate(`/orcamento/${id}`);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie seus orçamentos de vendas</p>
        </div>
        <Dialog open={showNovoOrcamento} onOpenChange={setShowNovoOrcamento}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Orçamento</DialogTitle>
              <DialogDescription>
                Crie um novo orçamento manualmente ou a partir de uma ficha de custo
              </DialogDescription>
            </DialogHeader>
            <NovoOrcamentoModal 
              onSuccess={() => {
                setShowNovoOrcamento(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : orcamentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum orçamento criado ainda</p>
            <Button onClick={() => setShowNovoOrcamento(true)} variant="outline">
              Criar primeiro orçamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orcamentos.map((orcamento) => (
            <Card key={orcamento.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{orcamento.nomeCliente}</CardTitle>
                    <CardDescription>
                      Orçamento: {orcamento.numeroOrcamento} • {formatDate(orcamento.dataEmissao)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(Number(orcamento.total))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {orcamento.totalPecas} peças
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    <p>Marca: {orcamento.marca}</p>
                    <p>Validade: {orcamento.validade} dias</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(orcamento.id)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(orcamento.id)}
                      disabled={deleteOrcamento.isPending}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

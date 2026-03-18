import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";

export default function VisualizarFicha() {
  const { user } = useAuth();
  const [, params] = useRoute("/ficha/:id");
  const [, setLocation] = useLocation();
  
  const fichaId = params?.id ? parseInt(params.id) : null;
  
  const { data: fichas } = trpc.fichasCusto.list.useQuery();
  const ficha = fichas?.find((f) => f.id === fichaId);

  useEffect(() => {
    if (fichaId && !ficha && fichas && fichas.length > 0) {
      // Redirecionar apenas se já carregou as fichas e não encontrou
      setLocation("/fichas-custo");
    }
  }, [fichaId, ficha, fichas, setLocation]);

  if (!ficha) {
    return null;
  }

  const custoTotal =
    Number(ficha.modelagem) +
    Number(ficha.piloto) +
    Number(ficha.corte) +
    Number(ficha.beneficiamento) +
    Number(ficha.costura) +
    Number(ficha.lavanderia) +
    Number(ficha.acabamento) +
    Number(ficha.passadoria) +
    Number(ficha.tecido) +
    Number(ficha.aviamento);

  const custoMaoDeObra =
    Number(ficha.modelagem) +
    Number(ficha.piloto) +
    Number(ficha.corte) +
    Number(ficha.beneficiamento) +
    Number(ficha.costura) +
    Number(ficha.lavanderia) +
    Number(ficha.acabamento) +
    Number(ficha.passadoria);

  const custoMateriaPrima = Number(ficha.tecido) + Number(ficha.aviamento);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Botões de ação - não aparecem na impressão */}
      <div className="print:hidden container py-4 flex gap-2">
        <Button variant="outline" onClick={() => setLocation("/fichas-custo")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
        <Button onClick={handleExportPDF}>
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Conteúdo da ficha - formatado para impressão */}
      <div className="container py-8 max-w-4xl print:py-4 print:px-0">
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-8 print:p-6">
            {/* Cabeçalho com logo */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-primary print:mb-4 print:pb-3">
              <div className="flex items-center gap-4">
                <img
                  src="/logo-r2pb.jpeg"
                  alt="R2PB Confecções"
                  style={{ height: '45px', width: 'auto' }}
                  className="object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground print:text-xl">
                    R2PB Confecções
                  </h1>
                  <p className="text-sm text-muted-foreground print:text-xs">
                    Ficha de Custo
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Data de Criação</p>
                <p className="font-semibold">
                  {new Date(ficha.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            {/* Informações do Produto */}
            <div className="grid grid-cols-2 gap-6 mb-6 print:mb-4 print:gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-4 text-foreground print:text-base print:mb-3">
                  Informações do Produto
                </h2>
                <div className="space-y-3 print:space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Referência</p>
                    <p className="font-semibold text-lg print:text-base">{ficha.referencia}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{ficha.tipo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Família</p>
                    <p className="font-medium">{ficha.familia}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{ficha.cliente}</p>
                  </div>
                </div>
              </div>

              {/* Foto do Produto */}
              {ficha.fotoUrl && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-foreground print:text-base print:mb-3">
                    Foto do Produto
                  </h2>
                  <img
                    src={ficha.fotoUrl}
                    alt={ficha.referencia}
                    className="w-full h-48 object-cover rounded-lg border print:h-32"
                  />
                </div>
              )}
            </div>

            {/* Custos de Mão-de-Obra */}
            <div className="mb-6 print:mb-4">
              <h2 className="text-lg font-semibold mb-4 text-foreground print:text-base print:mb-3">
                Custos de Mão-de-Obra
              </h2>
              <div className="grid grid-cols-2 gap-4 print:gap-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Modelagem</span>
                  <span className="font-medium">
                    R$ {Number(ficha.modelagem).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Piloto</span>
                  <span className="font-medium">
                    R$ {Number(ficha.piloto).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Corte</span>
                  <span className="font-medium">
                    R$ {Number(ficha.corte).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Beneficiamento</span>
                  <span className="font-medium">
                    R$ {Number(ficha.beneficiamento).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Costura</span>
                  <span className="font-medium">
                    R$ {Number(ficha.costura).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Lavanderia</span>
                  <span className="font-medium">
                    R$ {Number(ficha.lavanderia).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Acabamento</span>
                  <span className="font-medium">
                    R$ {Number(ficha.acabamento).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Passadoria</span>
                  <span className="font-medium">
                    R$ {Number(ficha.passadoria).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between py-3 mt-2 border-t-2 border-primary">
                <span className="font-semibold">Subtotal Mão-de-Obra</span>
                <span className="font-semibold text-primary">
                  R$ {custoMaoDeObra.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Custos de Matéria-Prima */}
            <div className="mb-6 print:mb-4">
              <h2 className="text-lg font-semibold mb-4 text-foreground print:text-base print:mb-3">
                Custos de Matéria-Prima
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Tecido</span>
                  <span className="font-medium">
                    R$ {Number(ficha.tecido).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Aviamento</span>
                  <span className="font-medium">
                    R$ {Number(ficha.aviamento).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between py-3 mt-2 border-t-2 border-primary">
                <span className="font-semibold">Subtotal Matéria-Prima</span>
                <span className="font-semibold text-primary">
                  R$ {custoMateriaPrima.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Observações */}
            {ficha.observacoes && (
              <div className="mb-6 print:mb-4">
                <h2 className="text-lg font-semibold mb-4 text-foreground print:text-base print:mb-3">
                  Observações
                </h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {ficha.observacoes}
                </p>
              </div>
            )}

            {/* Custo Total */}
            <div className="bg-primary/10 rounded-lg p-6 mt-6 print:mt-4 print:p-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-foreground print:text-xl">
                  CUSTO TOTAL
                </span>
                <span className="text-3xl font-bold text-primary print:text-2xl">
                  R$ {custoTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Rodapé */}
            <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground print:mt-4 print:pt-3 print:text-xs">
              <p>R2PB Confecções Ltda.</p>
              <p>Documento gerado eletronicamente. Válido sem carimbo.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

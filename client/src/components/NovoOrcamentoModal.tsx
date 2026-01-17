import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import NovoOrcamentoManual from "./NovoOrcamentoManual";
import NovoOrcamentoDaFicha from "./NovoOrcamentoDaFicha";

interface NovoOrcamentoModalProps {
  onSuccess?: () => void;
}

export default function NovoOrcamentoModal({ onSuccess }: NovoOrcamentoModalProps) {
  const [activeTab, setActiveTab] = useState("manual");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manual">Criar Manualmente</TabsTrigger>
        <TabsTrigger value="ficha">A partir da Ficha</TabsTrigger>
      </TabsList>

      <TabsContent value="manual" className="mt-6">
        <NovoOrcamentoManual onSuccess={onSuccess} />
      </TabsContent>

      <TabsContent value="ficha" className="mt-6">
        <NovoOrcamentoDaFicha onSuccess={onSuccess} />
      </TabsContent>
    </Tabs>
  );
}

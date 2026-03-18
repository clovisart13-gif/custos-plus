import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SelectTenant() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Custos Plus</h1>
          <p className="text-gray-600">Selecione sua empresa para continuar</p>
        </div>

        <div className="space-y-4">
          {/* Mirage - OAuth */}
          <Button
            onClick={() => setLocation("/login-oauth")}
            className="w-full h-16 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          >
            <div className="flex flex-col items-center">
              <span>🏢 Mirage</span>
              <span className="text-xs font-normal mt-1">Login com Google/Facebook</span>
            </div>
          </Button>

          {/* R2PB - Email + Senha */}
          <Button
            onClick={() => setLocation("/login")}
            variant="outline"
            className="w-full h-16 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400"
          >
            <div className="flex flex-col items-center">
              <span>👕 R2PB Confecções</span>
              <span className="text-xs font-normal mt-1">Login com Email e Senha</span>
            </div>
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Desenvolvido por Manus</p>
        </div>
      </Card>
    </div>
  );
}

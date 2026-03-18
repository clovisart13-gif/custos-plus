import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function LoginOAuth() {
  useEffect(() => {
    // Redirecionar para OAuth do Manus
    window.location.href = getLoginUrl();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Redirecionando para login...</p>
      </div>
    </div>
  );
}

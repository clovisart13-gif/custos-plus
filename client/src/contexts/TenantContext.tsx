import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../_core/hooks/useAuth';

interface TenantContextType {
  selectedTenantId: number | null;
  setSelectedTenantId: (tenantId: number) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

  // Inicializar tenant selecionado
  useEffect(() => {
    if (!user) return;

    // Se não é admin, usar tenant do usuário
    if (user.role !== 'admin') {
      setSelectedTenantId(user.tenantId);
      return;
    }

    // Se é admin, carregar preferência do localStorage
    const savedTenantId = localStorage.getItem('selectedTenantId');
    if (savedTenantId) {
      setSelectedTenantId(parseInt(savedTenantId));
    } else {
      // Padrão: usar tenant do usuário (Mirage = 2)
      setSelectedTenantId(user.tenantId);
    }
  }, [user]);

  // Salvar preferência quando mudar
  const handleSetSelectedTenantId = (tenantId: number) => {
    setSelectedTenantId(tenantId);
    localStorage.setItem('selectedTenantId', tenantId.toString());
  };

  return (
    <TenantContext.Provider value={{ selectedTenantId, setSelectedTenantId: handleSetSelectedTenantId }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

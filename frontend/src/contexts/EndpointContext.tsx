/**
 * Context for sharing selected endpoint state across components
 */

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface EndpointContextType {
  selectedEndpointId: string | null;
  setSelectedEndpointId: (id: string | null) => void;
}

const EndpointContext = createContext<EndpointContextType | undefined>(undefined);

export function EndpointProvider({ children }: { children: ReactNode }) {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);

  return (
    <EndpointContext.Provider value={{ selectedEndpointId, setSelectedEndpointId }}>
      {children}
    </EndpointContext.Provider>
  );
}

export function useSelectedEndpoint() {
  const context = useContext(EndpointContext);
  if (!context) {
    throw new Error('useSelectedEndpoint must be used within EndpointProvider');
  }
  return context;
}

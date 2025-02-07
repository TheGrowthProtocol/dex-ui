import React, { createContext, useContext, useState, useMemo } from 'react';
import { Provider } from '../window';

interface ProviderContextType {
  provider: Provider | null;
  setProvider: (provider: Provider | null) => void;
}

const ProviderContext = createContext<ProviderContextType>({
  provider: null,
  setProvider: () => {},
});

export const ProviderContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<Provider | null>(null);

  const value = useMemo(() => ({
    provider,
    setProvider
  }), [provider]);

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
};

export const useProviderContext = () => useContext(ProviderContext); 
import { createContext, useContext, ReactNode } from 'react';
import { useSnackbar } from '../Hooks/useSnackbar';
import { CustomSnackbar } from '../Components/customSnackbar';

type SnackbarContextType = ReturnType<typeof useSnackbar>;

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const snackbar = useSnackbar();

  return (
    <SnackbarContext.Provider value={snackbar}>
      {children}
      <CustomSnackbar />
    </SnackbarContext.Provider>
  );
};

export const useSnackbarContext = () => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbarContext must be used within a SnackbarProvider');
  }
  return context;
};
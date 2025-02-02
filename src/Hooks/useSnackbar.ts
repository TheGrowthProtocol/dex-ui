import { useState, useCallback, ReactNode } from 'react';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarState {
  open: boolean;
  content: ReactNode;
  severity: SnackbarSeverity;
}

export const useSnackbar = () => {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    content: '',
    severity: 'info',
  });

  const showSnackbar = useCallback((content: ReactNode, severity: SnackbarSeverity = 'info') => {
    setState({
      open: true,
      content,
      severity,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setState(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  return {
    ...state,
    showSnackbar,
    hideSnackbar,
  };
};
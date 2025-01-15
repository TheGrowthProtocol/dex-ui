export interface TOKEN {
    name: string;
    symbol: string;
    decimals?: number;
    address?: string | null;
}

export interface COINFIELD {
    setSelectedToken: (token: TOKEN) => void;
    setAmount: (amount: string) => void;
    value: string;
}

export interface COINDIALOG {
    tokens: TOKEN[];
    handleClose: () => void;
    isOpen: boolean;
    onTokenSelect: (token: TOKEN) => void;
}

export interface TokenInputFieldProps {
    tokens: TOKEN[];
    selectedToken: TOKEN;
    onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  }

  export interface LiquidityState {
    token1: TOKEN;
    token2: TOKEN;
    amount1: string;
    amount2: string;
    amount1Min: string;
    amount2Min: string;
    loading: boolean;
    error: string | null;
    provider: any;
    signer: any;
  }

  // Add new interface for menu items
export interface MenuItemProps {
    label: string;
    onClick: () => void;
  }
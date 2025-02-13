export interface TOKEN {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
    icon?: string;
}

export interface POOL {
    id: string;
    pairAddress: string;
    token0: TOKEN;
    token1: TOKEN;
    //token0Symbol: string;
    //token1Symbol: string;
    token0Reserve: string;
    token1Reserve: string;
    token0Share?: string;
    token1Share?: string;
    lpBalance?: string;
    liquidity?: string;
    volume24h?: string;
    tvl?: string;
    apr?: string;
}

export interface COINFIELD {
    title: string;
    setSelectedToken: (token: TOKEN) => void;
    setAmount: (amount: string) => void;
    value: string;
    selectedToken: TOKEN;
    isDisabledAmountField: boolean;
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
    onAmountChange: (amount: string) => void;
    isDisplayBalance: boolean;
    value: string;
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

  export interface SwapState {
    token1: TOKEN;
    token2: TOKEN;
    amount1: number;
    amount2: number;
    loading: boolean;
    error: string | null;
    }

  // Add new interface for menu items
export interface MenuItemProps {
    label: string;
    onClick: () => void;
  }

export interface CoinPairIconsProps {
    coin1Image?: string;
    coin2Image?: string;
  }

  export interface TokenState {
    tokens: TOKEN[];
    loading: boolean;
    error: string | null;
  }

  export interface TokenomicsItem {
    title: string;
    value: string;
}

export interface Tokenomics {
    [key: string]: TokenomicsItem;
}
export const env = {
  chainId: process.env.REACT_APP_CHAIN_ID ?? '0x17c99',
  rpcUrl: process.env.REACT_APP_RPC_URL ?? 'https://subnets.avax.network/tgp/testnet/rpc',
  networkName: process.env.REACT_APP_NETWORK_NAME ?? 'TGP Testnet',
  currency: {
    name: process.env.REACT_APP_CURRENCY_NAME ?? 'CERES',
    symbol: process.env.REACT_APP_CURRENCY_SYMBOL ?? 'CERES', 
    decimals: Number(process.env.REACT_APP_CURRENCY_DECIMALS ?? 18)
  },
  blockExplorerUrl: process.env.REACT_APP_BLOCK_EXPLORER_URL ?? 'https://subnets-test.avax.network/tgp',
  contracts: {
    masterChef: process.env.REACT_APP_MASTER_CHEF_ADDRESS ?? '0x481b2c832322F73Ec66e4f9e013001db9B55518a',
    poolFactory: process.env.REACT_APP_POOL_FACTORY_ADDRESS ?? '0x61210626D2010F09265224dBe219e04F1797B1B3'
  },
  priceFeedApi: process.env.REACT_APP_PRICE_FEED_API ?? 'https://api.coingecko.com/api/v3/simple/price?ids=ceres&vs_currencies=usd',
  routerAddress: process.env.REACT_APP_ROUTER_ADDRESS ?? '0xA8F1013B5c23813999Dc909dc529B79EdaD033Ae'
};


## DEX-Interface

This is a DEX interface for the The Growth Protocol Testnet.
Reference: https://medium.com/clearmatics/how-i-made-a-uniswap-interface-from-scratch-b51e1027ca87

## Contracts address
```
WCERES Addr: 0x932583C39d2bf79009eE0E9b16196BD31953b7a9

New Token1 Addr: 0x58AC2e9d0CCEcd67686883aE81704608F5Ee5d81
New Token2 Addr: 0x7E0F9B0fa9E72D9234C56ed50Ed1A639679A3bF1

UniswapV2Factory deployed to: 0x61210626D2010F09265224dBe219e04F1797B1B3
UniswapV2Router02 deployed to: 0xA8F1013B5c23813999Dc909dc529B79EdaD033Ae
 
```



## Usage
#### To install the dependencies
```bash
npm install --legacy-peer-deps
```
#### To start the app
```bash
npm run start
```

#### To build the app
```bash
npm run build
```

#### set the env variables
```bash
create .env file in root folder and set the following variables:

REACT_APP_CHAIN_ID=<chain_id>
REACT_APP_RPC_URL=<rpc_url>
REACT_APP_NETWORK_NAME=<network_name>
REACT_APP_CURRENCY_NAME=<currency_name>
REACT_APP_CURRENCY_SYMBOL=<currency_symbol>
REACT_APP_CURRENCY_DECIMALS=<currency_decimals>
REACT_APP_BLOCK_EXPLORER_URL=<block_explorer_url>
REACT_APP_MASTER_CHEF_ADDRESS=<master_chef_address>
REACT_APP_POOL_FACTORY_ADDRESS=<pool_factory_address>
REACT_APP_PRICE_FEED_API=<price_feed_api>
```

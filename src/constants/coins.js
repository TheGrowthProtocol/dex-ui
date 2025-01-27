import * as chains from './chains';

const TGPCoins = [
  {
    name: "TOKEN1",
    abbr: "TK1",
    address: "0x58AC2e9d0CCEcd67686883aE81704608F5Ee5d81", 
    icon: "https://cryptologos.cc/logos/ethereum-name-service-ens-logo.png",
  },
  {
    name: "TOKEN2",
    abbr: "TK2",
    address: "0x7E0F9B0fa9E72D9234C56ed50Ed1A639679A3bF1", 
    icon: "https://cryptologos.cc/logos/ethereum-name-service-ens-logo.png",
  },
  {
    name: "WCERES",
    abbr: "WCERES",
    address: "0x932583C39d2bf79009eE0E9b16196BD31953b7a9", // Wceres address is fetched from the router
    icon: "https://cryptologos.cc/logos/ethereum-name-service-ens-logo.png",
  },
]

const COINS = new Map();
COINS.set(chains.ChainId.TGP, TGPCoins)
export default COINS

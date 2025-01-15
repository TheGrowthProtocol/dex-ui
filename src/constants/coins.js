import * as chains from './chains';

const TGPCoins = [
  {
    name: "TOKEN1",
    abbr: "TK1",
    address: "0x45fd4F6c7DB076dbB1296fD0718f396089E39A45", 
  },
  {
    name: "TOKEN2",
    abbr: "TK2",
    address: "0x175309ec3F9DdCeC156a52E3603e78a4628e7405", 
  },
  {
    name: "WCERES",
    abbr: "WCERES",
    address: "0x932583C39d2bf79009eE0E9b16196BD31953b7a9", // Wceres address is fetched from the router
  },
]

const COINS = new Map();
COINS.set(chains.ChainId.TGP, TGPCoins)
export default COINS

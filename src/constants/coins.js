import * as chains from './chains';

/*const TGPCoins = [
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
]*/
const getIconFromAssets = (iconName) => {
  try {
    console.log(require(`../assets/coins/${iconName}`));
    return require(`../assets/coins/${iconName}`).default;
    
  } catch (error) {
    console.warn(`Icon ${iconName} not found in assets`);
    return "https://cryptologos.cc/logos/ethereum-name-service-ens-logo.png"; // Default fallback icon
  }
};

const TGPCoins = [
  {
    name: "PLUTO",
    abbr: "PLUTO", 
    address: "0xaD6b92f47070069FD1ef4C5FAF1fc3A7753737b1",
    icon: getIconFromAssets("pluto.png"),
  },
  {
    name: "ERIS",
    abbr: "ERIS",
    address: "0xF733EfD5440C2Fb8592dB020C19f1C0Fda1cdb14",
    icon: getIconFromAssets("eris.png"),
  },
  {
    name: "WCERES",
    abbr: "WCERES",
    address: "0x2Ae4Bd028aF542d11ADE8816343BF943fcd30ad1",
    icon: getIconFromAssets("ceres.png"),
  },
]


const COINS = new Map();
COINS.set(chains.ChainId.TGP, TGPCoins)
export default COINS

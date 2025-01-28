import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers, Contract } from "ethers";
import COINS from "../../constants/coins";
import WCERES from "../../build/WCERES.json";
import ERC20 from "../../build/ERC20.json";
import { env } from "../../env";


const TGP_NETWORK = {
    chainId: env.chainId, // Convert 97433 to hex
    chainName: env.networkName,
    rpcUrls: [env.rpcUrl],
    nativeCurrency: {
      name: env.currency.name,
      symbol: env.currency.symbol,
      decimals: env.currency.decimals,
    },
    blockExplorerUrls: [env.blockExplorerUrl],
  };

export const fetchTokens = createAsyncThunk("tokens/fetchTokens", async () => {
    try {
        if (!window.ethereum) {
            throw new Error("Please install MetaMask or another Ethereum wallet.");
        }
        const provider = new ethers.providers.JsonRpcProvider(TGP_NETWORK.rpcUrls[0]);
        const network = provider.getNetwork();
        const chainId = (await network).chainId;
        const fetchedTokens = await Promise.all(
                COINS.get(chainId).map(async (coinObject: any) => {
                    const address = coinObject.address;
                    const tokenContract = new Contract(address, coinObject.name === "WCERES" ? WCERES.abi : ERC20.abi, provider);
                    if(coinObject.name === "WCERES") {
                        const name = 'CERES';
                        const symbol = 'CERES';
                        const decimals = 18;
                        return { name, symbol, address, decimals, icon: coinObject.icon };
                    }
                    const name = await tokenContract.name();
                    const symbol = await tokenContract.symbol();
                    const decimals = await tokenContract.decimals().then((result: any) => {
                        return result;
                      }).catch((error: any) => {
                        console.log(error)
                        return 18;
                      });
                    return { name, symbol, address, decimals, icon: coinObject.icon };
                })
            );

        return fetchedTokens;
    } catch (error) {
        throw new Error("Failed to fetch tokens");
    }
});

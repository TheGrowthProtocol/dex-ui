import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers, Contract } from "ethers";
import COINS from "../../constants/coins";
import WCERES from "../../build/WCERES.json";
import ERC20 from "../../build/ERC20.json";

export const fetchTokens = createAsyncThunk("tokens/fetchTokens", async (
  provider: ethers.providers.JsonRpcProvider
) => {
    try {
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

import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers, Contract } from "ethers";
import COINS from "../../constants/coins";
import WCERES from "../../build/WCERES.json";
import ERC20 from "../../build/ERC20.json";


const TGP_NETWORK = {
    chainId: "0x17c99", // Convert 97433 to hex
    chainName: "TGP Testnet",
    rpcUrls: ["https://subnets.avax.network/tgp/testnet/rpc"],
    nativeCurrency: {
      name: "CERES",
      symbol: "CERES",
      decimals: 18,
    },
    blockExplorerUrls: ["https://subnets-test.avax.network/tgp"],
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
                    const name = await tokenContract.name();
                    const symbol = await tokenContract.symbol();
                    return { name, symbol, address };
                })
            );

        return fetchedTokens;
    } catch (error) {
        throw new Error("Failed to fetch tokens");
    }
});

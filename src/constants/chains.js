import { env } from "../env";
export const networks = [97433]

export const ChainId = {
  TGP: 97433,
};

export const routerAddress = new Map();
routerAddress.set(ChainId.TGP, env.routerAddress);

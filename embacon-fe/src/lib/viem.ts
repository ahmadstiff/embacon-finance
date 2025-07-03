import { createPublicClient } from "viem";
import { http } from "wagmi";
import { arbitrumSepolia } from "viem/chains";

export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

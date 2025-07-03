import { createConfig, http } from "wagmi";
import { arbitrumSepolia } from "viem/chains";
import { metaMask } from "wagmi/connectors";

export const config = createConfig({
  ssr: true,
  chains: [arbitrumSepolia],
  connectors: [metaMask()],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});

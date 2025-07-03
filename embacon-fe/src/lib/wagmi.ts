import { createConfig, http } from "wagmi";
import { arbitrumSepolia, avalancheFuji } from "viem/chains";
import { metaMask } from "wagmi/connectors";

export const config = createConfig({
  ssr: true, // Make sure to enable this for server-side rendering (SSR) applications.
  chains: [arbitrumSepolia],
  connectors: [metaMask()],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});

import { createConfig, http } from "wagmi";
import { avalancheFuji } from "viem/chains";
import { metaMask } from "wagmi/connectors";

export const config = createConfig({
  ssr: true, // Make sure to enable this for server-side rendering (SSR) applications.
  chains: [avalancheFuji],
  connectors: [metaMask()],
  transports: {
    [avalancheFuji.id]: http(),
  },
});

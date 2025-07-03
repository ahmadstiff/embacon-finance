import { http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrumSepolia } from "viem/chains";

export const config = getDefaultConfig({
  appName: "MyDApp",
  projectId: "YOUR_PROJECT_ID",
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});
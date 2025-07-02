"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, ExternalLink } from "lucide-react";

const ButtonConnectWallet = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        openAccountModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";

        if (!ready) {
          return (
            <div
              aria-hidden={true}
              className="opacity-0 pointer-events-none select-none"
            />
          );
        }

        if (!account || !chain) {
          return (
            <button
              onClick={openConnectModal}
              type="button"
              className="btn-futuristic flex items-center justify-center space-x-1.5 px-6 py-2.5 rounded-xl text-white font-medium transition-all duration-300 hover-lift"
            >
              <span className="text-glow">Connect Wallet</span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              type="button"
              className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl glass border border-red-400/30 text-red-400 font-medium transition-all duration-300 hover-lift"
            >
              <span>Wrong Network</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          );
        }
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={openChainModal}
              type="button"
              className="flex items-center justify-center space-x-1 px-4 py-2 rounded-xl glass border border-blue-400/30 text-white hover:opacity-90 font-medium transition-all duration-300 hover-lift"
            >
              {chain.hasIcon && chain.iconUrl && (
                <img
                  src={chain.iconUrl || "/placeholder.svg"}
                  alt={chain.name || "Chain icon"}
                  className="w-4 h-4 rounded-full mr-1"
                  style={{ background: chain.iconBackground }}
                />
              )}
              <span>{chain.name}</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
            </button>

            <button
              onClick={openAccountModal}
              type="button"
              className="flex items-center justify-center space-x-1 px-4 py-2 rounded-xl glass border border-cyan-400/30 text-cyan-300 hover:opacity-90 font-medium transition-all duration-300 hover-lift"
            >
              <span className="truncate max-w-[120px] text-glow-cyan">
                {account.displayName}
              </span>
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ButtonConnectWallet;

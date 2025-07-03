"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAddress } from "@/lib/format-address";
import { ChevronDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, chains } = useSwitchChain();

  const connector = connectors[0];

  return (
    <div className="z-99 flex flex-col md:flex-row items-center gap-3">
      {isConnected ? (
        <>
          {/* Chain Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 rounded-xl font-semibold border-2 border-blue-400 bg-background text-foreground shadow-md hover:bg-accent transition-colors backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse" />
              {chain?.name.split(" ").slice(0, 2).join(" ")}
              <ChevronDown className="w-4 h-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl bg-popover text-popover-foreground shadow-lg p-2 min-w-[150px]">
              {chains.map(
                (c) =>
                  c.id !== chain?.id && (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => switchChain({ chainId: c.id })}
                      className="cursor-pointer px-3 py-2 rounded-md font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      {c.name}
                    </DropdownMenuItem>
                  )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wallet Address Dropdown */}
          <div className="relative w-fit">
            <DropdownMenu>
              <DropdownMenuTrigger className="z-99 flex items-center gap-1 px-5 py-2 rounded-xl font-semibold border-2 border-blue-400 bg-background text-foreground shadow-md hover:bg-accent transition-colors backdrop-blur-md">
                <Wallet className="w-4 h-4 mr-1 text-blue-400" />
                {formatAddress(address)}
                <ChevronDown className="w-4 h-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-99 w-full rounded-xl bg-popover text-popover-foreground shadow-lg p-2 min-w-[12.5rem]">
                <DropdownMenuItem
                  onClick={() => disconnect()}
                  className="cursor-pointer px-3  text-red-500 font-semibold hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-700 rounded-md"
                >
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        <Button
          className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-blue-800 text-white font-semibold rounded-xl px-6 py-2 shadow-xl transition-all border-2 border-transparent hover:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 before:absolute before:inset-0 before:rounded-xl before:animate-glow before:bg-gradient-to-r before:from-blue-500 before:via-blue-600 before:to-blue-800 before:opacity-40 before:z-[-1] overflow-hidden"
          onClick={() => connect({ connector })}
        >
          <Wallet className="w-5 h-5 mr-2 animate-pulse text-blue-300" />
          Connect Wallet
        </Button>
      )}
    </div>
  );
}

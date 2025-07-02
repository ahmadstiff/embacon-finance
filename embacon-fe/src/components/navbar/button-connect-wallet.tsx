"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAddress } from "@/lib/format-address";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, chains } = useSwitchChain();

  const connector = connectors[0];

  return (
    <div className="flex flex-col md:flex-row items-center gap-3">
      {isConnected ? (
        <>
          {/* Chain Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 rounded-xl font-semibold border border-border bg-background text-foreground shadow-sm hover:bg-accent transition-colors">
              {chain?.name.split(" ").slice(0, 2).join(" ")}
              <ChevronDown className="w-4 h-4" />
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
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-5 py-2 rounded-xl font-semibold border border-border bg-background text-foreground shadow-sm hover:bg-accent transition-colors">
              {formatAddress(address)}
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl bg-popover text-popover-foreground shadow-lg p-2 min-w-[150px]">
              <DropdownMenuItem
                onClick={() => disconnect()}
                className="cursor-pointer px-3 py-2 text-red-500 font-semibold hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-700 rounded-md"
              >
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2 shadow-lg transition-all"
          onClick={() => connect({ connector })}
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
}

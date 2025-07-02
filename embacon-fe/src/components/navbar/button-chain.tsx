"use client"

import { useSwitchChain } from "wagmi"

function NetworkSwitcher() {
  const { chains, switchChain } = useSwitchChain()
  
  return (
    <div>
      {chains.map((chain) => (
        <button
          key={chain.id}
          onClick={() => switchChain({ chainId: chain.id })}
        >
          Switch to {chain.name}
        </button>
      ))}
    </div>
  )
}
export default NetworkSwitcher;
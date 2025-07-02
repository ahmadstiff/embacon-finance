"use client";

import React, { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import Providers from "./providers";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="relative z-99">
          <Navbar />
        </div>
        <div className="mt-5 relative z-10">
          <Providers>{children}</Providers>
        </div>
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { erc20Abi, parseUnits, Address } from "viem";
import { poolAbi } from "@/lib/abis/poolAbi";
import { toast } from "sonner";

interface SwapTokenParams {
  fromToken: {
    address: `0x${string}`;
    name: string;
    decimals: number;
  };
  toToken: {
    address: `0x${string}`;
    name: string;
    decimals: number;
  };
  fromAmount: string;
  toAmount: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  positionAddress: Address;
  lpAddress: Address;
}

export const useSwapToken = ({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  onSuccess,
  onError,
  positionAddress,
  lpAddress,
}: SwapTokenParams) => {
  const { address } = useAccount();
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const {
    writeContractAsync,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle success
  useEffect(() => {
    if (isSuccess && txHash) {
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [isSuccess, txHash]); // Remove onSuccess from dependencies

  // Handle error
  useEffect(() => {
    if (isError && confirmError) {
      if (onError) {
        onError(confirmError);
      }
    }
  }, [isError, confirmError]); // Remove onError from dependencies

  const swapToken = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setError("");
      setTxHash(undefined);

      // Calculate the amount with proper decimals
      const amountIn = parseUnits(fromAmount, fromToken.decimals);

      // Submit the swap transaction
      const tx = await writeContractAsync({
        address: lpAddress,
        abi: poolAbi,
        functionName: "swapTokenByPosition",
        args: [fromToken.address, toToken.address, BigInt(amountIn)],
      });

      if (tx) {
        setTxHash(tx);
        // Don't call onSuccess here, wait for transaction confirmation
      }
    } catch (err) {
      console.error("Error during swap:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to execute swap. Please try again.";
      setError(errorMessage);

      if (onError && err instanceof Error) {
        onError(err);
      }
      
      throw err; // Re-throw to let the component handle the error
    }
  };

  return {
    swapToken,
    isLoading: isWritePending,
    isConfirming,
    isSuccess,
    isError,
    txHash,
    error,
    setError,
  };
};

"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "sonner";
import { mockErc20Abi } from "@/lib/abis/mockErc20Abi";
import { tokens } from "@/constants/token-address";
import { Token } from "@/types/type";
import { addTokenToWallet } from "@/lib/walletUtils";

export const useFaucet = (chainId: number = 43113) => {
  const { address } = useAccount();
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
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

  const filteredTokens = tokens
    .map((token) => {
      const tokenAddress = token.addresses[chainId];
      return tokenAddress ? { ...token, address: tokenAddress } : null;
    })
    .filter(
      (token): token is Token & { address: `0x${string}` } => token !== null
    );

  // Enhanced setAmount with debugging
  const setAmountWithDebug = (newAmount: string) => {
    setAmount(newAmount);
  };

  const handleClaim = async () => {
    if (!selectedTokenAddress || !amount) {
      toast.error("Please select a token and enter an amount");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    const selectedToken = filteredTokens.find(
      (token) => token.address === selectedTokenAddress
    );

    if (!selectedToken) {
      toast.error("Invalid token selected");
      return;
    }

    try {
      setIsClaiming(true);
      setTxHash(undefined);

      const decimals = selectedToken.decimals;
      const amountBigInt = BigInt(
        Math.floor(parseFloat(amount) * 10 ** decimals)
      );

      const tx = await writeContractAsync({
        address: selectedTokenAddress as `0x${string}`,
        abi: mockErc20Abi,
        functionName: "mint_mock",
        args: [address as `0x${string}`, amountBigInt],
      });

      if (tx) {
        setTxHash(tx);
        toast.success("Transaction submitted. Waiting for confirmation...");
      }
    } catch (error) {
      toast.error("Failed to submit transaction");
      setIsClaiming(false);
    }
  };

  const copyTokenAddress = () => {
    if (selectedTokenAddress) {
      navigator.clipboard.writeText(selectedTokenAddress);
      toast.success("Token address copied to clipboard");
    }
  };

  const handleAddTokenToWallet = async () => {
    const selectedToken = filteredTokens.find(
      (token) => token.address === selectedTokenAddress
    );

    if (selectedToken) {
      await addTokenToWallet(selectedTokenAddress, selectedToken);
    }
  };

  // Debug effect to track amount changes
  useEffect(() => {
  }, [amount]);

  // Debug effect to track claiming state
  useEffect(() => {
  }, [isClaiming, isWritePending]);

  useEffect(() => {
    if (isSuccess && txHash) {
      toast.success(`Successfully claimed tokens!`);
      setAmount("");
      setSelectedTokenAddress("");
      setIsClaiming(false);
    }
  }, [isSuccess, txHash]);

  useEffect(() => {
    if (isError) {
      const errorMessage =
        confirmError?.message || writeError?.message || "Transaction failed";
      toast.error(`Transaction failed: ${errorMessage}`);
      setIsClaiming(false);
    }
  }, [isError, confirmError, writeError]);

  // Reset claiming state if it gets stuck
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isClaiming && !isWritePending && !isConfirming) {
        setIsClaiming(false);
      }
    }, 30000); // Reset after 30 seconds if stuck

    return () => clearTimeout(timeout);
  }, [isClaiming, isWritePending, isConfirming]);

  return {
    selectedTokenAddress,
    amount,
    isClaiming: isClaiming || isWritePending,
    isConfirming,
    txHash,
    filteredTokens,
    setSelectedTokenAddress,
    setAmount: setAmountWithDebug, // Use the debug version
    handleClaim,
    copyTokenAddress,
    addTokenToWallet: handleAddTokenToWallet,
    isSuccess,
    isError,
    error: confirmError || writeError,
  };
};

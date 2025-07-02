"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
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
    .filter((token): token is Token & { address: `0x${string}` } => token !== null);

  const handleClaim = async () => {
    if (!selectedTokenAddress || !amount) {
      toast.error("Please select a token and enter an amount", {
        className: "bg-red-900/10 backdrop-blur-md border-red-400/30 text-red-300",
        style: {
          backgroundColor: "rgba(239,68,68,0.1)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(248, 113, 113, 0.3)",
          color: "#fca5a5"
        }
      });
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet", {
        className: "bg-red-900/10 backdrop-blur-md border-red-400/30 text-red-300",
        style: {
          backgroundColor: "rgba(239,68,68,0.1)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(248, 113, 113, 0.3)",
          color: "#fca5a5"
        }
      });
      return;
    }

    const selectedToken = filteredTokens.find(
      (token) => token.address === selectedTokenAddress
    );

    if (!selectedToken) {
      toast.error("Invalid token selected", {
        className: "bg-red-900/10 backdrop-blur-md border-red-400/30 text-red-300",
        style: {
          backgroundColor: "rgba(239,68,68,0.1)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(248, 113, 113, 0.3)",
          color: "#fca5a5"
        }
      });
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
        toast.success("Transaction submitted. Waiting for confirmation...", {
          className: "bg-green-900/10 backdrop-blur-md border-green-400/30 text-green-300",
          style: {
            backgroundColor: "rgba(34,197,94,0.1)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(134, 239, 172, 0.3)",
            color: "#86efac"
          }
        });
      }
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Failed to submit transaction", {
        className: "bg-red-900/10 backdrop-blur-md border-red-400/30 text-red-300",
        style: {
          backgroundColor: "rgba(239,68,68,0.1)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(248, 113, 113, 0.3)",
          color: "#fca5a5"
        }
      });
      setIsClaiming(false);
    }
  };

  const copyTokenAddress = () => {
    if (selectedTokenAddress) {
      navigator.clipboard.writeText(selectedTokenAddress);
      toast.success("Token address copied to clipboard", {
        className: "bg-green-900/10 backdrop-blur-md border-green-400/30 text-green-300",
        style: {
          backgroundColor: "rgba(34,197,94,0.1)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(134, 239, 172, 0.3)",
          color: "#86efac"
        }
      });
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

  useEffect(() => {
    if (isSuccess && txHash) {
      toast.success(`Successfully claimed tokens!`, {
        className: "bg-green-900/10 backdrop-blur-md border-green-400/30 text-green-300",
        style: {
          backgroundColor: "rgba(34,197,94,0.1)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(134, 239, 172, 0.3)",
          color: "#86efac"
        }
      });
      setAmount("");
      setSelectedTokenAddress("");
      setIsClaiming(false);
    }
  }, [isSuccess, txHash]);

  useEffect(() => {
    if (isError) {
      const errorMessage = confirmError?.message || writeError?.message || "Transaction failed";
      toast.error(`Transaction failed: ${errorMessage}`, {
        className: "bg-red-900/10 backdrop-blur-md border-red-400/30 text-red-300",
        style: {
          backgroundColor: "rgba(239,68,68,0.1)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(248, 113, 113, 0.3)",
          color: "#fca5a5"
        }
      });
      setIsClaiming(false);
    }
  }, [isError, confirmError, writeError]);

  return {
    selectedTokenAddress,
    amount,
    isClaiming: isClaiming || isWritePending,
    isConfirming,
    txHash,
    filteredTokens,
    setSelectedTokenAddress,
    setAmount,
    handleClaim,
    copyTokenAddress,
    addTokenToWallet: handleAddTokenToWallet,
    isSuccess,
    isError,
    error: confirmError || writeError,
  };
};

"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { toast } from "sonner";
import { tokens } from "@/constants/token-address";
import { useSwapToken } from "@/hooks/useSwapToken";
import { useTokenCalculator } from "@/hooks/read/useTokenCalculator";
import { useReadPositionBalance } from "@/hooks/read/useReadPositionBalance";
import { useReadUserCollateral } from "@/hooks/read/useReadUserCollateral";
import { defaultChain } from "@/lib/get-default-chain";
import {
  getAllLPFactoryData,
  getSelectedCollateralTokenByLPAddress,
} from "@/actions/GetLPFactory";
import { getPositionByOwnerAndLpAddress } from "@/actions/GetPosition";
import { useReadAddressPosition } from "@/hooks/read/useReadAddressPosition";

export const useSwapLogic = () => {
  const { address } = useAccount();
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [isMounted, setIsMounted] = useState(false);
  const [positionAddress, setPositionAddress] = useState<string | undefined>(undefined);
  const [positionLength, setPositionLength] = useState(0);
  const [positionsArray, setPositionsArray] = useState<any[]>([]);
  const [lpAddress, setLpAddress] = useState<any[]>([]);
  const [lpAddressSelected, setLpAddressSelected] = useState<string>("");
  const [positionIndex, setPositionIndex] = useState<number | undefined>(undefined);
  const [selectedCollateralToken, setSelectedCollateralToken] = useState<any>(null);

  const { addressPosition } = useReadAddressPosition(lpAddressSelected);
  
  const { positionBalance: fromTokenBalance } = useReadPositionBalance(
    fromToken.addresses[defaultChain] as Address,
    addressPosition as `0x${string}`
  );
  
  const { positionBalance: toTokenBalance } = useReadPositionBalance(
    toToken.addresses[defaultChain] as Address,
    addressPosition as `0x${string}`
  );

  const {
    userCollateral,
    positionLoading,
    collateralLoading,
    positionError,
    collateralError,
  } = useReadUserCollateral(selectedCollateralToken, lpAddressSelected);

  const {
    price: priceExchangeRate,
    isLoading: isLoadingPrice,
    error: errorPrice,
  } = useTokenCalculator(
    fromToken.addresses[defaultChain] as Address,
    toToken.addresses[defaultChain] as Address,
    Number(1),
    addressPosition as Address
  );

  const {
    price: priceExchangeRateReverse,
    isLoading: isLoadingPriceReverse,
    error: errorPriceReverse,
  } = useTokenCalculator(
    fromToken.addresses[defaultChain] as Address,
    toToken.addresses[defaultChain] as Address,
    Number(fromAmount),
    addressPosition as Address
  );

  const { swapToken, isLoading, error, setError } = useSwapToken({
    fromToken: {
      address: fromToken.addresses[defaultChain] as Address,
      name: fromToken.name,
      decimals: fromToken.decimals,
    },
    toToken: {
      address: toToken.addresses[defaultChain] as Address,
      name: toToken.name,
      decimals: toToken.decimals,
    },
    fromAmount,
    toAmount,
    onSuccess: () => {
      setFromAmount("");
      setToAmount("");
    },
    onError: (error) => {
      console.error("Swap error:", error);
    },
    positionAddress: addressPosition as `0x${string}`,
    lpAddress: lpAddressSelected as Address,
  });

  // Set mounted state to true after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchSelectedCollateralToken = async () => {
      const data = await getSelectedCollateralTokenByLPAddress(lpAddressSelected);
      setSelectedCollateralToken(data?.collateralToken);
    };
    fetchSelectedCollateralToken();
  }, [lpAddressSelected]);

  // Calculate exchange rate and to amount
  useEffect(() => {
    if (fromAmount && priceExchangeRate && priceExchangeRateReverse) {
      try {
        const amount = parseFloat(fromAmount);
        if (!isNaN(amount) && amount > 0) {
          const calculatedAmount = Number(priceExchangeRateReverse);
          setToAmount(calculatedAmount.toFixed(6));
        } else {
          setToAmount("");
        }
      } catch (err) {
        console.error("Error calculating exchange rate:", err);
        setToAmount("");
      }
    } else {
      setToAmount("");
      setError("");
    }
  }, [fromAmount, priceExchangeRate, priceExchangeRateReverse, fromToken, toToken]);

  useEffect(() => {
    const fetchLpAddress = async () => {
      try {
        setPositionsArray([]);
        setPositionLength(0);
        setPositionAddress(undefined);
        const lpAddress = await getAllLPFactoryData();
        setLpAddress(lpAddress);
      } catch (error) {
        console.error("Error fetching LP address:", error);
        setLpAddress([]);
      }
    };
    fetchLpAddress();
  }, []);

  useEffect(() => {
    if (lpAddressSelected) {
      const fetchPosition = async () => {
        const response = await getPositionByOwnerAndLpAddress(
          address as string,
          lpAddressSelected
        );
        setPositionsArray(response.data);
        setPositionLength(response.data.length);
        setPositionAddress(undefined);
      };
      fetchPosition();
    }
  }, [lpAddressSelected]);

  // Utility functions
  const tokenName = (address: string) => {
    const token = tokens.find((token) => token.addresses[defaultChain] === address);
    return token?.name;
  };

  const tokenLogo = (address: string) => {
    const token = tokens.find((token) => token.addresses[defaultChain] === address);
    return token?.logo;
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const formatExchangeRate = (price: number) => {
    return `1 ${fromToken.name} ≈ ${
      isLoadingPrice ? "Loading..." : Number(price).toFixed(6)
    } ${toToken.name}`;
  };

  const handleSwap = async () => {
    const fromAmountReal = parseFloat(fromAmount) * 10 ** fromToken.decimals;
    const fromTokenBalanceReal =
      fromToken.name === tokenName(selectedCollateralToken)
        ? Number(userCollateral?.toString() ?? "0")
        : Number(fromTokenBalance) * 10 ** fromToken.decimals;

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!fromAmountReal || fromAmountReal <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (fromAmountReal > Number(fromTokenBalanceReal)) {
      setError("Insufficient balance");
      return;
    }

    try {
      await swapToken();
      toast.success("Swap completed successfully!", {
        style: {
          background: 'rgba(34, 197, 94, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#86efac',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
        }
      });
    } catch (err) {
      console.error("Swap error:", err);
      const errorMessage = err instanceof Error
        ? err.message
        : "Failed to execute swap. Please try again.";
      
      setError(errorMessage);
      
      toast.error(errorMessage, {
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
        }
      });
    }
  };

  const getButtonText = () => {
    if (!isMounted) return "Swap";
    if (!address) return "Connect Wallet";
    if (!addressPosition || addressPosition === "0x0000000000000000000000000000000000000000") {
      return "Create Position First";
    }
    if (isLoading) return "Processing...";
    return "Swap";
  };

  const formatButtonClick = () => {
    if (
      addressPosition === "0x0000000000000000000000000000000000000000" ||
      addressPosition === undefined
    ) {
      toast.error("You don't have any active positions. Visit the Borrow page to create a pool first.", {
        duration: 5000,
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
        },
        action: {
          label: "Go to Borrow",
          onClick: () => window.open('/borrow', '_blank')
        }
      });
    } else if (
      Number(fromAmount) >
      Number(fromTokenBalance) / 10 ** fromToken.decimals
    ) {
      toast.error("Insufficient balance", {
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
        }
      });
    } else {
      handleSwap();
    }
  };

  const formatButtonClassName = () => {
    return `w-full py-3.5 rounded-xl font-bold transition-colors ${
      isLoading ||
      !fromAmount ||
      !toAmount ||
      !address ||
      addressPosition === undefined ||
      addressPosition === "0x0000000000000000000000000000000000000000" ||
      Number(fromAmount) > Number(fromTokenBalance) / 10 ** fromToken.decimals
        ? "bg-blue-600/30 text-white shadow-md hover:shadow-lg cursor-not-allowed"
        : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-md hover:shadow-lg"
    }`;
  };

  return {
    // State
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    slippage,
    isMounted,
    lpAddress,
    lpAddressSelected,
    addressPosition,
    selectedCollateralToken,
    fromTokenBalance,
    toTokenBalance,
    userCollateral,
    priceExchangeRate,
    isLoading,
    error,
    
    // Setters
    setFromToken,
    setToToken,
    setFromAmount,
    setToAmount,
    setSlippage,
    setLpAddressSelected,
    
    // Functions
    tokenName,
    tokenLogo,
    switchTokens,
    formatExchangeRate,
    handleSwap,
    getButtonText,
    formatButtonClick,
    formatButtonClassName,
  };
};

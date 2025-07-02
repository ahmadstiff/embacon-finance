"use client";

import { getTokenInfo } from "@/lib/tokenUtils";
import { useReadSupplyLiquidity } from "@/hooks/read/useReadSupplyLiquidity";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import { useReadRate } from "@/hooks/read/useReadRate";
import { Address } from "viem";

interface RowPoolProps {
  collateralToken: string;
  borrowToken: string;
  ltv: string;
  lpAddress: string;
  
  borrowAddress: string;
  handleRowClick: (pool: {
    collateralToken: string;
    loanToken: string;
    ltv: string;
    liquidity: string;
    rate: string;
    lpAddress: string;
    borrowAddress: string;
  }) => void;
}

// Target chain ID, bisa kamu ubah kalau multi-chain
const TARGET_CHAIN_ID = 43113;

const RowPool = ({
  collateralToken,
  borrowToken,
  ltv,
  lpAddress,
  
  borrowAddress,
  handleRowClick,
}: RowPoolProps) => {
  const collateralInfo = getTokenInfo(collateralToken, TARGET_CHAIN_ID);
  const borrowInfo = getTokenInfo(borrowToken, TARGET_CHAIN_ID);

  const { supplyLiquidity } = useReadSupplyLiquidity({
    tokenAddress: borrowToken,
    chainId: TARGET_CHAIN_ID,
    lpAddress: lpAddress,
  });

  const convertLtv = (ltv: string) => {
    const ltvNumber = Number(ltv);
    return `${ltvNumber.toFixed(2)}%`;
  };

  const formatCurrency = (amount: number) => {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 5,
    }).format(amount);
    return formattedNumber;
  };

  const liquidityFormatted =
    typeof supplyLiquidity === "number"
      ? formatCurrency(supplyLiquidity)
      : supplyLiquidity;

  const { rate, isLoading: isLoadingRate } = useReadRate(lpAddress as Address);

  const formatRate = (rate: number) => {
    const percentage = 120 / 100;
    return (rate * percentage).toFixed(2);
  };

  return (
    <button
      className="w-full px-6 py-4 hover:bg-slate-700/50 transition-colors cursor-pointer text-left"
      onClick={() =>
        liquidityFormatted !== "70.00"
          ? handleRowClick({
              collateralToken: collateralInfo?.name ?? "",
              loanToken: borrowInfo?.name ?? "",
              ltv: convertLtv(ltv).toString(),
              liquidity: liquidityFormatted,
              rate: rate.toString(),
              lpAddress,
              borrowAddress,
            })
          : toast.error("There is no liquidity in this pool")
      }
    >
      <div className="grid grid-cols-5 gap-4 items-center justify-center text-center">
        {/* Collateral */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border border-blue-400/30 flex items-center justify-center">
            <Image
              src={collateralInfo?.logo ?? "/placeholder.png"}
              alt={collateralInfo?.name ?? "Unknown"}
              width={24}
              height={24}
            />
          </div>
          <div className="font-medium text-gray-100">
            {collateralInfo?.name ?? "Unknown"}
          </div>
        </div>

        {/* Borrow */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border border-blue-400/30 flex items-center justify-center">
            <Image
              src={borrowInfo?.logo ?? "/placeholder.png"}
              alt={borrowInfo?.name ?? "Unknown"}
              width={24}
              height={24}
            />
          </div>
          <div className="font-medium text-gray-100">
            {borrowInfo?.name ?? "Unknown"}
          </div>
        </div>

        {/* LTV */}
        <div className="text-emerald-400">{convertLtv(ltv)}</div>

        {/* Liquidity */}
        <div className="text-gray-100">
          {liquidityFormatted} ${borrowInfo?.name ?? ""}
        </div>

        <div className="text-blue-600">{isLoadingRate ? "Loading..." : formatRate(rate)}%</div>
      </div>
    </button>
  );
};

export default RowPool;

"use client";

import { getTokenInfo } from "@/lib/tokenUtils";
import { useReadSupplyLiquidity } from "@/hooks/read/useReadSupplyLiquidity";
import Image from "next/image";
import { toast } from "sonner";
import { useReadRate } from "@/hooks/read/useReadRate";
import type { Address } from "viem";
import { defaultChain } from "@/lib/get-default-chain";
import { Progress } from "@/components/ui/progress";
import { useReadTotalSupplyAssets } from "@/hooks/read/useReadTotalSupplyAssets";
import { useReadTotalBorrowAssets } from "@/hooks/read/useReadTotalBorrowAssets";

// Note: Table headers should be hidden on screens < 640px (sm) to avoid ambiguity with card layout
// Use: className="hidden sm:block" on your table header component

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

const RowPool = ({
  collateralToken,
  borrowToken,
  ltv,
  lpAddress,
  borrowAddress,
  handleRowClick,
}: RowPoolProps) => {
  const collateralInfo = getTokenInfo(collateralToken, defaultChain);
  const borrowInfo = getTokenInfo(borrowToken, defaultChain);

  const { supplyLiquidity } = useReadSupplyLiquidity({
    tokenAddress: borrowToken,
    chainId: defaultChain,
    lpAddress: lpAddress,
  });

  const convertLtv = (ltv: string) => {
    const ltvNumber = Number(ltv);
    return `${ltvNumber.toFixed(2)}%`;
  };

  const formatCurrency = (amount: number) => {
    const formattedNumber = new Intl.NumberFormat("en-US", {
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
    return (rate).toFixed(2);
  };
  const { data: totalSupplyAssets, isLoading: isLoadingTotalSupplyAssets } = useReadTotalSupplyAssets(lpAddress as Address);
  const { totalBorrowAssets, isLoadingTotalBorrowAssets } = useReadTotalBorrowAssets(lpAddress as Address);
  const utilizationRate = totalSupplyAssets && totalBorrowAssets ? (Number(totalBorrowAssets) / Number(totalSupplyAssets)) * 100 : 0;

  return (
    <button
      className="w-full p-3 sm:p-4 lg:px-6 lg:py-4 hover:bg-slate-700/50 transition-colors cursor-pointer text-left border-b border-blue-400/20"
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
      {/* Card Layout for Mobile (< 640px) */}
      <div className="block sm:hidden">
        <div className="bg-slate-800/30 rounded-lg p-4 border border-blue-400/20">
          {/* Header with token pair */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                <Image
                  src={collateralInfo?.logo ?? "/placeholder.png"}
                  alt={collateralInfo?.name ?? "Unknown"}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-100">
                  {collateralInfo?.name ?? "Unknown"}
                </div>
                <div className="text-xs text-gray-400">Collateral</div>
              </div>
            </div>

            <div className="text-gray-400 text-sm">→</div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                <Image
                  src={borrowInfo?.logo ?? "/placeholder.png"}
                  alt={borrowInfo?.name ?? "Unknown"}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-100">
                  {borrowInfo?.name ?? "Unknown"}
                </div>
                <div className="text-xs text-gray-400">Borrow</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">LTV</div>
              <div className="text-lg font-semibold text-emerald-400">
                {convertLtv(ltv)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Liquidity</div>
              <div className="text-sm font-medium text-gray-100">
                <div className="truncate">{liquidityFormatted}</div>
                <div className="text-xs text-gray-400">
                  {borrowInfo?.name ?? ""}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Rate</div>
              <div className="text-lg font-semibold text-blue-600">
                {isLoadingRate ? "..." : `${formatRate(rate)}%`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Layout for SM and above (>= 640px) */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-5 gap-4 items-center">
          {/* Collateral Column */}
          <div className="flex items-center justify-start gap-2 min-w-0 lg:ml-8">
            <div className="w-8 h-8 rounded-full border border-blue-400/30 flex items-center justify-center flex-shrink-0">
              <Image
                src={collateralInfo?.logo ?? "/placeholder.png"}
                alt={collateralInfo?.name ?? "Unknown"}
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <div className="font-medium text-gray-100 truncate text-sm lg:text-base">
              {collateralInfo?.name ?? "Unknown"}
            </div>
          </div>

          {/* Borrow Column */}
          <div className="flex items-center justify-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full border border-blue-400/30 flex items-center justify-center flex-shrink-0">
              <Image
                src={borrowInfo?.logo ?? "/placeholder.png"}
                alt={borrowInfo?.name ?? "Unknown"}
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <div className="font-medium text-gray-100 truncate text-sm lg:text-base">
              {borrowInfo?.name ?? "Unknown"}
            </div>
          </div>

          {/* LTV Column */}
          <div className="text-center">
            <div className="font-medium text-emerald-400 text-sm lg:text-base">
              {convertLtv(ltv)}
            </div>
          </div>

          {/* Liquidity Column */}
          <div className="text-center">
            <div className="font-medium text-gray-100 truncate text-sm lg:text-base flex flex-col gap-3">
              <div>
                {liquidityFormatted} ${borrowInfo?.name ?? ""}
              </div>
              <div>
                <Progress value={utilizationRate} className="w-full" />
                {isLoadingTotalSupplyAssets || isLoadingTotalBorrowAssets ? (
                  <p className="text-xs text-left opacity-50">
                    Utilization Rate ...
                  </p>
                ) : (
                  <p className="text-xs text-left opacity-50">
                    Utilization Rate {utilizationRate.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Rate Column */}
          <div className="text-center">
            <div className="font-medium text-blue-600 text-sm lg:text-base">
              {isLoadingRate ? "Loading..." : `${formatRate(rate)}%`}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default RowPool;

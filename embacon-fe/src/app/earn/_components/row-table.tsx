"use client";

import React from "react";
import DialogSupply from "./dialog-supply";
import DialogWithdraw from "./dialog-withdraw";
import Image from "next/image";
import { getTokenInfo } from "@/lib/tokenUtils";
import { useReadSupplyLiquidity } from "@/hooks/read/useReadSupplyLiquidity";
import { useReadAPY } from "@/hooks/read/useReadAPY";
import { Address } from "viem";
import { defaultChain } from "@/lib/get-default-chain";

interface RowTableProps {
  lpAddress: string;
  borrowToken: string;
  collateralToken: string;
}

const RowTable = ({
  lpAddress,
  borrowToken,
  collateralToken,
}: RowTableProps) => {
  const tokenData = getTokenInfo(borrowToken, defaultChain);
  const collateralData = getTokenInfo(collateralToken, defaultChain);

  const formatCurrency = (amount: number) => {
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 5,
    }).format(amount);
    return formattedNumber;
  };

  const { isLoading: isLoadingAPY, apy } = useReadAPY(lpAddress as Address);

  const { supplyLiquidity } = useReadSupplyLiquidity({
    tokenAddress: borrowToken,
    chainId: defaultChain,
    lpAddress: lpAddress,
  });

  const handleSupplySuccess = () => {};
  const handleWithdrawSuccess = () => {};

  if (!tokenData) {
    console.warn(
      `Token with address ${borrowToken} not found for chain ${defaultChain}`
    );
    return null;
  }

  const formatAPY = (apy: number) => {
    const percentage = 150 / 100;
    return (apy * percentage + 3).toFixed(2);
  };

  return (
    <tr className="border-b border-[#9EC6F3]">
      {/* Token Column */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center space-x-2">
          <Image
            src={tokenData.logo || "/placeholder.svg"}
            alt={tokenData.name}
            width={28}
            height={28}
            className="w-7 h-7 rounded-full"
          />
          <div className="font-medium text-gray-200">${tokenData.name}</div>
        </div>
      </td>

      {/* Supply Liquidity Column */}
      <td className="px-4 py-3 text-gray-200">
        <div className="font-medium max-w-[300px] truncate">
          {formatCurrency(Number(supplyLiquidity))} ${tokenData.name}
        </div>
      </td>

      {/* Collateral Column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-gray-200">
          <Image
            src={collateralData?.logo ?? "/placeholder.svg"}
            alt={collateralData?.name ?? "Unknown"}
            width={28}
            height={28}
            className="w-7 h-7 rounded-full"
          />
          <div className="font-medium">
            ${collateralData?.name ?? "Unknown"}
          </div>
        </div>
      </td>

      {/* APY Column */}
      <td className="px-4 py-3 text-left">
        <div className="font-medium text-green-500">
          {isLoadingAPY ? "Loading..." : `${formatAPY(apy)}%`}
        </div>
      </td>

      {/* Actions Column */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <DialogSupply
            borrowToken={borrowToken}
            onSuccess={handleSupplySuccess}
            lpAddress={lpAddress}
          />
          <DialogWithdraw
            lpAddress={lpAddress}
            onSuccess={handleWithdrawSuccess}
            borrowToken={borrowToken}
          />
        </div>
      </td>
    </tr>
  );
};

export default RowTable;

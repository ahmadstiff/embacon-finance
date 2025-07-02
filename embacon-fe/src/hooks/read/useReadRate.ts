import { poolAbi } from "@/lib/abis/poolAbi";
import { Address } from "viem";
import { useReadContract } from "wagmi";

export const useReadRate = (lpAddress: Address) => {
  const {
    data: totalBorrowShares,
    isLoading,
    error,
  } = useReadContract({
    address: lpAddress,
    abi: poolAbi,
    functionName: "totalBorrowShares",
  });

  const {
    data: totalBorrowAssets,
    isLoading: isLoadingTotalBorrowAssets,
    error: errorTotalBorrowAssets,
  } = useReadContract({
    address: lpAddress,
    abi: poolAbi,
    functionName: "totalBorrowAssets",
  });

  const rate =
    totalBorrowAssets && totalBorrowShares
      ? (100 - (Number(totalBorrowShares) / Number(totalBorrowAssets)) * 100) *
        365
      : 0;

  return {
    totalBorrowShares,
    totalBorrowAssets,
    isLoading,
    error,
    isLoadingTotalBorrowAssets,
    errorTotalBorrowAssets,
    rate,
  };
};

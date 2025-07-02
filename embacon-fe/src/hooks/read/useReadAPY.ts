import { poolAbi } from "@/lib/abis/poolAbi";
import { Address } from "viem";
import { useReadContract } from "wagmi";

export const useReadAPY = (lpAddress: Address) => {
  const {
    data: totalSupplyShares,
    isLoading,
    error,
  } = useReadContract({
    address: lpAddress,
    abi: poolAbi,
    functionName: "totalSupplyShares",
  });

  const {
    data: totalSupplyAssets,
    isLoading: isLoadingTotalSupplyAssets,
    error: errorTotalSupplyAssets,
  } = useReadContract({
    address: lpAddress,
    abi: poolAbi,
    functionName: "totalSupplyAssets",
  });

  const apy =
    totalSupplyAssets && totalSupplyShares
      ? (100 - (Number(totalSupplyShares) / Number(totalSupplyAssets)) * 100) *
        365
      : 0;

  return {
    totalSupplyShares,
    totalSupplyAssets,
    isLoading,
    error,
    isLoadingTotalSupplyAssets,
    errorTotalSupplyAssets,
    apy,
  };
};

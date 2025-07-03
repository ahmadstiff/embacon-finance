import { useReadContract } from "wagmi";
import { poolAbi } from "@/lib/abis/poolAbi";
import { Address } from "viem";

export const useReadTotalSupplyAssets = (lpAddress: Address) => {
  const { data, isLoading } = useReadContract({
    address: lpAddress as `0x${string}`,
    abi: poolAbi,
    functionName: "totalSupplyAssets",
  });
  return { data, isLoading };
};
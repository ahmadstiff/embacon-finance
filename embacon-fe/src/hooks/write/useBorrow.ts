import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { toast } from "sonner";
import { poolAbi } from "@/lib/abis/poolAbi";
import { useAccount } from "wagmi";
import { chains } from "@/constants/chain-address";
import { defaultChain } from "@/lib/get-default-chain";

export function useBorrow(
  destinationChainId: number,
  amount: string,
  lpAddress: string,
  decimal: number
) {
  const {
    data: borrowHash,
    isPending: isBorrowPending,
    writeContract: borrowTransaction,
    error: borrowError,
  } = useWriteContract();

  const {
    isLoading: isBorrowLoading,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: borrowHash,
  });

  const handleBorrow = async () => {
    try {
      if (!amount || Number.parseFloat(amount) <= 0) {
        toast.error("Please enter a valid borrow amount");
        return;
      }

      const parsedAmount = parseUnits(amount, decimal);

      const destination = chains.find(
        (c) => c.id === destinationChainId
      )?.destination;

      await borrowTransaction({
        address: lpAddress as `0x${string}`,
        abi: poolAbi,
        functionName: "borrowDebt",
        args: [parsedAmount, BigInt(defaultChain), Number(destination)],
      });
    } catch (error: any) {
      toast.error(error?.message || "Borrow transaction failed");
    }
  };

  const isProcessing = isBorrowPending || isBorrowLoading;

  return {
    handleBorrow,
    isProcessing,
    borrowHash,
    isSuccess,
  };
}

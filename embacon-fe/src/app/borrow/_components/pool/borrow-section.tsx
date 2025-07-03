import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { History, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
import ChainSelectorButton from "@/components/dialog/borrow/chain-selector-button";
import AmountInput from "@/components/dialog/borrow/amount-input";
import TransactionSuccessDialog from "@/components/dialog/borrow/transaction-success-dialog";
import BorrowHistoryDialog from "@/components/dialog/borrow/borrow-history-dialog";
import { useBorrow } from "@/hooks/write/useBorrow";
import { tokens } from "@/constants/token-address";
import { saveBorrowToHistory } from "@/utils/borrow-history";
import { defaultChain } from "@/lib/get-default-chain";
import { Card } from "@/components/ui/card";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { useAccount } from "wagmi";

interface BorrowSectionProps {
  onTransactionSuccess?: () => void;
  collateralToken: string;
  loanToken: string;
  lpAddress: string;
}

const BorrowSection = ({
  onTransactionSuccess,
  collateralToken,
  loanToken,
  lpAddress,
}: BorrowSectionProps) => {
  const [fromChain, setFromChain] = useState(defaultChain);
  const [toChain, setToChain] = useState(defaultChain);
  const [amount, setAmount] = useState("");
  const [txCompleted, setTxCompleted] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const decimal = tokens.find((token) => token.name === loanToken)?.decimals;

  const { handleBorrow, isProcessing, isSuccess, borrowHash } = useBorrow(
    Number(toChain),
    amount,
    lpAddress,
    Number(decimal)
  );

  const { address } = useAccount();
  const { createTransaction } = useTransactionHistory(address || "");

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && borrowHash && address) {
      setTxCompleted(true);

      // Index ke DB (POST) dengan error handling
      (async () => {
        try {
          const res = await createTransaction({
            user_address: address,
            collateral_token: collateralToken,
            collateral_chain: fromChain.toString(),
            borrow_token: loanToken,
            borrow_chain: toChain.toString(),
            borrow_amount: amount,
            gas_fee_estimate: "0", // default, ganti jika ada estimasi
            collateral_price: "0", // default, ganti jika ada harga
            borrow_price: "0", // default, ganti jika ada harga
            ltv_ratio: "0", // default, ganti jika ada ltv
            status: Number(toChain) === defaultChain ? "completed" : "pending",
            tx_hash: borrowHash,
            error_message: "",
          });
          console.log("[createTransaction] response:", res);
          if (res && res.id) {
            toast.success("Transaction indexed to DB!");
          } else {
            toast.error("Failed to index transaction to DB");
          }
        } catch (err: any) {
          console.error("[createTransaction] error:", err);
          toast.error("Error indexing transaction: " + (err?.message || err));
        }
      })();

      // Show success toast
      if (Number(toChain) === defaultChain) {
        // Onchain success - show success toast
        toast.success(
          "Transaction successful! Your borrow has been completed on Arbitrum Sepolia."
        );
      } else if (Number(toChain) === 11155111) {
        // Ethereum - show 1 hour estimation toast
        toast.info(
          "Transaction submitted successfully! Estimated completion time: 1 hour for Ethereum processing."
        );
      } else {
        // Other crosschain - show 5 minutes estimation toast
        toast.info(
          "Transaction submitted successfully! Estimated completion time: 5 minutes for cross-chain processing."
        );
      }

      // Open the success dialog
      setShowSuccessDialog(true);

      // Call success callback if provided
      if (onTransactionSuccess) {
        onTransactionSuccess();
      }
    }
  }, [
    isSuccess,
    borrowHash,
    collateralToken,
    loanToken,
    amount,
    toChain,
    onTransactionSuccess,
    address,
    fromChain,
    createTransaction,
  ]);

  let buttonText = `Borrow ${loanToken}`;
  if (isProcessing) {
    buttonText = "Processing...";
  } else if (txCompleted) {
    buttonText = "Completed";
  }
  const estimatedReceive = Number(amount) - Number(amount) * 0.0001;
  return (
    <>
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Borrow {loanToken}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistoryDialog(true)}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            History
          </Button>
        </div>

        <ChainSelectorButton
          fromChain={Number(fromChain)}
          toChain={Number(toChain)}
          setFromChain={setFromChain}
          setToChain={setToChain}
        />
        <AmountInput token={loanToken} value={amount} onChange={setAmount} />
      </div>
      <Card className="px-4 py-2 mb-2 shadow-md ">
        <div className="flex items-center gap-1">
          <span className="text-base font-semibold text-[#01ECBE] flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#01ECBE]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
            Borrow Information
          </span>
        </div>
        <div className="text-sm flex items-center gap-2">
          <span className="text-gray-300">Estimated Receive:</span>
          <span className="text-gray-300 font-sm px-1 py-1 ">
            {estimatedReceive}
          </span>
        </div>
      </Card>
      <DialogFooter>
        <Button
          onClick={handleBorrow}
          className="w-full bg-gradient-to-r from-[#141beb] to-[#01ECBE] hover:from-[#01ECBE] hover:to-[#141beb] text-white font-medium shadow-md hover:shadow-lg transition-colors duration-300 rounded-lg cursor-pointer"
          disabled={isProcessing || txCompleted || !amount}
        >
          {buttonText}
          {isProcessing && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        </Button>
      </DialogFooter>

      <TransactionSuccessDialog
        isOpen={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        transactionHash={borrowHash || ""}
        destinationChainId={Number(toChain)}
        fromToken={collateralToken}
        toToken={loanToken}
        amount={amount}
      />

      <BorrowHistoryDialog
        isOpen={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
      />
    </>
  );
};

export default BorrowSection;

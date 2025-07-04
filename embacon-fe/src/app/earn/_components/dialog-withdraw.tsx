"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCopy,
  DollarSign,
  ExternalLink,
  Loader2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAccount, useChainId } from "wagmi";
import { useReadUserShares } from "@/hooks/read/useReadUserShares";
import { useWithdrawLiquidity } from "@/hooks/write/useWithdrawLiquidity";
import { chains } from "@/constants/chain-address";
import { getTokenInfo } from "@/lib/tokenUtils";

export default function DialogWithdraw({
  lpAddress,
  onSuccess,
  borrowToken,
}: {
  lpAddress?: string;
  onSuccess?: () => void;
  borrowToken?: string;
}) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { userSupplySharesAmountParsed, sharesLoading, sharesError } =
    useReadUserShares(lpAddress);
  const {
    withdraw,
    txHash,
    isWritePending,
    isReceiptLoading,
    isReceiptSuccess,
    error: withdrawError,
    reset,
  } = useWithdrawLiquidity(lpAddress, borrowToken);

  /* ── UI state ─────────────────────────────────────────────────────────── */
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [inputError, setInputError] = useState("");

  const explorer = chains.find((c) => c.id === chainId)?.contracts
    .blockExplorer;
  const maxBalance = userSupplySharesAmountParsed ?? 0;

  const tokenInfo = getTokenInfo(borrowToken ?? "", chainId);
  const tokenSymbol = tokenInfo?.symbol ?? "";

  const validateAmount = (value: string): string => {
    const numValue = Number.parseFloat(value);
    if (numValue > maxBalance) return "Insufficient balance";
    return "";
  };

  const handleAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setInputError(validateAmount(value));
    }
  };

  const handleMaxClick = () => {
    const maxAmount = String(maxBalance);
    setAmount(maxAmount);
    setInputError(validateAmount(maxAmount));
  };

  const handleWithdraw = () => {
    const error = validateAmount(amount);
    if (error) {
      setInputError(error);
      toast.error(error);
      return;
    }

    try {
      const bigintAmount = parseUnits(amount, 6);
      withdraw({ amount: bigintAmount });
    } catch {
      toast.error("Invalid amount format");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setAmount("");
    setInputError("");
    reset();
  };

  const copyTxHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      toast.success("Transaction hash copied!");
    }
  };

  const isAmountValid = amount && !inputError && Number.parseFloat(amount) > 0;
  const isProcessing = isWritePending || isReceiptLoading;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            if (!address) {
              toast.error("Please connect your wallet first");
              return;
            }
            setIsOpen(true);
          }}
          className="bg-gradient-to-l from-indigo-400 to-blue-600 hover:bg-gradient-to-r hover:from-indigo-400 hover:to-blue-600 text-white shadow-md hover:shadow-lg cursor-pointer"
        >
          Withdraw
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-slate-800 border-0 shadow-xl rounded-xl">
        <DialogHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-500" />
            <DialogTitle className="text-xl font-bold text-gray-200">
             Withdraw {tokenSymbol}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Success State */}
        {isReceiptSuccess ? (
          <div className="text-center space-y-4 py-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <p className="text-slate-600">
              Your {amount} {tokenSymbol} has been withdrawn successfully.
            </p>
            {txHash && (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Transaction:</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`${explorer}/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1"
                      >
                        View on Explorer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyTxHash}
                        className="h-6 w-6 p-0"
                      >
                        <ClipboardCopy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Button
              onClick={handleClose}
              className="w-full h-12 text-base font-medium rounded-lg bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-600 hover:to-indigo-500 text-white shadow-md hover:shadow-lg"
            >
              Close
            </Button>
          </div>
        ) : (
          /* Input State */
          <>
            <div className="space-y-6 py-4">
              <Card className="border shadow-sm">
                <CardContent className="px-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-300">
                      Withdrawal Amount
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 py-2 rounded-lg ">
                    <Input
                      placeholder={`Enter amount of ${tokenSymbol}`}
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      disabled={isProcessing}
                      className={`border ${amount ? "border-blue-500" : "border-slate-200"} bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium`}
                    />
                    <div className="flex items-center gap-1 bg-blue-600 px-3 py-1 rounded-md">
                      <DollarSign className="h-4 w-4 text-gray-200" />
                      <span className="font-semibold text-gray-200 read-only:not-only:">{tokenSymbol}</span>
                    </div>
                  </div>

                  {inputError && (
                    <div className="flex items-center gap-1 text-sm text-red-500 mt-2">
                      <AlertCircle className="h-3 w-3" />
                      {inputError}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs px-1 mt-2">
                    <span className="text-gray-400">Available Balance:</span>
                    <div className="flex items-center gap-2 mt-1">
                      {sharesLoading ? (
                        <div className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-gray-600">Loading...</span>
                        </div>
                      ) : sharesError ? (
                        <span className="text-red-500">Error</span>
                      ) : (
                        <>
                          <span className="text-gray-600">{maxBalance}</span>
                          <button
                            onClick={handleMaxClick}
                            disabled={maxBalance === 0 || isProcessing}
                            className="text-xs px-2 p-0.5 border border-blue-500 rounded-sm text-blue-500 hover:bg-blue-500 hover:text-gray-200 cursor-pointer duration-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Max
                          </button>
                        </> 
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {withdrawError && (
                <Card className="border border-red-200 bg-red-50 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        {withdrawError.message || "Withdrawal failed"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction Hash */}
              {txHash && !isReceiptSuccess && (
                <Card className="border border-slate-200 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Transaction:</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`${explorer}/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1"
                        >
                          {txHash.slice(0, 6)}...{txHash.slice(-4)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={copyTxHash}
                          className="h-6 w-6 p-0"
                        >
                          <ClipboardCopy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleWithdraw}
                disabled={!isAmountValid || isProcessing || sharesLoading}
                className={`w-full h-12 text-base font-medium rounded-lg ${
                  !isAmountValid || isProcessing || sharesLoading
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-blue-700 text-gray-200 hover:bg-blue-600 hover:text-gray-200 shadow-md hover:shadow-lg"
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>
                      {isWritePending
                        ? "Confirm in Wallet..."
                        : "Processing Transaction..."}
                    </span>
                  </div>
                ) : (
                  <span>Withdraw {tokenSymbol}</span>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

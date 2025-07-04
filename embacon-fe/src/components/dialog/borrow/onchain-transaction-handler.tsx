"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { TransactionHandlerProps } from "@/types/type";
import {
  TransactionProgressModal,
  type TransactionStep,
} from "@/components/transaction-progress";
import { toast } from "sonner";
import { poolAbi } from "@/lib/abis/poolAbi";
import { parseUnits } from "viem";
import { tokens } from "@/constants/token-address";

export default function useOnChainTransactionHandler({
  amount,
  token,
  fromChain,
  toChain,
  recipientAddress,
  lpAddress,
  onSuccess,
  onLoading,
}: TransactionHandlerProps) {
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionSteps, setTransactionSteps] = useState<TransactionStep[]>([]);
  const [txInProgress, setTxInProgress] = useState(false);
  
  // Use refs to track already-handled states to prevent repeated effect triggers
  const successHandled = useRef(false);
  const errorHandled = useRef(false);
  const onSuccessCalled = useRef(false);

  // For on-chain transactions
  const {
    data: borrowHash,
    isPending: isBorrowPending,
    writeContract: borrowTransaction,
    status: writeStatus,
    error: writeError,
  } = useWriteContract();

  const { 
    isLoading: isBorrowLoading, 
    isSuccess: isBorrowSuccess,
    status: txStatus,
  } = useWaitForTransactionReceipt({
    hash: borrowHash,
  });

  // Helper function to update a step's status
  const updateStepStatus = (
    stepId: string,
    status: "pending" | "loading" | "completed" | "error",
    txHash?: string
  ) => {
    setTransactionSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? { ...step, status, ...(txHash ? { txHash } : {}) }
          : step
      )
    );
  };

  // Helper to call onSuccess only once
  const completeTransaction = () => {
    if (!onSuccessCalled.current) {
      onSuccessCalled.current = true;
      setTxInProgress(false);
      onLoading(false);
      
      // Slightly delay the onSuccess call to avoid state conflicts
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 100);
    }
  };

  // Reset refs when transaction starts
  useEffect(() => {
    if (txInProgress) {
      successHandled.current = false;
      errorHandled.current = false;
      onSuccessCalled.current = false;
    }
  }, [txInProgress]);

  // Effect to track transaction status changes
  useEffect(() => {
    if (!txInProgress) return;

    // When we get a hash from the write contract operation
    if (borrowHash && writeStatus === 'success' && transactionSteps.some(step => step.id === "initiate" && step.status === "loading")) {
      updateStepStatus("initiate", "completed", borrowHash);
      updateStepStatus("process", "loading");
    }

    // When transaction is confirmed
    if (borrowHash && txStatus === 'success' && isBorrowSuccess && !successHandled.current) {
      successHandled.current = true; // Mark as handled to prevent repeated execution
      
      updateStepStatus("process", "completed", borrowHash);
      updateStepStatus("completion", "loading");
      
      // Use timeout to allow UI to update before completing the sequence
      setTimeout(() => {
        updateStepStatus("completion", "completed");
        
        // Display success message
        toast.success(`Successfully borrowed ${amount} ${token} on ${fromChain.name}`, {
          style: {
            background: 'rgba(34, 197, 94, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#86efac',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
          }
        });
        
        // Close the modal after success
        setTimeout(() => {
          setIsModalOpen(false);
          
          // Complete transaction after dialog closes
          setTimeout(() => {
            completeTransaction();
          }, 500);
        }, 2000);
      }, 1000);
    }

    // Handle errors - use ref to prevent multiple error handling
    if (writeError && !errorHandled.current) {
      errorHandled.current = true; // Mark as handled
      console.error("Transaction write error:", writeError);
      toast.error(`Transaction failed: ${writeError.message}`, {
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
        }
      });
      
      setTransactionSteps((prev) =>
        prev.map((step) =>
          step.status === "loading" ? { ...step, status: "error" } : step
        )
      );
      setTxInProgress(false);
      onLoading(false); // Reset loading state on error
    }
  }, [borrowHash, isBorrowSuccess, writeStatus, txStatus, writeError, txInProgress, amount, token, fromChain.name, onSuccess, onLoading, transactionSteps]);

  // Cleanup function when component unmounts
  useEffect(() => {
    return () => {
      // Ensure we reset any callbacks if component unmounts during transaction
      if (txInProgress) {
        setTxInProgress(false);
        onLoading(false);
      }
    };
  }, [txInProgress, onLoading]);

  const handleTransaction = async () => {
    try {
      // Validation checks
      if (!amount || Number.parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount to borrow.", {
          style: {
            background: 'rgba(239, 68, 68, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
          }
        });
        return;
      }

      if (!address) {
        toast.error("Please connect your wallet before proceeding.", {
          style: {
            background: 'rgba(239, 68, 68, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
          }
        });
        return;
      }

      // For on-chain transactions, we use the wallet address as recipient if not specified
      const recipient = recipientAddress || address;

      // Reset transaction state
      successHandled.current = false;
      errorHandled.current = false;
      onSuccessCalled.current = false;
      
      onLoading(true);
      setTxInProgress(true);

      // Simplified steps for on-chain transaction
      const initialSteps: TransactionStep[] = [
        {
          id: "initiate",
          title: `Initiating borrow transaction on ${fromChain.name}`,
          status: "pending",
        },
        {
          id: "process",
          title: `Processing on-chain borrow transaction...`,
          status: "pending",
        },
        {
          id: "completion",
          title: `Finalizing transaction...`,
          status: "pending",
        },
      ];

      setTransactionSteps(initialSteps);
      setIsModalOpen(true);

      // Update first step to loading state
      updateStepStatus("initiate", "loading");
      const decimal = tokens.find((option) => option.name === token)?.decimals;
      const parsedAmount = parseUnits(amount, decimal ?? 6);


      // Execute the borrowByPosition function from the lending pool
      // borrowTransaction({
      //   address: lpAddress as `0x${string}`,
      //   abi: poolAbi,
      //   functionName: "borrowDebt",
      //   args: [parsedAmount, false],
      // });

      // Note: The rest of the transaction flow is handled by the useEffect above
      // which tracks the transaction status changes

    } catch (error) {
      if (!errorHandled.current) {
        errorHandled.current = true;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        // Update steps to show error
        setTransactionSteps((prev) =>
          prev.map((step) =>
            step.status === "loading" ? { ...step, status: "error" } : step
          )
        );

        console.error("Transaction failed:", errorMessage);
        toast.error(`Transaction failed: ${errorMessage}`, {
          style: {
            background: 'rgba(239, 68, 68, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
          }
        });
        setTxInProgress(false);
        onLoading(false);
      }
    }
  };

  const closeModal = () => {
    if (!txInProgress) {
      setIsModalOpen(false);
    } else {
      toast.warning("Please wait for the transaction to complete", {
        style: {
          background: 'rgba(245, 158, 11, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#fcd34d',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.1)'
        }
      });
    }
  };

  const isProcessing = isBorrowPending || isBorrowLoading || txInProgress;

  return {
    handleTransaction,
    isProcessing,
    TransactionProgress: (
      <TransactionProgressModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Embacon Finance On-Chain Borrow Progress"
        steps={transactionSteps}
        fromChain={fromChain.name}
        toChain={toChain.name}
        amount={amount}
        token={token}
      />
    ),
  };
} 
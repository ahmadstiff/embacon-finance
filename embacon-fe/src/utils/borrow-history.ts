import { defaultChain } from "@/lib/get-default-chain";

interface BorrowHistoryItem {
  id: string;
  transactionHash: string;
  fromToken: string;
  toToken: string;
  amount: string;
  timestamp: number;
  destinationChainId: number;
  status: "pending" | "completed";
}

export const saveBorrowToHistory = (
  transactionHash: string,
  fromToken: string,
  toToken: string,
  amount: string,
  destinationChainId: number
) => {
  const isArbitrumSepolia = destinationChainId === defaultChain;

  const historyItem: BorrowHistoryItem = {
    id: `${transactionHash}-${Date.now()}`,
    transactionHash,
    fromToken,
    toToken,
    amount,
    timestamp: Date.now(),
    destinationChainId,
    status: isArbitrumSepolia ? "completed" : "pending",
  };

  const existingHistory = localStorage.getItem("borrowHistory");
  const history: BorrowHistoryItem[] = existingHistory
    ? JSON.parse(existingHistory)
    : [];

  history.push(historyItem);
  localStorage.setItem("borrowHistory", JSON.stringify(history));
};

export const getBorrowHistory = (): BorrowHistoryItem[] => {
  const savedHistory = localStorage.getItem("borrowHistory");
  if (!savedHistory) return [];

  const parsedHistory: BorrowHistoryItem[] = JSON.parse(savedHistory);

  // Update status based on chain and timestamp
  return parsedHistory.map((item) => {
    if (item.destinationChainId === defaultChain) {
      return {
        ...item,
        status: "completed" as const,
      };
    }

    // For Ethereum (11155111), use 1-hour timer (3600000ms)
    if (item.destinationChainId === 11155111) {
      return {
        ...item,
        status:
          Date.now() - item.timestamp > 3600000
            ? ("completed" as const)
            : ("pending" as const),
      };
    }

    // For other chains, use 5-minute timer (300000ms)
    return {
      ...item,
      status:
        Date.now() - item.timestamp > 300000
          ? ("completed" as const)
          : ("pending" as const),
    };
  });
};

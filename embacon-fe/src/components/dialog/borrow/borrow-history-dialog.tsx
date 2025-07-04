import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, ExternalLink } from "lucide-react";
import { defaultChain } from "@/lib/get-default-chain";
import { useAccount } from "wagmi";

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

interface BorrowHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const BorrowHistoryDialog: React.FC<BorrowHistoryDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { address } = useAccount();
  const [historyItems, setHistoryItems] = useState<BorrowHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch history from DB
  const loadHistory = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/transaction-history?user_address=${address}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      let dbHistory = await res.json();

      // Mapping field dari DB ke struktur yang dipakai komponen
      const mappedHistory = dbHistory.map((item: Record<string, any>) => ({
        id: item.id,
        transactionHash: item.tx_hash,
        fromToken: item.collateral_token,
        toToken: item.borrow_token,
        amount: item.borrow_amount,
        timestamp: item.created_at, // ISO string
        destinationChainId: Number(item.borrow_chain),
        status: item.status === "completed" ? "completed" : "pending",
      }));

      // Update status jika perlu (logic lama, tapi pakai mappedHistory)
      const now = Date.now();
      const updatedHistory = await Promise.all(mappedHistory.map(async (item: any) => {
        let status = item.status;
        let shouldUpdate = false;
        if (item.destinationChainId === defaultChain) {
          status = "completed";
        } else if (item.destinationChainId === 11155111) {
          if (now - (typeof item.timestamp === "string" ? Date.parse(item.timestamp) : item.timestamp) > 3600000) {
            status = "completed";
          } else {
            status = "pending";
          }
        } else {
          if (now - (typeof item.timestamp === "string" ? Date.parse(item.timestamp) : item.timestamp) > 300000) {
            status = "completed";
          } else {
            status = "pending";
          }
        }
        if (status !== item.status) {
          shouldUpdate = true;
        }
        // Update status in DB if needed
        if (shouldUpdate) {
          await fetch(`/api/transaction-history/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
        }
        return { ...item, status };
      }));
      setHistoryItems(updatedHistory);
    } catch (e) {
      setHistoryItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, address]);

  // Auto-refresh every 30 seconds to update remaining time
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      loadHistory();
    }, 30000);
    return () => clearInterval(interval);
  }, [isOpen, address]);

  const getExplorerUrl = (transactionHash: string, chainId: number) => {
    if (chainId === defaultChain) {
      return `https://sepolia.arbiscan.io/tx/${transactionHash}`;
    }
    return `https://ccip.chain.link/tx/${transactionHash}`;
  };

  const formatDate = (timestamp: number | string) => {
    const ts = typeof timestamp === "string" ? Date.parse(timestamp) : timestamp;
    if (!ts || isNaN(ts)) return "-";
    return new Date(ts).toLocaleString();
  };

  const getChainName = (chainId: number | string | undefined) => {
    if (!chainId || chainId === "" || chainId === null) return "-";
    const cid = typeof chainId === "string" ? Number(chainId) : chainId;
    if (cid === defaultChain) return "Arbitrum Sepolia";
    if (cid === 11155111) return "Ethereum";
    if (cid === 43113) return "Avalance Fuji";
    if (cid === 84532) return "Base";
    return `Chain ${cid}`;
  };

  const getEstimationText = (chainId: number) => {
    if (chainId === defaultChain) return null; // No estimation for Avalanche Fuji (onchain)
    if (chainId === 11155111) return "1 hour"; // Ethereum
    return "5 minutes"; // Other chains (Arbitrum, Base, etc.)
  };

  const getRemainingTime = (item: BorrowHistoryItem) => {
    let ts = typeof item.timestamp === "string" ? Date.parse(item.timestamp) : item.timestamp;
    if (!ts || isNaN(ts)) return null;
    if (
      item.status === "completed" ||
      item.destinationChainId === defaultChain
    ) {
      return null;
    }

    const elapsed = Date.now() - ts;
    let totalTime: number;

    if (item.destinationChainId === 11155111) {
      totalTime = 3600000; // 1 hour for Ethereum
    } else {
      totalTime = 300000; // 5 minutes for other chains
    }

    const remaining = totalTime - elapsed;
    if (remaining <= 0) return null;

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    if (item.destinationChainId === 11155111) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (hours > 0) {
        return `${hours}h ${remainingMinutes}m remaining`;
      } else {
        return `${minutes}m ${seconds}s remaining`;
      }
    } else {
      return `${minutes}m ${seconds}s remaining`;
    }
  };

  const openExplorer = (transactionHash: string, chainId: number) => {
    window.open(getExplorerUrl(transactionHash, chainId), "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-full overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Borrow History
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No borrow history found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{item.fromToken}</span>
                        <span>→</span>
                        <span className="font-medium">{item.toToken}</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {item.amount} {item.toToken}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge
                        variant={
                          item.status === "completed" ? "default" : "secondary"
                        }
                        className={
                          item.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {item.status === "completed"
                          ? "Completed"
                          : "Processing"}
                      </Badge>
                      {/* Chain name */}
                      <div className="text-xs text-gray-500">
                        {getChainName(item.destinationChainId)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>{formatDate(item.timestamp)}</div>
                    
                    {item.destinationChainId !== defaultChain && (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">
                          Estimated:{" "}
                          {getEstimationText(item.destinationChainId)}
                        </span>
                        {item.status === "pending" &&
                          getRemainingTime(item) && (
                            <span className="text-orange-600 font-medium">
                              ({getRemainingTime(item)})
                            </span>
                          )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-600 font-mono hover:text-blue-600 truncate flex-1">
                      {item.transactionHash}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openExplorer(
                          item.transactionHash,
                          item.destinationChainId
                        )
                      }
                      className="h-6 px-2"
                    >
                      <ExternalLink className="w-3 h-3 hover:text-blue-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BorrowHistoryDialog;

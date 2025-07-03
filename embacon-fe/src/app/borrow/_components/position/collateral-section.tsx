"use client";

import { CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowBigLeftDash, ArrowRight, CircleDollarSign } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";
import { getTokenInfo } from "@/lib/tokenUtils";
import { defaultChain } from "@/lib/get-default-chain";

interface LpData {
  id: string;
  lpAddress: string;
  collateralToken: string;
  borrowToken: string;
}

interface CollateralSectionProps {
  lpAddress: string;
  setLpAddress: (value: string) => void;
  lpData: LpData[];
}

const CollateralSection = ({
  lpAddress,
  setLpAddress,
  lpData,
}: CollateralSectionProps) => {
  const handleLpChange = (value: string) => {
    setLpAddress(value);
  };

  return (
    <div className="flex items-center gap-2 py-2">
      <CircleDollarSign className="h-5 w-5 text-blue-400" />
      <CardTitle className="text-xl text-gray-100 w-full">
        <div className="flex items-center gap-1">
          <div>Lending Pool</div>
          <div className="flex items-center gap-2 ml-4">
            <Select value={lpAddress} onValueChange={handleLpChange}>
              <SelectTrigger className="w-full text-white border border-blue-400/30 hover:border-blue-400/50 focus:ring-2 focus:ring-blue-400/50 rounded-lg shadow-sm cursor-pointer bg-slate-800/50">
                <SelectValue placeholder="Select Lending Pool" />
              </SelectTrigger>
              <SelectContent className="border border-blue-400/30 rounded-lg shadow-md bg-slate-800 text-white">
                <SelectGroup>
                  <SelectLabel className="text-blue-300 font-semibold px-3 pt-2">
                    Collateral Token
                  </SelectLabel>
                  {lpData.map((lp) => {
                    const collateral = getTokenInfo(
                      lp.collateralToken,
                      defaultChain
                    );
                    const borrow = getTokenInfo(lp.borrowToken, defaultChain);

                    return (

                      <SelectItem
                        key={lp.id}
                        value={String(lp.lpAddress)}
                        className="cursor-pointer px-3 py-2 text-sm text-gray-100 hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                      >
                        <div className=""></div>
                        <Image
                          src={collateral?.logo ?? "/placeholder.png"}
                          alt={collateral?.name ?? "Unknown"}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        <ArrowRight />
                        <Image
                          src={borrow?.logo ?? "/placeholder.png"}
                          alt={borrow?.name ?? "Unknown"}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardTitle>
    </div>
  );
};

export default CollateralSection;

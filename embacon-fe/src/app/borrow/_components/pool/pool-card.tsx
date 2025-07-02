import { Card } from "@/components/ui/card";
import React from "react";
import PoolHeader from "./pool-header";
import PoolList from "./pool-list";
const PoolCard = () => {
  return (
    <Card className="shadow-xl border overflow-hidden bg-slate-800/50 border-blue-400/30">
      <PoolHeader />
      <PoolList />
    </Card>
  );
};

export default PoolCard;

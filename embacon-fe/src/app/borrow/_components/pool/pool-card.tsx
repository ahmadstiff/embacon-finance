import { Card } from "@/components/ui/card";
import React from "react";
import PoolHeader from "./pool-header";
import PoolList from "./pool-list";
const PoolCard = () => {
  return (
    <Card className="shadow-xl border overflow-hidden">
      <PoolHeader />
      <PoolList />
    </Card>
  );
};

export default PoolCard;

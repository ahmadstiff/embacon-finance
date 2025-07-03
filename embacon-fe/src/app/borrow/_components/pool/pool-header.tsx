import { CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

const PoolHeader = () => {
  return (
    <CardHeader className="">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold text-gray-100">
            Available Pools
          </CardTitle>
        </div>
      </div>
    </CardHeader>
  );
};

export default PoolHeader;

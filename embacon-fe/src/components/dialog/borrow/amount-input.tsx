"use client";

import { Input } from "@/components/ui/input";
import { tokens } from "@/constants/token-address";

interface AmountInputProps {
  token: string;
  value: string;
  onChange: (value: string) => void;
}

export default function AmountInput({
  token,
  value,
  onChange,
}: AmountInputProps) {

  const tokenImage = tokens.find(
    (option) => option.name === token
  )?.logo;

  return (
    <div>
      <div className="flex justify-between mb-2">
        <p className="text-sm text-gray-600">Token</p>
        <p className="text-sm text-gray-600">Amount</p>
      </div>
      <div className="flex gap-4">
        <div className="w-1/2 border rounded-lg p-1 flex">
          <div className="flex items-center gap-2 ml-1">
            <img src={tokenImage} alt={token} className="size-5" />
          </div>
          <div className="flex items-center">
            <span className="font-medium ml-2">{token}</span>
          </div>
        </div>
        <div className="w-1/2 border rounded-lg">
          <div>
            <Input
              type="text"
              placeholder="0.00"
              value={value}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^\d.]/g, '');
            
                const parts = numericValue.split('.');
                const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
                onChange(formattedValue);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

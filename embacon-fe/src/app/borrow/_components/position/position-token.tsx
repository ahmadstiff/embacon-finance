import { Button } from "@/components/ui/button";
import Link from "next/link";
import { type Address } from "viem";
import { RepaySelectedToken } from "./repay-selected-token";
import { tokens } from "@/constants/token-address";
import { ArrowRightLeft } from "lucide-react";
import Image from "next/image";
import { useReadPositionBalance } from "@/hooks/read/useReadPositionBalance";
import { useReadBorrowToken } from "@/hooks/read/useReadBorrowToken";
import { useReadCollateralToken } from "@/hooks/read/useReadCollateralToken";
import { defaultChain } from "@/lib/get-default-chain";

interface PositionTokenProps {
  name: string | undefined;
  address: Address;
  decimal: number;
  addressPosition: Address | undefined;
  lpAddress: string | undefined;
  logo: string | undefined;
  isCard?: boolean;
}

const PositionToken = ({
  name,
  address,
  decimal,
  addressPosition,
  lpAddress,
  logo,
  isCard = false,
}: PositionTokenProps) => {
  const { positionBalance, isLoadingPositionBalance, refetchPositionBalance } =
    useReadPositionBalance(address, addressPosition as Address);

  const { borrowToken } = useReadBorrowToken(lpAddress as `0x${string}`);
  const { collateralToken } = useReadCollateralToken(
    lpAddress as `0x${string}`
  );

  const borrowTokenName = tokens.find(
    (token) => token.addresses[defaultChain] === borrowToken
  )?.name;

  const collateralTokenName = tokens.find(
    (token) => token.addresses[defaultChain] === collateralToken
  )?.name;

  const convertRealAmount = (amount: bigint | undefined, decimal: number) => {
    const realAmount = amount ? Number(amount) / 10 ** decimal : 0;
    return realAmount;
  };

  const getDecimal = (address: Address) => {
    const token = tokens.find((asset) => asset.addresses === address);
    return token?.decimals;
  };

  const tokenBalance = convertRealAmount(
    positionBalance as bigint,
    decimal
  ).toFixed(5);

  const findLogoToken = (address: Address) => {
    const token = tokens.find((asset) => asset.addresses === address);
    return token?.logo;
  };

  return (
    isCard ? (
      <div className="flex flex-col gap-3 p-2 items-start bg-slate-900/60 rounded-lg">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold">
            <Image
              src={logo as string}
              alt={name as string}
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-medium text-gray-100 text-base truncate">${name}</span>
          </div>
        </div>
        <div className="text-gray-100 font-semibold text-lg pl-1">{tokenBalance}</div>
        <div className="flex flex-row gap-2 w-full mt-2">
          <Link href="/trade" className="flex-1">
            <Button className="w-full flex-1 bg-blue-800 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-lg cursor-pointer">
              <ArrowRightLeft className="size-4 mr-2" />
              Trade
            </Button>
          </Link>
          <div className="flex-1">
            {lpAddress && (
              <RepaySelectedToken
                lpAddress={lpAddress}
                addressPosition={addressPosition as Address}
                tokenBalance={tokenBalance}
                borrowToken={borrowTokenName}
                tokenName={name}
                fullWidth
              />
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-3 gap-2 p-3 items-center hover:bg-slate-700/30 transition-colors rounded-lg">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold">
            <Image
              src={logo as string}
              alt={name as string}
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
          <span className="font-medium text-gray-100">${name}</span>
        </div>
        <div className="text-center">
          <span className="text-gray-100 font-medium">{tokenBalance}</span>
        </div>
        <div className="flex justify-center gap-2">
          <Link href="/trade">
            <Button className="bg-blue-800 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-lg cursor-pointer">
              <ArrowRightLeft className="size-4 mr-2" />
              Trade
            </Button>
          </Link>
          <div className="text-black">
            {lpAddress && (
              <RepaySelectedToken
                lpAddress={lpAddress}
                addressPosition={addressPosition as Address}
                tokenBalance={tokenBalance}
                borrowToken={borrowTokenName}
                tokenName={name}
              />
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default PositionToken;

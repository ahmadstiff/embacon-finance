"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AnimatePresence, motion } from "framer-motion"
import { Wallet, HandCoins, TrendingUp, Loader2, CreditCard, SquareArrowOutUpRight } from "lucide-react"
import { mockUsdc, mockWeth } from "@/constants/addresses"
import type { Address } from "viem"
import { tokens } from "@/constants/token-address"
import PositionToken from "./position-token"
import { useAccount, useWriteContract } from "wagmi"
import { poolAbi } from "@/lib/abis/poolAbi"
import { getAllLPFactoryData, getSelectedLPFactoryByAddress } from "@/actions/GetLPFactory"
import CollateralSection from "./collateral-section"
import { toast } from "sonner"
import { createPosition } from "@/actions/CreatePosition"
import { getPositionByOwnerAndLpAddress } from "@/actions/GetPosition"
import { useReadUserCollateral } from "@/hooks/read/useReadUserCollateral"
import { useReadUserBorrowShares } from "@/hooks/read/useReadUserBorrowShares"
import { useReadTotalBorrowAssets } from "@/hooks/read/useReadTotalBorrowAssets"
import { useReadTotalBorrowShares } from "@/hooks/read/useReadTotalBorrowShares"
import { useReadAddressPosition } from "@/hooks/read/useReadAddressPosition"
import Link from "next/link"
import { defaultChain } from "@/lib/get-default-chain"

const PositionCard = () => {
  const [positionAddress, setPositionAddress] = useState<string | undefined>(undefined)
  const [positionLength, setPositionLength] = useState<number>(0)
  const [positionsArray, setPositionsArray] = useState<any[]>([])
  const [positionIndex, setPositionIndex] = useState<number>(-1)
  const [lpData, setLpData] = useState<any[]>([])
  const [lpAddress, setLpAddress] = useState<string | undefined>(undefined)
  const [collateralToken, setCollateralToken] = useState<string | undefined>(mockWeth)
  const [borrowToken, setBorrowToken] = useState<string | undefined>(mockUsdc)
  const [poolIndex, setPoolIndex] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isPositionStorePending, setIsPositionStorePending] = useState(false)

  const { address } = useAccount()
  const { isPending: isPositionPending, writeContract: createPositionTransaction } = useWriteContract()

  useEffect(() => {
    const fetchLpData = async () => {
      const data = await getAllLPFactoryData()
      setLpData(data)
    }
    fetchLpData()
  }, [])

  useEffect(() => {
    const fetchSelectedLPFactoryByAddress = async () => {
      setIsLoading(true)
      const data = await getSelectedLPFactoryByAddress(lpAddress as `0x${string}`)
      setCollateralToken(data?.collateralToken)
      setBorrowToken(data?.borrowToken)
      setPoolIndex(data?.poolIndex)
      setIsLoading(false)
    }
    fetchSelectedLPFactoryByAddress()
  }, [collateralToken, lpAddress])

  useEffect(() => {
    const fetchPosition = async () => {
      const response = await getPositionByOwnerAndLpAddress(address as string, lpAddress as string)
      setPositionsArray(response.data)
      setPositionLength(response.data.length)
      setPositionAddress(undefined)
    }
    fetchPosition()
  }, [lpAddress])

  const findNameToken = (address: string | undefined) => {
    if (!address) return undefined
    const token = tokens.find((asset) => asset.addresses[defaultChain] === (address as `0x${string}`))
    return token?.name
  }

  const findLogoToken = (address: Address | undefined) => {
    const token = tokens.find((asset) => asset.addresses === address)
    return token?.logo
  }

  const convertRealAmount = (amount: number | undefined, decimal: number) => {
    const realAmount = Number(amount) ? Number(amount) / decimal : 0
    return realAmount
  }

  const { userCollateral } = useReadUserCollateral(collateralToken as `0x${string}`, lpAddress as `0x${string}`)

  const { userBorrowShares, isLoadingUserBorrowShares, refetchUserBorrowShares } = useReadUserBorrowShares(
    lpAddress as `0x${string}`,
  )

  const { totalBorrowAssets, isLoadingTotalBorrowAssets, refetchTotalBorrowAssets } = useReadTotalBorrowAssets(
    lpAddress as `0x${string}`,
  )

  const { totalBorrowShares, isLoadingTotalBorrowShares, refetchTotalBorrowShares } = useReadTotalBorrowShares(
    lpAddress as `0x${string}`,
  )

  const { addressPosition, isLoadingAddressPosition, refetchAddressPosition } = useReadAddressPosition(
    lpAddress as `0x${string}`,
  )

  const handleAddPosition = async (address: string) => {
    try {
      createPositionTransaction({
        address: address as `0x${string}`,
        abi: poolAbi,
        functionName: "createPosition",
        args: [],
      })

      const response = await createPosition(
        collateralToken as string,
        borrowToken as string,
        poolIndex as string,
        lpAddress as string,
        address,
      )

      if (response.success) {
        toast.success(response.message)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error("Error creating position:", error)
      toast.error("Failed to create position")
    }
  }

  const getDecimal = (address: string) => {
    const token = tokens.find((asset) => asset.addresses[defaultChain] === address)
    return token?.decimals
  }

  const formatTitle = () => {
    if (isLoading)
      return <div className="h-8 sm:h-10 w-24 sm:w-32 bg-slate-700 animate-pulse rounded-xl duration-1300" />

    if (!lpAddress) return "Choose Your Lending Pool"

    return `${(Number(userCollateral) / 10 ** Number(getDecimal(String(collateralToken)))).toFixed(
      5,
    )} $${findNameToken(collateralToken)}`
  }

  const formatCollateralAmount = () => {
    if (isLoading)
      return (
        <div className="flex justify-center">
          <Loader2 className="size-6 sm:size-8 animate-spin duration-1000" />
        </div>
      )

    const amount = convertRealAmount(Number(userCollateral), 10 ** Number(getDecimal(String(collateralToken)))).toFixed(
      5,
    )
    return `${amount} $${findNameToken(collateralToken)}`
  }

  const formatBorrowAmount = () => {
    refetchUserBorrowShares()
    refetchTotalBorrowAssets()
    refetchTotalBorrowShares()

    if (isLoadingUserBorrowShares || isLoadingTotalBorrowAssets || isLoadingTotalBorrowShares || isLoading)
      return (
        <div className="flex justify-center">
          <Loader2 className="size-6 sm:size-8 animate-spin duration-1000" />
        </div>
      )

    const userDebt = (Number(userBorrowShares) * Number(totalBorrowAssets)) / Number(totalBorrowShares)

    const amount = convertRealAmount(Number(userDebt), 10 ** Number(getDecimal(String(borrowToken)))).toFixed(5)
    return `${amount} $${findNameToken(borrowToken)}`
  }

  const formatAddressPosition = () => {
    if (isLoadingAddressPosition)
      return (
        <div className="flex justify-center">
          <Loader2 className="size-6 sm:size-8 animate-spin duration-1000" />
        </div>
      )

    return addressPosition != "0x0000000000000000000000000000000000000000" ? (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
        <div className="flex items-center gap-2 text-gray-500 shrink-0">
          <CreditCard className="size-4 sm:size-5" />
          <span className="text-sm sm:text-base lg:text-lg text-gray-200">Your Position Address:</span>
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`https://testnet.snowtrace.io/address/${addressPosition}`}
            className="text-sm sm:text-base lg:text-lg text-gray-500 flex items-center gap-1 hover:text-blue-400 duration-300 break-all"
            target="_blank"
          >
            <span className="truncate sm:break-all">{addressPosition}</span>
            <SquareArrowOutUpRight className="size-3 sm:size-4 shrink-0" />
          </Link>
        </div>
      </div>
    ) : (
      ""
    )
  }

  const formatRate = () => {
    if (isLoading)
      return (
        <div className="flex justify-center">
          <Loader2 className="size-6 sm:size-8 animate-spin duration-1000" />
        </div>
      )

    const rate = "3%"
    return `${rate}`
  }

  return (
    <Card className="border shadow-sm overflow-hidden bg-slate-800/50 border-blue-400/30 w-full max-w-none">
      <CardHeader className="pb-2 border-b py-3 sm:py-4 border-blue-400/30 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <CollateralSection lpAddress={lpAddress as string} setLpAddress={setLpAddress} lpData={lpData} />
        </div>
        <div className="flex items-center gap-2 ml-0 sm:ml-7 mt-2 sm:mt-0">
          <h1 className="text-base sm:text-lg lg:text-xl text-gray-300 break-words">{formatTitle()}</h1>
        </div>
      </CardHeader>

      <AnimatePresence initial={false}>
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <CardContent className="px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6">
            {lpAddress ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Stats Grid - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 border border-blue-400/30 rounded-lg shadow-sm bg-slate-800/50">
                  <div className="space-y-2 text-center p-2 sm:p-0">
                    <div className="text-xs sm:text-sm text-blue-300 flex items-center justify-center gap-1 font-medium">
                      <Wallet className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-300" />
                      <span className="hidden xs:inline">Total Collateral</span>
                      <span className="xs:hidden">Collateral</span>
                    </div>
                    <div className="text-sm sm:text-base lg:text-lg font-medium text-gray-100">
                      <span className="text-emerald-400">{formatCollateralAmount()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-center p-2 sm:p-0">
                    <div className="text-xs sm:text-sm text-blue-300 flex items-center justify-center gap-1 font-medium">
                      <HandCoins className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-rose-400" />
                      <span>Your Debt</span>
                    </div>
                    <div className="text-sm sm:text-base lg:text-lg font-medium text-gray-100">
                      <span className="text-emerald-400">{formatBorrowAmount()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-center p-2 sm:p-0 sm:col-span-2 lg:col-span-1">
                    <div className="text-xs sm:text-sm text-blue-300 flex items-center justify-center gap-1 font-medium">
                      <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
                      <span>Interest Rate</span>
                    </div>
                    <div className="text-sm sm:text-base lg:text-lg font-medium text-emerald-400">{formatRate()}</div>
                  </div>
                </div>

                {/* Address Position - Responsive */}
                <div className="flex justify-center">
                  <div className="w-full max-w-4xl px-2 sm:px-0">{formatAddressPosition()}</div>
                </div>

                {/* Position Content - Responsive */}
                <div className="overflow-hidden rounded-lg border border-blue-400/30 shadow-sm bg-slate-800/30">
                  {addressPosition === "0x0000000000000000000000000000000000000000" ? (
                    <div className="flex flex-col items-center justify-center gap-4 p-6 sm:p-8 text-center">
                      <div className="bg-blue-500/20 p-3 sm:p-4 rounded-full">
                        <Wallet className="h-8 w-8 sm:h-10 sm:w-10 text-blue-300" />
                      </div>
                      <span className="text-lg sm:text-xl lg:text-2xl text-gray-100">
                        {positionLength === 0 ? "Ready to Start Lending?" : "Connect Your Position"}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed">
                        {positionLength === 0
                          ? "Begin your DeFi journey by creating your first lending position. Supply collateral and start earning while borrowing assets."
                          : "Select your position to manage your lending portfolio and track your assets."}
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Table Header - Hidden on mobile and sm, shown on md+ */}
                      <div className="hidden md:grid md:grid-cols-3 gap-2 p-3 text-sm font-medium text-blue-300 border-b border-blue-400/20">
                        <div className="pl-4">Assets</div>
                        <div className="text-center">Current Balance</div>
                        <div className="text-center">Quick Actions</div>
                      </div>

    
                      <div className="md:divide-y md:divide-blue-400/20">
                        <div className="flex flex-col gap-3 md:hidden">
                          {tokens.map((token) => (
                            <div
                              key={token.addresses[defaultChain]}
                              className="rounded-lg border border-blue-400/30 bg-slate-900/60 p-4 flex flex-col gap-2 shadow-sm"
                            >
                              <PositionToken
                                name={token.name}
                                address={token.addresses[defaultChain]}
                                logo={token.logo as string}
                                decimal={token.decimals}
                                addressPosition={addressPosition as `0x${string}`}
                                lpAddress={lpAddress as `0x${string}`}
                                isCard
                              />
                            </div>
                          ))}
                        </div>
                        {/* Table style for md+ */}
                        <div className="hidden md:block">
                          <div className="divide-y divide-blue-400/20">
                            {tokens.map((token) => (
                              <PositionToken
                                key={token.addresses[defaultChain]}
                                name={token.name}
                                address={token.addresses[defaultChain]}
                                logo={token.logo as string}
                                decimal={token.decimals}
                                addressPosition={addressPosition as `0x${string}`}
                                lpAddress={lpAddress as `0x${string}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-full min-h-[200px] sm:min-h-[300px]">
                <div className="flex flex-col items-center justify-center gap-4 p-6 sm:p-8 text-center max-w-md">
                  <div className="bg-blue-500/20 p-3 sm:p-4 rounded-full">
                    <Wallet className="h-8 w-8 sm:h-10 sm:w-10 text-blue-300" />
                  </div>
                  <span className="text-lg sm:text-xl lg:text-2xl text-gray-100">Select Your Lending Pool</span>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    Choose a lending pool to view your positions and manage your DeFi portfolio
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </motion.div>
      </AnimatePresence>
    </Card>
  )
}

export default PositionCard

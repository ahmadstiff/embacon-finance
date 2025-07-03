"use server";

import { chains } from "@/constants/chain-address";
import { defaultChain } from "@/lib/get-default-chain";
import { PrismaClient } from "@prisma/client";
import { prisma } from '@/lib/prisma';


export const getAllLPFactoryData = async () => {
  const data = await prisma.lP_Factory.findMany({
    where: {
      chain_id: defaultChain.toString(),
    },
  });
  return data;
};
export const getSelectedLPFactory = async (address: string) => {
  if (address) {
    const data = await prisma.lP_Factory.findFirst({
      where: {
        sender: address,
        chain_id: defaultChain.toString(),
      },
    });
    return data;
  } else {
    return null;
  }
};
export const getLPFactoryCount = async () => {
  const count = await prisma.lP_Factory.count({
    where: {
      chain_id: defaultChain.toString(),
    },
  });
  return count;
};

export const getSelectedLPFactorybyColBor = async (
  collateralToken: string,
  borrowToken: string
) => {
  const data = await prisma.lP_Factory.findFirst({
    where: {
      collateralToken: collateralToken,
      borrowToken: borrowToken,
      chain_id: defaultChain.toString(),
    },
  });
  return data;
};

export const getSelectedLPFactoryByAddress = async (address: string) => {
  const data = await prisma.lP_Factory.findFirst({
    where: {
      lpAddress: address,
      chain_id: defaultChain.toString(),
    },
  });
  return data;
};

export const getSelectedCollateralTokenByLPAddress = async (address: string) => {
  const data = await prisma.lP_Factory.findFirst({
    where: {
      lpAddress: address,
    },
  });
  return data;
};

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { prisma } from '@/lib/prisma';

// CREATE transaction
export async function POST(req: NextRequest) {
  console.log('POST /api/transaction-history called');
  const data = await req.json()
  const tx = await prisma.transactionHistory.create({ data })
  return NextResponse.json(tx)
}

// READ all transactions for a user
export async function GET(req: NextRequest) {
  console.log('GET /api/transaction-history called');
  const user_address = req.nextUrl.searchParams.get("user_address")
  if (!user_address) return NextResponse.json([], { status: 400 })
  const txs = await prisma.transactionHistory.findMany({
    where: { user_address },
    orderBy: { created_at: "desc" },
  })
  return NextResponse.json(txs)
}
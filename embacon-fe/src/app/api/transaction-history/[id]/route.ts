import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// UPDATE transaction by id
export async function PATCH(req: NextRequest) {
  const { status, tx_hash, error_message } = await req.json();
  const id = req.nextUrl.pathname.split("/").pop(); // Extracts the id from the URL
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const tx = await prisma.transactionHistory.update({
    where: { id },
    data: { status, tx_hash, error_message },
  });
  return NextResponse.json(tx);
}

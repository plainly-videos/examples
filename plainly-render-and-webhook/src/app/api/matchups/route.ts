import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  const data = await prisma.matchup.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return NextResponse.json(data);
}

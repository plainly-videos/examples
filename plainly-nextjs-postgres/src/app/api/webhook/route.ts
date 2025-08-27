import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, output, success } = body;

    // Update matchup in DB based on renderId
    await prisma.matchup.updateMany({
      where: { renderId: id },
      data: {
        status: success ? "completed" : "failed",
        videoUrl: output ?? null,
      },
    });

    revalidatePath("/");
    revalidateTag("matchup");

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 },
    );
  }
}

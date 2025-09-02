import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

/**
 * Webhook endpoint to handle POST requests for updating matchup status.
 *
 * This endpoint expects a JSON payload with the following structure:
 * {
 *   id: string,        // The render ID associated with the matchup
 *   output: string,    // The URL of the rendered video (optional)
 *   success: boolean   // Indicates whether the rendering was successful
 *   error: { message: string, code: string } // Error details (optional)
 * }
 *
 * The endpoint updates the matchup status in the database based on the provided render ID.
 * If the rendering was successful, payload returns `success: true`, and we can set the status to "completed" and update the video URL.
 * If webhook options allow the delivery in case of a failed or invalid renders (by passing `onFailure: true` or `onInvalid: true`),
 * the payload sent will be slightly different, as it will not contain the output information and error property will contain the error details,
 * allowing for more granular handling of different render outcomes. In our case we will update the status to "failed".
 *
 * After updating the database, the cache for the homepage and the "matchup" tag is revalidated.
 *
 * In case of an error, a 500 status code is returned along with an error message.
 */
export async function POST(request: NextRequest) {
  try {
    // Here you can see the example webhook payloads
    // https://help.plainlyvideos.com/docs/user-guide/rendering/video-delivery#webhook-delivery
    const body = await request.json();
    const { passthrough, output, success, expirationDate } = body;

    // Update matchup in DB based on customData
    await prisma.matchup.updateMany({
      where: { customData: passthrough },
      data: {
        status: success ? "completed" : "failed",
        videoUrl: output ?? null,
        expirationDate: expirationDate ?? null,
      },
    });

    // Revalidate cache for the homepage and "matchup" tag
    revalidatePath("/");
    revalidateTag("matchup");

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Webhook error:", error);

    // Return a 500 status code to indicate a server-side error
    // This will force Plainly to retry the webhook delivery
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 },
    );
  }
}

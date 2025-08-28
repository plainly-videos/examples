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
 * }
 *
 * The endpoint updates the matchup status in the database based on the provided render ID.
 * If the rendering was successful, the status is set to "completed" and the video URL is updated.
 * Otherwise, the status is set to "failed".
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
		const { id, output, success } = body;

		// Update matchup in DB based on renderId
		await prisma.matchup.updateMany({
			where: { renderId: id },
			data: {
				status: success ? "completed" : "failed",
				videoUrl: output ?? null,
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
		return NextResponse.json(
			{ message: "Error processing webhook" },
			{ status: 500 },
		);
	}
}

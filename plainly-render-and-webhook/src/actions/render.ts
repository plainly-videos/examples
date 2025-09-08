"use server";
import { revalidatePath } from "next/cache";
import { auth, projectId, publicUrl } from "@/constants";
import prisma from "../../lib/prisma";

export async function render(formData: FormData) {
  const rawFormData = {
    team1: formData.get("team1")?.toString() || "",
    team1logo: formData.get("team1logo")?.toString() || "",
    team2: formData.get("team2")?.toString() || "",
    team2logo: formData.get("team2logo")?.toString() || "",
  };

  let matchupId: number;
  try {
    // Save matchup details to the database with an initial status of 'pending'
    const { id } = await prisma.matchup.create({
      data: {
        teamA: rawFormData.team1,
        teamB: rawFormData.team2,
        teamALogo: rawFormData.team1logo,
        teamBLogo: rawFormData.team2logo,
        status: "pending", // Initial status of the matchup
      },
    });

    matchupId = id;
  } catch (error) {
    throw new Error("Failed to create matchup in the database", {
      cause: error,
    });
  }

  // Construct the request body for the Plainly Videos API
  const body = {
    projectId, // Project ID for the Plainly Videos project
    // render parameters
    parameters: {
      plainlyEditTeam1: rawFormData.team1,
      plainlyEditLogo1: rawFormData.team1logo,
      plainlyEditTeam2: rawFormData.team2,
      plainlyEditLogo2: rawFormData.team2logo,
    },
    webhook: {
      url: `${publicUrl}/api/webhook`, // Webhook URL to handle render status updates
      passthrough: matchupId, // Send matchupId as passthrough to identify the render
      onFailure: true, // Trigger webhook on failure
      onInvalid: true, // Trigger webhook on invalid data
    },
  };

  // Send a POST request to the Plainly Videos API to initiate a render
  const res = await fetch("https://api.plainlyvideos.com/api/v2/renders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`, // Basic authentication header
    },
    body: JSON.stringify(body),
  });

  // Throw an error if the API request fails
  if (!res.ok) {
    try {
      await prisma.matchup.updateMany({
        where: { id: matchupId },
        data: { status: "failed" },
      });
    } catch (error) {
      throw new Error("Failed to update matchup status in the database", {
        cause: error,
      });
    }

    revalidatePath("/", "layout");
    throw new Error(`Error: ${res.status} ${res.statusText}`);
  }

  // Revalidate the homepage and matchup tag to update the UI
  revalidatePath("/", "layout");
}

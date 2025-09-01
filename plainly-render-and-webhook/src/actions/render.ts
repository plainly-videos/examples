"use server";
import { auth, projectId, webhookBaseUrl } from "@/constants";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "../../lib/prisma";

export async function render(formData: FormData) {
  const rawFormData = {
    team1: formData.get("team1")?.toString() || "",
    team1logo: formData.get("team1logo")?.toString() || "",
    team2: formData.get("team2")?.toString() || "",
    team2logo: formData.get("team2logo")?.toString() || "",
  };

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
      url: `${webhookBaseUrl}/api/webhook`, // Webhook URL to handle render status updates
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
    throw new Error(`Error: ${res.status} ${res.statusText}`);
  }

  // Parse the response JSON to extract the render ID
  const { id } = await res.json();

  // Save matchup details to the database with an initial status of 'pending'
  await prisma.matchup.create({
    data: {
      teamA: rawFormData.team1,
      teamB: rawFormData.team2,
      teamALogo: rawFormData.team1logo,
      teamBLogo: rawFormData.team2logo,
      status: "pending", // Initial status of the matchup
      renderId: id, // Render ID returned by the Plainly Videos API
    },
  });

  // Revalidate the homepage and matchup tag to update the UI
  revalidatePath("/");
  revalidateTag("matchup");
}

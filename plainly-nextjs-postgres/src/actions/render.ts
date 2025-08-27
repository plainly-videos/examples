"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "../../lib/prisma";
import { auth } from "./utils";

export async function render(formData: FormData) {
	const rawFormData = {
		team1: formData.get("team1")?.toString() || "",
		team1logo: formData.get("team1logo")?.toString() || "",
		team2: formData.get("team2")?.toString() || "",
		team2logo: formData.get("team2logo")?.toString() || "",
	};

	const body = {
		projectId: process.env.NEXT_PUBLIC_PLAINLY_PROJECT_ID,
		parameters: {
			team1: rawFormData.team1,
			team1logo: rawFormData.team1logo,
			team2: rawFormData.team2,
			team2logo: rawFormData.team2logo,
		},
		webhook: {
			url: `${process.env.NEXT_PUBLIC_WEBHOOK_PUBLIC_URL}/api/webhook`,
			onFailure: true,
		},
	};

	const res = await fetch("https://api.plainlyvideos.com/api/v2/renders", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Basic ${auth}`,
		},
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		throw new Error(`Error: ${res.status} ${res.statusText}`);
	}

	const { id } = await res.json();

	// Save matchup to DB with status 'pending'
	await prisma.matchup.create({
		data: {
			teamA: rawFormData.team1,
			teamB: rawFormData.team2,
			teamALogo: rawFormData.team1logo,
			teamBLogo: rawFormData.team2logo,
			status: "pending",
			renderId: id,
		},
	});

	revalidatePath("/");
	revalidateTag("matchup");
}

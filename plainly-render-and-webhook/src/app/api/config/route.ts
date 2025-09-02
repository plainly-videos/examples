import { publicUrl } from "@/constants";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    publicUrl,
    publicEndpoint: publicUrl ? `${publicUrl}/api/webhook` : null,
    isConfigured: !!publicUrl,
  });
}

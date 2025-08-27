import { NextResponse } from "next/server";
import { publicUrl } from "@/constants";

export async function GET() {
  return NextResponse.json({
    publicUrl,
    publicEndpoint: publicUrl ? `${publicUrl}/api/webhook` : null,
    isConfigured: !!publicUrl,
  });
}

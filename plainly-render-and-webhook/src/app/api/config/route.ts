import { webhookBaseUrl } from "@/constants";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    webhookBaseUrl,
    webhookEndpoint: webhookBaseUrl ? `${webhookBaseUrl}/api/webhook` : null,
    isConfigured: !!webhookBaseUrl,
  });
}

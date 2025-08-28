import localtunnel from "localtunnel";

let tunnel: localtunnel.Tunnel | null = null;
let tunnelUrl: string | null = null;

export async function createTunnel(
  port = 3000,
  maxRetries = 3,
): Promise<string> {
  if (tunnel && tunnelUrl) {
    console.log(`🌐 Tunnel already running: ${tunnelUrl}`);
    return tunnelUrl;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `🔄 Creating tunnel for port ${port}... (attempt ${attempt}/${maxRetries})`,
      );

      // Create tunnel without subdomain to get a unique URL every time
      tunnel = await localtunnel({ port });
      tunnelUrl = tunnel.url;

      console.log(`✅ Tunnel created: ${tunnelUrl}`);

      tunnel.on("close", () => {
        console.log("🔴 Tunnel closed");
        tunnel = null;
        tunnelUrl = null;
      });

      tunnel.on("error", (err: Error) => {
        console.error("🚨 Tunnel error:", err);
        tunnel = null;
        tunnelUrl = null;
      });

      if (!tunnelUrl) {
        throw new Error("Failed to get tunnel URL");
      }

      // Test if tunnel is actually working
      await testTunnel(tunnelUrl);

      return tunnelUrl;
    } catch (error) {
      console.error(`❌ Failed to create tunnel (attempt ${attempt}):`, error);

      if (tunnel) {
        tunnel.close();
        tunnel = null;
        tunnelUrl = null;
      }

      if (attempt === maxRetries) {
        throw new Error(
          `Failed to create tunnel after ${maxRetries} attempts: ${error}`,
        );
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error("Failed to create tunnel");
}

async function testTunnel(url: string): Promise<void> {
  try {
    const response = await fetch(`${url}/api/config`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`Tunnel test failed: ${response.status}`);
    }
    console.log("✅ Tunnel connection verified");
  } catch (_error) {
    console.warn(
      "⚠️ Could not verify tunnel connection (this is normal if the server is not running yet)",
    );
  }
}

export function getTunnelUrl(): string | null {
  return tunnelUrl;
}

export async function closeTunnel(): Promise<void> {
  if (tunnel) {
    console.log("🔄 Closing tunnel...");
    tunnel.close();
    tunnel = null;
    tunnelUrl = null;
  }
}

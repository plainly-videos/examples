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

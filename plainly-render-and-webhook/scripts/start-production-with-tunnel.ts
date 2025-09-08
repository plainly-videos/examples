#!/usr/bin/env tsx

import { createTunnel, closeTunnel } from "../lib/tunnel";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ENV_FILE = path.join(process.cwd(), ".env.local");
const PORT = 3000;

async function updateEnvFile(tunnelUrl: string) {
  try {
    let envContent = "";

    // Read existing .env.local if it exists
    if (fs.existsSync(ENV_FILE)) {
      envContent = fs.readFileSync(ENV_FILE, "utf8");
    }

    // Update or add the webhook URL
    const webhookUrlPattern = /^NEXT_PUBLIC_WEBHOOK_PUBLIC_URL=.*$/m;
    const webhookLine = `NEXT_PUBLIC_WEBHOOK_PUBLIC_URL=${tunnelUrl}`;

    if (webhookUrlPattern.test(envContent)) {
      envContent = envContent.replace(webhookUrlPattern, webhookLine);
    } else {
      // Add the line if it doesn't exist
      if (envContent && !envContent.endsWith("\n")) {
        envContent += "\n";
      }
      envContent += `${webhookLine}\n`;
    }

    fs.writeFileSync(ENV_FILE, envContent);
    console.log(`📝 Updated .env.local with webhook URL: ${tunnelUrl}`);
  } catch (error) {
    console.error("❌ Failed to update .env.local:", error);
    throw error;
  }
}

async function startApp() {
  try {
    console.log(
      "🚀 Starting Plainly app in production mode with automatic tunnel setup...\n",
    );

    // Create tunnel first
    const tunnelUrl = await createTunnel(PORT);

    // Update environment file
    await updateEnvFile(tunnelUrl);

    console.log("\n🌐 Tunnel URL:", tunnelUrl);
    console.log("📨 Webhook URL:", `${tunnelUrl}/api/webhook`);

    // Update the environment with the new webhook URL
    const updatedEnv = {
      ...process.env,
      NEXT_PUBLIC_WEBHOOK_PUBLIC_URL: tunnelUrl,
    };

    console.log("\n🔄 Rebuilding Next.js with tunnel URL...\n");

    // Rebuild the app with the correct environment variable
    const buildProcess = spawn("pnpm", ["build"], {
      stdio: "inherit",
      env: updatedEnv,
    });

    await new Promise((resolve, reject) => {
      buildProcess.on("exit", (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    });

    console.log("\n🔄 Starting Next.js production server...\n");

    // Start Next.js production server with updated environment
    const nextProcess = spawn("pnpm", ["start"], {
      stdio: "inherit",
      env: updatedEnv,
    });

    // Handle process termination
    const cleanup = async () => {
      console.log("\n🔄 Shutting down...");
      nextProcess.kill();
      await closeTunnel();
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    nextProcess.on("exit", (code) => {
      console.log(`\n💻 Next.js process exited with code ${code}`);
      closeTunnel();
      process.exit(code || 0);
    });
  } catch (error) {
    console.error("❌ Failed to start app:", error);
    process.exit(1);
  }
}

// Start the app
startApp();

#!/usr/bin/env tsx

import { type ChildProcess, spawn } from "node:child_process";
import { closeTunnel, createTunnel } from "../lib/tunnel";

const PORT = 3000;

async function startApp() {
  try {
    console.log("🚀 Starting Plainly app with automatic tunnel setup...\n");

    // Create tunnel first
    const tunnelUrl = await createTunnel(PORT);

    console.log("\n🌐 Tunnel URL:", tunnelUrl);
    console.log("📨 Webhook URL:", `${tunnelUrl}/api/webhook`);

    // Update the environment with the new webhook URL
    const updatedEnv = {
      ...process.env,
      WEBHOOK_PUBLIC_URL: tunnelUrl,
    };

    let nextProcess: ChildProcess;
    if (process.env.NODE_ENV === "development") {
      // Start Next.js dev server with updated environment
      nextProcess = spawn("pnpm", ["dev"], {
        stdio: "inherit",
        env: updatedEnv,
        detached: process.platform !== "win32",
      });
    } else {
      console.log("\n🔄 Rebuilding Next.js with tunnel URL...\n");

      const buildProcess = spawn("pnpm", ["build"], {
        stdio: "inherit",
        env: updatedEnv,
        detached: process.platform !== "win32",
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

      nextProcess = spawn("pnpm", ["start"], {
        stdio: "inherit",
        env: updatedEnv,
        detached: process.platform !== "win32",
      });
    }

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

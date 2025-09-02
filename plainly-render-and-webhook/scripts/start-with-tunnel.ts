#!/usr/bin/env tsx

import { type ChildProcess, spawn } from "node:child_process";
import { closeTunnel, createTunnel } from "../lib/tunnel";

const PORT = 3000;

async function startApp() {
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
  try {
    if (process.env.NODE_ENV === "development") {
      // Start Next.js dev server with updated environment
      nextProcess = spawn("next", ["dev"], {
        stdio: "inherit",
        env: updatedEnv,
        shell: true,
      });
    } else {
      console.log("\n🔄 Rebuilding Next.js with tunnel URL...\n");

      const buildProcess = spawn("next", ["build"], {
        stdio: "inherit",
        env: updatedEnv,
        shell: true,
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

      nextProcess = spawn("next", ["start"], {
        stdio: "inherit",
        env: updatedEnv,
        shell: true,
      });
    }

    const exitPromise = new Promise<void>((resolve) => {
      nextProcess?.on("exit", (code, signal) => {
        console.log(`\n💻 Next.js exited with code ${code}, signal ${signal}`);
        // Treat SIGTERM or SIGINT as normal exit
        if (signal === "SIGTERM" || signal === "SIGINT") resolve();
        else if (code === 0) resolve();
        else resolve(); // ignore ELIFECYCLE
      });
    });

    const cleanup = async () => {
      console.log("\n🔄 Shutting down...");
      if (nextProcess && !nextProcess.killed) {
        try {
          nextProcess.kill("SIGTERM");
        } catch (err) {
          console.warn("Failed to kill nextProcess:", err);
        }
      }
      await closeTunnel();
    };

    process.on("SIGINT", async () => {
      await cleanup();
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      await cleanup();
      process.exit(0);
    });

    await exitPromise;
    await closeTunnel();
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to start app:", err);
    process.exit(1);
  }
}

// Start the app
startApp();

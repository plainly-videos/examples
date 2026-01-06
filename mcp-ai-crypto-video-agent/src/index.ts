#!/usr/bin/env node

/**
 * MCP AI Crypto Video Agent
 * Autonomous agent-based system using OpenAI Agents with MCP servers
 *
 * The agents autonomously:
 * - Discover and use MCP tools
 * - Coordinate with each other
 * - Generate videos from cryptocurrency data
 */

import type { AgentInputItem } from "@openai/agents";
import {
	Agent,
	MCPServerStdio,
	MCPServerStreamableHttp,
	run,
} from "@openai/agents";
import chalk from "chalk";
import { Command } from "commander";
import { config } from "dotenv";
import { formatValue, logRunStream, truncate } from "./agent-logging.js";

const STATUS_POLL_INTERVAL = 15000;
const MAX_RENDER_CHECKS = 10;
const MAX_TURNS = 30;
const MAX_LOG_LENGTH = 300;

// Load environment variables
config({ path: ".env.local" });

const program = new Command();

program
	.name("crypto-video-agent")
	.description("Autonomous AI agents generate crypto videos using MCP tools")
	.version("0.1.0")
	.option(
		"-c, --coin <symbol>",
		"Cryptocurrency symbol (bitcoin, ethereum)",
		"bitcoin",
	)
	.parse(process.argv.filter((arg) => arg !== "--"));

const options = program.opts();

const allowedCoins = ["bitcoin", "ethereum"] as const;
const providedCoin = String(options.coin ?? "").toLowerCase();
if (!allowedCoins.includes(providedCoin as (typeof allowedCoins)[number])) {
	console.error(
		chalk.red(
			`❌ Invalid coin symbol "${options.coin}". Allowed values: ${allowedCoins.join(
				", ",
			)}`,
		),
	);
	process.exit(1);
}
options.coin = providedCoin;

async function main() {
	console.log(chalk.cyan.bold("\n🎬 MCP AI Crypto Video Agent"));
	console.log(chalk.gray("Autonomous agents with MCP tool integration\n"));

	// Verify API keys
	if (!process.env.OPENAI_API_KEY) {
		console.error(chalk.red("❌ OPENAI_API_KEY not found in environment"));
		console.error(chalk.gray("   Add it to .env.local file"));
		process.exitCode = 1;
		return;
	}

	if (!process.env.PLAINLY_API_KEY) {
		console.error(chalk.red("❌ PLAINLY_API_KEY not found in environment"));
		console.error(chalk.gray("   Add it to .env.local file"));
		process.exitCode = 1;
		return;
	}

	if (!process.env.SMITHERY_API_KEY) {
		console.error(chalk.red("❌ SMITHERY_API_KEY not found in environment"));
		console.error(chalk.gray("   Add it to .env.local file"));
		process.exitCode = 1;
		return;
	}

	let cryptoServer: MCPServerStreamableHttp | undefined;
	let plainlyServer: MCPServerStdio | undefined;

	try {
		// Connect to MCP servers
		console.log("🔌 Connecting to MCP servers...");

		const url = new URL(
			"https://server.smithery.ai/@Liam8/free-coin-price-mcp/mcp",
		);
		url.searchParams.set("api_key", process.env.SMITHERY_API_KEY);
		cryptoServer = new MCPServerStreamableHttp({ url: url.toString() });

		plainlyServer = new MCPServerStdio({
			fullCommand: "npx -y @plainly-videos/mcp-server@latest",
			env: { PLAINLY_API_KEY: process.env.PLAINLY_API_KEY },
		});

		await Promise.all([cryptoServer.connect(), plainlyServer.connect()]);
		console.log("  ✅ Connected to Crypto MCP server");
		console.log("  ✅ Connected to Plainly MCP server\n");

		// Create the orchestrator agent
		const orchestrator = new Agent({
			name: "Video Production Orchestrator",
			instructions: `You are a video production orchestrator that coordinates cryptocurrency video generation.

Your workflow:
1. Use crypto MCP tools to fetch data for "${options.coin}"
2. Analyze the crypto data and extract key metrics (price, 24h change, 7d change)
3. Use Plainly MCP tools to discover the best project for a cryptocurrency data, try with keywords like "crypto", or similar.
4. Map the crypto data to template parameters. Don't use symbols "$" or "%" in the parameter fields, but you can use "+" and "-" signs for the changes. For the images, use assets from https://assets.coingecko.com/coins/...
5. Render the video using the Plainly tools
6. Monitor render status until completion.
7. Return the final video URL

Be autonomous and figure out which MCP tools to use. The crypto tools are for fetching cryptocurrency data, and Plainly tools are for video rendering.
Describe each step you take and your thinking process in plain language (no JSON). Summarize key facts only, avoid raw tool responses, and keep it concise.
Do not end the workflow until you have the final video URL. If the render is still in progress, wait 15 seconds and check again.
If for any reason you cannot proceed, or you are experiencing issue, as of you not understanding the situation, respond with a clear explanation of the problem, even if you find the solution later.

When you have the final video URL, respond with: "VIDEO_URL: [url]"`,
			mcpServers: [cryptoServer, plainlyServer],
		});

		console.log(
			chalk.cyan(
				`🤖 Orchestrator: Starting autonomous workflow for ${options.coin}...\n`,
			),
		);
		console.log("═".repeat(60));

		const runWithLogging = async (
			input: string | AgentInputItem[],
			label: string,
		) => {
			console.log(chalk.gray(`\n▶ ${label}`));
			const result = await run(orchestrator, input, {
				stream: true,
				maxTurns: MAX_TURNS,
			});

			await logRunStream(result);

			if (result.finalOutput) {
				console.log(
					chalk.green(
						`\n✅ Final Output: ${truncate(formatValue(result.finalOutput), MAX_LOG_LENGTH)}`,
					),
				);
			}

			return result;
		};

		const initialInput = `Generate a cryptocurrency performance video for ${options.coin}. Fetch the latest data, find the appropriate template, and render the video. Return the final video URL.`;

		let result = await runWithLogging(initialInput, "Initial run");
		let finalOutput = formatValue(result.finalOutput);
		let attempts = 0;

		while (
			!finalOutput.includes("VIDEO_URL:") &&
			attempts < MAX_RENDER_CHECKS
		) {
			attempts += 1;
			console.log(
				chalk.yellow(
					`⏱️ Waiting 15 seconds before checking render status again (attempt ${attempts}/${MAX_RENDER_CHECKS})...`,
				),
			);
			await new Promise((resolve) => setTimeout(resolve, STATUS_POLL_INTERVAL));

			const followUpInput: AgentInputItem[] = [
				...result.history,
				{
					role: "user",
					content:
						"Continue monitoring the render status. If complete, respond with VIDEO_URL: [url]. If not complete, wait 15 seconds and check again.",
				},
			];

			result = await runWithLogging(followUpInput, `Follow-up run ${attempts}`);
			finalOutput = formatValue(result.finalOutput);
		}

		if (!finalOutput.includes("VIDEO_URL:")) {
			console.log(
				chalk.yellow(
					"⚠️ Render may still be in progress. Re-run to continue monitoring or check Plainly directly.",
				),
			);
		}

		process.exitCode = 0;
	} catch (error) {
		console.error(chalk.red("\n❌ Error:"), error);
		process.exitCode = 1;
	} finally {
		const closeWithTimeout = async (
			server: MCPServerStreamableHttp | MCPServerStdio | undefined,
			label: string,
			timeoutMs = 2000,
		) => {
			if (!server) {
				return;
			}
			const timeout = new Promise<void>((_, reject) => {
				const timer = setTimeout(() => {
					clearTimeout(timer);
					reject(new Error(`${label} close timed out`));
				}, timeoutMs);
			});
			try {
				await Promise.race([server.close(), timeout]);
			} catch (error) {
				console.warn(chalk.yellow(`⚠️ ${label} did not close cleanly:`), error);
			}
		};

		await Promise.allSettled([
			closeWithTimeout(cryptoServer, "Crypto MCP server"),
			closeWithTimeout(plainlyServer, "Plainly MCP server"),
		]);
	}
}

main();

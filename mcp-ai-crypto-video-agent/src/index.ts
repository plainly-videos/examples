#!/usr/bin/env node

/**
 * MCP AI Crypto Video Agent
 * Example demonstrating how to use Free Crypto Coin Data and Plainly MCP tools
 */

import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { CryptoService } from "./crypto.js";
import { MCPClientManager } from "./mcp-client.js";
import { PlainlyService } from "./plainly.js";
import type { CryptoData } from "./types.js";

const program = new Command();

program
	.name("crypto-video-agent")
	.description("Generate crypto performance videos using MCP tools")
	.version("1.0.0")
	.option(
		"-c, --coin <symbol>",
		"Cryptocurrency symbol (bitcoin or ethereum)",
		"bitcoin",
	)
	.parse(process.argv.filter((arg) => arg !== "--"));

const options = program.opts();
const allowedCoins = new Set(["bitcoin", "ethereum"]);

if (!allowedCoins.has(options.coin)) {
	console.error(
		chalk.red(
			`Invalid coin "${options.coin}". For this example, only bitcoin and ethereum are supported due to static image mapping.`,
		),
	);
	process.exitCode = 1;
} else {
	main();
}

async function main() {
	console.log(chalk.cyan.bold("\n🎬 MCP AI Crypto Video Agent\n"));

	const mcpClient = new MCPClientManager();
	const cryptoService = new CryptoService(mcpClient);
	const plainlyService = new PlainlyService(mcpClient);

	try {
		// Step 1: Fetch crypto data
		const spinner = ora("Fetching cryptocurrency data...").start();
		const cryptoData = await cryptoService.getCryptoData(options.coin);
		spinner.succeed(
			`Fetched ${chalk.green(cryptoData.coin)} data: ${chalk.yellow(`$${cryptoData.currentPrice.toFixed(2)}`)} (24h: ${cryptoData.priceChange24h >= 0 ? chalk.green("+") : chalk.red("")}${cryptoData.priceChange24h.toFixed(2)}%, 7d: ${cryptoData.priceChange7d >= 0 ? chalk.green("+") : chalk.red("")}${cryptoData.priceChange7d.toFixed(2)}%)`,
		);

		// Step 2: Discover projects
		spinner.start("Discovering Plainly projects...");
		const cryptoProject = await plainlyService.findCryptoProject();

		if (!cryptoProject) {
			spinner.fail('Could not find "Crypto 2025" project');
			process.exitCode = 1;
			return;
		}

		spinner.succeed(
			`Found project: ${chalk.green(cryptoProject.name)} (ID: ${cryptoProject.id})`,
		);

		// Step 3: Get project details
		spinner.start("Fetching project details...");
		const projectDetails = await plainlyService.getProjectDetails(
			cryptoProject.id,
			false,
		);

		spinner.succeed(
			`Project has ${projectDetails.itemDetails?.length || 0} variant(s)`,
		);

		// Use the first template variant
		const template = projectDetails.itemDetails?.[0];
		if (!template) {
			spinner.fail("No template variants found");
			process.exitCode = 1;
			return;
		}

		console.log(chalk.gray(`Using template: ${template.templateVariantId}`));

		// Step 4: Map crypto data to template parameters
		const parameters = mapCryptoDataToParameters(cryptoData);
		console.log(chalk.gray("Parameters mapped successfully\n"));

		// Step 5: Render video
		spinner.start("Submitting render request...");
		const renderId = await plainlyService.renderVideo(
			template.projectDesignId,
			template.templateVariantId,
			false,
			parameters,
		);
		spinner.succeed(`Render submitted: ${chalk.yellow(renderId)}`);

		// Step 6: Poll for completion
		spinner.start("Rendering video...");
		let lastState = "";

		const finalStatus = await plainlyService.pollRenderStatus(
			renderId,
			(status) => {
				if (status.state !== lastState) {
					lastState = status.state;
					spinner.text = `Rendering video... (${chalk.yellow(status.state)})`;
				}
			},
		);

		if (finalStatus.state === "DONE") {
			spinner.succeed(chalk.green.bold("Video rendered successfully! ✨"));
			console.log(
				chalk.cyan("\n📹 Video URL:"),
				chalk.underline.blue(finalStatus.output),
			);
		} else {
			spinner.fail(`Render failed: ${finalStatus.state}`);
			if (finalStatus.error) {
				console.error(chalk.red(finalStatus.error));
			}
			process.exitCode = 1;
			return;
		}
	} catch (error) {
		console.error(chalk.red("\n❌ Error:"), error);
		process.exitCode = 1;
	} finally {
		await mcpClient.close();
	}
}

/**
 * Map crypto data to template parameters
 * This is where you customize the video content based on crypto data
 */
function mapCryptoDataToParameters(
	cryptoData: CryptoData,
): Record<string, unknown> {
	const params: Record<string, unknown> = {};
	const imageByCoin: Record<string, string> = {
		bitcoin: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
		ethereum:
			"https://assets.coingecko.com/coins/images/279/large/ethereum.png",
	};

	// Map data to Crypto 2025 template parameters
	// Based on actual template: editName, editSymbol, editPrice, editChange24h, editChange7d, editImage, editDate, editOutroText
	params.editName = cryptoData.coin; // Crypto name
	params.editSymbol = cryptoData.coin.substring(0, 3).toUpperCase(); // Symbol (e.g., BTC, ETH)
	params.editPrice = cryptoData.currentPrice.toFixed(2); // Current price
	params.editChange24h = `${cryptoData.priceChange24h >= 0 ? "+" : "-"}${cryptoData.priceChange24h.toFixed(2)}`; // 24h change with sign
	params.editChange7d = `${cryptoData.priceChange7d >= 0 ? "+" : "-"}${cryptoData.priceChange7d.toFixed(2)}`; // 7d change with sign
	params.editImage = imageByCoin[cryptoData.coin.toLowerCase()];
	params.editDate = new Date().toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	return params;
}

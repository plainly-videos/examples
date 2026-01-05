/**
 * MCP Client Setup
 * Handles connection to MCP servers (Crypto and Plainly)
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

export class MCPClientManager {
	private cryptoClient: Client | null = null;
	private plainlyClient: Client | null = null;

	/**
	 * Initialize the Free Crypto Coin Data MCP client
	 */
	async initCryptoClient(): Promise<Client> {
		if (this.cryptoClient) {
			return this.cryptoClient;
		}

		const url = new URL(
			"https://server.smithery.ai/@Liam8/free-coin-price-mcp/mcp",
		);
		const apiKey = process.env.SMITHERY_API_KEY;

		if (!apiKey) {
			throw new Error(
				"SMITHERY_API_KEY not found in environment. Please add it to .env.local",
			);
		}

		// if (!smitheryProfile) {
		//   throw new Error(
		//     "SMITHERY_PROFILE not found in environment. Please add it to .env.local",
		//   );
		// }

		url.searchParams.set("api_key", apiKey);
		// url.searchParams.set("profile", smitheryProfile);

		const transport = new StreamableHTTPClientTransport(url);

		this.cryptoClient = new Client(
			{
				name: "crypto-video-agent",
				version: "1.0.0",
			},
			{
				capabilities: {},
			},
		);

		await this.cryptoClient.connect(transport);
		return this.cryptoClient;
	}

	/**
	 * Initialize the Plainly MCP client
	 */
	async initPlainlyClient(): Promise<Client> {
		if (this.plainlyClient) {
			return this.plainlyClient;
		}

		const apiKey = process.env.PLAINLY_API_KEY;
		if (!apiKey) {
			throw new Error(
				"PLAINLY_API_KEY not found in environment. Please add it to .env.local",
			);
		}

		const transport = new StdioClientTransport({
			command: "npx",
			args: ["-y", "@plainly-videos/mcp-server@latest"],
			env: {
				...process.env,
				PLAINLY_API_KEY: apiKey,
			},
		});

		this.plainlyClient = new Client(
			{
				name: "crypto-video-agent",
				version: "1.0.0",
			},
			{
				capabilities: {},
			},
		);

		await this.plainlyClient.connect(transport);
		return this.plainlyClient;
	}

	/**
	 * Call a tool on the Crypto MCP server
	 */
	async callCryptoTool(toolName: string, args: Record<string, unknown>) {
		const client = await this.initCryptoClient();
		const result = await client.callTool({
			name: toolName,
			arguments: args,
		});
		return result;
	}

	/**
	 * Call a tool on the Plainly MCP server
	 */
	async callPlainlyTool(toolName: string, args: Record<string, unknown>) {
		const client = await this.initPlainlyClient();
		const result = await client.callTool({
			name: toolName,
			arguments: args,
		});
		return result;
	}

	/**
	 * Close all connections
	 */
	async close() {
		if (this.cryptoClient) {
			await this.cryptoClient.close();
		}
		if (this.plainlyClient) {
			await this.plainlyClient.close();
		}
	}
}

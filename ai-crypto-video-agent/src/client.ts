import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

if (!process.env.SMITHERY_API_KEY) {
	throw new Error("SMITHERY_API_KEY environment variable is not set.");
}

if (!process.env.SMITHERY_PROFILE) {
	throw new Error("SMITHERY_PROFILE environment variable is not set.");
}

// Construct server URL with authentication for Plainly MCP server
const plainlyVideosUrl = new URL("https://server.smithery.ai/@plainly-videos/mcp-server/mcp");
plainlyVideosUrl.searchParams.set("api_key", process.env.SMITHERY_API_KEY);
plainlyVideosUrl.searchParams.set("profile", process.env.SMITHERY_PROFILE);

const plainlyVideosTransport = new StreamableHTTPClientTransport(plainlyVideosUrl);
const plainlyVideosClient = new Client({ name: "Plainly Videos client", version: "1.0.0" });

// Construct server URL with authentication for Free Crypto Coin Data MCP server
const freeCryptoCoinDataUrl = new URL("https://server.smithery.ai/@Liam8/free-coin-price-mcp/mcp");
freeCryptoCoinDataUrl.searchParams.set("api_key", process.env.SMITHERY_API_KEY);

const freeCryptoCoinDataTransport = new StreamableHTTPClientTransport(freeCryptoCoinDataUrl);
const freeCryptoCoinDataClient = new Client({ name: "Free Crypto Coin Data client", version: "1.0.0" });

await freeCryptoCoinDataClient.connect(freeCryptoCoinDataTransport);
await plainlyVideosClient.connect(plainlyVideosTransport);

export { plainlyVideosClient, freeCryptoCoinDataClient };

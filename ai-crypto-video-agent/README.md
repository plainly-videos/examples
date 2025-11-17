# AI Crypto Video Agent

Fetches 7-day historical crypto data (price, volume) via Free Crypto Coin Data MCP server and then renders a Plainly "Media / Abstract" square video summarizing stats.

## Features
- Retrieves 7-day historical chart (`getCoinHistoricalChart`).
- Computes start, end, high, low, % change, average volume.
- Selects the Plainly `Media / Abstract` design (square variant).
- Auto-populates textual parameters and supplies PNG logo/image URL (CoinGecko) for required media layers.
- Initiates a render.

## Requirements
- [Smithery AI account](https://smithery.ai/signup).
- Node.js 22+ (TypeScript target ES2022 / module nodenext).
- PNPM package manager.
- Valid API keys from [Free Crypto Coin Data](https://smithery.ai/server/@Liam8/free-coin-price-mcp) and [Plainly Videos](https://smithery.ai/server/@plainly-videos/mcp-server).

## Getting started

Create a `.env` file from `.env.example` and fill in your API keys.
```bash
cp .env.example .env
```

Go to [Plainly Videos](https://smithery.ai/server/@plainly-videos/mcp-server) and [Free Crypto Coin Data](https://smithery.ai/server/@Liam8/free-coin-price-mcp) to get your API keys and `profile`, by clicking on the TypeScript under the Connect tab and copying the values from there into your `.env` file.

## Usage

Values for coin are hard-coded in the `src/constants.ts` as `bitcoin`; modify as needed (e.g. change `id` to another coin). You can also extend the code to accept command-line arguments for dynamic coin selection.

Run the example:

```bash
pnpm install
pnpm build
pnpm start
```

On success, you will get a response message, and you can visit the [Render list page](https://app.plainlyvideos.com/dashboard/renders) to track status of your video render.

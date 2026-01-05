/**
 * Crypto Data Fetching
 * Uses Free Crypto Coin Data MCP tool to fetch cryptocurrency information
 */

import type { MCPClientManager } from "./mcp-client.js";
import type { CryptoChartData, CryptoData, CryptoPrice } from "./types.js";

export class CryptoService {
	constructor(private mcpClient: MCPClientManager) {}

	/**
	 * Fetch current price and 24h change for a cryptocurrency
	 */
	async getCoinPrice(coinId: string): Promise<CryptoPrice> {
		const result = await this.mcpClient.callCryptoTool("getCoinPrice", {
			ids: coinId,
			vs_currencies: "usd",
		});

		// Parse the MCP response
		const data = this.parseToolResponse(result);
		if (!data || typeof data !== "object") {
			throw new Error("Unexpected response from getCoinPrice");
		}
		const coinData = (data as Record<string, any>)[coinId];

		if (!coinData) {
			throw new Error(`Coin not found: ${coinId}`);
		}

		return {
			id: coinId,
			symbol: coinData.symbol || coinId,
			name: coinData.name || coinId,
			current_price: coinData.usd || 0,
			price_change_percentage_24h: 0, // Will be calculated from chart data
			market_cap: coinData.usd_market_cap || 0,
			total_volume: coinData.usd_24h_vol || 0,
		};
	}

	/**
	 * Fetch historical chart data for specified number of days
	 */
	async getCoinHistoricalChart(
		coinId: string,
		days: string = "7",
	): Promise<CryptoChartData> {
		const result = await this.mcpClient.callCryptoTool(
			"getCoinHistoricalChart",
			{
				id: coinId,
				vs_currency: "usd",
				days,
			},
		);

		const data = this.parseToolResponse(result);
		if (!data || typeof data !== "object") {
			throw new Error("Unexpected response from getCoinHistoricalChart");
		}

		return {
			prices: Array.isArray(data.prices) ? data.prices : [],
			market_caps: Array.isArray(data.market_caps) ? data.market_caps : [],
			total_volumes: Array.isArray(data.total_volumes) ? data.total_volumes : [],
		};
	}

	/**
	 * Get complete crypto data for video rendering
	 */
	async getCryptoData(coinId: string): Promise<CryptoData> {
		const [price, chartData7d] = await Promise.all([
			this.getCoinPrice(coinId),
			this.getCoinHistoricalChart(coinId, "7"),
		]);

		// Calculate 24h change from 7-day chart data
		let priceChange24h = 0;
		if (chartData7d.prices.length >= 2) {
			const latestPoint = chartData7d.prices[chartData7d.prices.length - 1];
			const latestTimestamp = latestPoint[0];
			const latestPrice = latestPoint[1];
			const cutoffTimestamp = latestTimestamp - 24 * 60 * 60 * 1000;
			const oldestPoint =
				chartData7d.prices.find((point) => point[0] >= cutoffTimestamp) ??
				chartData7d.prices[0];
			const oldestPrice = oldestPoint[1];
			if (oldestPrice > 0) {
				priceChange24h = ((latestPrice - oldestPrice) / oldestPrice) * 100;
			}
		}

		// Calculate 7-day change from 7-day chart data
		let priceChange7d = 0;
		if (chartData7d.prices.length >= 2) {
			const oldestPrice = chartData7d.prices[0][1];
			const latestPrice = chartData7d.prices[chartData7d.prices.length - 1][1];
			if (oldestPrice > 0) {
				priceChange7d = ((latestPrice - oldestPrice) / oldestPrice) * 100;
			}
		}

		return {
			coin: price.name,
			currentPrice: price.current_price,
			priceChange24h,
			priceChange7d,
			chartData: chartData7d,
		};
	}

	/**
	 * Parse MCP tool response
	 */
	private parseToolResponse(result: any): any {
		if (result.content && Array.isArray(result.content)) {
			for (const item of result.content) {
				if (item.type === "text" && item.text) {
					try {
						return JSON.parse(item.text);
					} catch {
						return item.text;
					}
				}
			}
		}
		return result;
	}
}

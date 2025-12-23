import { freeCryptoCoinDataClient } from "./client.js";
import { days, id, vs_currency } from "./constants.js";
import type { HistoricalChartContent, HistoricalChartData } from "./types.js";

export async function getHistoricalData() {
	try {
		const historicalChartResponse = await freeCryptoCoinDataClient.callTool({
			name: "getCoinHistoricalChart",
			arguments: { id, days, vs_currency },
		});

		const content = historicalChartResponse.content;
		const data = JSON.parse(((content as unknown[])[0] as HistoricalChartContent).text) as HistoricalChartData;
		const stats = computeStats(data);
		return stats;
	} catch (error) {
		console.error("Error fetching historical data:", error);
		throw error;
	}
}

// Compute basic stats from historical chart
function computeStats(d: HistoricalChartData) {
	const prices = d.prices.map(([_, p]) => p);
	const vols = d.total_volumes.map(([_, v]) => v);
	const start = prices[0];
	const end = prices[prices.length - 1];
	const high = Math.max(...prices);
	const low = Math.min(...prices);
	const changePct = ((end - start) / start) * 100;
	const avgVol = vols.reduce((a, b) => a + b, 0) / vols.length;
	return { start, end, high, low, changePct, avgVol };
}

/**
 * Type definitions for the MCP AI Crypto Video Agent
 */

// Crypto data types
export interface CryptoPrice {
	id: string;
	symbol: string;
	name: string;
	current_price: number;
	price_change_percentage_24h: number;
	market_cap: number;
	total_volume: number;
}

export interface CryptoChartData {
	prices: [number, number][]; // [timestamp, price]
	market_caps: [number, number][];
	total_volumes: [number, number][];
}

export interface CryptoData {
	coin: string;
	currentPrice: number;
	priceChange24h: number;
	priceChange7d: number;
	chartData: CryptoChartData;
}

// Plainly template types
export interface PlainlyTemplate {
	id: string;
	name: string;
	description?: string;
	aspectRatio?: string;
	durationSeconds?: number;
}

export interface PlainlyRenderableItem {
	id: string;
	name: string;
	isDesign: boolean;
	templates?: PlainlyTemplate[];
}

export interface RenderStatus {
	state:
		| "PENDING"
		| "THROTTLED"
		| "QUEUED"
		| "IN_PROGRESS"
		| "DONE"
		| "FAILED"
		| "INVALID"
		| "CANCELLED";
	renderId: string;
	output?: string;
	error?: string;
}

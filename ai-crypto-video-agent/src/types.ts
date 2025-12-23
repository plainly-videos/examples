export interface HistoricalChartContent {
	type: "text";
	text: string;
}

export interface HistoricalChartData {
	prices: [number, number][];
	market_caps: [number, number][];
	total_volumes: [number, number][];
}

export interface Parameter {
	key: string;
	mandatory?: boolean;
	type?: string;
	description?: string;
	label?: string;
	defaultValue?: string;
}

export interface RenderableItemSummary {
	id: string;
	name: string;
}

export interface DesignDetailsResponse {
	templates?: Array<{
		id: string;
		name: string;
		variants: Array<{
			id: string;
			name: string;
			aspectRatio?: string;
			parameters?: Parameter[];
		}>;
	}>;
	itemDetails?: Array<{
		isDesign: boolean;
		projectDesignId: string;
		templateVariantId: string;
		exampleVideoUrl?: string;
		parameters: Parameter[];
	}>;
}

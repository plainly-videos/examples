import type { RenderableItemSummary } from "./types.js";

export function formatPercent(pct: number): string {
	const sign = pct >= 0 ? "+" : "";
	return `${sign}${pct.toFixed(2)}%`;
}

export function formatCurrency(value: number, code: string): string {
	const currency = code.toUpperCase();
	const minFrac = value < 1 ? 4 : 2;
	const maxFrac = value < 1 ? 6 : 2;
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: minFrac,
		maximumFractionDigits: maxFrac,
	}).format(value);
}

export function formatCompactCurrency(value: number, code: string): string {
	const currency = code.toUpperCase();
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);
}

export function extractFirstText(content: unknown): string | null {
	if (!Array.isArray(content)) return null;
	for (const c of content) {
		if (c && typeof c === "object" && "text" in c) {
			const t = (c as { text?: unknown }).text;
			if (typeof t === "string") return t;
		}
	}
	return null;
}

export function coerceItems(value: unknown): RenderableItemSummary[] {
	if (Array.isArray(value)) return value as RenderableItemSummary[];
	if (value && typeof value === "object") {
		const obj = value as Record<string, unknown>;
		for (const key of ["items", "designs", "data"]) {
			const candidate = obj[key];
			if (Array.isArray(candidate)) return candidate as RenderableItemSummary[];
		}
	}
	return [];
}

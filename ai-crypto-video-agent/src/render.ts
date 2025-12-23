import { plainlyVideosClient } from "./client.js";
import { days, id, vs_currency } from "./constants.js";
import type { DesignDetailsResponse, Parameter } from "./types.js";
import { coerceItems, extractFirstText, formatCompactCurrency, formatCurrency, formatPercent } from "./utils.js";

export async function renderDesign(stats: {
	start: number;
	end: number;
	high: number;
	low: number;
	changePct: number;
	avgVol: number;
}) {
	const listResp = await plainlyVideosClient.callTool({
		name: "list_renderable_items",
		arguments: { excludeProjects: true },
	});

	const listText = extractFirstText(listResp.content as unknown);
	if (!listText) {
		console.warn("No list_renderable_items response text found; skipping render.");
		return;
	}

	let itemsParsed: unknown;
	try {
		itemsParsed = JSON.parse(listText);
	} catch (e) {
		console.log("Failed to parse list_renderable_items JSON:", e);
		return;
	}

	const items = coerceItems(itemsParsed);
	if (!items.length) {
		console.log("No renderable items found after coercion; aborting render.");
		return;
	}

	const target = items.find((it) => {
		const nameLower = it.name?.toLowerCase() || "";
		const isAbstract = nameLower.includes("abstract");
		return isAbstract;
	});

	if (!target) {
		console.warn(
			"Could not find media-abstract square design; available names:",
			items.map((i) => i.name),
		);
		return;
	}

	try {
		const designDetails = await getDesignDetails(target.id);
		if (!designDetails || !designDetails.itemDetails || !designDetails.itemDetails.length) {
			console.warn("No design details or itemDetails found; cannot render.");
			return;
		}

		let parameters: Parameter[] | undefined;

		const itemDetails = designDetails.itemDetails;
		const squareDetail = itemDetails.find((d) => d.templateVariantId.toLowerCase() === "square") || itemDetails[0];
		const variantId = squareDetail.templateVariantId;
		parameters = squareDetail.parameters;

		if (!variantId) {
			console.warn("No variantId resolved; aborting render.");
			return;
		}

		const arrow = stats.changePct >= 0 ? "▲" : "▼";
		const coinPretty = id.slice(0, 1).toUpperCase() + id.slice(1).toLowerCase();

		const paramValues: Record<string, string> = {};
		const headingLine =
			stats.changePct >= 0
				? `${coinPretty} is up ${formatPercent(stats.changePct)} ${arrow} in the last ${days} days!`
				: `${coinPretty} is down ${formatPercent(stats.changePct)} ${arrow} in the last ${days} days.`;
		const subheadingLine =
			"Price " +
			formatCurrency(stats.end, vs_currency) +
			"\n" +
			"High " +
			formatCurrency(stats.high, vs_currency) +
			"\n" +
			"Low " +
			formatCurrency(stats.low, vs_currency) +
			"\n" +
			"Avg Vol " +
			formatCompactCurrency(stats.avgVol, vs_currency);

		const ctaLine = `Read more about ${coinPretty} on CoinGecko!`;

		if (parameters) {
			for (const p of parameters) {
				const key: string = p.key;
				const label = (p.label || p.description || "").toLowerCase();
				if (key.toLowerCase().includes("image")) {
					// Provide media asset placeholders for image/logo keys
					paramValues[key] = "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";
					continue;
				}
				if (key.toLowerCase().includes("logo")) {
					paramValues[key] = "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";
					continue;
				}

				if (p.mandatory) {
					if (key.toLowerCase().includes("subheading") || label.includes("subheading")) {
						paramValues[key] = subheadingLine;
					} else if (key.toLowerCase().includes("cta")) {
						paramValues[key] = ctaLine;
					} else {
						paramValues[key] = headingLine;
					}
				}
			}
		}

		const renderResp = await plainlyVideosClient.callTool({
			name: "render_item",
			arguments: {
				isDesign: true,
				projectDesignId: target.id,
				templateVariantId: variantId,
				...(Object.keys(paramValues).length ? { parameters: paramValues } : {}),
			},
		});

		const renderText = extractFirstText(renderResp.content as unknown);
		if (!renderText) {
			console.warn("No render_item response text found; render may have failed.");
			return;
		}

		console.log("Render initiated successfully. Response:");
		console.log(renderText);
	} catch (error) {
		console.error("Error during design selection/render:", error);
	}
}

async function getDesignDetails(targetId: string) {
	try {
		const detailsResp = await plainlyVideosClient.callTool({
			name: "get_renderable_items_details",
			arguments: { renderableItemId: targetId, isDesign: true },
		});
		const detailsText = extractFirstText(detailsResp.content as unknown);
		if (!detailsText) {
			console.warn("No get_renderable_items_details response text found; cannot render.");
			return;
		}
		const details: DesignDetailsResponse = JSON.parse(detailsText);
		return details;
	} catch (error) {
		console.error("Error during design selection/render:", error);
	}
}

/**
 * Plainly Video Service
 * Handles template discovery and video rendering with Plainly MCP tool
 */

import type { MCPClientManager } from "./mcp-client.js";
import type { PlainlyRenderableItem, RenderStatus } from "./types.js";

export class PlainlyService {
	constructor(private mcpClient: MCPClientManager) {}

	/**
	 * List all available renderable items (Projects and Designs)
	 */
	async listRenderableItems(): Promise<PlainlyRenderableItem[]> {
		const result = await this.mcpClient.callPlainlyTool(
			"list_renderable_items",
			{},
		);
		const data = this.parseToolResponse(result);

		// Return parsed items
		return data.items || [];
	}

	/**
	 * Find the "Crypto 2025" template
	 * This demonstrates how to search and filter templates programmatically
	 */
	async findCryptoProject(): Promise<PlainlyRenderableItem | null> {
		const items = await this.listRenderableItems();

		// Search for "Crypto 2025" project
		// in a real world scenario, you might want to make this more robust
		const cryptoProject = items.find(
			(item) =>
				item.name.toLowerCase().includes("crypto") &&
				item.name.includes("2025"),
		);

		return cryptoProject || null;
	}

	/**
	 * Get detailed information about a template including its parameters
	 */
	async getProjectDetails(itemId: string, isDesign: boolean): Promise<any> {
		const result = await this.mcpClient.callPlainlyTool(
			"get_renderable_items_details",
			{
				renderableItemId: itemId,
				isDesign,
			},
		);

		return this.parseToolResponse(result);
	}

	/**
	 * Render a video with the specified template and parameters
	 */
	async renderVideo(
		projectDesignId: string,
		templateVariantId: string,
		isDesign: boolean,
		parameters: Record<string, unknown>,
	): Promise<string> {
		const result = await this.mcpClient.callPlainlyTool("render_item", {
			projectDesignId,
			templateVariantId,
			isDesign,
			parameters,
		});

		const data = this.parseToolResponse(result);
		return data.renderId;
	}

	/**
	 * Check the status of a render job
	 */
	async checkRenderStatus(renderId: string): Promise<RenderStatus> {
		const result = await this.mcpClient.callPlainlyTool("check_render_status", {
			renderId,
		});

		const data = this.parseToolResponse(result);

		return {
			state: data.state,
			renderId: data.renderId,
			output: data.output,
			error: data.error,
		};
	}

	/**
	 * Poll render status until completion
	 */
	async pollRenderStatus(
		renderId: string,
		onProgress?: (status: RenderStatus) => void,
		intervalMs: number = 3000,
		maxWaitMs: number = 10 * 60 * 1000,
		maxIntervalMs: number = 15000,
		backoffFactor: number = 1.5,
	): Promise<RenderStatus> {
		const startTime = Date.now();
		let currentIntervalMs = intervalMs;

		while (true) {
			const status = await this.checkRenderStatus(renderId);

			if (onProgress) {
				onProgress(status);
			}

			// Check if render is complete
			if (["DONE", "FAILED", "INVALID", "CANCELLED"].includes(status.state)) {
				return status;
			}

			// Wait before checking again
			if (Date.now() - startTime > maxWaitMs) {
				throw new Error(
					`Render polling timed out after ${Math.round(maxWaitMs / 1000)}s`,
				);
			}

			await new Promise((resolve) => setTimeout(resolve, currentIntervalMs));
			currentIntervalMs = Math.min(
				Math.round(currentIntervalMs * backoffFactor),
				maxIntervalMs,
			);
		}
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

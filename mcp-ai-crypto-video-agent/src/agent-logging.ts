import type { Agent, RunItem, StreamedRunResult } from "@openai/agents";
import chalk from "chalk";

export const truncate = (value: string, max: number) =>
	value.length > max ? `${value.slice(0, max)}...` : value;

export const safeStringify = (value: unknown) => {
	const seen = new WeakSet();
	return JSON.stringify(value, (_key, current) => {
		if (typeof current === "bigint") {
			return current.toString();
		}
		if (typeof current === "object" && current !== null) {
			if (seen.has(current)) {
				return "[Circular]";
			}
			seen.add(current);
		}
		return current;
	});
};

export const formatValue = (value: unknown) => {
	if (typeof value === "string") {
		return value;
	}
	try {
		return safeStringify(value ?? {}) ?? "";
	} catch (error) {
		console.warn(chalk.yellow("⚠️ Unable to stringify output:"), error);
		return String(value ?? "");
	}
};

const extractOutputText = (item: RunItem) => {
	const raw = item?.rawItem;
	if (!raw || typeof raw !== "object" || !("content" in raw)) {
		return null;
	}
	const content = Array.isArray((raw as { content?: unknown }).content)
		? (raw as { content: any[] }).content
		: [];
	const text = content
		.filter(
			(part: any) =>
				part?.type === "output_text" && typeof part.text === "string",
		)
		.map((part: any) => part.text as string)
		.join("");
	return text.trim() ? text.trim() : null;
};

export const logRunStream = async (
	result: StreamedRunResult<any, Agent<any, any>>,
) => {
	for await (const event of result) {
		if (event.type === "agent_updated_stream_event") {
			console.log(chalk.gray(`🤖 Agent: ${event.agent.name}`));
			continue;
		}

		if (event.type !== "run_item_stream_event") {
			continue;
		}

		if (event.name === "message_output_created") {
			const text = extractOutputText(event.item);
			if (text) {
				console.log(chalk.gray(`📝 Step: ${text}`));
			}
		}
	}

	await result.completed;

	if (result.error) {
		throw result.error;
	}
};

import type { StreamedRunResult } from "@openai/agents";
import chalk from "chalk";

const extractOutputText = (item: any) => {
	const raw = item?.rawItem;
	const content = Array.isArray(raw?.content) ? raw.content : [];
	const text = content
		.filter((part: any) => part?.type === "output_text")
		.map((part: any) => part.text)
		.join("");
	return text.trim() ? text.trim() : null;
};

export const logRunStream = async (result: StreamedRunResult<any, any>) => {
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

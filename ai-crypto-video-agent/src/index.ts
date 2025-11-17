import { freeCryptoCoinDataClient, plainlyVideosClient } from "./client.js";
import { getHistoricalData } from "./historicalData.js";
import { renderDesign } from "./render.js";

const stats = await getHistoricalData();
await renderDesign(stats);
await Promise.all([freeCryptoCoinDataClient.close(), plainlyVideosClient.close()]);

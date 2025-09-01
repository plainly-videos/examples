const apiKey = process.env.PLAINLY_API_KEY;
const username = apiKey;
const password = "";

export const auth = btoa(`${username}:${password}`);
export const env = process.env.NODE_ENV;
export const projectId = process.env.PLAINLY_PROJECT_ID;
export const webhookBaseUrl = process.env.WEBHOOK_PUBLIC_URL;

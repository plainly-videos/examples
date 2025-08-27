const apiKey = process.env.NEXT_PUBLIC_PLAINLY_API_KEY;
const username = apiKey;
const password = "";
export const auth = btoa(`${username}:${password}`);
